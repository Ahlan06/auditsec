import express from 'express';
import { requireAuth } from '../middleware/jwtAuth.js';
import {
  createAudit,
  listAudits,
  getAudit,
  runAudit,
  cancelAudit,
} from '../controllers/auditController.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification JWT
router.use(requireAuth);

/**
 * @route   POST /api/audits
 * @desc    Créer un nouvel audit
 * @access  Private (JWT)
 * @body    { targetType: 'domain'|'ip'|'email', targetValue: string }
 */
router.post('/', createAudit);

/**
 * @route   GET /api/audits
 * @desc    Lister les audits de l'utilisateur avec pagination
 * @access  Private (JWT)
 * @query   page, limit, status, sortBy, sortOrder
 */
router.get('/', listAudits);

/**
 * @route   GET /api/audits/:id
 * @desc    Récupérer les détails d'un audit spécifique
 * @access  Private (JWT + RBAC: propriétaire uniquement)
 */
router.get('/:id', getAudit);

/**
 * @route   POST /api/audits/:id/run
 * @desc    Lancer l'exécution d'un audit
 * @access  Private (JWT + RBAC: propriétaire uniquement)
 */
router.post('/:id/run', runAudit);

/**
 * @route   POST /api/audits/:id/cancel
 * @desc    Annuler un audit en cours
 * @access  Private (JWT + RBAC: propriétaire uniquement)
 */
router.post('/:id/cancel', cancelAudit);

export default router;
