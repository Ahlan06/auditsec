import express from 'express';
import crypto from 'crypto';
import dns from 'dns/promises';
import fs from 'fs/promises';
import path from 'path';
import multer from 'multer';
import * as pdfParsePkg from 'pdf-parse';

import db from '../client/db.js';
import { clientAuth } from '../middleware/clientAuth.js';
import { createUserRateLimiter } from '../middleware/userRateLimit.js';
import { getOpenAIClient, getOpenAIModel } from '../services/openaiClient.js';
import {
  canBypassVerificationForLocalhost,
  isLocalhost,
  normalizeHostnameFromTarget,
  owaspWebQuickChecks,
  portScan,
} from '../services/scanners.js';

const router = express.Router();
router.use(clientAuth);

// SaaS safety: per-user rate limiting for chat/agent endpoints.
// This prevents one tenant from exhausting resources for others.
router.use(
  createUserRateLimiter({
    windowMs: Number(process.env.RL_CLIENT_AI_WINDOW_MS) || 60_000,
    max: Number(process.env.RL_CLIENT_AI_MAX) || 60,
    keyPrefix: 'client-ai',
  })
);

const nowIso = () => new Date().toISOString();

const __uploadsDir = path.join(process.cwd(), 'backend', 'client', 'uploads');
const ensureUploadsDir = async () => {
  try {
    await fs.mkdir(__uploadsDir, { recursive: true });
  } catch {
    // ignore
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 10,
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

const requireConversation = (conversationId, userId) => {
  const row = db
    .prepare('SELECT * FROM ai_conversations WHERE id = ? AND user_id = ?')
    .get(Number(conversationId), userId);
  return row || null;
};

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const listConversationMessages = (conversationId, userId, limit = 50) => {
  const rows = db
    .prepare(
      'SELECT role, content, created_at FROM ai_messages WHERE conversation_id = ? AND user_id = ? ORDER BY id ASC LIMIT ?'
    )
    .all(Number(conversationId), userId, Number(limit));
  return rows;
};

const listConversationMessagesWithAttachments = (conversationId, userId, limit = 200) => {
  const rows = db
    .prepare(
      `SELECT m.id as id, m.role as role, m.content as content, m.created_at as created_at
       FROM ai_messages m
       WHERE m.conversation_id = ? AND m.user_id = ?
       ORDER BY m.id ASC
       LIMIT ?`
    )
    .all(Number(conversationId), userId, Number(limit));

  const ids = rows.map((r) => r.id);
  if (!ids.length) return rows.map((r) => ({ ...r, attachments: [] }));

  const placeholders = ids.map(() => '?').join(',');
  const attachments = db
    .prepare(
      `SELECT ma.message_id as message_id, a.id as id, a.original_name as original_name, a.mime_type as mime_type, a.size_bytes as size_bytes, a.created_at as created_at
       FROM ai_message_attachments ma
       JOIN ai_attachments a ON a.id = ma.attachment_id
       WHERE ma.message_id IN (${placeholders}) AND a.user_id = ?
       ORDER BY a.id ASC`
    )
    .all(...ids, userId);

  const byMsg = new Map();
  for (const a of attachments) {
    const list = byMsg.get(a.message_id) || [];
    list.push({
      id: a.id,
      original_name: a.original_name,
      mime_type: a.mime_type,
      size_bytes: a.size_bytes,
      created_at: a.created_at,
    });
    byMsg.set(a.message_id, list);
  }

  return rows.map((r) => ({ ...r, attachments: byMsg.get(r.id) || [] }));
};

const getAttachmentRowsByIds = (attachmentIds, userId, conversationId) => {
  const ids = (attachmentIds || []).map((x) => Number(x)).filter((x) => Number.isFinite(x) && x > 0).slice(0, 10);
  if (!ids.length) return [];
  const placeholders = ids.map(() => '?').join(',');
  return db
    .prepare(
      `SELECT id, original_name, mime_type, size_bytes, storage_path, created_at
       FROM ai_attachments
       WHERE id IN (${placeholders}) AND user_id = ? AND conversation_id = ?
       ORDER BY id ASC`
    )
    .all(...ids, userId, Number(conversationId));
};

const readAttachmentAsDataUrl = async (row) => {
  const buf = await fs.readFile(row.storage_path);
  const mime = row.mime_type || 'application/octet-stream';
  const b64 = buf.toString('base64');
  return `data:${mime};base64,${b64}`;
};

const extractAttachmentText = async (row) => {
  const mime = (row.mime_type || '').toLowerCase();
  const buf = await fs.readFile(row.storage_path);

  if (mime === 'application/pdf') {
    const pdfParse = pdfParsePkg.default ?? pdfParsePkg;
    const parsed = await pdfParse(buf);
    return (parsed?.text || '').toString();
  }

  if (mime.startsWith('text/')) {
    return buf.toString('utf8');
  }

  // Common textual formats that often arrive as application/*
  const name = (row.original_name || '').toLowerCase();
  if (name.endsWith('.json') || name.endsWith('.md') || name.endsWith('.csv') || name.endsWith('.txt') || name.endsWith('.log')) {
    return buf.toString('utf8');
  }

  return null;
};

const createApproval = ({ userId, actionType, actionPayload, ttlMinutes = 15 }) => {
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();

  const info = db
    .prepare(
      'INSERT INTO agent_approvals (user_id, status, action_type, action_payload_json, created_at, expires_at) VALUES (?,?,?,?,?,?)'
    )
    .run(userId, 'pending', actionType, JSON.stringify(actionPayload), createdAt, expiresAt);

  return {
    approvalId: info.lastInsertRowid,
    expiresAt,
  };
};

const getVerifiedTargetRow = ({ userId, hostname }) => {
  return db
    .prepare('SELECT * FROM verified_targets WHERE user_id = ? AND hostname = ?')
    .get(userId, hostname);
};

const ensureTargetVerifiedOrLocalhost = ({ userId, hostname }) => {
  const h = String(hostname || '').toLowerCase();
  if (!h) return { ok: false, reason: 'hostname_required' };

  if (isLocalhost(h) && canBypassVerificationForLocalhost()) {
    return { ok: true, verified: true, method: 'localhost-bypass' };
  }

  const row = getVerifiedTargetRow({ userId, hostname: h });
  if (!row || !row.verified_at) return { ok: false, reason: 'target_not_verified' };

  return { ok: true, verified: true, method: 'dns-txt', verifiedAt: row.verified_at };
};

const systemPrompt = () => {
  return [
    'You are AuditSec AI, a security-audit assistant for authorized clients.',
    'You must follow these constraints:',
    '- Only help with defensive security auditing and reporting.',
    '- Never provide instructions for hacking unauthorized systems.',
    '- For active actions (network scans, web checks), you must request explicit user approval first.',
    '- Only scan targets that are verified/owned by the user (DNS TXT verification) or localhost in dev when allowed.',
    '- When suggesting OWASP Top 10 checks, keep it high-level and safe (no exploitation steps).',
    '',
    'When you need permission to run a scan, call the tool create_scan_request.',
    'When a target is not verified, call tool request_target_verification to generate DNS TXT instructions.',
  ].join('\n');
};

const buildTools = (userId) => {
  return [
    {
      type: 'function',
      function: {
        name: 'list_verified_targets',
        description: 'List targets the user has verified/owned via DNS TXT.',
        parameters: { type: 'object', properties: {}, additionalProperties: false },
      },
    },
    {
      type: 'function',
      function: {
        name: 'request_target_verification',
        description:
          'Create/return a DNS TXT verification token for a hostname so the user can prove ownership.',
        parameters: {
          type: 'object',
          properties: {
            hostname: { type: 'string', description: 'Domain/hostname to verify (e.g., example.com)' },
          },
          required: ['hostname'],
          additionalProperties: false,
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'check_target_verification',
        description: 'Check DNS TXT record for verification and mark target verified if found.',
        parameters: {
          type: 'object',
          properties: {
            hostname: { type: 'string' },
          },
          required: ['hostname'],
          additionalProperties: false,
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'create_scan_request',
        description:
          'Create a pending approval record to run an active scan. Execution happens only after user approves.',
        parameters: {
          type: 'object',
          properties: {
            target: { type: 'string', description: 'Target URL or hostname' },
            scanType: {
              type: 'string',
              enum: ['ports_simple', 'ports_deep', 'web_owasp_quick'],
            },
            ports: {
              type: 'array',
              items: { type: 'integer' },
              description: 'Optional explicit list of ports for port scans',
            },
            reason: { type: 'string' },
          },
          required: ['target', 'scanType', 'reason'],
          additionalProperties: false,
        },
      },
    },
  ];
};

const executeTool = async (toolCall, userId) => {
  const name = toolCall?.function?.name;
  const rawArgs = toolCall?.function?.arguments || '{}';

  let args;
  try {
    args = JSON.parse(rawArgs);
  } catch {
    args = {};
  }

  if (name === 'list_verified_targets') {
    const rows = db
      .prepare('SELECT hostname, verified_at, created_at FROM verified_targets WHERE user_id = ? ORDER BY hostname ASC')
      .all(userId);
    return { targets: rows };
  }

  if (name === 'request_target_verification') {
    const hostname = normalizeHostnameFromTarget(args?.hostname);
    if (!hostname) return { error: 'invalid_hostname' };

    const token = crypto.randomBytes(16).toString('hex');
    const txtValue = `auditsec-verify=${token}`;

    const existing = getVerifiedTargetRow({ userId, hostname: hostname.toLowerCase() });
    if (existing) {
      db.prepare('UPDATE verified_targets SET token = ?, verified_at = NULL WHERE user_id = ? AND hostname = ?').run(
        token,
        userId,
        hostname.toLowerCase()
      );
    } else {
      db.prepare('INSERT INTO verified_targets (user_id, hostname, token) VALUES (?,?,?)').run(
        userId,
        hostname.toLowerCase(),
        token
      );
    }

    return {
      hostname: hostname.toLowerCase(),
      method: 'dns-txt',
      instructions:
        'Add the following DNS TXT record on the domain, wait for propagation, then ask me to re-check verification.',
      dnsTxtName: hostname.toLowerCase(),
      dnsTxtValue: txtValue,
    };
  }

  if (name === 'check_target_verification') {
    const hostname = normalizeHostnameFromTarget(args?.hostname);
    if (!hostname) return { error: 'invalid_hostname' };

    const row = getVerifiedTargetRow({ userId, hostname: hostname.toLowerCase() });
    if (!row) return { error: 'verification_not_requested' };

    const expected = `auditsec-verify=${row.token}`;

    try {
      const txt = await dns.resolveTxt(hostname.toLowerCase());
      const flat = txt.flat().map((x) => String(x));
      const ok = flat.some((entry) => entry.includes(expected));
      if (!ok) {
        return { verified: false, message: 'TXT record not found yet. Ensure DNS propagated.' };
      }

      db.prepare('UPDATE verified_targets SET verified_at = ? WHERE user_id = ? AND hostname = ?').run(
        nowIso(),
        userId,
        hostname.toLowerCase()
      );

      return { verified: true, hostname: hostname.toLowerCase(), method: 'dns-txt' };
    } catch (err) {
      return { verified: false, error: 'dns_lookup_failed', details: String(err?.message || err) };
    }
  }

  if (name === 'create_scan_request') {
    const target = String(args?.target || '').trim();
    const scanType = String(args?.scanType || '').trim();
    const reason = String(args?.reason || '').trim();
    const ports = Array.isArray(args?.ports) ? args.ports : undefined;

    if (!target || !scanType || !reason) return { error: 'missing_fields' };

    const hostname = normalizeHostnameFromTarget(target);
    if (!hostname) return { error: 'invalid_target' };

    const verification = ensureTargetVerifiedOrLocalhost({ userId, hostname });
    if (!verification.ok) {
      return {
        error: 'target_not_verified',
        hostname,
        message: 'Target not verified. Please verify ownership first.',
      };
    }

    const approval = createApproval({
      userId,
      actionType: 'scan',
      actionPayload: { target, hostname, scanType, ports, reason },
      ttlMinutes: 15,
    });

    return {
      ok: true,
      approvalId: approval.approvalId,
      expiresAt: approval.expiresAt,
      message: 'Pending approval created. Ask the user to approve and run it in the UI.',
    };
  }

  return { error: 'unknown_tool' };
};

router.get('/conversations', (req, res) => {
  const rows = db
    .prepare('SELECT id, title, created_at, pinned, pinned_at FROM ai_conversations WHERE user_id = ? ORDER BY pinned DESC, pinned_at DESC, id DESC')
    .all(req.user.id);
  res.json({ conversations: rows });
});

router.post('/conversations', (req, res) => {
  const title = (req.body?.title || '').toString().trim() || 'AuditSec Assistant';
  const info = db
    .prepare('INSERT INTO ai_conversations (user_id, title) VALUES (?, ?)')
    .run(req.user.id, title);
  const convo = db
    .prepare('SELECT id, title, created_at, pinned, pinned_at FROM ai_conversations WHERE id = ? AND user_id = ?')
    .get(info.lastInsertRowid, req.user.id);
  res.status(201).json({ conversation: convo });
});

router.put('/conversations/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ error: 'Invalid conversation id' });

  const title = (req.body?.title || '').toString().trim();
  if (!title) return res.status(400).json({ error: 'title is required' });
  if (title.length > 80) return res.status(400).json({ error: 'title too long (max 80)' });

  const convo = requireConversation(id, req.user.id);
  if (!convo) return res.status(404).json({ error: 'Conversation not found' });

  db.prepare('UPDATE ai_conversations SET title = ? WHERE id = ? AND user_id = ?').run(title, id, req.user.id);
  const updated = db
    .prepare('SELECT id, title, created_at, pinned, pinned_at FROM ai_conversations WHERE id = ? AND user_id = ?')
    .get(id, req.user.id);

  res.json({ conversation: updated });
});

router.put('/conversations/:id/pin', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ error: 'Invalid conversation id' });

  const convo = requireConversation(id, req.user.id);
  if (!convo) return res.status(404).json({ error: 'Conversation not found' });

  const pinned = Boolean(req.body?.pinned);
  db.prepare('UPDATE ai_conversations SET pinned = ?, pinned_at = ? WHERE id = ? AND user_id = ?').run(
    pinned ? 1 : 0,
    pinned ? nowIso() : null,
    id,
    req.user.id
  );

  const updated = db
    .prepare('SELECT id, title, created_at, pinned, pinned_at FROM ai_conversations WHERE id = ? AND user_id = ?')
    .get(id, req.user.id);

  res.json({ conversation: updated });
});

