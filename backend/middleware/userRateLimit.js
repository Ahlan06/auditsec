// Per-user rate limiting (multi-tenant safety)
//
// Why not rely only on IP rate limiting?
// - In SaaS, multiple users can share the same IP (office/VPN/NAT).
// - Attackers can also rotate IPs.
//
// This middleware enforces quotas by authenticated user id (req.user.id).
// It uses an in-memory store which is OK for development and single-instance deployments.
// For multi-instance production, replace with Redis-backed rate limiting.

const now = () => Date.now();

export const createUserRateLimiter = ({
  windowMs,
  max,
  keyPrefix = 'user',
  getKey,
} = {}) => {
  const effectiveWindowMs = Number(windowMs) > 0 ? Number(windowMs) : 60_000;
  const effectiveMax = Number(max) > 0 ? Number(max) : 60;

  // Map<key, { resetAt: number, count: number }>
  const buckets = new Map();

  return (req, res, next) => {
    const userId = req.user?.id;
    const rawKey = typeof getKey === 'function' ? getKey(req) : userId;

    // Security decision: unauthenticated requests should be handled by IP limiters.
    // This middleware is meant to run AFTER auth.
    if (!rawKey) return next();

    const key = `${keyPrefix}:${rawKey}`;
    const t = now();

    const existing = buckets.get(key);
    if (!existing || existing.resetAt <= t) {
      buckets.set(key, { resetAt: t + effectiveWindowMs, count: 1 });
      res.setHeader('X-RateLimit-Limit', String(effectiveMax));
      res.setHeader('X-RateLimit-Remaining', String(Math.max(0, effectiveMax - 1)));
      res.setHeader('X-RateLimit-Reset', String(Math.ceil((t + effectiveWindowMs) / 1000)));
      return next();
    }

    existing.count += 1;
    res.setHeader('X-RateLimit-Limit', String(effectiveMax));
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, effectiveMax - existing.count)));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(existing.resetAt / 1000)));

    if (existing.count > effectiveMax) {
      // Keep error generic; do not leak internal policy beyond standard headers.
      return res.status(429).json({ error: 'Too many requests' });
    }

    return next();
  };
};
