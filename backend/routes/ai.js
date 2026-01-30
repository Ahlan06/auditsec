import express from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/jwtAuth.js';
import { aiRateLimit } from '../middleware/aiRateLimit.js';
import * as aiService from '../services/aiService.js';

const router = express.Router();

/**
 * Validation schema for chat request
 */
const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message is required').max(5000, 'Message too long'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
        timestamp: z.string().optional(),
      })
    )
    .max(50, 'History too long')
    .optional()
    .default([]),
});

/**
 * POST /api/ai/chat
 * Send a message to AI assistant with rate limiting and validation
 */
router.post('/chat', requireAuth, aiRateLimit, async (req, res) => {
  try {
    const userId = req.auth?.sub;

    // Validate request body
    const validation = chatRequestSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid request data',
        details: validation.error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }

    const { message, history } = validation.data;

    console.log(`[AI Chat] User ${userId} - Message: ${message.slice(0, 50)}...`);

    // Call AI service
    const result = await aiService.chat({
      userId,
      message,
      history,
    });

    return res.status(200).json({
      reply: result.reply,
      sources: result.sources || [],
      metadata: {
        ...result.metadata,
        userId,
      },
    });
  } catch (error) {
    console.error('[AI Chat] Error:', error);

    // Handle specific errors
    if (error.message.includes('Rate limit exceeded')) {
      return res.status(429).json({
        error: 'Rate Limit Exceeded',
        message: 'AI service rate limit exceeded. Please try again later.',
      });
    }

    if (error.message.includes('authentication failed')) {
      return res.status(503).json({
        error: 'Service Unavailable',
        message: 'AI service is temporarily unavailable',
      });
    }

    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process your message',
    });
  }
});

/**
 * GET /api/ai/models
 * Get available AI models
 */
router.get('/models', requireAuth, async (req, res) => {
  try {
    const models = await aiService.getAvailableModels();
    return res.status(200).json({ models });
  } catch (error) {
    console.error('[AI Models] Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch models',
    });
  }
});

export default router;
