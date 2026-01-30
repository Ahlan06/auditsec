import jwt from 'jsonwebtoken';

// Security: never allow a hardcoded fallback secret in production.
const getJwtSecret = () => {
  const secret = String(process.env.JWT_SECRET || '').trim();
  const env = process.env.NODE_ENV || 'development';
  if (env === 'production') {
    if (!secret || secret === 'fallback-secret') {
      throw new Error('JWT_SECRET must be set to a strong random value in production');
    }
    return secret;
  }

  // Development convenience only.
  return secret || 'fallback-secret';
};

export const clientAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const signClientToken = (payload) => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
};