router.delete('/conversations/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ error: 'Invalid conversation id' });

    const convo = requireConversation(id, req.user.id);
    if (!convo) return res.status(404).json({ error: 'Conversation not found' });

    // Cleanup files
    const attachments = db
      .prepare('SELECT storage_path FROM ai_attachments WHERE conversation_id = ? AND user_id = ?')
      .all(id, req.user.id);
    for (const a of attachments) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await fs.unlink(a.storage_path);
      } catch {
        // ignore
      }
    }

    // Cleanup rows
    db.prepare('DELETE FROM ai_message_attachments WHERE message_id IN (SELECT id FROM ai_messages WHERE conversation_id = ? AND user_id = ?)').run(id, req.user.id);
    db.prepare('DELETE FROM ai_messages WHERE conversation_id = ? AND user_id = ?').run(id, req.user.id);
    db.prepare('DELETE FROM ai_attachments WHERE conversation_id = ? AND user_id = ?').run(id, req.user.id);
    db.prepare('DELETE FROM ai_conversations WHERE id = ? AND user_id = ?').run(id, req.user.id);

    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.get('/conversations/:id/messages', (req, res) => {
  const convo = requireConversation(req.params.id, req.user.id);
  if (!convo) return res.status(404).json({ error: 'Conversation not found' });

  const messages = listConversationMessagesWithAttachments(convo.id, req.user.id, 200);
  res.json({ messages });
});

