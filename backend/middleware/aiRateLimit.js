import rateLimit from 'express-rate-limit';
import { createClient } from 'redis';

/**
 * In-memory store for user rate limiting (fallback if Redis not available)
 */
class MemoryStore {
  constructor() {
    this.hits = new Map();
    this.resetTime = new Map();
  }

  increment(key) {
    const now = Date.now();
    const resetAt = this.resetTime.get(key) || now;

    if (now > resetAt) {
      this.hits.set(key, 1);
      this.resetTime.set(key, now + 60000); // 1 minute window
      return { totalHits: 1, resetTime: new Date(now + 60000) };
    }

    const currentHits = (this.hits.get(key) || 0) + 1;
    this.hits.set(key, currentHits);

    return { totalHits: currentHits, resetTime: new Date(resetAt) };
  }

  resetKey(key) {
    this.hits.delete(key);
    this.resetTime.delete(key);
  }
}

const memoryStore = new MemoryStore();

/**
 * AI-specific rate limiter per user
 * Limits: 10 requests per minute per user
 */
export const aiRateLimit = (req, res, next) => {
  try {
    // Get userId from JWT auth
    const userId = req.auth?.sub;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required for rate limiting',
      });
    }

    const key = `ai-rate-limit:${userId}`;
    const limit = Number(process.env.AI_RATE_LIMIT_MAX) || 10;
    const windowMs = Number(process.env.AI_RATE_LIMIT_WINDOW_MS) || 60000; // 1 minute

    // Use in-memory store (can be replaced with Redis for production)
    const { totalHits, resetTime } = memoryStore.increment(key);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - totalHits));
    res.setHeader('X-RateLimit-Reset', resetTime.toISOString());

    if (totalHits > limit) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Maximum ${limit} requests per minute.`,
        retryAfter: Math.ceil((resetTime.getTime() - Date.now()) / 1000),
      });
    }

    next();
  } catch (error) {
    console.error('[AI Rate Limit] Error:', error);
    // On error, allow the request to proceed (fail open)
    next();
  }
};

/**
 * Redis-based rate limiter (for production with Redis)
 */
export const createRedisRateLimiter = () => {
  const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });

  redisClient.on('error', (err) => {
    console.error('[Redis Rate Limit] Error:', err);
  });

  redisClient.connect().catch((err) => {
    console.error('[Redis Rate Limit] Connection error:', err);
  });

  return async (req, res, next) => {
    try {
      const userId = req.auth?.sub;
      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      }

      const key = `ai-rate-limit:${userId}`;
      const limit = Number(process.env.AI_RATE_LIMIT_MAX) || 10;
      const windowSeconds = Math.floor(
        (Number(process.env.AI_RATE_LIMIT_WINDOW_MS) || 60000) / 1000
      );

      // Increment counter
      const multi = redisClient.multi();
      multi.incr(key);
      multi.expire(key, windowSeconds);
      const results = await multi.exec();

      const currentHits = results[0];

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - currentHits));
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + windowSeconds * 1000).toISOString());

      if (currentHits > limit) {
        return res.status(429).json({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Maximum ${limit} requests per minute.`,
          retryAfter: windowSeconds,
        });
      }

      next();
    } catch (error) {
      console.error('[Redis Rate Limit] Error:', error);
      // Fallback to memory store
      return aiRateLimit(req, res, next);
    }
  };
};

export default aiRateLimit;
