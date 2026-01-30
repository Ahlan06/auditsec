import express from 'express';
import db from '../client/db.js';
import { clientAuth } from '../middleware/clientAuth.js';
import { createUserRateLimiter } from '../middleware/userRateLimit.js';
import { getUserEntitlements } from '../services/entitlements.js';
import { enqueueScanJob } from '../queues/scanQueue.js';

const router = express.Router();

// All routes require auth
router.use(clientAuth);

// SaaS safety: per-user rate limiting on audits endpoints.
router.use(
  createUserRateLimiter({
    windowMs: Number(process.env.RL_CLIENT_AUDITS_WINDOW_MS) || 60_000,
    max: Number(process.env.RL_CLIENT_AUDITS_MAX) || 30,
    keyPrefix: 'client-audits',
  })
);

const normalizeTarget = (value) => {
  if (!value) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  // Accept domain or URL; store as normalized URL-like string
  try {
    if (/^https?:\/\//i.test(raw)) {
      const u = new URL(raw);
      if (!u.hostname) return null;
      return u.toString();
    }
    // Domain only
    if (!/^[a-z0-9.-]+$/i.test(raw)) return null;
    return `https://${raw}`;
  } catch {
    return null;
  }
};

const getHostnameFromNormalizedTarget = (normalizedTarget) => {
  try {
    const u = new URL(String(normalizedTarget));
    return (u.hostname || '').toLowerCase();
  } catch {
    return null;
  }
};

const isTargetVerified = ({ userId, hostname }) => {
  const h = String(hostname || '').toLowerCase().trim();
  if (!h) return false;
  const row = db
    .prepare('SELECT verified_at FROM verified_targets WHERE user_id = ? AND hostname = ?')
    .get(Number(userId), h);
  return Boolean(row?.verified_at);
};

const countAuditsToday = ({ userId }) => {
  // Counts audits created since UTC midnight.
  // Security decision: keep quotas server-side and deterministic.
  const row = db
    .prepare(
      "SELECT COUNT(1) as c FROM audits WHERE user_id = ? AND created_at >= strftime('%Y-%m-%dT00:00:00Z','now')"
    )
    .get(Number(userId));
  return Number(row?.c || 0);
};

router.get('/', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM audits WHERE user_id = ? ORDER BY id DESC')
    .all(req.user.id);

  const audits = rows.map((r) => ({
    ...r,
    result: r.result_json ? JSON.parse(r.result_json) : null,
    aiAnalysis: r.ai_analysis_json ? JSON.parse(r.ai_analysis_json) : null,
  }));

  res.json({ audits });
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const row = db
    .prepare('SELECT * FROM audits WHERE id = ? AND user_id = ?')
    .get(id, req.user.id);
  if (!row) return res.status(404).json({ error: 'Audit not found' });

  res.json({
    audit: {
      ...row,
      result: row.result_json ? JSON.parse(row.result_json) : null,
      aiAnalysis: row.ai_analysis_json ? JSON.parse(row.ai_analysis_json) : null,
    },
  });
});

router.get('/:id/status', (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare('SELECT id, target_url, status, ai_analysis_json FROM audits WHERE id = ? AND user_id = ?')
    .get(id, req.user.id);
  if (!row) return res.status(404).json({ error: 'Audit not found' });

  let summary = null;
  let errorsCount = 0;
  let aiRiskSummary = null;
  try {
    if (row.result_json && String(row.result_json).length < 1_000_000) {
      const parsed = JSON.parse(row.result_json);
      summary = parsed?.summary || null;
      errorsCount = Array.isArray(parsed?.errors) ? parsed.errors.length : 0;
    }
    if (row.ai_analysis_json) {
      const aiAnalysis = JSON.parse(row.ai_analysis_json);
      aiRiskSummary = aiAnalysis?.riskSummary || null;
    }
  } catch {
    // ignore
  }

  return res.json({
    auditId: row.id,
    status: row.status,
    mode: row.mode,
    target: row.target,
    createdAt: row.created_at,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    summary,
    errorsCount,
    errorText: row.error_text || null,
    aiRiskSummary,
  });
});

router.post('/', (req, res) => {
  const target = normalizeTarget(req.body?.target);
  if (!target) return res.status(400).json({ error: 'target is required (domain or URL)' });

  // SaaS quotas: enforce per-plan daily limit.
  const entitlements = getUserEntitlements(req.user.id);
  const todayCount = countAuditsToday({ userId: req.user.id });
  if (todayCount >= entitlements.maxAuditsPerDay) {
    return res.status(429).json({
      error: 'Quota exceeded',
      message: 'Daily audit quota reached for your plan.',
    });
  }

  // Default to passive mode (non-intrusive). Active mode is gated.
  const requestedMode = String(req.body?.mode || 'passive').toLowerCase();
  const mode = requestedMode === 'active' ? 'active' : 'passive';

  if (mode === 'active') {
    // Security + legal: require plan entitlement AND proof of ownership.
    if (!entitlements.allowActiveScanning) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Active scanning is not enabled for your plan.',
      });
    }

    const hostname = getHostnameFromNormalizedTarget(target);
    if (!hostname || !isTargetVerified({ userId: req.user.id, hostname })) {
      return res.status(403).json({
        error: 'Target not verified',
        message: 'Verify target ownership (DNS TXT) before running active scans.',
      });
    }
  }
  const info = db
    .prepare('INSERT INTO audits (user_id, target, status, mode) VALUES (?, ?, ?, ?)')
    .run(req.user.id, target, 'queued', mode);

  const audit = db
    .prepare('SELECT * FROM audits WHERE id = ? AND user_id = ?')
    .get(info.lastInsertRowid, req.user.id);

  res.status(201).json({ audit });
});

// Launch audit: placeholder until a provider/worker is configured
router.post('/:id/run', (req, res) => {
  const id = Number(req.params.id);
  const audit = db
    .prepare('SELECT * FROM audits WHERE id = ? AND user_id = ?')
    .get(id, req.user.id);
  if (!audit) return res.status(404).json({ error: 'Audit not found' });

  // Safety: active mode is gated at creation time (plan + verified target).
  // We still treat this endpoint as a job submission API; execution happens in a Docker-isolated worker.

  db.prepare(
    'UPDATE audits SET status = ?, started_at = (strftime(\'%Y-%m-%dT%H:%M:%SZ\',\'now\')), finished_at = NULL, result_json = NULL, error_text = NULL WHERE id = ? AND user_id = ?'
  ).run('queued', id, req.user.id);

  enqueueScanJob({
    auditId: id,
    userId: req.user.id,
  })
    .then((job) => {
      return res.status(202).json({
        ok: true,
        jobId: String(job.id),
        queue: job.queueName,
        auditId: id,
      });
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error('failed to enqueue scan job', err);
      return res.status(500).json({
        error: 'Queue error',
        message: 'Failed to enqueue scan job. Is Redis running and configured?',
      });
    });
});

export default router;
