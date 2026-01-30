import jwt from 'jsonwebtoken';

export const getJwtSecret = () => process.env.JWT_SECRET || 'fallback-secret';

export const signAccessToken = (payload, { expiresIn = '7d' } = {}) => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};
