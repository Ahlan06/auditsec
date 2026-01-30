import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import db from '../client/db.js';
import { signClientToken } from '../middleware/clientAuth.js';
import { getOAuthClients, getFrontendUrl } from '../modules/auth/oauth/oauthClients.js';
import { mailer } from '../utils/mailer.js';
import { sendPhoneVerificationCode } from '../modules/auth/services/smsService.js';

const router = express.Router();

// OAuth flow store (in-memory) for CSRF protection (state) + redirect (next).
// Note: For multi-instance production, replace with Redis or DB-backed storage.
const OAUTH_FLOW_TTL_MS = 10 * 60 * 1000;
const oauthFlowsByState = new Map();

const cleanupOAuthFlows = () => {
  const now = Date.now();
  for (const [state, flow] of oauthFlowsByState.entries()) {
    if (!flow?.createdAt || now - flow.createdAt > OAUTH_FLOW_TTL_MS) {
      oauthFlowsByState.delete(state);
    }
  }
};

// Best-effort cleanup; won't keep the process alive.
const cleanupInterval = setInterval(cleanupOAuthFlows, 60 * 1000);
cleanupInterval.unref?.();

const normalizeNextPath = (value) => {
  if (!value) return '/account';
  const raw = String(value).trim();
  // Only allow safe relative paths.
  if (!raw.startsWith('/')) return '/account';
  if (raw.startsWith('//')) return '/account';
  if (raw.includes('://')) return '/account';
  return raw;
};

const normalizeEmail = (email) => (email ? String(email).toLowerCase().trim() : undefined);

const isDev = () => (process.env.NODE_ENV || 'development') !== 'production';

const sha256Hex = (value) => crypto.createHash('sha256').update(String(value)).digest('hex');

const toIso = (date) => date.toISOString();

const parseIsoMs = (iso) => {
  if (!iso) return null;
  const ms = Date.parse(String(iso));
  return Number.isFinite(ms) ? ms : null;
};

const validateE164 = (phone) => /^\+?[1-9]\d{1,14}$/.test(String(phone || '').trim());

const requireSqliteAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    if (!decoded?.id) return res.status(401).json({ error: 'Invalid token' });

    req.user = { id: decoded.id, email: decoded.email };
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Manual auth (SQLite)
router.post('/register', (req, res) => {
  const { email, password, firstName, lastName, phone, newsletter } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  if (String(password).length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  const normalizedEmail = normalizeEmail(email);
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
  if (exists) return res.status(409).json({ error: 'Email already registered' });

  const hash = bcrypt.hashSync(String(password), 10);

  const phoneValue = phone ? String(phone).trim() : null;
  if (phoneValue && !validateE164(phoneValue)) {
    return res.status(400).json({ error: 'Invalid phone format (use E.164: +33...)' });
  }

  const info = db
    .prepare(
      'INSERT INTO users (email, password_hash, first_name, last_name, phone, newsletter_opt_in) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .run(
      normalizedEmail,
      hash,
      firstName ? String(firstName).trim() : null,
      lastName ? String(lastName).trim() : null,
      phoneValue,
      newsletter === false ? 0 : 1
    );

  const token = signClientToken({ id: info.lastInsertRowid, email: normalizedEmail });
  return res.status(201).json({ token, user: { id: info.lastInsertRowid, email: normalizedEmail } });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const normalizedEmail = normalizeEmail(email);
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = bcrypt.compareSync(String(password), user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signClientToken({ id: user.id, email: user.email });
  return res.json({ token, user: { id: user.id, email: user.email } });
});

router.get('/me', requireSqliteAuth, (req, res) => {
  const user = db
    .prepare(
      'SELECT id, email, first_name, last_name, phone, email_verified, phone_verified, plan FROM users WHERE id = ?'
    )
    .get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.first_name || null,
      lastName: user.last_name || null,
      phone: user.phone || null,
      emailVerified: Boolean(user.email_verified),
      phoneVerified: Boolean(user.phone_verified),
      plan: user.plan,
    },
  });
});

