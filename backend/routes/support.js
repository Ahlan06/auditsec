import express from 'express';
import multer from 'multer';
import { mailer } from '../utils/mailer.js';

const router = express.Router();

const MAX_FILES = 3;
const MAX_FILE_SIZE_BYTES = 7 * 1024 * 1024; // 7MB per file

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: MAX_FILES,
    fileSize: MAX_FILE_SIZE_BYTES,
  },
});

const sanitizeHeaderValue = (value) => String(value || '').replace(/[\r\n]+/g, ' ').trim();

const collectFiles = (req) => {
  const files = [];

  // Support both styles:
  // - attachment_1 / attachment_2 / attachment_3 (our current UI)
  // - attachments[] (a single multiple input)
  const fileFields = ['attachment_1', 'attachment_2', 'attachment_3', 'attachments'];
  for (const field of fileFields) {
    const fieldFiles = (req.files?.[field] || []).filter(Boolean);
    for (const f of fieldFiles) files.push(f);
  }

  return files.slice(0, MAX_FILES);
};

router.post(
  '/contact',
  upload.fields([
    { name: 'attachment_1', maxCount: 1 },
    { name: 'attachment_2', maxCount: 1 },
    { name: 'attachment_3', maxCount: 1 },
    { name: 'attachments', maxCount: MAX_FILES },
  ]),
  async (req, res, next) => {
    try {
      const fromName = sanitizeHeaderValue(req.body?.from_name);
      const fromEmail = sanitizeHeaderValue(req.body?.from_email);
      const subject = sanitizeHeaderValue(req.body?.subject);
      const message = String(req.body?.message || '').trim();

      if (!fromName || !fromEmail || !subject || !message) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          message: 'Missing required fields: name, email, subject, message.',
        });
      }

      const supportTo = (process.env.SUPPORT_EMAIL || process.env.FROM_EMAIL || '').trim();
      if (!supportTo) {
        return res.status(500).json({
          error: 'SUPPORT_EMAIL_MISSING',
          message: 'SUPPORT_EMAIL (or FROM_EMAIL) is not configured on the server.',
        });
      }

      const rawFiles = collectFiles(req);
      const attachments = rawFiles.map((f) => ({
        filename: sanitizeHeaderValue(f.originalname) || 'attachment',
        content: f.buffer,
        contentType: f.mimetype,
      }));

      const text = [
        `New support message`,
        `From: ${fromName} <${fromEmail}>`,
        `Subject: ${subject}`,
        `Attachments: ${attachments.length}`,
        '',
        message,
      ].join('\n');

      const html = `
        <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.5;">
          <h2 style="margin: 0 0 12px;">New support message</h2>
          <div><strong>From:</strong> ${escapeHtml(fromName)} &lt;${escapeHtml(fromEmail)}&gt;</div>
          <div><strong>Subject:</strong> ${escapeHtml(subject)}</div>
          <div><strong>Attachments:</strong> ${attachments.length}</div>
          <hr style="margin: 16px 0; border: 0; border-top: 1px solid #e5e7eb;" />
          <pre style="white-space: pre-wrap; margin: 0;">${escapeHtml(message)}</pre>
        </div>
      `;

      await mailer.sendMail({
        to: supportTo,
        subject: `[Support] ${subject}`,
        text,
        html,
        replyTo: fromEmail,
        attachments,
      });

      return res.status(200).json({
        ok: true,
        sent: {
          attachments: attachments.map((a) => ({ filename: a.filename, contentType: a.contentType })),
        },
      });
    } catch (err) {
      if (err?.code === 'MAIL_NOT_CONFIGURED') {
        return res.status(503).json({
          error: 'MAIL_NOT_CONFIGURED',
          message:
            'SMTP is not configured on the server. Set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/FROM_EMAIL (and optionally SUPPORT_EMAIL).',
        });
      }

      if (err?.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          error: 'FILE_TOO_LARGE',
          message: `Attachment too large. Max ${Math.floor(MAX_FILE_SIZE_BYTES / (1024 * 1024))}MB per file.`,
        });
      }

      if (err?.code === 'LIMIT_FILE_COUNT') {
        return res.status(413).json({
          error: 'TOO_MANY_FILES',
          message: `Too many attachments. Max ${MAX_FILES}.`,
        });
      }

      return next(err);
    }
  }
);

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default router;
