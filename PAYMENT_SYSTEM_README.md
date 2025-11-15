# ZeroDay Shop - Système de Paiement Complet

## 🚀 Vue d'Ensemble

Système e-commerce complet pour produits digitaux avec paiements Stripe et Crypto, téléchargements sécurisés et emails automatiques.

---

## 📋 Fonctionnalités Implémentées

### ✅ 1. Paiement Stripe
- **Endpoint**: `POST /api/payments/create-checkout-session`
- **Fonctionnalités**:
  - Création de sessions Stripe Checkout
  - Validation des produits
  - Génération d'orderId unique
  - Webhook pour confirmation de paiement
  - Redirection automatique après paiement

**Exemple d'utilisation**:
```javascript
const { sessionId } = await paymentAPI.createStripeSession(items, email);
const stripe = window.Stripe(STRIPE_PUBLIC_KEY);
await stripe.redirectToCheckout({ sessionId });
```

### ✅ 2. Paiement Crypto
- **Endpoint**: `POST /api/crypto/create-crypto-payment`
- **Cryptomonnaies supportées**: Bitcoin, Ethereum, Litecoin
- **Fonctionnalités**:
  - Génération d'adresse de paiement
  - QR Code pour paiement mobile
  - Timer d'expiration (30 minutes)
  - Vérification automatique du statut
  - Confirmation manuelle par admin

**Exemple d'utilisation**:
```javascript
const cryptoData = await paymentAPI.createCryptoPayment(
  items, 
  email, 
  'bitcoin'
);
// Afficher: address, amount, qrCode, expiresAt
```

### ✅ 3. Base de Données Commandes
- **Modèle**: `Order.js`
- **Champs principaux**:
  - `orderId`: Identifiant unique (ZD-XXXXXX)
  - `customerEmail`: Email client
  - `products`: Liste des produits commandés
  - `totalAmount`: Montant total
  - `status`: pending | completed | failed | refunded
  - `paymentMethod`: stripe | bitcoin | ethereum | litecoin
  - `downloadTokens`: Tokens de téléchargement sécurisés
  - `cryptoPaymentData`: Données paiement crypto

**Index pour performance**:
- customerEmail + createdAt
- stripeSessionId
- status + createdAt
- downloadTokens.token

### ✅ 4. Liens de Téléchargement Sécurisés
- **Endpoint**: `GET /api/downloads/:token`
- **Sécurité**:
  - Tokens uniques par produit
  - Expiration automatique (24h par défaut)
  - Usage unique (marqué comme utilisé)
  - Génération de presigned URLs S3
  - Limitation temporelle

**Fonctionnalités**:
```javascript
// Générer des tokens
const tokens = await generateDownloadTokens(products);

// Télécharger un fichier
const { downloadUrl } = await downloadsAPI.getDownloadUrl(token);
// Le token est automatiquement marqué comme utilisé
```

### ✅ 5. Emails Automatiques
- **Providers supportés**: SendGrid, SMTP
- **Template**: Email HTML cyberpunk avec ASCII art
- **Contenu**:
  - Confirmation de commande
  - Détails de la commande (orderId, total, date)
  - Liens de téléchargement directs
  - Instructions d'utilisation
  - Avertissements de sécurité
  - Expiration des liens

**Configuration**:
```env
SENDGRID_API_KEY=SG.your_key
FROM_EMAIL=noreply@zerodayshop.com
DOWNLOAD_LINK_EXPIRATION=24
```

### ✅ 6. Frontend Intégré
- **Pages créées**:
  - `CheckoutPage.jsx`: Sélection méthode paiement + formulaire
  - `CryptoPaymentPage.jsx`: Interface paiement crypto
  - `PaymentSuccessPage.jsx`: Confirmation + téléchargements

- **Services API**:
  - `api.js`: Client axios centralisé
  - Gestion automatique des erreurs
  - Interceptors request/response

---

## 🛠️ Configuration Requise

### Backend (.env)
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/zeroday-shop

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SENDGRID_API_KEY=SG.xxx
FROM_EMAIL=noreply@zerodayshop.com

# AWS S3
AWS_S3_BUCKET=zeroday-shop-files
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=eu-west-1

# Crypto Wallets
BITCOIN_ADDRESS=bc1q...
ETHEREUM_ADDRESS=0x...
LITECOIN_ADDRESS=ltc1q...

# Liens téléchargement
DOWNLOAD_LINK_EXPIRATION=24

# URLs
FRONTEND_URL=http://localhost:5173
PORT=3001
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

---

## 📁 Structure Backend

