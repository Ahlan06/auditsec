import { query, transaction } from '../supabase.js';

/**
 * Product Repository - PostgreSQL implementation
 * Replaces Mongoose Product model
 */

export const productRepository = {
  /**
   * Create a new product
   */
  async create(productData) {
    const {
      name,
      description,
      longDescription,
      price,
      category,
      type,
      image,
      fileUrl,
      fileSize,
      tags = [],
      featured = false,
      active = true,
      stripeProductId,
      stripePriceId,
    } = productData;

    const result = await query(
      `INSERT INTO products (
        name, description, long_description, price, category, type,
        image, file_url, file_size, tags, featured, active,
        stripe_product_id, stripe_price_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        name,
        description,
        longDescription,
        price,
        category,
        type,
        image,
        fileUrl,
        fileSize,
        tags,
        featured,
        active,
        stripeProductId,
        stripePriceId,
      ]
    );

    return result.rows[0];
  },

  /**
   * Find product by ID
   */
  async findById(id) {
    const result = await query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  /**
   * Find all active products
   */
  async findAll(filters = {}) {
    let sql = 'SELECT * FROM products WHERE active = TRUE';
    const params = [];
    let paramCount = 1;

    if (filters.category) {
      sql += ` AND category = $${paramCount}`;
      params.push(filters.category);
      paramCount++;
    }

    if (filters.type) {
      sql += ` AND type = $${paramCount}`;
      params.push(filters.type);
      paramCount++;
    }

    if (filters.featured !== undefined) {
      sql += ` AND featured = $${paramCount}`;
      params.push(filters.featured);
      paramCount++;
    }

    sql += ' ORDER BY created_at DESC';

    if (filters.limit) {
      sql += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
      paramCount++;
    }

    if (filters.offset) {
      sql += ` OFFSET $${paramCount}`;
      params.push(filters.offset);
    }

    const result = await query(sql, params);
    return result.rows;
  },

  /**
   * Find products by category
   */
  async findByCategory(category, limit = 50) {
    const result = await query(
      'SELECT * FROM products WHERE category = $1 AND active = TRUE ORDER BY created_at DESC LIMIT $2',
      [category, limit]
    );
    return result.rows;
  },

  /**
   * Find featured products
   */
  async findFeatured(limit = 10) {
    const result = await query(
      'SELECT * FROM products WHERE featured = TRUE AND active = TRUE ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    return result.rows;
  },

  /**
   * Search products (full-text search)
   */
  async search(searchTerm, limit = 50) {
    const result = await query(
      `SELECT *, 
        ts_rank(to_tsvector('french', name || ' ' || description || ' ' || COALESCE(array_to_string(tags, ' '), '')), 
                plainto_tsquery('french', $1)) as rank
       FROM products 
       WHERE active = TRUE 
         AND to_tsvector('french', name || ' ' || description || ' ' || COALESCE(array_to_string(tags, ' '), '')) @@ plainto_tsquery('french', $1)
       ORDER BY rank DESC, created_at DESC
       LIMIT $2`,
      [searchTerm, limit]
    );
    return result.rows;
  },

  /**
   * Update product
   */
  async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updateData).forEach(([key, value]) => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      fields.push(`${snakeKey} = $${paramCount}`);
      values.push(value);
      paramCount++;
    });

    values.push(id);
    const result = await query(
      `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0];
  },

  /**
   * Increment download count
   */
  async incrementDownloadCount(id) {
    const result = await query(
      'UPDATE products SET download_count = download_count + 1 WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },

  /**
   * Delete product
   */
  async delete(id) {
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },

  /**
   * Soft delete (set active = false)
   */
  async softDelete(id) {
    const result = await query(
      'UPDATE products SET active = FALSE WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },

  /**
   * Find by Stripe Product ID
   */
  async findByStripeProductId(stripeProductId) {
    const result = await query(
      'SELECT * FROM products WHERE stripe_product_id = $1',
      [stripeProductId]
    );
    return result.rows[0] || null;
  },

  /**
   * Find by Stripe Price ID
   */
  async findByStripePriceId(stripePriceId) {
    const result = await query(
      'SELECT * FROM products WHERE stripe_price_id = $1',
      [stripePriceId]
    );
    return result.rows[0] || null;
  },

  /**
   * Count total products
   */
  async count(filters = {}) {
    let sql = 'SELECT COUNT(*) as count FROM products WHERE active = TRUE';
    const params = [];
    let paramCount = 1;

    if (filters.category) {
      sql += ` AND category = $${paramCount}`;
      params.push(filters.category);
      paramCount++;
    }

    const result = await query(sql, params);
    return parseInt(result.rows[0].count);
  },

  /**
   * Get products by multiple IDs
   */
  async findByIds(ids) {
    const result = await query(
      'SELECT * FROM products WHERE id = ANY($1) AND active = TRUE',
      [ids]
    );
    return result.rows;
  },
};

export default productRepository;
