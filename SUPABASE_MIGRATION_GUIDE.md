# 🚀 Guide de Migration vers Supabase PostgreSQL

Ce guide vous accompagne pas à pas pour migrer votre application AuditSec de MongoDB/SQLite vers Supabase PostgreSQL.

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Configuration Supabase](#configuration-supabase)
3. [Migration de la base de données](#migration-de-la-base-de-données)
4. [Configuration de l'application](#configuration-de-lapplication)
5. [Migration des données](#migration-des-données)
6. [Tests et vérification](#tests-et-vérification)
7. [Mise en production](#mise-en-production)

---

## 🎯 Prérequis

- [ ] Compte Supabase (gratuit sur [supabase.com](https://supabase.com))
- [ ] Node.js v16+ installé
- [ ] Accès à vos données MongoDB actuelles
- [ ] Backup de vos données existantes

---

## 🏗️ Configuration Supabase

### Étape 1 : Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com) et connectez-vous
2. Cliquez sur **"New Project"**
3. Remplissez les informations :
   - **Organization** : Créez-en une ou sélectionnez une existante
   - **Project Name** : `auditsec-production` (ou le nom de votre choix)
   - **Database Password** : Choisissez un mot de passe fort (NOTEZ-LE !)
   - **Region** : `West EU (London)` ou la région la plus proche de vos utilisateurs
   - **Pricing Plan** : Free (suffisant pour démarrer)

4. Cliquez sur **"Create new project"** et attendez ~2 minutes

### Étape 2 : Récupérer la chaîne de connexion

1. Dans votre projet Supabase, allez dans **Settings** > **Database**
2. Scrollez jusqu'à **Connection String** > **URI**
3. Copiez la chaîne de connexion (elle ressemble à ça) :
   ```
   postgresql://postgres.abcdefgh:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres
   ```
4. Remplacez `[YOUR-PASSWORD]` par le mot de passe que vous avez défini à l'étape 1

---

## 💾 Migration de la base de données

### Étape 3 : Créer les tables dans Supabase

1. Dans votre projet Supabase, allez dans **SQL Editor**
2. Cliquez sur **"New Query"**
3. Ouvrez le fichier `supabase-migration.sql` que j'ai créé
4. Copiez **tout le contenu** du fichier
5. Collez-le dans l'éditeur SQL de Supabase
6. Cliquez sur **"Run"** en bas à droite
7. Vérifiez qu'il n'y a pas d'erreurs (toutes les lignes doivent être vertes ✅)

### Étape 4 : Vérifier les tables créées

1. Allez dans **Table Editor** (menu de gauche)
2. Vous devriez voir toutes ces tables :
   - ✅ users
   - ✅ products
   - ✅ orders
   - ✅ order_items
   - ✅ download_tokens
   - ✅ account_products
   - ✅ projects
   - ✅ audits
   - ✅ ai_conversations
   - ✅ ai_messages

---

## ⚙️ Configuration de l'application

### Étape 5 : Installer les dépendances PostgreSQL

Dans le dossier `backend`, installez le driver PostgreSQL :

```bash
cd backend
npm install pg
```

### Étape 6 : Configurer les variables d'environnement

1. Copiez le fichier de configuration :
   ```bash
   cp .env.supabase .env
   ```

2. Éditez `backend/.env` et remplissez au minimum :
   ```env
   # OBLIGATOIRE : Votre chaîne de connexion Supabase
   DATABASE_URL=postgresql://postgres.abcdefgh:VOTRE_MOT_DE_PASSE@aws-0-eu-west-1.pooler.supabase.com:5432/postgres
   
   # JWT Secret (générez-en un nouveau)
   JWT_SECRET=votre-secret-jwt-très-long-et-aléatoire
   
   # URLs de votre application
   BACKEND_URL=http://localhost:3001
   FRONTEND_URL=http://localhost:5173
   
   # Stripe (vos clés existantes)
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLIC_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   
   # AWS S3 (vos clés existantes)
   AWS_ACCESS_KEY_ID=...
   AWS_SECRET_ACCESS_KEY=...
   S3_BUCKET_NAME=auditsec-products
   
   # Email (SendGrid ou SMTP)
   SENDGRID_API_KEY=... 
   # OU
   SMTP_HOST=smtp.gmail.com
   SMTP_USER=...
   SMTP_PASS=...
   ```

3. Pour générer un JWT_SECRET sécurisé :
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

### Étape 7 : Mettre à jour server.js

Ouvrez `backend/server.js` et remplacez la connexion MongoDB par la connexion PostgreSQL :

```javascript
// Remplacez la section MongoDB (lignes ~98-122) par :
import { initDatabase, closeDatabase } from './db/index.js';

// Initialize PostgreSQL/Supabase
try {
  const dbType = await initDatabase();
  console.log(`✅ Database initialized: ${dbType}`);
} catch (error) {
  console.error('❌ Database initialization failed:', error);
  process.exit(1);
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('⏹️ SIGTERM received, closing database...');
  await closeDatabase();
  process.exit(0);
});
```

---

## 🔄 Migration des données

### Étape 8 : Créer un script de migration (optionnel)

Si vous avez des données existantes dans MongoDB, créez ce script :

**Fichier : `backend/scripts/migrate-data.js`**

```javascript
import mongoose from 'mongoose';
import { initDatabase, getRepositories } from '../db/index.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

async function migrateData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/auditsec');
    console.log('✅ Connected to MongoDB');

    // Connect to PostgreSQL
    await initDatabase();
    const repos = await getRepositories();
    console.log('✅ Connected to PostgreSQL');

    // Migrate Users
    console.log('📊 Migrating users...');
    const mongoUsers = await User.find({});
    for (const user of mongoUsers) {
      try {
        await repos.userRepository.create({
          email: user.email,
          passwordHash: user.passwordHash,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
        });
        console.log(`  ✅ Migrated user: ${user.email}`);
      } catch (err) {
        console.error(`  ❌ Failed to migrate user ${user.email}:`, err.message);
      }
    }

    // Migrate Products
    console.log('📊 Migrating products...');
    const mongoProducts = await Product.find({});
    const productIdMap = new Map(); // MongoDB ID -> PostgreSQL ID
    
    for (const product of mongoProducts) {
      try {
        const newProduct = await repos.productRepository.create({
          name: product.name,
          description: product.description,
          longDescription: product.longDescription,
          price: product.price,
          category: product.category,
          type: product.type,
          image: product.image,
          fileUrl: product.fileUrl,
          fileSize: product.fileSize,
          tags: product.tags,
          featured: product.featured,
          active: product.active,
          stripeProductId: product.stripeProductId,
          stripePriceId: product.stripePriceId,
        });
        productIdMap.set(product._id.toString(), newProduct.id);
        console.log(`  ✅ Migrated product: ${product.name}`);
      } catch (err) {
        console.error(`  ❌ Failed to migrate product ${product.name}:`, err.message);
      }
    }

    // Migrate Orders
    console.log('📊 Migrating orders...');
    const mongoOrders = await Order.find({}).populate('products.productId');
    for (const order of mongoOrders) {
      try {
        const products = order.products.map(p => ({
          productId: productIdMap.get(p.productId._id.toString()),
          name: p.name,
          price: p.price,
          quantity: p.quantity,
        })).filter(p => p.productId); // Only include products that were migrated

        if (products.length === 0) {
          console.warn(`  ⚠️ Skipping order ${order.orderId}: no valid products`);
          continue;
        }

        await repos.orderRepository.create({
          orderId: order.orderId,
          customerEmail: order.customerEmail,
          customerName: order.customerName,
          products,
          totalAmount: order.totalAmount,
          currency: order.currency,
          status: order.status,
          paymentMethod: order.paymentMethod,
          stripeSessionId: order.stripeSessionId,
          stripePaymentIntentId: order.stripePaymentIntentId,
          ipAddress: order.ipAddress,
          userAgent: order.userAgent,
        });
        console.log(`  ✅ Migrated order: ${order.orderId}`);
      } catch (err) {
        console.error(`  ❌ Failed to migrate order ${order.orderId}:`, err.message);
      }
    }

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateData();
```

Pour exécuter la migration :
```bash
node backend/scripts/migrate-data.js
```

---

## ✅ Tests et vérification

### Étape 9 : Tester la connexion

1. Démarrez votre serveur :
   ```bash
   npm run dev
   ```

2. Vérifiez dans les logs :
   ```
   ✅ PostgreSQL/Supabase pool initialized
   ✅ Database initialized: postgresql
   ```

3. Testez une requête API (inscription par exemple) :
   ```bash
   curl -X POST http://localhost:3001/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@auditsec.com","password":"Test123!","firstName":"Test","lastName":"User"}'
   ```

4. Vérifiez dans Supabase **Table Editor** > **users** que l'utilisateur a bien été créé

### Étape 10 : Tester les fonctionnalités principales

- [ ] Inscription / Connexion utilisateur
- [ ] Affichage des produits
- [ ] Ajout au panier
- [ ] Paiement Stripe
- [ ] Réception de l'email avec liens de téléchargement
- [ ] Téléchargement d'un produit
- [ ] Portail client (projets, audits)

---

## 🌐 Mise en production

### Étape 11 : Configurer pour la production

1. **Variables d'environnement production** :
   ```env
   NODE_ENV=production
   DATABASE_URL=postgresql://postgres.xxx:PASSWORD@xxx.supabase.com:5432/postgres
   BACKEND_URL=https://api.votredomaine.com
   FRONTEND_URL=https://votredomaine.com
   ```

2. **Activer SSL pour PostgreSQL** :
   Le fichier `backend/db/supabase.js` gère déjà le SSL automatiquement en production.

3. **Row Level Security (RLS)** :
   Pour sécuriser vos données, activez RLS dans Supabase :
   
   ```sql
   -- Dans Supabase SQL Editor
   ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
   ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
   ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
   ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
   
   -- Exemple de policy (ajustez selon vos besoins)
   CREATE POLICY "Users can view own projects"
     ON projects FOR SELECT
     USING (user_id = (current_setting('app.user_id'))::uuid);
   ```

4. **Backups automatiques** :
   Supabase fait des backups automatiques quotidiens (plan gratuit : 7 jours de rétention).

---

## 🎉 Migration terminée !

Votre application utilise maintenant **Supabase PostgreSQL** ! 

### Avantages de cette migration :

✅ **Scalabilité** : PostgreSQL scale beaucoup mieux que SQLite  
✅ **Performance** : Requêtes optimisées avec des index  
✅ **Sécurité** : RLS, SSL, authentification robuste  
✅ **Backups** : Automatiques et versionnés  
✅ **Dashboard** : Interface Supabase pour gérer vos données  
✅ **Free tier** : Jusqu'à 500 MB gratuits  

### Ressources utiles :

- [Documentation Supabase](https://supabase.com/docs)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don%27t_Do_This)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### Support :

En cas de problème, vérifiez :
1. Les logs du serveur backend
2. L'onglet **Logs** dans Supabase (Database, API, Auth)
3. Les **Metrics** pour voir les requêtes lentes

---

**Bon courage ! 🚀**
