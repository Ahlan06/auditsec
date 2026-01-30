import { query, transaction, getClient } from '../supabase.js';

/**
 * Order Repository - PostgreSQL implementation
 * Replaces Mongoose Order model
 */

export const orderRepository = {
  /**
   * Create a new order with items
   */
  async create(orderData) {
    return await transaction(async (client) => {
      const {
        orderId,
        customerEmail,
        customerName,
        products,
        totalAmount,
        currency = 'eur',
        status = 'pending',
        paymentMethod = 'stripe',
        stripeSessionId,
        stripePaymentIntentId,
        cryptoPaymentData,
        ipAddress,
        userAgent,
      } = orderData;

      // Insert order
      const orderResult = await client.query(
        `INSERT INTO orders (
          order_id, customer_email, customer_name, total_amount, currency,
          status, payment_method, stripe_session_id, stripe_payment_intent_id,
          crypto_payment_data, ip_address, user_agent
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`,
        [
          orderId,
          customerEmail,
          customerName,
          totalAmount,
          currency,
          status,
          paymentMethod,
          stripeSessionId,
          stripePaymentIntentId,
          cryptoPaymentData ? JSON.stringify(cryptoPaymentData) : null,
          ipAddress,
          userAgent,
        ]
      );

      const order = orderResult.rows[0];

      // Insert order items
      if (products && products.length > 0) {
        for (const product of products) {
          await client.query(
            `INSERT INTO order_items (order_id, product_id, name, price, quantity)
             VALUES ($1, $2, $3, $4, $5)`,
            [order.id, product.productId, product.name, product.price, product.quantity || 1]
          );
        }
      }

      return order;
    });
  },

  /**
   * Find order by ID
   */
  async findById(id) {
    const result = await query(
      `SELECT o.*, 
        json_agg(
          json_build_object(
            'id', oi.id,
            'productId', oi.product_id,
            'name', oi.name,
            'price', oi.price,
            'quantity', oi.quantity
          )
        ) FILTER (WHERE oi.id IS NOT NULL) as products
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.id = $1
       GROUP BY o.id`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Find order by order_id (custom ID)
   */
  async findByOrderId(orderId) {
    const result = await query(
      `SELECT o.*, 
        json_agg(
          json_build_object(
            'id', oi.id,
            'productId', oi.product_id,
            'name', oi.name,
            'price', oi.price,
            'quantity', oi.quantity
          )
        ) FILTER (WHERE oi.id IS NOT NULL) as products
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.order_id = $1
       GROUP BY o.id`,
      [orderId]
    );
    return result.rows[0] || null;
  },

  /**
   * Find order by Stripe Session ID
   */
  async findByStripeSessionId(sessionId) {
    const result = await query(
      `SELECT o.*, 
        json_agg(
          json_build_object(
            'id', oi.id,
            'productId', oi.product_id,
            'name', oi.name,
            'price', oi.price,
            'quantity', oi.quantity
          )
        ) FILTER (WHERE oi.id IS NOT NULL) as products
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.stripe_session_id = $1
       GROUP BY o.id`,
      [sessionId]
    );
    return result.rows[0] || null;
  },

  /**
   * Find orders by customer email
   */
  async findByCustomerEmail(email, limit = 50) {
    const result = await query(
      `SELECT o.*, 
        json_agg(
          json_build_object(
            'id', oi.id,
            'productId', oi.product_id,
            'name', oi.name,
            'price', oi.price,
            'quantity', oi.quantity
          )
        ) FILTER (WHERE oi.id IS NOT NULL) as products
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.customer_email = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT $2`,
      [email, limit]
    );
    return result.rows;
  },

  /**
   * Update order status
   */
  async updateStatus(orderId, status) {
    const result = await query(
      'UPDATE orders SET status = $1 WHERE order_id = $2 RETURNING *',
      [status, orderId]
    );
    return result.rows[0];
  },

  /**
   * Mark email as sent
   */
  async markEmailSent(orderId) {
    const result = await query(
      'UPDATE orders SET email_sent = TRUE, email_sent_at = NOW() WHERE order_id = $1 RETURNING *',
      [orderId]
    );
    return result.rows[0];
  },

  /**
   * Create download token for a product in an order
   */
  async createDownloadToken(orderInternalId, productId, token, expiresAt) {
    const result = await query(
      `INSERT INTO download_tokens (order_id, product_id, token, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [orderInternalId, productId, token, expiresAt]
    );
    return result.rows[0];
  },

  /**
   * Get download token
   */
  async getDownloadToken(token) {
    const result = await query(
      `SELECT dt.*, p.file_url, p.name as product_name, o.customer_email
       FROM download_tokens dt
       JOIN products p ON dt.product_id = p.id
       JOIN orders o ON dt.order_id = o.id
       WHERE dt.token = $1`,
      [token]
    );
    return result.rows[0] || null;
  },

  /**
   * Mark download token as used
   */
  async markTokenAsUsed(token) {
    const result = await query(
      'UPDATE download_tokens SET used = TRUE, used_at = NOW() WHERE token = $1 RETURNING *',
      [token]
    );
    return result.rows[0];
  },

  /**
   * Get all orders (admin)
   */
  async findAll(limit = 100, offset = 0) {
    const result = await query(
      `SELECT o.*, 
        json_agg(
          json_build_object(
            'id', oi.id,
            'productId', oi.product_id,
            'name', oi.name,
            'price', oi.price,
            'quantity', oi.quantity
          )
        ) FILTER (WHERE oi.id IS NOT NULL) as products
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return result.rows;
  },

  /**
   * Count orders
   */
  async count(filters = {}) {
    let sql = 'SELECT COUNT(*) as count FROM orders';
    const params = [];
    const conditions = [];
    let paramCount = 1;

    if (filters.status) {
      conditions.push(`status = $${paramCount}`);
      params.push(filters.status);
      paramCount++;
    }

    if (filters.customerEmail) {
      conditions.push(`customer_email = $${paramCount}`);
      params.push(filters.customerEmail);
      paramCount++;
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await query(sql, params);
    return parseInt(result.rows[0].count);
  },

  /**
   * Update order
   */
  async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updateData).forEach(([key, value]) => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (snakeKey === 'crypto_payment_data' && typeof value === 'object') {
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
      `UPDATE orders SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0];
  },

  /**
   * Delete order (cascade will delete items and tokens)
   */
  async delete(id) {
    const result = await query('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },
};

export default orderRepository;