// Email verification (SQLite)
router.post('/verify/email/request', requireSqliteAuth, (req, res) => {
  const user = db.prepare('SELECT id, email FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const rawToken = crypto.randomBytes(24).toString('hex');
  const tokenHash = sha256Hex(rawToken);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 60 minutes

  db.prepare(
    'UPDATE users SET email_verification_token_hash = ?, email_verification_expires_at = ? WHERE id = ?'
  ).run(tokenHash, toIso(expiresAt), user.id);

  const frontend = getFrontendUrl();
  const verifyUrl = `${frontend}/auth/verify-email?token=${encodeURIComponent(rawToken)}`;

  const subject = 'AuditSec — Verify your email';
  const text = `Hello,\n\nClick this link to verify your email:\n${verifyUrl}\n\nIf you did not request this, you can ignore this email.`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5">
      <h2>Verify your email</h2>
      <p>Click this link:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>If you did not request this, you can ignore this email.</p>
    </div>
  `;

  const send = async () => {
    await mailer.sendMail({ to: user.email, subject, text, html });
  };

  try {
    if (mailer.isConfigured()) {
      // Fire and forget is okay in dev; but we still await to report real errors.
      // In production, prefer queue.
      return Promise.resolve(send())
        .then(() => res.json({ ok: true }))
        .catch((err) => {
          console.error('Email verification send error:', err);
          // In development, allow the flow to continue even if SMTP is broken.
          // This makes local testing possible without fighting email provider quirks.
          if (isDev()) {
            return res.json({
              ok: true,
              devToken: rawToken,
              verifyUrl,
              warning: 'SMTP send failed; using dev token fallback',
              debug: String(err?.message || err),
            });
          }
          return res.status(500).json({ error: 'Failed to send verification email' });
        });
    }

    // Dev fallback: no SMTP configured
    if (isDev()) {
      return res.json({ ok: true, devToken: rawToken, verifyUrl });
    }
    return res.json({ ok: true });
  } catch (err) {
    console.error('Email verification request error:', err);
    return res.status(500).json({ error: 'Failed to request verification email' });
  }
});

router.post('/verify/email/confirm', requireSqliteAuth, (req, res) => {
  const rawToken = String(req.body?.token || '').trim();
  if (!rawToken) return res.status(400).json({ error: 'Token is required' });

  const user = db
    .prepare(
      'SELECT id, email_verification_token_hash, email_verification_expires_at FROM users WHERE id = ?'
    )
    .get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const expectedHash = user.email_verification_token_hash;
  const expiresMs = parseIsoMs(user.email_verification_expires_at);
  if (!expectedHash || !expiresMs) return res.status(400).json({ error: 'No pending verification' });
  if (Date.now() > expiresMs) return res.status(400).json({ error: 'Token expired' });

  const providedHash = sha256Hex(rawToken);
  if (!crypto.timingSafeEqual(Buffer.from(expectedHash), Buffer.from(providedHash))) {
    return res.status(400).json({ error: 'Invalid token' });
  }

  db.prepare(
    'UPDATE users SET email_verified = 1, email_verification_token_hash = NULL, email_verification_expires_at = NULL WHERE id = ?'
  ).run(user.id);

  return res.json({ ok: true });
});

// Phone verification (SQLite)
router.post('/verify/phone/request', requireSqliteAuth, async (req, res) => {
  const phone = String(req.body?.phone || '').trim();
  if (!phone) return res.status(400).json({ error: 'Phone is required' });
  if (!validateE164(phone)) return res.status(400).json({ error: 'Invalid phone format (use E.164: +33...)' });

  // 6-digit numeric code
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const codeHash = sha256Hex(code);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  db.prepare(
    'UPDATE users SET phone = ?, phone_verification_code_hash = ?, phone_verification_expires_at = ? WHERE id = ?'
  ).run(phone, codeHash, toIso(expiresAt), req.user.id);

  try {
    // Send via Twilio if configured; otherwise dev fallback.
    await sendPhoneVerificationCode({ to: phone, code });
    return res.json({ ok: true });
  } catch (err) {
    if (err?.code === 'SMS_NOT_CONFIGURED' && isDev()) {
      return res.json({ ok: true, devCode: code });
    }
    console.error('Phone verification request error:', err);
    return res.status(500).json({ error: 'Failed to send verification code' });
  }
});

router.post('/verify/phone/confirm', requireSqliteAuth, (req, res) => {
  const code = String(req.body?.code || '').trim();
  if (!code) return res.status(400).json({ error: 'Code is required' });

  const user = db
    .prepare(
      'SELECT id, phone_verification_code_hash, phone_verification_expires_at FROM users WHERE id = ?'
    )
    .get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const expectedHash = user.phone_verification_code_hash;
  const expiresMs = parseIsoMs(user.phone_verification_expires_at);
  if (!expectedHash || !expiresMs) return res.status(400).json({ error: 'No pending verification' });
  if (Date.now() > expiresMs) return res.status(400).json({ error: 'Code expired' });

  const providedHash = sha256Hex(code);
  if (!crypto.timingSafeEqual(Buffer.from(expectedHash), Buffer.from(providedHash))) {
    return res.status(400).json({ error: 'Invalid code' });
  }

  db.prepare(
    'UPDATE users SET phone_verified = 1, phone_verification_code_hash = NULL, phone_verification_expires_at = NULL WHERE id = ?'
  ).run(user.id);

  return res.json({ ok: true });
});

// OAuth (OIDC) providers (SQLite identity linking)
const buildCallbackRedirect = (token, provider, next) => {
  const base = getFrontendUrl();
  const safeNext = normalizeNextPath(next);
  return `${base}/auth/oauth/callback?provider=${encodeURIComponent(provider)}&token=${encodeURIComponent(token)}&next=${encodeURIComponent(safeNext)}`;
};

router.get('/oauth/:provider', async (req, res) => {
  const provider = String(req.params.provider || '').toLowerCase();
  const clients = await getOAuthClients();
  const entry = clients[provider];
  if (!entry) return res.status(400).json({ error: 'OAuth provider not configured' });

  const { client } = entry;
  const next = normalizeNextPath(req.query?.next);
  const state = crypto.randomBytes(18).toString('hex');
  const nonce = crypto.randomBytes(18).toString('hex');

  oauthFlowsByState.set(state, { createdAt: Date.now(), provider, nonce, next });

  const url = client.authorizationUrl({
    scope: 'openid email profile',
    state,
    nonce,
  });
  return res.redirect(url);
});

router.get('/oauth/:provider/callback', async (req, res) => {
  try {
    const provider = String(req.params.provider || '').toLowerCase();
    const clients = await getOAuthClients();
    const entry = clients[provider];
    if (!entry) return res.status(400).json({ error: 'OAuth provider not configured' });

    const { client } = entry;
    const params = client.callbackParams(req);

    const state = String(params?.state || '');
    const flow = state ? oauthFlowsByState.get(state) : null;
    if (!flow || flow.provider !== provider) {
      return res.status(400).json({ error: 'Invalid or expired OAuth state' });
    }
    // One-time use.
    oauthFlowsByState.delete(state);

    const tokenSet = await client.callback(client.metadata.redirect_uris[0], params, {});

    const claims = tokenSet.claims();
    if (flow.nonce && claims?.nonce && String(claims.nonce) !== String(flow.nonce)) {
      return res.status(400).json({ error: 'Invalid OAuth nonce' });
    }

    const email = normalizeEmail(claims.email);
    const sub = claims.sub;

    if (!sub) return res.status(400).json({ error: 'OAuth missing subject' });

    const existingIdentity = db
      .prepare('SELECT user_id FROM user_oauth_identities WHERE provider = ? AND sub = ?')
      .get(provider, sub);

    let userId;

    if (existingIdentity?.user_id) {
      userId = existingIdentity.user_id;
    } else {
      const existingUser = email ? db.prepare('SELECT id FROM users WHERE email = ?').get(email) : null;

      if (existingUser?.id) {
        userId = existingUser.id;
      } else {
        // users.password_hash is NOT NULL; create an unusable random password by default.
        const randomPassword = crypto.randomBytes(32).toString('hex');
        const hash = bcrypt.hashSync(randomPassword, 10);
        const created = db
          .prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
          .run(email || `oauth_${provider}_${sub}@local.invalid`, hash);
        userId = created.lastInsertRowid;
      }

      db.prepare(
        'INSERT OR IGNORE INTO user_oauth_identities (user_id, provider, sub, email) VALUES (?, ?, ?, ?)' 
      ).run(userId, provider, sub, email || null);
    }

    const user = db.prepare('SELECT id, email FROM users WHERE id = ?').get(userId);
    const jwtToken = signClientToken({ id: user.id, email: user.email });
    return res.redirect(buildCallbackRedirect(jwtToken, provider, flow.next));
  } catch (err) {
    console.error('OAuth callback error (sqlite):', err);
    return res.status(500).json({ error: 'OAuth error' });
  }
});

export default router;
