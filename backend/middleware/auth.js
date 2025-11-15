import jwt from 'jsonwebtoken';

// Simple admin authentication middleware
export const adminAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No valid token provided.' });
    }

    const token = authHeader.substring(7);
    
    // For demo purposes, we'll use a simple approach
    // In production, implement proper user authentication
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Generate admin token (for demo - replace with proper auth)
export const generateAdminToken = () => {
  return jwt.sign(
    { role: 'admin', user: 'admin' },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '24h' }
  );
};