// Database connection helper
// Supports both Supabase PostgreSQL and fallback to SQLite

import { initSupabase, closePool as closeSupabasePool } from './supabase.js';

let dbType = 'none';

export async function initDatabase() {
  // Try PostgreSQL/Supabase first
  if (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL) {
    try {
      initSupabase();
      dbType = 'postgresql';
      console.log('✅ Using PostgreSQL/Supabase as primary database');
      return 'postgresql';
    } catch (error) {
      console.error('❌ Failed to connect to PostgreSQL:', error.message);
      console.log('⚠️ Falling back to SQLite for client portal');
    }
  }

  // Fallback to SQLite for client portal (if PostgreSQL not available)
  console.log('ℹ️ PostgreSQL not configured. Client portal will use SQLite.');
  dbType = 'sqlite';
  return 'sqlite';
}

export function getDatabaseType() {
  return dbType;
}

export async function closeDatabase() {
  if (dbType === 'postgresql') {
    await closeSupabasePool();
  }
  console.log('✅ Database connections closed');
}

// Export repositories based on database type
export async function getRepositories() {
  if (dbType === 'postgresql') {
    const { default: userRepository } = await import('./repositories/userRepository.js');
    const { default: productRepository } = await import('./repositories/productRepository.js');
    const { default: orderRepository } = await import('./repositories/orderRepository.js');
    const { default: accountProductRepository } = await import('./repositories/accountProductRepository.js');
    const { 
      projectRepository, 
      auditRepository, 
      aiConversationRepository 
    } = await import('./repositories/clientPortalRepositories.js');

    return {
      userRepository,
      productRepository,
      orderRepository,
      accountProductRepository,
      projectRepository,
      auditRepository,
      aiConversationRepository,
    };
  }

  // If SQLite is used, you'll need to create equivalent repositories
  // For now, throw error to indicate PostgreSQL is required
  throw new Error('SQLite repositories not implemented yet. Please configure PostgreSQL.');
}

export default {
  initDatabase,
  getDatabaseType,
  closeDatabase,
  getRepositories,
};
