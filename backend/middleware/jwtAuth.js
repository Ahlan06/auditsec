import jwt from 'jsonwebtoken';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  return secret;
};

/**
 * Middleware d'authentification JWT
 * Vérifie le token dans l'en-tête Authorization: Bearer <token>
 * Ajoute req.auth avec les données décodées du token
 */
export const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Vérifier la présence de l'en-tête Authorization
    if (!authHeader) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authorization header provided',
      });
    }

    // Vérifier le format Bearer
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid authorization format. Expected: Bearer <token>',
      });
    }

    // Extraire le token
    const token = authHeader.slice('Bearer '.length).trim();
    
    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided',
      });
    }

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, getJwtSecret());
    
    // Vérifier que le token contient les informations nécessaires
    if (!decoded.sub) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Invalid token payload',
      });
    }

    // Attacher les données décodées à la requête
    req.auth = decoded;
    return next();
    
  } catch (error) {
    // Gestion des erreurs spécifiques JWT
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token has expired',
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token',
      });
    }
    
    if (error.name === 'NotBeforeError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token not yet valid',
      });
    }

    // Erreur générique
    console.error('JWT Auth Error:', error);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication failed',
    });
  }
};

/**
 * Middleware optionnel d'authentification JWT
 * N'échoue pas si aucun token n'est fourni
 * Utile pour les routes publiques avec des fonctionnalités optionnelles pour utilisateurs connectés
 */
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.auth = null;
      return next();
    }

    const token = authHeader.slice('Bearer '.length).trim();
    
    if (!token) {
      req.auth = null;
      return next();
    }

    const decoded = jwt.verify(token, getJwtSecret());
    req.auth = decoded;
    return next();
    
  } catch (error) {
    // En cas d'erreur, continuer sans auth
    req.auth = null;
    return next();
  }
};

