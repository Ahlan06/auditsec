import { query } from '../supabase.js';

/**
 * Account Product Repository - PostgreSQL implementation
 */

export const accountProductRepository = {
  async create(accountData) {
    const {
      productId,
      serviceName,
      accountType,
      username,
      password,
      additionalInfo,
      validUntil,
      deliveryTemplate,
      usageInstructions,
      region = 'Global',
      features = [],
      warningMessage,
    } = accountData;

    const result = await query(
      `INSERT INTO account_products (
        product_id, service_name, account_type, username, password,
        additional_info, valid_until, delivery_template, usage_instructions,
        region, features, warning_message
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        productId,
        serviceName,
        accountType,
        username,
        password,
        additionalInfo ? JSON.stringify(additionalInfo) : null,
        validUntil,
        deliveryTemplate,
        usageInstructions,
        region,
        features,
        warningMessage,
      ]
    );

    return result.rows[0];
  },

  async findById(id) {
    const result = await query('SELECT * FROM account_products WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async findByProductId(productId) {
    const result = await query(
      'SELECT * FROM account_products WHERE product_id = $1',
      [productId]
    );
    return result.rows;
  },

  async findAvailableByProductId(productId) {
    const result = await query(
      `SELECT * FROM account_products 
       WHERE product_id = $1 
         AND status = 'available' 
         AND valid_until > NOW()
       LIMIT 1`,
      [productId]
    );
    return result.rows[0] || null;
  },

  async markAsSold(id) {
    const result = await query(
      `UPDATE account_products SET status = 'sold' WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  },

  async updateStatus(id, status) {
    const result = await query(
      `UPDATE account_products SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return result.rows[0];
  },

  async isValid(id) {
    const result = await query(
      `SELECT * FROM account_products 
       WHERE id = $1 AND status = 'available' AND valid_until > NOW()`,
      [id]
    );
    return result.rows[0] ? true : false;
  },

  async getDeliveryData(id) {
    const result = await query(
      `SELECT service_name, account_type, username, password, 
              additional_info, valid_until, usage_instructions, 
              features, warning_message, region
       FROM account_products 
       WHERE id = $1`,
      [id]
    );
    
    if (!result.rows[0]) return null;

    const account = result.rows[0];
    return {
      serviceName: account.service_name,
      accountType: account.account_type,
      username: account.username,
      password: account.password,
      additionalInfo: account.additional_info,
      validUntil: account.valid_until,
      usageInstructions: account.usage_instructions,
      features: account.features,
      warningMessage: account.warning_message,
      region: account.region,
    };
  },

  async findExpired() {
    const result = await query(
      `SELECT * FROM account_products 
       WHERE status = 'available' AND valid_until <= NOW()`
    );
    return result.rows;
  },

  async markExpired(id) {
    const result = await query(
      `UPDATE account_products SET status = 'expired' WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await query('DELETE FROM account_products WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },

  async countByStatus(status) {
    const result = await query(
      'SELECT COUNT(*) as count FROM account_products WHERE status = $1',
      [status]
    );
    return parseInt(result.rows[0].count);
  },
};

export default accountProductRepository;
