import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

// Import User model
import User from '../models/User.js';

const TEST_USER = {
  email: 'test@auditsec.com',
  password: 'Test123456!',
  firstName: 'Test',
  lastName: 'User',
  emailVerified: true,
  phoneVerified: false,
};

async function createTestUser() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/auditsec';
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if user already exists
    const existingUser = await User.findOne({ email: TEST_USER.email });
    
    if (existingUser) {
      console.log('⚠️  User already exists. Updating password...');
      
      // Hash the new password
      const passwordHash = await bcrypt.hash(TEST_USER.password, 10);
      
      // Update user
      existingUser.passwordHash = passwordHash;
      existingUser.emailVerified = true;
      await existingUser.save();
      
      console.log('✅ Test user updated successfully!');
    } else {
      console.log('🔨 Creating new test user...');
      
      // Hash password
      const passwordHash = await bcrypt.hash(TEST_USER.password, 10);
      
      // Create user
      const newUser = new User({
        email: TEST_USER.email,
        passwordHash,
        firstName: TEST_USER.firstName,
        lastName: TEST_USER.lastName,
        emailVerified: TEST_USER.emailVerified,
        phoneVerified: TEST_USER.phoneVerified,
      });
      
      await newUser.save();
      console.log('✅ Test user created successfully!');
    }

    console.log('\n📋 Test User Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    ${TEST_USER.email}`);
    console.log(`Password: ${TEST_USER.password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✨ You can now login at: http://localhost:5173/auth/login\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('connect ECONNREFUSED')) {
      console.log('\n⚠️  MongoDB is not running!');
      console.log('To start MongoDB:');
      console.log('  - Windows: net start MongoDB');
      console.log('  - macOS/Linux: sudo systemctl start mongodb');
      console.log('  - Docker: docker run -d -p 27017:27017 mongo:latest');
    }
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

createTestUser();
