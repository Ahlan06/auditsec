# API Audits - Documentation

## ✅ Endpoints créés avec succès !

### 🔐 Authentification

Tous les endpoints nécessitent un token JWT dans l'en-tête `Authorization: Bearer <token>`

---

## 📋 Endpoints

### 1. POST /api/audits - Créer un audit

**Requête :**
```http
POST /api/audits
Authorization: Bearer <token>
Content-Type: application/json

{
  "targetType": "domain",
  "targetValue": "example.com"
}
```

**Validation :**
- `targetType` : enum ['domain', 'ip', 'email'] (requis)
- `targetValue` : string non vide (requis)

**Réponse (201 Created) :**
```json
{
  "message": "Audit created successfully",
  "audit": {
    "id": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "targetType": "domain",
    "targetValue": "example.com",
    "status": "queued",
    "progress": 0,
    "createdAt": "2026-01-30T10:30:00.000Z"
  }
}
```

---

### 2. GET /api/audits - Lister les audits (avec pagination)

**Requête :**
```http
GET /api/audits?page=1&limit=20&status=completed&sortBy=createdAt&sortOrder=desc
Authorization: Bearer <token>
```

**Query Parameters :**
- `page` : number (défaut: 1)
- `limit` : number, 1-100 (défaut: 20)
- `status` : enum ['queued', 'running', 'completed', 'failed'] (optionnel)
- `sortBy` : enum ['createdAt', 'updatedAt', 'status'] (défaut: createdAt)
- `sortOrder` : enum ['asc', 'desc'] (défaut: desc)

