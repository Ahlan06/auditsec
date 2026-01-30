import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Charger les variables d'environnement
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

// Import des modèles
import User from '../models/User.js';
import Audit from '../models/Audit.js';
import Report from '../models/Report.js';
import Alert from '../models/Alert.js';

// ===================================
// CONFIGURATION
// ===================================

const TEST_USER = {
  email: 'seed-user@auditsec.com',
  password: 'Seed123456!',
  firstName: 'Seed',
  lastName: 'User',
  role: 'user',
  plan: 'pro',
};

// ===================================
// FONCTIONS UTILITAIRES
// ===================================

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getRandomDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date;
};

const generateHash = (content) => {
  return crypto.createHash('sha256').update(content).digest('hex');
};

// ===================================
// DONNÉES FICTIVES
// ===================================

const AUDIT_TARGETS = {
  domain: ['example.com', 'test-site.fr', 'myapp.io', 'secure-web.net', 'api.demo.com'],
  ip: ['192.168.1.1', '10.0.0.5', '172.16.0.10', '8.8.8.8', '1.1.1.1'],
  email: ['admin@example.com', 'contact@test.fr', 'security@myapp.io', 'info@demo.com', 'support@secure.net'],
};

const AUDIT_STATUSES = ['queued', 'running', 'completed', 'failed'];

const VULNERABILITIES = [
  { name: 'SQL Injection', severity: 'critical', cvss: 9.8 },
  { name: 'XSS (Cross-Site Scripting)', severity: 'high', cvss: 7.5 },
  { name: 'CSRF', severity: 'medium', cvss: 6.1 },
  { name: 'Broken Authentication', severity: 'critical', cvss: 9.0 },
  { name: 'Sensitive Data Exposure', severity: 'high', cvss: 7.8 },
  { name: 'Security Misconfiguration', severity: 'medium', cvss: 5.3 },
  { name: 'Insecure Deserialization', severity: 'high', cvss: 8.1 },
];

// ===================================
// FONCTIONS DE CRÉATION
// ===================================

async function createTestUser() {
  console.log('📝 Creating test user...');
  
  const passwordHash = await bcrypt.hash(TEST_USER.password, 10);
  
  const user = await User.create({
    email: TEST_USER.email,
    passwordHash,
    firstName: TEST_USER.firstName,
    lastName: TEST_USER.lastName,
    role: TEST_USER.role,
    plan: TEST_USER.plan,
    emailVerified: true,
    phoneVerified: false,
    lastLoginAt: new Date(),
  });

  console.log(`✅ User created: ${user.email} (ID: ${user._id})`);
  return user;
}

async function createAudits(userId, count = 10) {
  console.log(`\n📝 Creating ${count} audits...`);
  
  const audits = [];

  for (let i = 0; i < count; i++) {
    const targetType = getRandomElement(Object.keys(AUDIT_TARGETS));
    const targetValue = getRandomElement(AUDIT_TARGETS[targetType]);
    const status = getRandomElement(AUDIT_STATUSES);
    const createdAt = getRandomDate(30);

    const audit = {
      userId,
      targetType,
      targetValue,
      status,
      createdAt,
    };

    // Ajouter des données selon le statut
    if (status === 'running') {
      audit.startedAt = new Date(createdAt.getTime() + 60000);
      audit.progress = Math.floor(Math.random() * 90) + 10;
    }

    if (status === 'completed') {
      const startedAt = new Date(createdAt.getTime() + 60000);
      const finishedAt = new Date(startedAt.getTime() + Math.random() * 600000);
      
      audit.startedAt = startedAt;
      audit.finishedAt = finishedAt;
      audit.progress = 100;
      audit.riskScore = Math.floor(Math.random() * 100);
      
      // Générer des résultats fictifs
      const numVulns = Math.floor(Math.random() * 5);
      const vulns = [];
      for (let j = 0; j < numVulns; j++) {
        vulns.push(getRandomElement(VULNERABILITIES));
      }
      
      audit.results = {
        vulnerabilities: vulns,
        summary: {
          total: numVulns,
          critical: vulns.filter(v => v.severity === 'critical').length,
          high: vulns.filter(v => v.severity === 'high').length,
          medium: vulns.filter(v => v.severity === 'medium').length,
          low: vulns.filter(v => v.severity === 'low').length,
        },
        scanDuration: finishedAt - startedAt,
        timestamp: finishedAt,
      };
    }

    if (status === 'failed') {
      audit.startedAt = new Date(createdAt.getTime() + 60000);
      audit.finishedAt = new Date(audit.startedAt.getTime() + Math.random() * 300000);
      audit.error = getRandomElement([
        'Connection timeout',
        'Target unreachable',
        'Authentication failed',
        'Scan cancelled by user',
        'Internal scanner error',
      ]);
    }

    const createdAudit = await Audit.create(audit);
    audits.push(createdAudit);
    
    console.log(`  ✅ Audit ${i + 1}/${count}: ${targetType} - ${targetValue} (${status})`);
  }

  return audits;
}

async function createReports(userId, audits, count = 3) {
  console.log(`\n📝 Creating ${count} reports...`);
  
  // Sélectionner des audits complétés
  const completedAudits = audits.filter(a => a.status === 'completed');
  
  if (completedAudits.length === 0) {
    console.log('⚠️  No completed audits found. Skipping reports.');
    return [];
  }

  const reports = [];

  for (let i = 0; i < Math.min(count, completedAudits.length); i++) {
    const audit = completedAudits[i];
    const type = getRandomElement(['pdf', 'json']);
    const content = JSON.stringify(audit.results);
    const size = Buffer.byteLength(content, 'utf8');
    const hash = generateHash(content);

    const report = await Report.create({
      auditId: audit._id,
      userId,
      type,
      s3Key: `reports/${userId}/${audit._id}/report-${Date.now()}.${type}`,
      size,
      hash,
    });

    // Générer un token de téléchargement
    await report.createDownloadToken(24);

    reports.push(report);
    console.log(`  ✅ Report ${i + 1}/${count}: ${type.toUpperCase()} (${report.sizeFormatted})`);
  }

  return reports;
}

