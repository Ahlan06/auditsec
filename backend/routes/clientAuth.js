import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '../client/db.js';
import { signClientToken } from '../middleware/clientAuth.js';
import { mailer } from '../utils/mailer.js';

const router = express.Router();

const normalizeEmail = (email) => (email ? String(email).toLowerCase().trim() : undefined);

router.post('/register', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const normalizedEmail = normalizeEmail(email);

  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
  if (exists) return res.status(409).json({ error: 'Email already registered' });

  const hash = bcrypt.hashSync(password, 10);
  const info = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(normalizedEmail, hash);
  const token = signClientToken({ id: info.lastInsertRowid, email: normalizedEmail });
  return res.status(201).json({ token, user: { id: info.lastInsertRowid, email: normalizedEmail } });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const normalizedEmail = normalizeEmail(email);
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = signClientToken({ id: user.id, email: user.email });
  return res.json({ token, user: { id: user.id, email: user.email } });
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email is required' });

  // Always return success to avoid leaking account existence
  const normalizedEmail = String(email).toLowerCase().trim();
  const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(normalizedEmail);

  if (user) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    db.prepare(
      'UPDATE users SET reset_token_hash = ?, reset_token_expires_at = ? WHERE id = ?'
    ).run(tokenHash, expiresAt, user.id);

    const origin = req.headers.origin;
    const baseUrl = origin && String(origin).startsWith('http')
      ? origin
      : (process.env.FRONTEND_URL || 'http://localhost:5174');
    const resetUrl = `${baseUrl}/client/reset-password?token=${rawToken}`;

    const subject = 'AuditSec — Réinitialisation de mot de passe';
    const text = `Bonjour,\n\nClique sur ce lien pour réinitialiser ton mot de passe (valide 30 minutes) :\n${resetUrl}\n\nSi tu n'es pas à l'origine de cette demande, ignore ce message.`;
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2>Réinitialisation de mot de passe</h2>
        <p>Clique sur ce lien (valide <b>30 minutes</b>) :</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>Si tu n'es pas à l'origine de cette demande, ignore ce message.</p>
      </div>
    `;

    try {
      await mailer.sendMail({ to: user.email, subject, text, html });
      console.log('✅ Password reset email sent to:', user.email);
    } catch (err) {
      // Dev fallback: log link to server console when SMTP isn't configured
      if (err?.code === 'MAIL_NOT_CONFIGURED') {
        console.warn('⚠️ SMTP non configuré. Lien de reset (dev):', resetUrl);
      } else {
        console.error('❌ Password reset email error:', err);
      }
    }
  }

  return res.json({
    success: true,
    message: "Si un compte existe, un email de réinitialisation a été envoyé.",
  });
});

router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body || {};
  if (!token || !newPassword) return res.status(400).json({ error: 'Token and newPassword are required' });
  if (String(newPassword).length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');
  const user = db
    .prepare(
      'SELECT id, reset_token_expires_at FROM users WHERE reset_token_hash = ?'
    )
    .get(tokenHash);

  if (!user || !user.reset_token_expires_at) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }

  const expires = Date.parse(user.reset_token_expires_at);
  if (!expires || expires < Date.now()) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }

  const hash = bcrypt.hashSync(String(newPassword), 10);
  db.prepare(
    'UPDATE users SET password_hash = ?, reset_token_hash = NULL, reset_token_expires_at = NULL WHERE id = ?'
  ).run(hash, user.id);

  return res.json({ success: true });
});

export default router;