router.post('/conversations/:id/attachments', upload.array('files', 10), async (req, res, next) => {
  try {
    const convo = requireConversation(req.params.id, req.user.id);
    if (!convo) return res.status(404).json({ error: 'Conversation not found' });

    await ensureUploadsDir();
    const files = req.files || [];
    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const saved = [];
    for (const f of files) {
      const mime = String(f.mimetype || 'application/octet-stream');
      const original = String(f.originalname || 'file');
      const sizeBytes = Number(f.size || 0);

      const idPart = crypto.randomBytes(12).toString('hex');
      const safeName = original.replace(/[^a-z0-9._-]/gi, '_').slice(0, 120);
      const filename = `${Date.now()}_${idPart}_${safeName}`;
      const storagePath = path.join(__uploadsDir, filename);

      await fs.writeFile(storagePath, f.buffer);

      const info = db
        .prepare(
          'INSERT INTO ai_attachments (conversation_id, user_id, original_name, mime_type, size_bytes, storage_path) VALUES (?,?,?,?,?,?)'
        )
        .run(convo.id, req.user.id, original, mime, sizeBytes, storagePath);

      saved.push({
        id: info.lastInsertRowid,
        original_name: original,
        mime_type: mime,
        size_bytes: sizeBytes,
        created_at: nowIso(),
      });
    }

    res.status(201).json({ attachments: saved });
  } catch (err) {
    next(err);
  }
});