```
backend/
├── models/
│   └── Order.js           # Modèle commandes MongoDB
├── routes/
│   ├── payments.js        # Routes Stripe + webhooks
│   ├── crypto.js          # Routes paiements crypto
│   ├── downloads.js       # Routes téléchargements
│   └── orders.js          # Routes gestion commandes
├── utils/
│   ├── orderUtils.js      # Génération tokens + emails
│   └── s3Utils.js         # Utilitaires AWS S3
└── server.js              # Configuration serveur
```

---

## 📱 Flux Utilisateur

### 1. Paiement par Carte (Stripe)
```
Checkout → Stripe Checkout → Webhook → 
Email + Tokens → PaymentSuccess → Téléchargement
```

### 2. Paiement Crypto
```
Checkout → CryptoPayment (QR + Address) → 
Confirmation manuelle/auto → Email + Tokens → 
PaymentSuccess → Téléchargement
```

---

## 🔐 Sécurité

### Paiements
- ✅ Validation Stripe webhook signatures
- ✅ Vérification des montants
- ✅ Tokens sécurisés (crypto.randomBytes)
- ✅ Expiration automatique des sessions

### Téléchargements
- ✅ Tokens uniques et temporaires
- ✅ Usage unique (one-time download)
- ✅ Presigned URLs S3 (1h expiration)
- ✅ Pas d'exposition directe des fichiers

### Données
- ✅ Emails en lowercase
- ✅ Index MongoDB pour performance
- ✅ IP tracking pour audit
- ✅ User-Agent logging

---

## 🔄 Webhooks Stripe

### Configuration
```bash
# Test en local avec Stripe CLI
stripe listen --forward-to localhost:3001/api/payments/stripe-webhook

# Récupérer le webhook secret
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Events gérés
- `checkout.session.completed`: Paiement réussi
- `checkout.session.expired`: Session expirée

---

## 📧 Email Template

Email cyberpunk avec:
- ASCII art header
- Détails commande
- Boutons de téléchargement
- Instructions sécurité
- Design noir/vert néon
- Responsive

---

## 🧪 Test du Système

### 1. Test Stripe (Mode Test)
```javascript
// Cartes de test Stripe
4242 4242 4242 4242 - Succès
4000 0000 0000 9995 - Décliné
```

### 2. Test Crypto (Simulation)
- Taux de change simulés
- Pas de vraie blockchain en dev
- Confirmation manuelle via admin

### 3. Test Téléchargements
```bash
# Vérifier un token
GET /api/downloads/status/:orderId

# Télécharger
GET /api/downloads/:token
```

---

## 📊 API Endpoints

### Paiements
```
POST /api/payments/create-checkout-session
POST /api/payments/stripe-webhook
POST /api/crypto/create-crypto-payment
GET  /api/crypto/crypto-payment-status/:orderId
POST /api/crypto/confirm-crypto-payment
```

### Téléchargements
```
GET /api/downloads/:token
GET /api/downloads/status/:orderId
```

### Commandes
```
GET /api/orders/:orderId
GET /api/orders/email/:email
```

---

## 🚀 Démarrage

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Full Stack
```bash
npm run dev  # Lance backend + frontend
```

---

## 📝 Notes Importantes

### Production
1. **Stripe**: Passer en mode live (keys live)
2. **Email**: Configurer SendGrid production
3. **S3**: Configurer bucket production
4. **Crypto**: Utiliser vraies API (CoinGecko, Blockchain.com)
5. **MongoDB**: Migrer vers Atlas ou cluster

### Améliorations Futures
- [ ] Système de refunds
- [ ] Multi-devises
- [ ] Webhooks crypto réels (BTCPay Server)
- [ ] Dashboard analytics
- [ ] Système de factures PDF
- [ ] API de vérification transactions blockchain
- [ ] Rate limiting avancé
- [ ] Cache Redis

---

## 🎯 Statut du Projet

✅ **Implémenté**:
- Paiements Stripe complets
- Paiements Crypto (frontend + backend)
- Base de données commandes
- Téléchargements sécurisés
- Emails automatiques
- Frontend checkout complet

🔄 **En attente configuration**:
- Clés Stripe réelles
- API SendGrid
- Bucket S3
- Wallets crypto production

---

## 🆘 Support

Pour tout problème:
1. Vérifier les logs serveur
2. Vérifier les webhooks Stripe
3. Tester les endpoints avec Postman
4. Consulter la documentation Stripe/SendGrid

---

**ZeroDay Shop** - Ethical Hacking • Pentest • OSINT
