import { z } from 'zod';
import Audit from '../models/Audit.js';
import { enqueueAuditJob, removeAuditJob } from '../queues/auditQueue.js';

// ===================================
// VALIDATION SCHEMAS
// ===================================

const createAuditSchema = z.object({
  targetType: z.enum(['domain', 'ip', 'email'], {
    errorMap: () => ({ message: 'targetType must be one of: domain, ip, email' }),
  }),
  targetValue: z.string().trim().min(1, 'targetValue is required'),
});

const listAuditsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['queued', 'running', 'completed', 'failed']).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ===================================
// CONTROLLERS
// ===================================

/**
 * POST /api/audits
 * Créer un nouvel audit
 */
export const createAudit = async (req, res) => {
  try {
    // Récupérer l'ID utilisateur depuis le token JWT
    const userId = req.auth?.sub;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    // Valider les données d'entrée
    const validationResult = createAuditSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: validationResult.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }

    const { targetType, targetValue } = validationResult.data;

    // Créer l'audit
    const audit = await Audit.create({
      userId,
      targetType,
      targetValue,
      status: 'queued',
      progress: 0,
    });

    return res.status(201).json({
      message: 'Audit created successfully',
      audit: {
        id: audit._id,
        userId: audit.userId,
        targetType: audit.targetType,
        targetValue: audit.targetValue,
        status: audit.status,
        progress: audit.progress,
        createdAt: audit.createdAt,
      },
    });
  } catch (error) {
    console.error('Create audit error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create audit',
    });
  }
};

/**
 * GET /api/audits
 * Lister les audits de l'utilisateur avec pagination
 */
export const listAudits = async (req, res) => {
  try {
    const userId = req.auth?.sub;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    // Valider les query params
    const validationResult = listAuditsSchema.safeParse(req.query);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation error',
        details: validationResult.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }

    const { page, limit, status, sortBy, sortOrder } = validationResult.data;

    // Construire le filtre (RBAC: seuls les audits de l'utilisateur)
    const filter = { userId };
    if (status) {
      filter.status = status;
    }

    // Calculer le skip pour la pagination
    const skip = (page - 1) * limit;

    // Construire le tri
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Récupérer les audits
    const [audits, total] = await Promise.all([
      Audit.find(filter).sort(sort).skip(skip).limit(limit),
      Audit.countDocuments(filter),
    ]);

    // Calculer les métadonnées de pagination
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).json({
      audits: audits.map((audit) => ({
        id: audit._id,
        targetType: audit.targetType,
        targetValue: audit.targetValue,
        status: audit.status,
        progress: audit.progress,
        riskScore: audit.riskScore,
        startedAt: audit.startedAt,
        finishedAt: audit.finishedAt,
        createdAt: audit.createdAt,
        updatedAt: audit.updatedAt,
        duration: audit.durationFormatted,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error('List audits error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch audits',
    });
  }
};

/**
 * GET /api/audits/:id
 * Récupérer les détails d'un audit spécifique
 */
export const getAudit = async (req, res) => {
  try {
    const userId = req.auth?.sub;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    // Récupérer l'audit
    const audit = await Audit.findById(id);

    if (!audit) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Audit not found',
      });
    }

    // RBAC: Vérifier que l'audit appartient à l'utilisateur
    if (audit.userId.toString() !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to access this audit',
      });
    }

    return res.status(200).json({
      audit: {
        id: audit._id,
        userId: audit.userId,
        targetType: audit.targetType,
        targetValue: audit.targetValue,
        status: audit.status,
        progress: audit.progress,
        riskScore: audit.riskScore,
        startedAt: audit.startedAt,
        finishedAt: audit.finishedAt,
        error: audit.error,
        results: audit.results,
        createdAt: audit.createdAt,
        updatedAt: audit.updatedAt,
        duration: audit.duration,
        durationFormatted: audit.durationFormatted,
      },
    });
  } catch (error) {
    console.error('Get audit error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid audit ID format',
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch audit',
    });
  }
};

/**
 * POST /api/audits/:id/run
 * Lancer l'exécution d'un audit
 */
export const runAudit = async (req, res) => {
  try {
    const userId = req.auth?.sub;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    // Récupérer l'audit
    const audit = await Audit.findById(id);

    if (!audit) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Audit not found',
      });
    }

    // RBAC: Vérifier que l'audit appartient à l'utilisateur
    if (audit.userId.toString() !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to run this audit',
      });
    }

    // Vérifier que l'audit n'est pas déjà en cours ou terminé
    if (audit.status === 'running' || audit.status === 'queued') {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Audit is already ${audit.status}`,
      });
    }

    if (audit.status === 'completed') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Audit is already completed. Create a new audit to run again.',
      });
    }

    // Mettre le status à 'queued' (le worker le passera à 'running')
    audit.status = 'queued';
    audit.progress = 0;
    await audit.save();

    // Envoyer le job BullMQ
    try {
      await enqueueAuditJob({
        auditId: audit._id.toString(),
        targetType: audit.targetType,
        targetValue: audit.targetValue,
        userId: audit.userId.toString(),
      });
      
      console.log(`[AuditController] Audit ${audit._id} enqueued successfully`);
    } catch (queueError) {
      console.error('[AuditController] Failed to enqueue audit:', queueError);
      // Revert audit status if queue fails
      audit.status = 'failed';
      audit.error = 'Failed to enqueue audit job';
      await audit.save();
      
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to queue audit for processing',
      });
    }

    return res.status(200).json({
      message: 'Audit queued successfully',
      audit: {
        id: audit._id,
        userId: audit.userId,
        targetType: audit.targetType,
        targetValue: audit.targetValue,
        status: audit.status,
        progress: audit.progress,
        createdAt: audit.createdAt,
        updatedAt: audit.updatedAt,
      },
    });
  } catch (error) {
    console.error('Run audit error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid audit ID format',
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to start audit',
    });
  }
};

/**
 * POST /api/audits/:id/cancel
 * Annuler un audit en cours
 */
export const cancelAudit = async (req, res) => {
  try {
    const userId = req.auth?.sub;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    // Récupérer l'audit
    const audit = await Audit.findById(id);

    if (!audit) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Audit not found',
      });
    }

    // RBAC: Vérifier que l'audit appartient à l'utilisateur
    if (audit.userId.toString() !== userId) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to cancel this audit',
      });
    }

    // Vérifier que l'audit peut être annulé
    if (audit.status !== 'queued' && audit.status !== 'running') {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Cannot cancel audit with status: ${audit.status}`,
      });
    }

    // Supprimer de la queue BullMQ si présent
    try {
      await removeAuditJob(audit._id.toString());
      console.log(`[AuditController] Audit ${audit._id} removed from queue`);
    } catch (queueError) {
      console.warn('[AuditController] Failed to remove from queue (may not exist):', queueError.message);
      // Continue anyway - job may have already processed
    }

    // Annuler l'audit
    await audit.fail('Cancelled by user');

    return res.status(200).json({
      message: 'Audit cancelled successfully',
      audit: {
        id: audit._id,
        status: audit.status,
        error: audit.error,
        finishedAt: audit.finishedAt,
      },
    });
  } catch (error) {
    console.error('Cancel audit error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid audit ID format',
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to cancel audit',
    });
  }
};
