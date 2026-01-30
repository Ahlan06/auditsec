# Route GET /api/me - Documentation

## ✅ Route créée avec succès !

### 📋 Endpoint

```
GET /api/me
```

### 🔐 Authentification

**Requis** : JWT Token dans l'en-tête `Authorization`

```http
Authorization: Bearer <votre_token_jwt>
```

### 📥 Réponse Success (200 OK)

```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "test@auditsec.com",
    "firstName": "John",
    "lastName": "Doe",
    "name": "John Doe",
    "phone": "+33612345678",
    "emailVerified": true,
    "phoneVerified": false,
    "role": "user",
    "plan": "free",
    "createdAt": "2026-01-30T10:30:00.000Z",
    "lastLoginAt": "2026-01-30T12:00:00.000Z"
  }
}
```

### ❌ Erreurs possibles

#### 401 Unauthorized - Aucun token fourni

```json
{
  "error": "Unauthorized",
  "message": "No authorization header provided"
}
```

#### 401 Unauthorized - Format invalide

```json
{
  "error": "Unauthorized",
  "message": "Invalid authorization format. Expected: Bearer <token>"
}
```

#### 401 Unauthorized - Token expiré

```json
{
  "error": "Unauthorized",
  "message": "Token has expired"
}
```

#### 401 Unauthorized - Token invalide

```json
{
  "error": "Unauthorized",
  "message": "Invalid token"
}
```

#### 403 Forbidden - Payload invalide

```json
{
  "error": "Forbidden",
  "message": "Invalid token payload"
}
```

#### 404 Not Found - Utilisateur inexistant

```json
{
  "error": "User not found",
  "message": "The authenticated user no longer exists"
}
```

#### 500 Internal Server Error

```json
{
  "error": "Internal Server Error",
  "message": "An error occurred while fetching user data"
}
```

---

## 🧪 Test avec cURL (PowerShell)

### 1. Obtenir un token (login)

```powershell
$body = @{
  email = 'test@auditsec.com'
  password = 'Test123456!'
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/login' -Method Post -Body $body -ContentType 'application/json'
$token = $response.token
```

### 2. Tester la route /api/me

```powershell
$headers = @{
  'Authorization' = "Bearer $token"
}

Invoke-RestMethod -Uri 'http://localhost:3001/api/me' -Method Get -Headers $headers
```

### 3. Test avec token invalide (doit retourner 401)

```powershell
$headers = @{
  'Authorization' = 'Bearer invalid_token_here'
}

Invoke-RestMethod -Uri 'http://localhost:3001/api/me' -Method Get -Headers $headers
```

---

## 📝 Modifications apportées

### ✅ Fichiers créés

1. **`backend/routes/me.js`**
   - Route GET `/api/me` protégée par JWT
   - Retourne les informations publiques de l'utilisateur
   - Gestion complète des erreurs 401/403/404/500

### ✅ Fichiers modifiés

2. **`backend/middleware/jwtAuth.js`**
   - Amélioration du middleware `requireAuth`
   - Messages d'erreur détaillés pour 401/403
   - Ajout du middleware `optionalAuth` (bonus)
   - Gestion des erreurs spécifiques JWT (TokenExpiredError, JsonWebTokenError, etc.)

3. **`backend/models/User.js`**
   - Ajout du champ `role` (user/admin/moderator)
   - Ajout du champ `plan` (free/pro/enterprise)

4. **`backend/server.js`**
   - Import et enregistrement de la route `/api/me`

---

## 🎯 Utilisation dans le frontend

```javascript
// services/api.js
export const getMe = async () => {
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch('http://localhost:3001/api/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch user data');
  }

  return response.json();
};

// Usage
try {
  const { user } = await getMe();
  console.log('User:', user);
} catch (error) {
  console.error('Error:', error.message);
}
```

---

## 🚀 Fonctionnalités

- ✅ Authentification JWT avec `Authorization: Bearer`
- ✅ Validation du token avec gestion d'erreurs détaillée
- ✅ Retour des informations publiques (id, email, name, role, plan)
- ✅ Gestion des erreurs 401 (Unauthorized) et 403 (Forbidden)
- ✅ Protection contre les tokens expirés/invalides
- ✅ Exclusion automatique du `passwordHash` de la réponse
- ✅ Support des champs `role` et `plan` ajoutés au modèle User

**La route est prête et opérationnelle !** 🎉
