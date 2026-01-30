import { query, transaction } from '../supabase.js';

/**
 * User Repository - PostgreSQL implementation
 * Replaces Mongoose User model
 */

export const userRepository = {
  /**
   * Create a new user
   */
  async create(userData) {
    const {
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      emailVerified = false,
      phoneVerified = false,
    } = userData;

    const result = await query(
      `INSERT INTO users (
        email, password_hash, first_name, last_name, phone, 
        email_verified, phone_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [email, passwordHash, firstName, lastName, phone, emailVerified, phoneVerified]
    );

    return result.rows[0];
  },

  /**
   * Find user by email
   */
  async findByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  },

  /**
   * Find user by ID
   */
  async findById(id) {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  /**
   * Find user by phone
   */
  async findByPhone(phone) {
    const result = await query('SELECT * FROM users WHERE phone = $1', [phone]);
    return result.rows[0] || null;
  },

  /**
   * Find user by OAuth provider
   */
  async findByOAuth(provider, sub) {
    const column = `oauth_${provider}_sub`;
    const result = await query(`SELECT * FROM users WHERE ${column} = $1`, [sub]);
    return result.rows[0] || null;
  },

  /**
   * Update user
   */
  async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic UPDATE query
    Object.entries(updateData).forEach(([key, value]) => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      fields.push(`${snakeKey} = $${paramCount}`);
      values.push(value);
      paramCount++;
    });

    values.push(id);
    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0];
  },

  /**
   * Update last login timestamp
   */
  async updateLastLogin(id) {
    const result = await query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },

  /**
   * Set email verification token
   */
  async setEmailVerificationToken(email, tokenHash, expiresAt) {
    const result = await query(
      `UPDATE users 
       SET email_verification_token_hash = $1, 
           email_verification_expires_at = $2 
       WHERE email = $3 
       RETURNING *`,
      [tokenHash, expiresAt, email]
    );
    return result.rows[0];
  },

  /**
   * Verify email
   */
  async verifyEmail(email) {
    const result = await query(
      `UPDATE users 
       SET email_verified = TRUE,
           email_verification_token_hash = NULL,
           email_verification_expires_at = NULL
       WHERE email = $1 
       RETURNING *`,
      [email]
    );
    return result.rows[0];
  },

  /**
   * Set password reset token
   */
  async setPasswordResetToken(email, tokenHash, expiresAt) {
    const result = await query(
      `UPDATE users 
       SET password_reset_token_hash = $1, 
           password_reset_expires_at = $2 
       WHERE email = $3 
       RETURNING *`,
      [tokenHash, expiresAt, email]
    );
    return result.rows[0];
  },

  /**
   * Reset password
   */
  async resetPassword(email, newPasswordHash) {
    const result = await query(
      `UPDATE users 
       SET password_hash = $1,
           password_reset_token_hash = NULL,
           password_reset_expires_at = NULL
       WHERE email = $2 
       RETURNING *`,
      [newPasswordHash, email]
    );
    return result.rows[0];
  },

  /**
   * Link OAuth account
   */
  async linkOAuth(userId, provider, sub) {
    const column = `oauth_${provider}_sub`;
    const result = await query(
      `UPDATE users SET ${column} = $1 WHERE id = $2 RETURNING *`,
      [sub, userId]
    );
    return result.rows[0];
  },

  /**
   * Delete user
   */
  async delete(id) {
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },

  /**
   * List all users (admin)
   */
  async findAll(limit = 100, offset = 0) {
    const result = await query(
      'SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  },

  /**
   * Count total users
   */
  async count() {
    const result = await query('SELECT COUNT(*) as count FROM users');
    return parseInt(result.rows[0].count);
  },
};

export default userRepository;