router.post('/conversations/:id/messages', async (req, res, next) => {
  try {
    const convo = requireConversation(req.params.id, req.user.id);
    if (!convo) return res.status(404).json({ error: 'Conversation not found' });

    const content = (req.body?.message || '').toString().trim();
    if (!content) return res.status(400).json({ error: 'message is required' });

    const attachmentIds = Array.isArray(req.body?.attachmentIds) ? req.body.attachmentIds : [];
    const attachments = getAttachmentRowsByIds(attachmentIds, req.user.id, convo.id);

    const userMsgInfo = db
      .prepare('INSERT INTO ai_messages (conversation_id, user_id, role, content) VALUES (?,?,?,?)')
      .run(convo.id, req.user.id, 'user', content);

    const userMessageId = userMsgInfo.lastInsertRowid;
    if (attachments.length) {
      const stmt = db.prepare('INSERT OR IGNORE INTO ai_message_attachments (message_id, attachment_id) VALUES (?, ?)');
      for (const a of attachments) {
        stmt.run(userMessageId, a.id);
      }
    }

    const history = listConversationMessages(convo.id, req.user.id, 30);
    const messages = [{ role: 'system', content: systemPrompt() }, ...history.map((m) => ({ role: m.role, content: m.content }))];

    // Build the current user input with attachments (images via vision, docs as extracted text snippets)
    const multimodal = [{ type: 'text', text: content }];
    if (attachments.length) {
      // Provide a short attachment index to the model
      const names = attachments.map((a) => `- ${a.original_name} (${a.mime_type}, ${a.size_bytes} bytes)`).join('\n');
      multimodal.push({
        type: 'text',
        text:
          `\n\nAttached files:\n${names}\n\nUse them only for defensive security analysis and reporting. If a file is not readable, ask the user for a text export.`,
      });

      for (const a of attachments) {
        const mime = String(a.mime_type || '').toLowerCase();
        if (mime.startsWith('image/')) {
          // eslint-disable-next-line no-await-in-loop
          const dataUrl = await readAttachmentAsDataUrl(a);
          multimodal.push({ type: 'image_url', image_url: { url: dataUrl } });
          continue;
        }

        // eslint-disable-next-line no-await-in-loop
        const text = await extractAttachmentText(a);
        if (text) {
          const clipped = text.slice(0, 20000);
          multimodal.push({
            type: 'text',
            text: `\n\n[Document: ${a.original_name}]\n${clipped}`,
          });
        } else {
          multimodal.push({
            type: 'text',
            text: `\n\n[Document: ${a.original_name}] (Unsupported format for auto-reading).`,
          });
        }
      }
    }

    messages.push({ role: 'user', content: multimodal });

    const client = getOpenAIClient();
    const model = getOpenAIModel();

    // Tool calling loop (max 3 tool rounds)
    let toolRounds = 0;
    let assistantText = '';

    while (toolRounds < 3) {
      // eslint-disable-next-line no-await-in-loop
      const completion = await client.chat.completions.create({
        model,
        messages,
        tools: buildTools(req.user.id),
        tool_choice: 'auto',
        temperature: 0.2,
      });

      const choice = completion.choices?.[0];
      const msg = choice?.message;

      if (!msg) throw new Error('OpenAI returned no message');

      if (msg.tool_calls && msg.tool_calls.length) {
        // Append assistant tool call message
        messages.push({ role: 'assistant', content: msg.content || '', tool_calls: msg.tool_calls });

        for (const tc of msg.tool_calls) {
          // eslint-disable-next-line no-await-in-loop
          const toolResult = await executeTool(tc, req.user.id);
          messages.push({
            role: 'tool',
            tool_call_id: tc.id,
            content: JSON.stringify(toolResult),
          });
        }

        toolRounds += 1;
        continue;
      }

      assistantText = (msg.content || '').toString();
      break;
    }

    if (!assistantText) {
      assistantText =
        "I couldn't complete that request. If you asked for an active scan, make sure the target is verified and try again.";
    }

    db.prepare('INSERT INTO ai_messages (conversation_id, user_id, role, content) VALUES (?,?,?,?)').run(
      convo.id,
      req.user.id,
      'assistant',
      assistantText
    );

    const pending = db
      .prepare('SELECT id, action_type, action_payload_json, created_at, expires_at FROM agent_approvals WHERE user_id = ? AND status = ? ORDER BY id DESC LIMIT 10')
      .all(req.user.id, 'pending')
      .map((r) => ({
        ...r,
        action_payload: safeJsonParse(r.action_payload_json),
      }));

    res.json({ reply: assistantText, pendingApprovals: pending });
  } catch (err) {
    next(err);
  }
});

