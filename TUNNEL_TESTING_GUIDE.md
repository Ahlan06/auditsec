# Test gratuit (Option 1) — Vercel + Backend local + SQLite + Cloudflare Tunnel

Objectif : tester **création de compte / login** depuis ton site **hébergé sur Vercel** (donc accessible depuis n’importe où), tout en gardant une base **SQLite locale** sur ton PC.

> Important : ton backend tourne sur ton PC. Si ton PC est éteint, l’API ne répond plus (normal pour des tests).

---

## 1) Préparer le backend (PC)

### A. Créer le fichier `backend/.env`
Copie `.env.example` en `backend/.env` (le backend charge explicitement `backend/.env`).

Variables minimum recommandées :

```dotenv
# backend/.env
PORT=3001
NODE_ENV=development

# IMPORTANT: remplace par ton URL Vercel
FRONTEND_URL=https://TON-PROJET.vercel.app

# IMPORTANT: sera remplacé par l’URL trycloudflare.com du tunnel
BACKEND_URL=https://XXXX.trycloudflare.com

# JWT (obligatoire dès que c’est exposé sur internet)
JWT_SECRET=CHANGE_ME_TO_A_LONG_RANDOM_STRING

# Pour les tests, laisse Mongo désactivé
ENABLE_MONGO=false
```

Pour générer un `JWT_SECRET` rapidement :

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### B. Démarrer l’API
Depuis la racine du repo :

```powershell
npm run dev:backend
```

Teste localement :
- `http://localhost:3001/health`

Les comptes sont stockés dans : `backend/client/client.db`.

---

## 2) Créer un tunnel gratuit (Cloudflare)

### A. Installer `cloudflared`
Si tu as winget :

```powershell
winget install Cloudflare.cloudflared
```

### B. Lancer le tunnel

```powershell
cloudflared tunnel --url http://localhost:3001
```

Cloudflared va t’afficher une URL de type :

- `https://XXXX.trycloudflare.com`

Garde cette URL : c’est ton **backend public**.

---

## 3) Configurer Vercel (frontend)

Dans Vercel → ton projet → **Settings → Environment Variables** :

- `VITE_API_URL` = `https://XXXX.trycloudflare.com/api`

Ensuite : **redeploy** (ou push un commit) pour que Vercel rebuild avec la variable.

---

## 4) Mettre à jour `BACKEND_URL` côté backend

Parce que le backend utilise `BACKEND_URL` pour les redirects OAuth (et potentiellement d’autres liens), mets :

- `BACKEND_URL=https://XXXX.trycloudflare.com`

dans `backend/.env`, puis **redémarre** le backend.

---

## 5) Test de création de compte

Depuis ton site Vercel :
- ouvre la page de register/login
- crée un compte

En cas de souci :
- vérifie que `VITE_API_URL` est bien celui du tunnel
- vérifie que le tunnel tourne toujours
- vérifie que le backend tourne toujours
- regarde la console du backend (elle doit recevoir le `POST /api/auth/register`)

---

## Notes importantes (sécurité)

- Même si c’est un test, tu exposes ton API sur internet via le tunnel.
- Mets un `JWT_SECRET` fort.
- Évite de laisser le tunnel actif en permanence.
- Les comptes de test sont dans SQLite local : ne mets pas de vraies données.
