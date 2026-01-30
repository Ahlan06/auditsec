# 🔐 Compte Utilisateur de Test - AuditSec

## ✅ Utilisateur SQLite créé avec succès !

Un utilisateur de test a été créé dans la base de données SQLite locale.

### 📋 Identifiants de connexion

```
Email:    test@auditsec.com
Password: Test123456!
```

### 🌐 Accès au site

**URL de connexion:** http://localhost:5173/auth/login

### ⚠️ Important : MongoDB vs SQLite

L'application utilise **deux systèmes d'authentification** :

1. **`/api/auth`** → MongoDB (désactivé actuellement car MongoDB n'est pas installé)
2. **`/api/client/auth`** → SQLite (actif et fonctionnel)

**Le frontend pointe actuellement vers `/api/auth` (MongoDB).**

### 🔧 Deux solutions pour se connecter :

#### **Solution 1 : Installer MongoDB (recommandé)**

**Windows:**
```powershell
# Télécharger MongoDB Community Server depuis:
# https://www.mongodb.com/try/download/community

# Ou avec chocolatey:
choco install mongodb

# Démarrer MongoDB:
net start MongoDB
```

Ensuite, activer MongoDB dans `.env`:
```env
ENABLE_MONGO=true
MONGODB_URI=mongodb://localhost:27017/auditsec
```

Puis créer l'utilisateur MongoDB:
```powershell
node backend/scripts/create-test-user.js
```

#### **Solution 2 : Utiliser SQLite (déjà configuré)**

L'utilisateur SQLite est déjà créé ! Pour l'utiliser:

1. **Aller directement sur la page de connexion:**
   ```
   http://localhost:5173/auth/login
   ```

2. **S'inscrire via l'interface** (MongoDB sera utilisé mais créera l'utilisateur)
   - Ou bien on peut modifier temporairement le frontend pour pointer vers SQLite

### 📊 Base de données SQLite

- **Fichier:** `backend/client/client.db`
- **Utilisateur créé:** test@auditsec.com
- **Tables disponibles:** users, projects, audits, ai_conversations, etc.

### 🚀 Scripts disponibles

```powershell
# Créer un utilisateur SQLite
node backend/scripts/create-test-user-sqlite.js

# Créer un utilisateur MongoDB (nécessite MongoDB actif)
node backend/scripts/create-test-user.js

# Vérifier la configuration
node backend/scripts/check-auth-config.js
```

### 💡 Note

Pour des tests rapides en local sans installer MongoDB, vous pouvez:
1. Utiliser directement le formulaire d'inscription: http://localhost:5173/auth/register
2. Créer un compte avec vos propres identifiants
3. MongoDB créera automatiquement la base de données locale

---

**Besoin d'aide ?** Consultez la documentation dans le dossier racine du projet.
