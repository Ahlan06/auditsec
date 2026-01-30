import pkg from 'pg';
const { Pool } = pkg;

let pool;

/**
 * Initialize PostgreSQL connection pool for Supabase
 */
export function initSupabase() {
  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

  if (!connectionString) {
    console.warn('⚠️ No DATABASE_URL configured. PostgreSQL features disabled.');
    return null;
  }

  pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  pool.on('error', (err) => {
    console.error('❌ Unexpected PostgreSQL pool error:', err);
  });

  console.log('✅ PostgreSQL/Supabase pool initialized');
  return pool;
}

/**
 * Get the pool instance
 */
export function getPool() {
  if (!pool) {
    throw new Error('PostgreSQL pool not initialized. Call initSupabase() first.');
  }
  return pool;
}

/**
 * Execute a query with parameters
 */
export async function query(text, params) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.LOG_QUERIES === 'true') {
      console.log('📊 Query executed', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('❌ Database query error:', { text, error: error.message });
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient() {
  const client = await pool.connect();
  const originalQuery = client.query.bind(client);
  const originalRelease = client.release.bind(client);

  // Timeout for transaction
  const timeout = setTimeout(() => {
    console.error('❌ Client has been checked out for more than 5 seconds!');
  }, 5000);

  // Monkey patch the query method to log
  client.query = (...args) => {
    if (process.env.LOG_QUERIES === 'true') {
      console.log('📊 Client query:', args[0]);
    }
    return originalQuery(...args);
  };

  // Monkey patch release to clear timeout
  client.release = () => {
    clearTimeout(timeout);
    client.query = originalQuery;
    client.release = originalRelease;
    return originalRelease();
  };

  return client;
}

/**
 * Transaction helper
 * @param {Function} callback - async function that receives client
 */
export async function transaction(callback) {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close the pool (for graceful shutdown)
 */
export async function closePool() {
  if (pool) {
    await pool.end();
    console.log('✅ PostgreSQL pool closed');
  }
}

// Default export for backward compatibility
export default {
  initSupabase,
  getPool,
  query,
  getClient,
  transaction,
  closePool,
};