async function createAlerts(userId, audits, count = 5) {
  console.log(`\n📝 Creating ${count} alerts...`);
  
  const alertTypes = [
    {
      type: 'security',
      severity: 'critical',
      title: 'Critical vulnerability detected',
      message: 'A critical SQL injection vulnerability was found in your application.',
    },
    {
      type: 'vulnerability',
      severity: 'high',
      title: 'High-risk XSS vulnerability',
      message: 'Cross-site scripting vulnerability detected on multiple endpoints.',
    },
    {
      type: 'scan_complete',
      severity: 'low',
      title: 'Scan completed successfully',
      message: 'Your security audit has been completed. View the detailed report.',
    },
    {
      type: 'system',
      severity: 'medium',
      title: 'System maintenance scheduled',
      message: 'Scheduled maintenance will occur on Sunday at 2:00 AM UTC.',
    },
    {
      type: 'warning',
      severity: 'medium',
      title: 'Unusual activity detected',
      message: 'Multiple failed login attempts detected from unknown IP addresses.',
    },
  ];

  const alerts = [];

  for (let i = 0; i < count; i++) {
    const alertData = alertTypes[i % alertTypes.length];
    const status = getRandomElement(['unread', 'read', 'archived']);
    const createdAt = getRandomDate(7);
    
    // Associer à un audit aléatoire si type = scan_complete ou vulnerability
    const auditId = ['scan_complete', 'vulnerability'].includes(alertData.type) && audits.length > 0
      ? getRandomElement(audits)._id
      : null;

    const alert = {
      userId,
      ...alertData,
      status,
      auditId,
      createdAt,
      metadata: {
        source: 'automated_scan',
        priority: alertData.severity === 'critical' ? 'urgent' : 'normal',
      },
    };

    if (status === 'read') {
      alert.readAt = new Date(createdAt.getTime() + Math.random() * 86400000);
    }

    if (status === 'archived') {
      alert.readAt = new Date(createdAt.getTime() + Math.random() * 86400000);
      alert.archivedAt = new Date(alert.readAt.getTime() + Math.random() * 86400000);
    }

    const createdAlert = await Alert.create(alert);
    alerts.push(createdAlert);
    
    console.log(`  ✅ Alert ${i + 1}/${count}: ${alertData.type} - ${alertData.severity} (${status})`);
  }

  return alerts;
}

// ===================================
// FONCTION PRINCIPALE
// ===================================

async function seed() {
  try {
    console.log('🌱 Starting database seed...\n');

    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/auditsec';
    console.log(`🔌 Connecting to MongoDB: ${mongoUri}`);
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // ===================================
    // NETTOYAGE (Idempotence)
    // ===================================
    console.log('🧹 Cleaning existing data...');
    
    await User.deleteMany({ email: TEST_USER.email });
    console.log('  ✅ Users cleaned');
    
    // Supprimer les audits de l'utilisateur de test
    const existingUser = await User.findOne({ email: TEST_USER.email });
    if (existingUser) {
      await Audit.deleteMany({ userId: existingUser._id });
      await Report.deleteMany({ userId: existingUser._id });
      await Alert.deleteMany({ userId: existingUser._id });
    }
    console.log('  ✅ Associated data cleaned\n');

    // ===================================
    // CRÉATION DES DONNÉES
    // ===================================
    
    // 1. Créer l'utilisateur
    const user = await createTestUser();

    // 2. Créer les audits
    const audits = await createAudits(user._id, 10);

    // 3. Créer les rapports
    const reports = await createReports(user._id, audits, 3);

    // 4. Créer les alertes
    const alerts = await createAlerts(user._id, audits, 5);

    // ===================================
    // RÉSUMÉ
    // ===================================
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Seed completed successfully!');
    console.log('='.repeat(50));
    console.log('\n📊 Summary:');
    console.log(`  • Users created: 1`);
    console.log(`  • Audits created: ${audits.length}`);
    console.log(`  • Reports created: ${reports.length}`);
    console.log(`  • Alerts created: ${alerts.length}`);
    
    console.log('\n🔑 Test User Credentials:');
    console.log('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Email:    ${TEST_USER.email}`);
    console.log(`  Password: ${TEST_USER.password}`);
    console.log(`  Role:     ${TEST_USER.role}`);
    console.log(`  Plan:     ${TEST_USER.plan}`);
    console.log('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n📈 Audit Status Breakdown:');
    const statusCounts = audits.reduce((acc, audit) => {
      acc[audit.status] = (acc[audit.status] || 0) + 1;
      return acc;
    }, {});
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  • ${status}: ${count}`);
    });

    console.log('\n🚀 You can now login at: http://localhost:5173/auth/login\n');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    
    if (error.message.includes('connect ECONNREFUSED')) {
      console.log('\n⚠️  MongoDB is not running!');
      console.log('To start MongoDB:');
      console.log('  - Windows: net start MongoDB');
      console.log('  - macOS/Linux: sudo systemctl start mongodb');
      console.log('  - Docker: docker run -d -p 27017:27017 mongo:latest\n');
    }
    
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Exécuter le seed
seed();