router.get('/approvals', (req, res) => {
  const status = (req.query?.status || 'pending').toString();
  const rows = db
    .prepare(
      'SELECT id, status, action_type, action_payload_json, created_at, decided_at, expires_at FROM agent_approvals WHERE user_id = ? AND status = ? ORDER BY id DESC LIMIT 50'
    )
    .all(req.user.id, status)
    .map((r) => ({
      ...r,
      action_payload: safeJsonParse(r.action_payload_json),
    }));
  res.json({ approvals: rows });
});

router.post('/approvals/:id/decide', (req, res) => {
  const id = Number(req.params.id);
  const allow = Boolean(req.body?.allow);

  const row = db
    .prepare('SELECT * FROM agent_approvals WHERE id = ? AND user_id = ?')
    .get(id, req.user.id);
  if (!row) return res.status(404).json({ error: 'Approval not found' });

  const expiresAt = row.expires_at ? new Date(row.expires_at).getTime() : 0;
  if (expiresAt && Date.now() > expiresAt) {
    db.prepare('UPDATE agent_approvals SET status = ?, decided_at = ? WHERE id = ? AND user_id = ?').run(
      'expired',
      nowIso(),
      id,
      req.user.id
    );
    return res.status(400).json({ error: 'Approval expired' });
  }

  db.prepare('UPDATE agent_approvals SET status = ?, decided_at = ? WHERE id = ? AND user_id = ?').run(
    allow ? 'approved' : 'denied',
    nowIso(),
    id,
    req.user.id
  );

  res.json({ ok: true, status: allow ? 'approved' : 'denied' });
});

