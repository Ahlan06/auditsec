import User from '../../../models/User.js';
import { generateOtp, sha256Hex } from '../utils/cryptoTokens.js';
import { sendPhoneVerificationCode } from '../services/smsService.js';
import { signAccessToken } from '../utils/jwt.js';

export const startPhoneAuth = async (req, res) => {
  try {
    const { phone } = req.body || {};
    if (!phone) return res.status(400).json({ error: 'phone is required' });

    const normalizedPhone = String(phone).trim();
    const code = generateOtp(6);

    let user = await User.findOne({ phone: normalizedPhone });
    if (!user) {
      user = await User.create({
        phone: normalizedPhone,
        phoneVerified: false,
        emailVerified: false,
      });
    }

    user.phoneAuthCodeHash = sha256Hex(code);
    user.phoneAuthExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendPhoneVerificationCode({ to: normalizedPhone, code });
    } catch (err) {
      if (err?.code === 'SMS_NOT_CONFIGURED') {
        console.warn('⚠️ SMS non configuré. Code login téléphone (dev):', code);
      } else {
        throw err;
      }
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Phone auth start error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const verifyPhoneAuth = async (req, res) => {
  try {
    const { phone, code } = req.body || {};
    if (!phone || !code) return res.status(400).json({ error: 'phone and code are required' });

    const normalizedPhone = String(phone).trim();
    const user = await User.findOne({ phone: normalizedPhone });
    if (!user || !user.phoneAuthCodeHash || !user.phoneAuthExpiresAt) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }
    if (user.phoneAuthExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    if (sha256Hex(code) !== user.phoneAuthCodeHash) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    user.phoneVerified = true;
    user.phoneAuthCodeHash = undefined;
    user.phoneAuthExpiresAt = undefined;
    user.lastLoginAt = new Date();
    await user.save();

    const token = signAccessToken({ sub: String(user._id), phone: user.phone, email: user.email });
    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
    });
  } catch (err) {
    console.error('Phone auth verify error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
