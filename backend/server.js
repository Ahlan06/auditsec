import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initializeAdmin } from './middleware/adminAuth.js';

// Import routes
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';
import cryptoRoutes from './routes/crypto.js';
import downloadRoutes from './routes/downloads.js';
import adminRoutes from './routes/admin.js';
import clientAuthRoutes from './routes/clientAuth.js';
import clientProjectsRoutes from './routes/clientProjects.js';
import clientAuditsRoutes from './routes/clientAudits.js';
import clientAiRoutes from './routes/clientAi.js';
import authRoutes from './routes/auth.js';
import authSqliteRoutes from './routes/authSqlite.js';
import supportRoutes from './routes/support.js';
import meRoutes from './routes/me.js';
import auditsRoutes from './routes/audits.js';

// Charger le .env depuis le dossier backend
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Security: fail fast if JWT secret is not configured in production.
// Using a default/fallback secret would allow token forgery.
if ((process.env.NODE_ENV || 'development') === 'production') {
  const s = String(process.env.JWT_SECRET || '').trim();
  if (!s || s === 'fallback-secret') {
    throw new Error('JWT_SECRET must be set to a strong random value in production');
  }
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Security middleware
app.use(helmet());
app.use(limiter);

// CORS configuration
// In dev, Vite may auto-pick another port if the default is busy.
const defaultDevOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

const configuredFrontendUrl = (process.env.FRONTEND_URL || '').trim();
const allowedOrigins = new Set([
  ...defaultDevOrigins,
  ...(configuredFrontendUrl ? [configuredFrontendUrl] : []),
]);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser tools (no Origin header)
      if (!origin) return callback(null, true);

      // Allow known dev origins + configured origin
      if (allowedOrigins.has(origin)) return callback(null, true);

      // Extra tolerance in development (Vite may switch ports e.g., 5175)
      if ((process.env.NODE_ENV || 'development') !== 'production') {
        if (
          /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin) ||
          /^http:\/\/(10(\.\d+){3}|192\.168(\.\d+){2}|172\.(1[6-9]|2\d|3[01])(\.\d+){2}):\d+$/.test(origin)
        ) {
          return callback(null, true);
        }
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// =====================================
// DATABASE INITIALIZATION
// =====================================
import { initDatabase, closeDatabase } from './db/index.js';

// Initialize PostgreSQL/Supabase
try {
  const dbType = await initDatabase();
  console.log(`✅ Database initialized: ${dbType}`);
  
  // Initialize admin after database is ready
  await initializeAdmin();
} catch (error) {
  console.error('❌ Database initialization failed:', error);
  // Try to initialize admin anyway (for backward compatibility)
  await initializeAdmin();
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('⏹️ SIGTERM received, closing database...');
  await closeDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('⏹️ SIGINT received, closing database...');
  await closeDatabase();
  process.exit(0);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'AuditSec API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/crypto', cryptoRoutes);
app.use('/api/downloads', downloadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);

// User profile route (JWT protected)
app.use('/api/me', meRoutes);

// Audits routes (JWT protected + RBAC)
app.use('/api/audits', auditsRoutes);

// Auth routes - Using PostgreSQL
app.use('/api/auth', authRoutes);

// Client portal backend
app.use('/api/client/auth', clientAuthRoutes);
app.use('/api/client/projects', clientProjectsRoutes);
app.use('/api/client/audits', clientAuditsRoutes);
app.use('/api/client/ai', clientAiRoutes);

// Stripe webhook endpoint (raw body needed)
app.use('/webhook', express.raw({ type: 'application/json' }), paymentRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    message: 'The requested resource does not exist'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.type === 'StripeSignatureVerificationError') {
    return res.status(400).json({ error: 'Invalid signature' });
  }
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 AuditSec API running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

server.on('error', (err) => {
  if (err?.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.error('Fix options:');
    console.error(`- Stop the process using the port (Windows): netstat -ano | findstr :${PORT}  ثم taskkill /PID <PID> /F`);
    console.error(`- Or run the backend on another port: set PORT=3002 (and set VITE_API_URL=http://localhost:3002/api in frontend env)`);
    process.exit(1);
  }

  if (err?.code === 'EACCES') {
    console.error(`\n❌ No permission to bind to port ${PORT}.`);
    console.error('Try a different PORT value (e.g. 3002).');
    process.exit(1);
  }

  console.error('\n❌ Server failed to start:', err);
  process.exit(1);
});