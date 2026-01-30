import { query } from '../supabase.js';

/**
 * Client Portal Repositories
 * For projects, audits, AI conversations
 */

export const projectRepository = {
  async create(userId, name, targetUrl) {
    const result = await query(
      'INSERT INTO projects (user_id, name, target_url) VALUES ($1, $2, $3) RETURNING *',
      [userId, name, targetUrl]
    );
    return result.rows[0];
  },

  async findByUserId(userId) {
    const result = await query(
      'SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  },

  async findById(id) {
    const result = await query('SELECT * FROM projects WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updateData).forEach(([key, value]) => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (snakeKey === 'last_result' && typeof value === 'object') {
        fields.push(`${snakeKey} = $${paramCount}`);
        values.push(JSON.stringify(value));
      } else {
        fields.push(`${snakeKey} = $${paramCount}`);
        values.push(value);
      }
      paramCount++;
    });

    values.push(id);
    const result = await query(
      `UPDATE projects SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },
};

export const auditRepository = {
  async create(userId, target, mode = 'active') {
    const result = await query(
      'INSERT INTO audits (user_id, target, mode) VALUES ($1, $2, $3) RETURNING *',
      [userId, target, mode]
    );
    return result.rows[0];
  },

  async findByUserId(userId, limit = 50) {
    const result = await query(
      'SELECT * FROM audits WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );
    return result.rows;
  },

  async findById(id) {
    const result = await query('SELECT * FROM audits WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async updateStatus(id, status, additionalData = {}) {
    const updates = { status, ...additionalData };
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (snakeKey === 'result_json' && typeof value === 'object') {
        fields.push(`${snakeKey} = $${paramCount}`);
        values.push(JSON.stringify(value));
      } else {
        fields.push(`${snakeKey} = $${paramCount}`);
        values.push(value);
      }
      paramCount++;
    });

    values.push(id);
    const result = await query(
      `UPDATE audits SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await query('DELETE FROM audits WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },

  async findQueued(limit = 10) {
    const result = await query(
      'SELECT * FROM audits WHERE status = $1 ORDER BY created_at ASC LIMIT $2',
      ['queued', limit]
    );
    return result.rows;
  },
};

export const aiConversationRepository = {
  async create(userId, title = null) {
    const result = await query(
      'INSERT INTO ai_conversations (user_id, title) VALUES ($1, $2) RETURNING *',
      [userId, title]
    );
    return result.rows[0];
  },

  async findByUserId(userId) {
    const result = await query(
      'SELECT * FROM ai_conversations WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return result.rows;
  },

  async findById(id) {
    const result = await query('SELECT * FROM ai_conversations WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async update(id, title) {
    const result = await query(
      'UPDATE ai_conversations SET title = $1 WHERE id = $2 RETURNING *',
      [title, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await query('DELETE FROM ai_conversations WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },

  async addMessage(conversationId, role, content) {
    const result = await query(
      'INSERT INTO ai_messages (conversation_id, role, content) VALUES ($1, $2, $3) RETURNING *',
      [conversationId, role, content]
    );
    return result.rows[0];
  },

  async getMessages(conversationId) {
    const result = await query(
      'SELECT * FROM ai_messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [conversationId]
    );
    return result.rows;
  },

  async getConversationWithMessages(id) {
    const convResult = await query('SELECT * FROM ai_conversations WHERE id = $1', [id]);
    if (!convResult.rows[0]) return null;

    const messagesResult = await query(
      'SELECT * FROM ai_messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [id]
    );

    return {
      ...convResult.rows[0],
      messages: messagesResult.rows,
    };
  },
};

export default {
  projectRepository,
  auditRepository,
  aiConversationRepository,
};
