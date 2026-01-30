import express from 'express';
import db from '../client/db.js';
import { clientAuth } from '../middleware/clientAuth.js';
import { createUserRateLimiter } from '../middleware/userRateLimit.js';

const router = express.Router();

// All routes require auth
router.use(clientAuth);

// SaaS safety: per-user rate limiting for projects endpoints.
router.use(
  createUserRateLimiter({
    windowMs: Number(process.env.RL_CLIENT_PROJECTS_WINDOW_MS) || 60_000,
    max: Number(process.env.RL_CLIENT_PROJECTS_MAX) || 60,
    keyPrefix: 'client-projects',
  })
);

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY id DESC').all(req.user.id);
  res.json({ projects: rows.map(r => ({ ...r, last_result: r.last_result ? JSON.parse(r.last_result) : null })) });
});

router.post('/', (req, res) => {
  const { name, target_url } = req.body || {};
  if (!name || !target_url) return res.status(400).json({ error: 'name and target_url required' });
  const info = db.prepare('INSERT INTO projects (user_id, name, target_url) VALUES (?,?,?)').run(req.user.id, name, target_url);
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ project });
});

router.put('/:id', (req, res) => {
  const { name, target_url, status } = req.body || {};
  const id = Number(req.params.id);
  const p = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(id, req.user.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  db.prepare('UPDATE projects SET name = COALESCE(?, name), target_url = COALESCE(?, target_url), status = COALESCE(?, status) WHERE id = ?')
    .run(name ?? null, target_url ?? null, status ?? null, id);
  const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  res.json({ project: updated });
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  db.prepare('DELETE FROM projects WHERE id = ? AND user_id = ?').run(id, req.user.id);
  res.status(204).end();
});

// Simulated test run endpoint
router.post('/:id/run', (req, res) => {
  const id = Number(req.params.id);
  const p = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(id, req.user.id);
  if (!p) return res.status(404).json({ error: 'Project not found' });
  const startedAt = new Date().toISOString();
  db.prepare('UPDATE projects SET status = ? WHERE id = ?').run('running', id);
  // Simulated result
  const result = {
    startedAt,
    finishedAt: new Date().toISOString(),
    summary: 'Simulated scan completed',
    findings: [
      { id: 'A1', title: 'Reflected XSS', severity: 'medium', path: '/search?q=', evidence: 'alert(1)' },
      { id: 'A2', title: 'Security headers missing', severity: 'low', path: '/', evidence: 'X-Frame-Options absent' }
    ]
  };
  db.prepare('UPDATE projects SET status = ?, last_result = ? WHERE id = ?').run('completed', JSON.stringify(result), id);
  const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  res.json({ project: { ...updated, last_result: result } });
});

export default router;
