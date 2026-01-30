import bcrypt from 'bcryptjs';
import User from '../../../models/User.js';
import { signAccessToken } from '../utils/jwt.js';

const normalizeEmail = (email) => String(email || '').toLowerCase().trim();

export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body || {};

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'email, password, firstName, lastName are required' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const normalizedEmail = normalizeEmail(email);
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(String(password), 12);
    const user = await User.create({
      email: normalizedEmail,
      passwordHash,
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      emailVerified: false,
      phoneVerified: false,
    });

    const token = signAccessToken({ sub: String(user._id), email: user.email });
    return res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
    });
  } catch (err) {
    console.error('Auth register error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email: normalizeEmail(email) });
    if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(String(password), user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    user.lastLoginAt = new Date();
    await user.save();

    const token = signAccessToken({ sub: String(user._id), email: user.email });
    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
    });
  } catch (err) {
    console.error('Auth login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const me = async (req, res) => {
  try {
    const userId = req.auth?.sub;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
    });
  } catch (err) {
    console.error('Auth me error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
