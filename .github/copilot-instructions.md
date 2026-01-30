# AuditSec - SAAS Cybersécurité & Pentest Platform

## Projet Overview
AuditSec est une plateforme SAAS complète dédiée à la cybersécurité, au pentest et à l'automatisation pour hackers éthiques, pentesters, et chercheurs en sécurité. La plateforme combine intelligence artificielle, automatisation des audits, et analyses de vulnérabilités dans une interface moderne.

## Tech Stack

### Frontend
- **Framework**: React 18.2.0 + Vite 5.4.10
- **Routing**: React Router v6
- **State Management**: Zustand 4.5.7
- **Styling**: Tailwind CSS 3.3.6
- **UI Components**: React Icons, Framer Motion, Lucide React
- **Markdown**: react-markdown 10.1.0 + react-syntax-highlighter
- **Charts**: Chart.js 4.5.1 + react-chartjs-2
- **Maps**: Leaflet 1.9.4 + react-leaflet
- **TypeScript**: Partial (components dashboard)

### Backend
- **Runtime**: Node.js + Express 4.18.2
- **Database**: MongoDB (Mongoose 8.0.3) + SQLite (better-sqlite3 9.4.5)
- **Queue System**: BullMQ 5.58.0 + Redis (ioredis 5.6.0)
- **Authentication**: JWT (jsonwebtoken 9.0.2) + bcryptjs 2.4.3
- **OAuth 2.0**: Google, Microsoft, Apple (openid-client 6.6.2)
- **Validation**: Zod 4.3.6
- **AI**: OpenAI 6.15.0
- **PDF Generation**: PDFKit 0.15.0
- **Storage**: AWS SDK v3 (@aws-sdk/client-s3, @aws-sdk/s3-request-presigner)
- **Email**: Nodemailer 6.9.7
- **Payment**: Stripe 14.7.0
- **Security**: Helmet 7.1.0, CORS, express-rate-limit 7.1.5

## Architecture

### Database Models (Mongoose)
- **User**: Authentication, roles (user/admin/moderator), plans (free/pro/enterprise)
- **Audit**: Security audits lifecycle (queued → running → completed/failed)
- **Report**: PDF/JSON reports avec download tokens et S3 integration
- **Alert**: Notifications sécurité avec severity levels
- **Order**: Commandes e-commerce
- **Product**: Produits digitaux (scripts, guides, formations)

### Queue System (BullMQ + Redis)
- **auditQueue**: Gestion des audits asynchrones
  - Retry: 3 tentatives avec exponential backoff
  - Concurrency: 5 workers configurables
  - Progress tracking: 0-100%
- **scanQueue**: Scans de sécurité avancés

### Workers
- **auditWorker.js**: Traitement audits
  - Simulation scans (DNS, Port Scan, Services, Vulns, Reports)
  - Progress updates temps réel
  - Génération automatique reports JSON
  - Création findings (severity: critical/high/medium/low)

### Services
- **aiService.js**: Chat AI cybersécurité
  - System prompt spécialisé (OWASP, CVE, MITRE ATT&CK)
  - Mock responses intelligents (pattern matching)
  - Sources extraction automatique
  - Metadata: tokens, processing time, confidence
- **reportPdfService.js**: Génération PDF professionnels
  - PDFKit avec styling AuditSec
  - Executive summary, findings tables, recommendations
  - Multi-pages avec pagination
- **s3Service.js**: Upload/download S3
  - AWS SDK v3 avec presigned URLs
  - Support Cloudflare R2, MinIO
  - Génération keys uniques
  - Metadata custom
