import bcrypt from 'bcryptjs';
import User from '../../../models/User.js';
import { generateRawToken, sha256Hex, generateOtp } from '../utils/cryptoTokens.js';
import { sendPasswordResetEmail } from '../services/emailService.js';
import { sendPasswordResetCodeSms } from '../services/smsService.js';

const normalizeEmail = (email) => String(email || '').toLowerCase().trim();
const getFrontendUrl = () => (process.env.FRONTEND_URL || 'http://localhost:5173');

export const forgotPassword = async (req, res) => {
  try {
    const { email, phone, channel } = req.body || {};
    const mode = String(channel || '').toLowerCase();

    // Always return success to avoid leaking account existence
    if (mode === 'sms') {
      if (!phone) return res.status(400).json({ error: 'phone is required for sms' });
      const user = await User.findOne({ phone: String(phone).trim() });
      if (user) {
        const code = generateOtp(6);
        user.passwordResetSmsCodeHash = sha256Hex(code);
        user.passwordResetSmsExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();
        try {
          await sendPasswordResetCodeSms({ to: user.phone, code });
        } catch (err) {
          if (err?.code === 'SMS_NOT_CONFIGURED') {
            console.warn('⚠️ SMS non configuré. Code reset (dev):', code);
          } else {
            throw err;
          }
        }
      }
      return res.json({ success: true, message: 'If the account exists, a reset code has been sent.' });
    }

    // default: email
    if (!email) return res.status(400).json({ error: 'email is required for email reset' });
    const user = await User.findOne({ email: normalizeEmail(email) });
    if (user) {
      const rawToken = generateRawToken(32);
      user.passwordResetTokenHash = sha256Hex(rawToken);
      user.passwordResetExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();

      const resetUrl = `${getFrontendUrl()}/auth/reset-password?token=${rawToken}`;
      try {
        await sendPasswordResetEmail({ to: user.email, resetUrl });
      } catch (err) {
        if (err?.code === 'MAIL_NOT_CONFIGURED') {
          console.warn('⚠️ SMTP non configuré. Lien reset (dev):', resetUrl);
        } else {
          throw err;
        }
      }
    }

    return res.json({ success: true, message: 'If the account exists, a reset email has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const resetPasswordWithToken = async (req, res) => {
  try {
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword) return res.status(400).json({ error: 'token and newPassword are required' });
    if (String(newPassword).length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const user = await User.findOne({ passwordResetTokenHash: sha256Hex(token) });
    if (!user || !user.passwordResetExpiresAt) return res.status(400).json({ error: 'Invalid or expired token' });
    if (user.passwordResetExpiresAt.getTime() < Date.now()) return res.status(400).json({ error: 'Invalid or expired token' });

    user.passwordHash = await bcrypt.hash(String(newPassword), 12);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();

    return res.json({ success: true });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const resetPasswordWithSmsCode = async (req, res) => {
  try {
    const { phone, code, newPassword } = req.body || {};
    if (!phone || !code || !newPassword) return res.status(400).json({ error: 'phone, code, newPassword are required' });
    if (String(newPassword).length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const user = await User.findOne({ phone: String(phone).trim() });
    if (!user || !user.passwordResetSmsCodeHash || !user.passwordResetSmsExpiresAt) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }
    if (user.passwordResetSmsExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    if (sha256Hex(code) !== user.passwordResetSmsCodeHash) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    user.passwordHash = await bcrypt.hash(String(newPassword), 12);
    user.passwordResetSmsCodeHash = undefined;
    user.passwordResetSmsExpiresAt = undefined;
    await user.save();

    return res.json({ success: true });
  } catch (err) {
    console.error('Reset password sms error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
