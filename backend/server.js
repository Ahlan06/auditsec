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

// Charger le .env depuis le dossier backend
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

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
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
// NOTE: MongoDB temporairement désactivé pour tester l'authentification
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zeroday-shop')
//   .then(async () => {
//     console.log('✅ Connected to MongoDB');
//     // Initialiser le système d'authentification admin
//     await initializeAdmin();
//   })
//   .catch(err => console.error('❌ MongoDB connection error:', err));

// Initialiser l'authentification admin sans MongoDB
(async () => {
  try {
    await initializeAdmin();
    console.log('✅ Admin authentication ready');
  } catch (error) {
    console.error('❌ Admin auth initialization error:', error);
  }
})();

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'ZeroDay Shop API is running',
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

app.listen(PORT, () => {
  console.log(`🚀 ZeroDay Shop API running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});