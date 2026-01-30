import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../client/client.db');

const TEST_USER = {
  email: 'test@auditsec.com',
  password: 'Test123456!',
};

async function createTestUser() {
  try {
    console.log('🔌 Connecting to SQLite database...');
    const db = new Database(dbPath);
    console.log('✅ Connected to SQLite');

    // Check if user already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(TEST_USER.email);
    
    if (existingUser) {
      console.log('⚠️  User already exists. Updating password...');
      
      // Hash the new password
      const passwordHash = await bcrypt.hash(TEST_USER.password, 10);
      
      // Update user
      db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(passwordHash, TEST_USER.email);
      
      console.log('✅ Test user updated successfully!');
    } else {
      console.log('🔨 Creating new test user...');
      
      // Hash password
      const passwordHash = await bcrypt.hash(TEST_USER.password, 10);
      
      // Create user
      db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(TEST_USER.email, passwordHash);
      
      console.log('✅ Test user created successfully!');
    }

    console.log('\n📋 Test User Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    ${TEST_USER.email}`);
    console.log(`Password: ${TEST_USER.password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✨ You can now login at: http://localhost:5173/auth/login\n');

    db.close();
    console.log('🔌 Disconnected from SQLite');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

createTestUser();
