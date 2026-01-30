# Guide de Déploiement - AuditSec

## 📦 Prérequis Production

### Services Externes
- MongoDB Atlas (ou serveur MongoDB)
- Compte Stripe (mode Live)
- Compte SendGrid ou service SMTP
- AWS S3 Bucket
- Wallets crypto (Bitcoin, Ethereum, Litecoin)

---

## 🔧 Configuration Production

### 1. MongoDB Atlas
```bash
# Créer un cluster sur MongoDB Atlas
# Obtenir l'URI de connexion
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/auditsec?retryWrites=true&w=majority
```

### 2. Stripe
```bash
# Dashboard Stripe → API Keys
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLIC_KEY=pk_live_xxxxx

# Webhooks → Add endpoint
# URL: https://votre-domaine.com/api/payments/stripe-webhook
# Events: checkout.session.completed, checkout.session.expired
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### 3. SendGrid
```bash
# SendGrid → Settings → API Keys
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=noreply@auditsec.com

# Vérifier le domaine d'envoi dans SendGrid
```

### 4. AWS S3
```bash
# IAM → Créer utilisateur avec permissions S3
# S3 → Créer bucket privé
AWS_S3_BUCKET=auditsec-prod
AWS_ACCESS_KEY_ID=AKIAxxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_REGION=eu-west-1