router.post('/approvals/:id/execute', async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const approval = db
      .prepare('SELECT * FROM agent_approvals WHERE id = ? AND user_id = ?')
      .get(id, req.user.id);
    if (!approval) return res.status(404).json({ error: 'Approval not found' });

    if (approval.status !== 'approved') {
      return res.status(400).json({ error: `Approval status must be approved (current=${approval.status})` });
    }

    const payload = safeJsonParse(approval.action_payload_json);
    if (!payload) return res.status(400).json({ error: 'Invalid approval payload' });

    const hostname = normalizeHostnameFromTarget(payload.hostname || payload.target);
    const verification = ensureTargetVerifiedOrLocalhost({ userId: req.user.id, hostname });
    if (!verification.ok) {
      return res.status(400).json({ error: 'Target not verified' });
    }

    const runInfo = db
      .prepare('INSERT INTO agent_runs (user_id, action_type, action_payload_json, status) VALUES (?,?,?,?)')
      .run(req.user.id, 'scan', JSON.stringify(payload), 'running');

    const runId = runInfo.lastInsertRowid;

    let result;

    if (payload.scanType === 'ports_simple') {
      const defaultPorts = [80, 443, 22, 21, 25, 110, 143, 53, 3389, 3306, 5432, 6379, 27017];
      const ports = Array.isArray(payload.ports) && payload.ports.length ? payload.ports : defaultPorts;
      result = await portScan({ hostname, ports, timeoutMs: 1200, maxConcurrency: 60 });
    } else if (payload.scanType === 'ports_deep') {
      // Deep = broader list but still capped.
      const common = [
        20, 21, 22, 23, 25, 53, 67, 68, 69, 80, 110, 111, 123, 135, 137, 138, 139, 143, 161, 389, 443,
        445, 465, 587, 636, 873, 993, 995, 1433, 1521, 2049, 2375, 2376, 2483, 2484, 3000, 3306, 3389,
        4000, 4444, 5000, 5432, 5601, 5672, 5900, 5985, 5986, 6379, 6443, 7001, 8000, 8080, 8081, 8443,
        8888, 9200, 9300, 10250, 11211, 15672, 27017,
      ];
      const ports = Array.isArray(payload.ports) && payload.ports.length ? payload.ports : common;
      result = await portScan({ hostname, ports, timeoutMs: 1500, maxConcurrency: 80 });
    } else if (payload.scanType === 'web_owasp_quick') {
      const targetUrl = payload.target;
      result = await owaspWebQuickChecks({ baseUrl: targetUrl });
    } else {
      throw new Error(`Unknown scanType: ${payload.scanType}`);
    }

    db.prepare(
      'UPDATE agent_runs SET status = ?, finished_at = ?, result_json = ? WHERE id = ? AND user_id = ?'
    ).run('completed', nowIso(), JSON.stringify(result), runId, req.user.id);

    db.prepare('UPDATE agent_approvals SET status = ?, decided_at = ? WHERE id = ? AND user_id = ?').run(
      'executed',
      nowIso(),
      id,
      req.user.id
    );

    res.json({ ok: true, runId, result });
  } catch (err) {
    next(err);
  }
});

export default router;
