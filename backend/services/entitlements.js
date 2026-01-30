// Entitlements (feature flags / quotas) for SaaS plans.
//
// Security notes:
// - Entitlements are evaluated server-side only.
// - The client must never be trusted for plan/role/quotas.
// - For now, this supports SQLite MVP; later it can be backed by Stripe and/or Postgres.

import db from '../client/db.js';

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const defaultEntitlementsForPlan = (plan) => {
  const p = String(plan || 'free').toLowerCase();

  // Keep defaults conservative. Increase limits once billing is enforced.
  if (p === 'enterprise') {
    return {
      plan: 'enterprise',
      maxAuditsPerDay: 200,
      maxTargets: 200,
      allowActiveScanning: true,
    };
  }

  if (p === 'pro') {
    return {
      plan: 'pro',
      maxAuditsPerDay: 50,
      maxTargets: 50,
      allowActiveScanning: true,
    };
  }

  return {
    plan: 'free',
    maxAuditsPerDay: 10,
    maxTargets: 10,
    allowActiveScanning: false,
  };
};

export const getUserEntitlements = (userId) => {
  const row = db
    .prepare('SELECT plan, entitlements_json FROM users WHERE id = ?')
    .get(Number(userId));

  const base = defaultEntitlementsForPlan(row?.plan);
  const overrides = row?.entitlements_json ? safeJsonParse(row.entitlements_json) : null;

  // Security decision: allow only known keys to be overridden.
  if (!overrides || typeof overrides !== 'object') return base;

  const out = { ...base };
  if (Number.isFinite(Number(overrides.maxAuditsPerDay))) out.maxAuditsPerDay = Number(overrides.maxAuditsPerDay);
  if (Number.isFinite(Number(overrides.maxTargets))) out.maxTargets = Number(overrides.maxTargets);
  if (typeof overrides.allowActiveScanning === 'boolean') out.allowActiveScanning = overrides.allowActiveScanning;

  return out;
};

export const requireEntitlement = (predicate, errorMessage) => {
  return (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const entitlements = getUserEntitlements(userId);
      req.entitlements = entitlements;

      const ok = typeof predicate === 'function' ? Boolean(predicate(entitlements, req)) : Boolean(predicate);
      if (!ok) {
        return res.status(403).json({
          error: 'Forbidden',
          message: errorMessage || 'Your current plan does not allow this action.',
        });
      }

      return next();
    } catch {
      return res.status(500).json({ error: 'Internal error' });
    }
  };
};