**Réponse (200 OK) :**
```json
{
  "audits": [
    {
      "id": "507f1f77bcf86cd799439011",
      "targetType": "domain",
      "targetValue": "example.com",
      "status": "completed",
      "progress": 100,
      "riskScore": 75,
      "startedAt": "2026-01-30T10:30:00.000Z",
      "finishedAt": "2026-01-30T10:35:00.000Z",
      "createdAt": "2026-01-30T10:29:00.000Z",
      "updatedAt": "2026-01-30T10:35:00.000Z",
      "duration": "5m 0s"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**RBAC :** Seuls les audits de l'utilisateur connecté sont retournés.

---

### 3. GET /api/audits/:id - Détails d'un audit

**Requête :**
```http
GET /api/audits/507f1f77bcf86cd799439011
Authorization: Bearer <token>
```

**Réponse (200 OK) :**
```json
{
  "audit": {
    "id": "507f1f77bcf86cd799439011",
    "userId": "507f191e810c19729de860ea",
    "targetType": "domain",
    "targetValue": "example.com",
    "status": "completed",
    "progress": 100,
    "riskScore": 75,
    "startedAt": "2026-01-30T10:30:00.000Z",
    "finishedAt": "2026-01-30T10:35:00.000Z",
    "error": null,
    "results": {
      "vulnerabilities": [...],
      "summary": {...}
    },
    "createdAt": "2026-01-30T10:29:00.000Z",
    "updatedAt": "2026-01-30T10:35:00.000Z",
    "duration": 300000,
    "durationFormatted": "5m 0s"
  }
}
```

**RBAC :** Retourne 403 si l'audit n'appartient pas à l'utilisateur.

---

### 4. POST /api/audits/:id/run - Lancer un audit

**Requête :**
```http
POST /api/audits/507f1f77bcf86cd799439011/run
Authorization: Bearer <token>
```

**Réponse (200 OK) :**
```json
{
  "message": "Audit started successfully",
  "audit": {
    "id": "507f1f77bcf86cd799439011",
    "status": "running",
    "progress": 0,
    "startedAt": "2026-01-30T10:30:00.000Z"
  }
}
```

**Erreurs :**
- 400 : Audit déjà en cours ou terminé
- 403 : L'audit n'appartient pas à l'utilisateur
- 404 : Audit non trouvé

---

### 5. POST /api/audits/:id/cancel - Annuler un audit

**Requête :**
```http
POST /api/audits/507f1f77bcf86cd799439011/cancel
Authorization: Bearer <token>
```

**Réponse (200 OK) :**
```json
{
  "message": "Audit cancelled successfully",
  "audit": {
    "id": "507f1f77bcf86cd799439011",
    "status": "failed",
    "error": "Cancelled by user",
    "finishedAt": "2026-01-30T10:32:00.000Z"
  }
}
```

**Erreurs :**
- 400 : Impossible d'annuler (status != queued/running)
- 403 : L'audit n'appartient pas à l'utilisateur
- 404 : Audit non trouvé

---

## ❌ Codes d'erreur communs

### 400 Bad Request - Validation
```json
{
  "error": "Validation error",
  "details": [
    {
      "field": "targetType",
      "message": "targetType must be one of: domain, ip, email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You do not have permission to access this audit"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Audit not found"
}
```

---

## 🧪 Tests avec PowerShell

### 1. Obtenir un token
```powershell
$body = @{ email = 'test@auditsec.com'; password = 'Test123456!' } | ConvertTo-Json
$response = Invoke-RestMethod -Uri 'http://localhost:3001/api/auth/login' -Method Post -Body $body -ContentType 'application/json'
$token = $response.token
$headers = @{ 'Authorization' = "Bearer $token" }
```

### 2. Créer un audit
```powershell
$body = @{ targetType = 'domain'; targetValue = 'example.com' } | ConvertTo-Json
$audit = Invoke-RestMethod -Uri 'http://localhost:3001/api/audits' -Method Post -Body $body -ContentType 'application/json' -Headers $headers
$auditId = $audit.audit.id
```

### 3. Lister les audits
```powershell
Invoke-RestMethod -Uri 'http://localhost:3001/api/audits?page=1&limit=10' -Headers $headers
```

### 4. Détails d'un audit
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/audits/$auditId" -Headers $headers
```

### 5. Lancer un audit
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/audits/$auditId/run" -Method Post -Headers $headers
```

### 6. Annuler un audit
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/audits/$auditId/cancel" -Method Post -Headers $headers
```

---

## 🎯 Fonctionnalités implémentées

### ✅ Validation avec Zod
- Schémas de validation stricts pour toutes les entrées
- Messages d'erreur détaillés et structurés
- Coercion automatique des types (page, limit)
- Validation des enums pour targetType, status, sortBy, sortOrder

### ✅ RBAC (Role-Based Access Control)
- Chaque utilisateur ne peut voir que **ses propres audits**
- Vérification stricte de la propriété avant toute action
- Retourne 403 Forbidden si accès non autorisé

### ✅ Pagination
- Support complet de la pagination (page, limit)
- Métadonnées : total, totalPages, hasNextPage, hasPrevPage
- Tri configurable (sortBy, sortOrder)
- Filtrage par status optionnel

### ✅ Gestion d'erreurs
- Codes HTTP appropriés (400, 401, 403, 404, 500)
- Messages d'erreur clairs et structurés
- Validation des IDs MongoDB (CastError)
- Logs des erreurs serveur

### ✅ Architecture Clean
- Controller séparé (`backend/controllers/auditController.js`)
- Routes séparées (`backend/routes/audits.js`)
- Réutilisation du middleware `requireAuth`
- Utilisation du modèle Audit avec ses méthodes

---

## 📂 Fichiers créés/modifiés

**Créés :**
- ✅ `backend/controllers/auditController.js`
- ✅ `backend/routes/audits.js`

**Modifiés :**
- ✅ `backend/server.js` (import + enregistrement route)
- ✅ `package.json` (ajout de zod)

**Prochaines étapes suggérées :**
1. Implémenter la queue BullMQ pour l'exécution asynchrone
2. Connecter les scanners au système d'audits
3. Générer les rapports automatiquement après complétion
4. Implémenter les webhooks pour notifications en temps réel

---

**Les endpoints sont prêts et opérationnels !** 🚀
