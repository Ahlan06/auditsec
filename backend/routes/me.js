import express from 'express';
import { requireAuth } from '../middleware/jwtAuth.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * GET /api/me
 * Récupère les informations publiques de l'utilisateur connecté
 * Protégé par JWT (Authorization: Bearer <token>)
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    // Le middleware requireAuth ajoute req.auth contenant { sub: userId, email }
    const userId = req.auth?.sub;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Valid authentication token required',
      });
    }

    // Récupérer l'utilisateur depuis la base de données
    const user = await User.findById(userId).select('-passwordHash -__v');

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The authenticated user no longer exists',
      });
    }

    // Retourner les informations publiques de l'utilisateur
    return res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.firstName || user.email.split('@')[0],
        phone: user.phone || null,
        emailVerified: user.emailVerified || false,
        phoneVerified: user.phoneVerified || false,
        role: user.role || 'user', // Ajouter si le champ existe dans le modèle
        plan: user.plan || 'free', // Ajouter si le champ existe dans le modèle
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt || null,
      },
    });
  } catch (err) {
    console.error('GET /api/me error:', err);

    // Gestion des erreurs spécifiques
    if (err.name === 'CastError') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid user ID format',
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An error occurred while fetching user data',
    });
  }
});

export default router;
