import User from '../../../models/User.js';
import { generateRawToken, sha256Hex, generateOtp } from '../utils/cryptoTokens.js';
import { sendEmailVerification } from '../services/emailService.js';
import { sendPhoneVerificationCode } from '../services/smsService.js';

const getFrontendUrl = () => (process.env.FRONTEND_URL || 'http://localhost:5173');

export const requestEmailVerification = async (req, res) => {
  try {
    const userId = req.auth?.sub;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.email) return res.status(400).json({ error: 'Email missing' });

    const rawToken = generateRawToken(32);
    user.emailVerificationTokenHash = sha256Hex(rawToken);
    user.emailVerificationExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();

    const verifyUrl = `${getFrontendUrl()}/auth/verify-email?token=${rawToken}`;
    try {
      await sendEmailVerification({ to: user.email, verifyUrl });
    } catch (err) {
      if (err?.code === 'MAIL_NOT_CONFIGURED') {
        console.warn('⚠️ SMTP non configuré. Lien de vérif email (dev):', verifyUrl);
      } else {
        throw err;
      }
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Email verification request error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const confirmEmailVerification = async (req, res) => {
  try {
    const { token } = req.body || {};
    if (!token) return res.status(400).json({ error: 'token is required' });

    const tokenHash = sha256Hex(token);
    const user = await User.findOne({ emailVerificationTokenHash: tokenHash });
    if (!user || !user.emailVerificationExpiresAt) return res.status(400).json({ error: 'Invalid or expired token' });
    if (user.emailVerificationExpiresAt.getTime() < Date.now()) return res.status(400).json({ error: 'Invalid or expired token' });

    user.emailVerified = true;
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpiresAt = undefined;
    await user.save();

    return res.json({ success: true });
  } catch (err) {
    console.error('Email verification confirm error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const requestPhoneVerification = async (req, res) => {
  try {
    const userId = req.auth?.sub;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { phone } = req.body || {};
    if (!phone) return res.status(400).json({ error: 'phone is required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const code = generateOtp(6);
    user.phone = String(phone).trim();
    user.phoneVerificationCodeHash = sha256Hex(code);
    user.phoneVerificationExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendPhoneVerificationCode({ to: user.phone, code });
    } catch (err) {
      if (err?.code === 'SMS_NOT_CONFIGURED') {
        console.warn('⚠️ SMS non configuré. Code téléphone (dev):', code);
      } else {
        throw err;
      }
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Phone verification request error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const confirmPhoneVerification = async (req, res) => {
  try {
    const userId = req.auth?.sub;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { code } = req.body || {};
    if (!code) return res.status(400).json({ error: 'code is required' });

    const user = await User.findById(userId);
    if (!user || !user.phoneVerificationCodeHash || !user.phoneVerificationExpiresAt) {
      return res.status(400).json({ error: 'No pending verification' });
    }
    if (user.phoneVerificationExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    const ok = sha256Hex(code) === user.phoneVerificationCodeHash;
    if (!ok) return res.status(400).json({ error: 'Invalid or expired code' });

    user.phoneVerified = true;
    user.phoneVerificationCodeHash = undefined;
    user.phoneVerificationExpiresAt = undefined;
    await user.save();

    return res.json({ success: true });
  } catch (err) {
    console.error('Phone verification confirm error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
