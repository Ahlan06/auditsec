# Configuration EmailJS pour AuditSec

## 🔧 CONFIGURATION REQUISE POUR ACTIVER L'ENVOI D'EMAILS

### Étape 1 : Créer un compte EmailJS
1. Allez sur https://www.emailjs.com/
2. Créez un compte gratuit (200 emails/mois)

### Étape 2 : Obtenir votre Public Key
1. Connectez-vous à EmailJS
2. Allez dans **Account** → **General**
3. Copiez votre **Public Key** (ex: `Abc123XyZ`)

### Étape 3 : Créer un Service Email
1. Allez dans **Email Services**
2. Cliquez sur **Add New Service**
3. Sélectionnez votre fournisseur :
   - **Gmail** (recommandé pour débuter)
   - Outlook
   - Autre
4. Suivez les instructions de connexion
5. Copiez le **Service ID** (ex: `service_abc123`)

### Étape 4 : Créer un Template Email
1. Allez dans **Email Templates**
2. Cliquez sur **Create New Template**
3. Configurez le template :

```
To: ahlan.mira@icloud.com
From: {{from_email}}
Subject: [AuditSec Contact] {{subject}}

Nouveau message de contact AuditSec:

Nom: {{from_name}}
Email: {{from_email}}
Sujet: {{subject}}

Message:
{{message}}

---
Envoyé depuis le formulaire de contact AuditSec
```

4. Copiez le **Template ID** (ex: `template_xyz789`)

### Étape 5 : Variables du Template
Assurez-vous que votre template EmailJS utilise ces variables (celles envoyées par le code) :
- `{{from_name}}` - Nom du contact
- `{{from_email}}` - Email du contact
- `{{subject}}` - Sujet du message
- `{{message}}` - Corps du message
- `{{reply_to}}` - Email de réponse (optionnel)
- `{{to_name}}` - Nom du destinataire (optionnel)

### Étape 6 : Variables d'environnement (recommandé)
Créez un fichier `.env` dans `/frontend` :

```env
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=Abc123XyZ
```

Ensuite, redémarrez le serveur de dev (Vite ne recharge pas toujours les `.env` à chaud).

### Étape 8 : Configuration CORS
Dans EmailJS Dashboard :
1. Allez dans **Email Services** → votre service
2. **Settings** → **Allowed Domains**
3. Ajoutez :
   - `localhost:5173` (pour développement)
   - `votre-domaine.com` (pour production)

## 🧪 Test de configuration

1. Lancez le site : `npm run dev`
2. Allez sur la page Contact
3. Remplissez le formulaire
4. Cliquez sur "Send Message"
5. Vérifiez :
   - ✅ Message de succès affiché
   - ✅ Email reçu sur ahlan.mira@icloud.com
   - ✅ Console sans erreurs

## 🌍 Configuration Vercel (production)
Dans Vercel → Project → Settings → Environment Variables, ajoutez exactement :
- `VITE_EMAILJS_SERVICE_ID`
- `VITE_EMAILJS_TEMPLATE_ID`
- `VITE_EMAILJS_PUBLIC_KEY`

Puis redeploy.

## 🔍 Debugging

Si les emails ne s'envoient pas :

1. **Vérifiez la console du navigateur**
   ```
   F12 → Console → Recherchez "Email send error"
   ```

2. **Erreurs courantes :**
   - `Invalid Public Key` → Vérifiez votre Public Key
   - `Service not found` → Vérifiez le Service ID
   - `Template not found` → Vérifiez le Template ID
   - `CORS error` → Ajoutez votre domaine dans EmailJS

3. **Vérifiez EmailJS Dashboard**
   - Allez dans **Auto Reply** pour voir les emails envoyés
   - Vérifiez le quota (200/mois gratuit)

## 📧 Alternative : Formulaire mailto simple
Si EmailJS ne fonctionne pas immédiatement, utilisez le bouton Email direct déjà présent sur la page qui ouvre le client mail local.

## 🔒 Sécurité
- ✅ Public Key peut être exposée (c'est normal)
- ✅ Les vraies clés API sont côté EmailJS
- ❌ Ne jamais exposer de clé EmailJS **Private Key** (inutile côté frontend)

⚠️ Si une **Private Key** a été partagée par erreur (capture d'écran, repo, etc.), considérez-la comme compromise et régénérez-la dans EmailJS.

## 📊 Limites gratuites EmailJS
- 200 emails/mois
- 1 service email
- Templates illimités
- Support communautaire

Pour plus : Plan Premium à $15/mois (1000 emails)