# Policy S3 recommandée:
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::auditsec-prod/*"
    }
  ]
}
```

### 5. Wallets Crypto
```bash
# Générer des adresses de réception
BITCOIN_ADDRESS=bc1q... # BTC native SegWit
ETHEREUM_ADDRESS=0x...  # ETH mainnet
LITECOIN_ADDRESS=ltc1q... # LTC

# Recommandé: Utiliser des wallets hardware (Ledger, Trezor)
```

---

## 🚀 Déploiement Backend

### Option 1: VPS (DigitalOcean, AWS EC2)

#### Installation
```bash
# Connecter au serveur
ssh root@votre-ip

# Installer Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer PM2
npm install -g pm2

# Cloner le repo
git clone https://github.com/votre-repo/auditsec.git
cd auditsec/backend

# Installer dépendances
npm install --production

# Créer .env
nano .env
# Coller la configuration production
```

#### Lancer avec PM2
```bash
# Démarrer l'app
pm2 start server.js --name "auditsec-api"

# Auto-restart au boot
pm2 startup
pm2 save

# Logs
pm2 logs auditsec-api
```

#### Nginx Reverse Proxy
```nginx
# /etc/nginx/sites-available/auditsec-api
server {
    listen 80;
    server_name api.auditsec.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/auditsec-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL avec Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.auditsec.com
```

### Option 2: Heroku
```bash
# Heroku CLI
heroku login
heroku create auditsec-api

# Config vars
heroku config:set MONGODB_URI=xxx
heroku config:set STRIPE_SECRET_KEY=xxx
# ... toutes les variables

# Déployer
git push heroku main

# Logs
heroku logs --tail
```

### Option 3: Vercel/Railway
```bash
# Vercel
vercel --prod

# Railway
railway login
railway init
railway up
```

---

## 🎨 Déploiement Frontend

### Option 1: Vercel (Recommandé)
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
cd frontend
vercel --prod

# Variables d'environnement dans Vercel Dashboard
VITE_API_URL=https://api.auditsec.com/api
VITE_STRIPE_PUBLIC_KEY=pk_live_xxx
```

### Déployer depuis GitHub (monorepo)

Deux options (les deux fonctionnent) :

**Option A (simple)**
1. Sur Vercel, créez un nouveau projet et connectez votre dépôt GitHub.
2. Root Directory = `frontend`
3. Build Command = `npm run build`
4. Output Directory = `dist`

**Option B (monorepo à la racine)**
1. Sur Vercel, créez un nouveau projet et connectez votre dépôt GitHub.
2. Root Directory = `.` (racine du repo)
3. Laissez Vercel utiliser `vercel.json` (déjà présent) pour builder `frontend`.

Variables d'environnement (obligatoire en prod si votre API n'est pas sur le même domaine) :

```
VITE_API_URL=https://api.auditsec.com/api
VITE_STRIPE_PUBLIC_KEY=pk_live_xxx
```

Notes:
- Le dépôt inclut `vercel.json` (racine) et `frontend/vercel.json` pour gérer la réécriture SPA (React Router) et forcer `dist` comme output.
- Le backend Express n'est pas déployé sur Vercel par cette configuration (voir section backend). Déployez-le sur VPS/Railway/Render et pointez `VITE_API_URL` vers son URL.

Déployez : Vercel déclenchera un build à chaque push sur la branche sélectionnée.

Notes:
- Si vous souhaitez également héberger le backend, privilégiez un service adapté (VPS, Railway) ou transformez les endpoints en fonctions serverless sous `api/`.
- Le dépôt contient un `.vercelignore` pour éviter d'envoyer des fichiers non nécessaires.

### Option 2: Netlify
```bash
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Option 3: VPS avec Nginx
```bash
# Build
cd frontend
npm run build

# Copier vers serveur
scp -r dist/* root@votre-ip:/var/www/auditsec/

# Nginx config
server {
    listen 80;
    server_name auditsec.com www.auditsec.com;
    root /var/www/auditsec;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 🔒 Sécurité Production

### Backend
```javascript
// Rate limiting plus strict
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50 // 50 requêtes / 15min
});

// CORS strict
app.use(cors({
  origin: ['https://auditsec.com'],
  credentials: true
}));

// Helmet configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "https://js.stripe.com"],
      frameSrc: ["https://js.stripe.com", "https://hooks.stripe.com"]
    }
  }
}));
```

### Variables sensibles
```bash
# Générer des secrets forts
JWT_SECRET=$(openssl rand -base64 32)
WEBHOOK_SECRET=$(openssl rand -base64 32)

# Ne JAMAIS commit .env
echo ".env" >> .gitignore
```

### HTTPS Obligatoire
```javascript
// Forcer HTTPS en production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
  });
}
```

---

## 📊 Monitoring

### Logs
```bash
# PM2 monitoring
pm2 monit

# Export logs
pm2 logs --json > logs.json

# Services externes
# - Sentry pour error tracking
# - LogRocket pour session replay
# - DataDog/New Relic pour APM
```

### Health Checks
```javascript
// Endpoint de santé
app.get('/health', async (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1;
  const s3Status = await checkS3Connection();
  
  res.status(mongoStatus && s3Status ? 200 : 503).json({
    status: mongoStatus && s3Status ? 'OK' : 'ERROR',
    mongo: mongoStatus ? 'connected' : 'disconnected',
    s3: s3Status ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});
```

---

## 🧪 Tests Avant Production

### Checklist
- [ ] Tester paiement Stripe en mode test
- [ ] Vérifier webhooks Stripe
- [ ] Tester envoi d'email
- [ ] Vérifier upload/download S3
- [ ] Tester génération de tokens
- [ ] Vérifier expiration des liens
- [ ] Tester tous les endpoints API
- [ ] Load testing (Apache Bench, k6)
- [ ] Sécurité (OWASP ZAP)

### Tests Stripe
```bash
# Test cards
4242 4242 4242 4242 - Succès
4000 0000 0000 9995 - Décliné
4000 0000 0000 0002 - Carte expirée

# Webhooks en local
stripe listen --forward-to localhost:3001/api/payments/stripe-webhook
stripe trigger checkout.session.completed
```

---

## 📈 Optimisations

### Database
```javascript
// Indexes MongoDB
db.orders.createIndex({ customerEmail: 1, createdAt: -1 });
db.orders.createIndex({ status: 1 });
db.products.createIndex({ category: 1, active: 1 });

// Connection pooling
mongoose.connect(MONGODB_URI, {
  maxPoolSize: 50,
  minPoolSize: 10
});
```

### Caching
```javascript
// Redis pour cache
import Redis from 'redis';
const redis = Redis.createClient();

// Cache produits
const products = await redis.get('products:all');
if (!products) {
  const data = await Product.find();
  await redis.setex('products:all', 3600, JSON.stringify(data));
}
```

### CDN
```bash
# Cloudflare pour assets statiques
# + DDoS protection
# + SSL gratuit
```

---

## 🆘 Troubleshooting

### Erreur Webhook Stripe
```bash
# Vérifier signature
stripe events list --limit 10

# Re-livrer event
stripe events resend evt_xxx
```

### Emails non reçus
```bash
# Vérifier SendGrid dashboard
# Vérifier spam/promotional
# Vérifier domaine vérifié
# Tester avec Mailtrap en dev
```

### S3 Errors
```bash
# Tester permissions
aws s3 ls s3://auditsec-prod
aws s3 cp test.txt s3://auditsec-prod/
```

---

## 📞 Support Production

### Monitoring Alerts
- Emails non envoyés
- Paiements échoués
- Téléchargements impossibles
- Erreurs 500+
- Temps de réponse > 2s

### Backup
```bash
# MongoDB backup quotidien
mongodump --uri="$MONGODB_URI" --out=/backups/$(date +%Y%m%d)

# S3 backup (S3 versioning activé)
```

---

## ✅ Checklist Finale

### Avant le lancement
- [ ] DNS configuré
- [ ] SSL/HTTPS actif
- [ ] Variables d'environnement production
- [ ] Stripe en mode live
- [ ] SendGrid configuré
- [ ] S3 sécurisé
- [ ] Monitoring actif
- [ ] Backups automatiques
- [ ] Rate limiting actif
- [ ] Tests de charge OK
- [ ] Documentation à jour
- [ ] Support email configuré
- [ ] CGV/Mentions légales
- [ ] RGPD compliance

---

**Prêt pour la production ! 🚀**