- **openaiClient.js**: Client OpenAI GPT-4
- **scanEngine/**: Moteur de scans (Docker, validation, normalisation)

### API Routes

#### Authentication & Users
- `POST /api/auth/register` - Inscription (MongoDB/PostgreSQL)
- `POST /api/auth/login` - Connexion JWT
- `GET /api/auth/oauth/google` - OAuth Google
- `GET /api/me` - Profil utilisateur (JWT protected)
- `POST /api/client/auth/*` - Auth client portal (SQLite)

#### Audits (RBAC)
- `POST /api/audits` - Créer audit
- `GET /api/audits` - Liste (pagination, filtres)
- `GET /api/audits/:id` - Détails audit
- `POST /api/audits/:id/run` - Lancer audit (BullMQ job)
- `POST /api/audits/:id/cancel` - Annuler audit

#### AI Assistant
- `POST /api/ai/chat` - Chat IA cybersécurité
  - Rate limit: 10 req/min/user
  - Validation Zod
  - Response: { reply, sources[], metadata }
- `GET /api/ai/models` - Modèles disponibles

#### E-commerce
- `GET /api/products` - Catalogue produits
- `POST /api/orders` - Créer commande
- `POST /api/payments/create-checkout` - Stripe checkout
- `POST /webhook` - Stripe webhooks
- `GET /api/downloads/:token` - Téléchargement sécurisé

#### Admin
- `GET /api/admin/stats` - Statistiques
- `POST /api/admin/products` - Gestion produits

### Frontend Components

#### Dashboard
- **ClientDashboardLayout.tsx**: Layout principal avec sidebar
- **DashboardOverview.tsx**: KPI cards (Risk Score, Vulns, Assets, Last Scan)
  - Skeleton loading
  - Dark/light mode
  - Grid responsive
- **ClientSidebar.tsx**: Navigation (Dashboard, Audits, AI, Reports, Tools)

#### AI Assistant
- **ClientAssistantPageNew.jsx**: Interface ChatGPT style
  - Messages list avec bulles colorées
  - Markdown rendering + syntax highlighting
  - LocalStorage history
  - Auto-scroll
  - Loading dots animation
  - Error handling élégant

#### Error Handling
- **ApiErrorBoundary.tsx**: React Error Boundary
  - Catch rendering errors
  - Stack trace (dev mode)
  - Retry/Home actions
- **UpgradeRequired.tsx**: Modal 403
  - Pricing plans (Pro $49, Enterprise $199)
  - Features comparison
  - Auto-trigger sur 403 responses

#### Global API Client
- **utils/apiClient.ts**: Enhanced fetch wrapper
  - Auto 401 → Clear tokens + redirect /login
  - Auto 403 → Show upgrade modal
  - Retry logic (3 attempts)
  - Event system pour monitoring

#### State Management (Zustand)
- **useDashboardStore.ts**: Dashboard data
  - Auto-fetch avec cache 30s
  - Retry logic
  - Loading/error states
- **authStore.js**: Authentication state
- **cartStore.js**: Panier e-commerce
- **themeStore.ts**: Dark/light mode

## Features Principales

### Audit Security Platform
- ✅ Création audits (domain, IP, email)
- ✅ Queue asynchrone BullMQ + Redis
- ✅ Progress tracking temps réel (0-100%)
- ✅ Findings avec severity (critical/high/medium/low)
- ✅ Génération automatique reports (PDF + JSON)
- ✅ Download tokens sécurisés (24h)
- ✅ Upload S3 avec presigned URLs
- ✅ Statistiques utilisateur

### AI Assistant
- ✅ Chat interface style ChatGPT
- ✅ Markdown + code syntax highlighting
- ✅ Historique local (localStorage)
- ✅ Rate limiting (10 req/min)
- ✅ Mock responses intelligents
- ✅ Sources extraction automatique
- ✅ OpenAI GPT-4 integration

### E-commerce Digital Products
- ✅ Catalogue produits (scripts, guides, formations)
- ✅ Panier dynamique Zustand
- ✅ Paiement Stripe Checkout
- ✅ Webhooks validation
- ✅ Livraison automatique par email
- ✅ Téléchargements sécurisés S3

### Authentication & Security
- ✅ JWT authentication
- ✅ OAuth 2.0 (Google, Microsoft, Apple)
- ✅ RBAC (role-based access control)
- ✅ Rate limiting per route/user
- ✅ Password hashing bcrypt
- ✅ Token expiration & refresh
- ✅ Multi-token support (client_token, adminToken)

### Global Error Handling
- ✅ 401 → Auto logout + redirect
- ✅ 403 → Upgrade modal
- ✅ Error Boundary React
- ✅ Retry logic API calls
- ✅ Toast notifications
- ✅ Detailed error logging

## Environment Variables

### Required
```env
# JWT
JWT_SECRET=your-super-secret-jwt-key-256-bits

# MongoDB (optional si ENABLE_MONGO=false)
MONGO_URI=mongodb://localhost:27017/auditsec
ENABLE_MONGO=true

# Redis (BullMQ)
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TLS=0

# AWS S3
AWS_ACCESS_KEY_ID=AKIAxxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_REGION=us-east-1
S3_BUCKET_NAME=auditsec-reports

# OpenAI (optional)
OPENAI_API_KEY=sk-xxxxx
OPENAI_MODEL=gpt-4-turbo-preview

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### Optional
```env
# OAuth
GOOGLE_CLIENT_ID=xxxxx
GOOGLE_CLIENT_SECRET=xxxxx

# Email
MAILGUN_API_KEY=xxxxx
MAILGUN_DOMAIN=mg.auditsec.com

# Frontend
FRONTEND_URL=http://localhost:5173

# Workers
AUDIT_WORKER_CONCURRENCY=5
AI_RATE_LIMIT_MAX=10
AI_RATE_LIMIT_WINDOW_MS=60000
```

## Development

### Installation
```bash
# Install all dependencies
npm run install:all

# Or separately
npm install                    # Backend
cd frontend && npm install     # Frontend
```

### Running
```bash
# Dev mode (both frontend + backend)
npm run dev

# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend

# Workers
npm run dev:audit-worker
npm run dev:scan-worker

# Seed database (MongoDB required)
npm run seed
```

### Production
```bash
# Build frontend
npm run build

# Start backend
npm start

# Start workers
npm run start:audit-worker
```

## API Documentation

### Authentication
All protected routes require `Authorization: Bearer <JWT_TOKEN>` header.

### Audits API
```javascript
// Create audit
POST /api/audits
{
  "targetType": "domain",
  "targetValue": "example.com"
}

// Run audit (sends to BullMQ)
POST /api/audits/:id/run
Response: { audit: { status: "queued" } }

// Get audit details
GET /api/audits/:id
Response: { audit: {...}, duration, durationFormatted }
```

### AI Chat API
```javascript
POST /api/ai/chat
{
  "message": "What is SQL injection?",
  "history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}

Response: {
  "reply": "# SQL Injection...",
  "sources": [
    { "title": "OWASP", "url": "...", "type": "reference" }
  ],
  "metadata": {
    "model": "gpt-4-turbo-preview",
    "tokensUsed": 1234,
    "processingTime": 2500
  }
}
```

## Design System

### Colors
- **Primary**: #0066CC (Blue)
- **Secondary**: #00CC66 (Green)
- **Danger**: #DC3545 (Red)
- **Warning**: #FFC107 (Yellow)
- **Info**: #17A2B8 (Cyan)

### Severity Colors
- **Critical**: #DC3545 (Red)
- **High**: #FF6B6B (Orange-Red)
- **Medium**: #FFC107 (Yellow)
- **Low**: #17A2B8 (Cyan)

### Dark Mode
Tous les composants supportent dark mode via Tailwind classes `dark:`.

## Security Best Practices

### Implemented
- ✅ JWT avec expiration
- ✅ Password hashing (bcrypt rounds: 10)
- ✅ Rate limiting global + per-user AI
- ✅ CORS configuré
- ✅ Helmet security headers
- ✅ Input validation (Zod schemas)
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS prevention (React escaping)
- ✅ CSRF tokens (Stripe webhooks)
- ✅ Presigned URLs avec expiration
- ✅ Private S3 buckets (ACL: private)

### TODO
- [ ] 2FA/MFA implementation
- [ ] API key rotation
- [ ] Audit logs persistants
- [ ] IP whitelisting admin routes
- [ ] Content Security Policy headers

## Deployment

### Vercel (Frontend)
```json
// vercel.json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Render/Railway (Backend)
```yaml
# render.yaml
services:
  - type: web
    name: auditsec-api
    env: node
    buildCommand: npm install
    startCommand: npm start
```

### Redis
- Upstash (serverless)
- Redis Cloud
- AWS ElastiCache

### MongoDB
- MongoDB Atlas (cloud)
- Local instance
- Alternative: PostgreSQL avec Prisma

### S3 Storage
- AWS S3
- Cloudflare R2 (S3-compatible)
- MinIO (self-hosted)

## Monitoring & Logs

### Backend Logs
```javascript
console.log('[AuditWorker] Job completed');
console.error('[AI Service] Error:', error);
```

### Frontend Errors
- ApiErrorBoundary catches rendering errors
- Console errors pour debugging
- Toast notifications pour UX

### Metrics
- BullMQ job statistics
- API response times (metadata.processingTime)
- Token usage (OpenAI)
- Error rates

## Contributing Guidelines

1. **Code Style**: ESLint + Prettier
2. **Commits**: Conventional commits (feat:, fix:, docs:)
3. **Branches**: feature/*, fix/*, refactor/*
4. **Testing**: Jest (backend), Vitest (frontend)
5. **Documentation**: Inline comments + JSDoc

## License
MIT