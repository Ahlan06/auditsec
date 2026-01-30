# Prompt IA AppSec — Documentation complète

## Objectif

Transformer des résultats de scans automatisés (Nuclei, headers HTTP, TLS) en **analyse AppSec structurée** :
- Priorisation (P0/P1/P2/P3)
- Preuves extraites des données réelles
- Explications développeur (impact + qui est affecté)
- Correctifs (quick fix + durable fix)
- Références OWASP + CWE

**Règle stricte** : Ne jamais inventer. Si une preuve manque, répondre `unknown` + expliquer dans `dataLimitations`.

---

## 1. Prompt System (à envoyer au modèle)

```
Tu es un expert en sécurité applicative (AppSec) et en pentest défensif.

Mission:
- Analyser des résultats de scans automatisés (Nuclei, headers HTTP, TLS).
- Expliquer clairement à un développeur ce qui est en cause.
- Prioriser les risques.
- Proposer des corrections sécurisées.

Règles strictes:
- Ne jamais inventer de vulnérabilités ni de preuves.
- Te baser uniquement sur les données fournies dans l'entrée JSON.
- Chaque vulnérabilité DOIT inclure des éléments de preuve (evidence) extraits de l'entrée.
- Si une information manque, répondre avec "unknown" et expliquer ce qui manque.
- Référencer OWASP Top 10 (2021/2023 selon pertinence), CWE, et bonnes pratiques.
- Ne pas proposer d'actions offensives ni d'exploitation.
- Retourner UNIQUEMENT une réponse JSON valide, sans texte autour.

Prioritisation:
- Utiliser un classement P0/P1/P2/P3.
- Basé sur: sévérité (scan), exploitabilité, exposition, impact.
- Donner une recommandation "quick fix" et "durable fix".
```

---

## 2. Schéma JSON d'entrée (userMessage)

```json
{
  "target": "string",
  "scan_context": {
    "environment": "prod|staging|dev|unknown",
    "authenticated": boolean | "unknown",
    "notes": "string|optional"
  },
  "nuclei_findings": [
    {
      "templateId": "string",
      "name": "string|optional",
      "severity": "critical|high|medium|low|info|unknown",
      "matchedAt": "string (url)|optional",
      "tags": ["string"]|optional,
      "description": "string|optional",
      "raw": object|optional
    }
  ],
  "http": {
    "requests": [
      {
        "url": "string",
        "method": "string",
        "status": number,
        "response_headers": { "header-name": "value" },
        "body_snippet": "string|optional"
      }
    ]
  },
  "tls": {
    "endpoints": [
      {
        "host": "string",
        "port": number,
        "protocols": ["TLSv1.2", "TLSv1.3"]|optional,
        "cipher_suites": ["string"]|optional,
        "certificate": {
          "subject_cn": "string|optional",
          "issuer_cn": "string|optional",
          "not_before": "ISO8601 string|optional",
          "not_after": "ISO8601 string|optional",
          "sans": ["string"]|optional
        }
      }
    ]
  }
}
```

---

## 3. Schéma JSON de sortie (réponse IA)

```json
{
  "meta": {
    "target": "string",
    "generatedAt": "ISO8601 string",
    "confidence": "low|medium|high",
    "dataLimitations": ["string"]
  },
  "riskSummary": {
    "overallPriority": "P0|P1|P2|P3",
    "countsByPriority": {
      "P0": 0,
      "P1": 0,
      "P2": 0,
      "P3": 0
    }
  },
  "issues": [
    {
      "id": "string",
      "title": "string",
      "priority": "P0|P1|P2/P3",
      "severityFromTool": "string",
      "category": {
        "owasp": {
          "id": "A01|A02|...",
          "name": "string"
        },
        "cwe": [
          {
            "id": "CWE-XXX",
            "name": "string"
          }
        ]
      },
      "evidence": {
        "source": "nuclei|http|tls",
        "details": "string",
        "observations": ["string"]
      },
      "impact": {
        "whatCanHappen": "string",
        "whoIsAffected": "string",
        "preconditions": "string"
      },
      "recommendations": {
        "quickFix": "string",
        "durableFix": "string",
        "verificationSteps": ["string"]
      },
      "references": [
        {
          "label": "string",
          "url": "string"
        }
      ]
    }
  ],
  "developerNotes": {
    "safeAssumptions": ["string"],
    "unknowns": ["string"]
  }
}
```

---

## 4. Exemple complet

### Entrée (userMessage JSON)

```json
{
  "target": "https://shop.auditsec.example",
  "scan_context": {
    "environment": "staging",
    "authenticated": false,
    "notes": "Scan non-auth, home + login only."
  },
  "nuclei_findings": [
    {
      "templateId": "missing-security-headers",
      "name": "Missing Security Headers",
      "severity": "medium",
      "matchedAt": "https://shop.auditsec.example/",
      "tags": ["misconfig", "headers"],
      "description": "Checks common security headers presence."
    },
    {
      "templateId": "cookie-without-httponly",
      "name": "Cookie Without HttpOnly Flag",
      "severity": "high",
      "matchedAt": "https://shop.auditsec.example/login",
      "tags": ["cookie", "auth"],
      "description": "Session cookie missing HttpOnly."
    }
  ],
  "http": {
    "requests": [
      {
        "url": "https://shop.auditsec.example/",
        "method": "GET",
        "status": 200,
        "response_headers": {
          "server": "nginx",
          "content-type": "text/html; charset=utf-8",
          "set-cookie": "sid=abc123; Path=/; Secure; SameSite=Lax",
          "x-frame-options": "",
          "content-security-policy": "",
          "strict-transport-security": ""
        },
        "body_snippet": "<html>...</html>"
      },
      {
        "url": "https://shop.auditsec.example/login",
        "method": "GET",
        "status": 200,
        "response_headers": {
          "set-cookie": "sid=def456; Path=/; Secure; SameSite=Lax",
          "content-type": "text/html; charset=utf-8"
        }
      }
    ]
  },
  "tls": {
    "endpoints": [
      {
        "host": "shop.auditsec.example",
        "port": 443,
        "protocols": ["TLSv1.2", "TLSv1.3"],
        "certificate": {
          "subject_cn": "shop.auditsec.example",
          "issuer_cn": "Let's Encrypt",
          "not_before": "2025-11-01T00:00:00Z",
          "not_after": "2026-01-30T00:00:00Z",
          "sans": ["shop.auditsec.example"]
        }
      }
    ]
  }
}
```

### Sortie (réponse JSON de l'IA)

```json
{
  "meta": {
    "target": "https://shop.auditsec.example",
    "generatedAt": "2025-12-24T12:00:00.000Z",
    "confidence": "medium",
    "dataLimitations": [
      "Scan non-authentifié: les pages derrière login et API internes ne sont pas couvertes.",
      "Aucune preuve détaillée de configuration CSP/HSTS (valeurs vides seulement)."
    ]
  },
  "riskSummary": {
    "overallPriority": "P0",
    "countsByPriority": {
      "P0": 1,
      "P1": 1,
      "P2": 0,
      "P3": 0
    }
  },
  "issues": [
    {
      "id": "ISSUE-COOKIE-HTTPONLY",
      "title": "Cookie de session sans attribut HttpOnly",
      "priority": "P0",
      "severityFromTool": "high",
      "category": {
        "owasp": {
          "id": "A07",
          "name": "Identification and Authentication Failures"
        },
        "cwe": [
          {
            "id": "CWE-1004",
            "name": "Sensitive Cookie Without 'HttpOnly' Flag"
          }
        ]
      },
      "evidence": {
        "source": "http",
        "details": "Le cookie `sid` est émis sans attribut `HttpOnly`.",
        "observations": [
          "Sur / : `set-cookie: sid=abc123; Path=/; Secure; SameSite=Lax` (pas de `HttpOnly`)",
          "Sur /login : `set-cookie: sid=def456; Path=/; Secure; SameSite=Lax` (pas de `HttpOnly`)"
        ]
      },
      "impact": {
        "whatCanHappen": "Si une XSS est présente ailleurs sur le site, un script pourrait lire/extraire le cookie de session et mener à un détournement de session (session hijacking).",
        "whoIsAffected": "Utilisateurs authentifiés (sessions actives).",
        "preconditions": "Présence d'une XSS ou d'un script malveillant exécuté dans le contexte du domaine."
      },
      "recommendations": {
        "quickFix": "Ajouter `HttpOnly` sur le cookie de session côté serveur (en gardant `Secure` + `SameSite`).",
        "durableFix": "Combiner `HttpOnly` + rotation de session + réduction de durée de vie, et renforcer la prévention XSS (validation/sanitation, template escaping, CSP solide).",
        "verificationSteps": [
          "Re-tester la réponse HTTP: le header `Set-Cookie` doit contenir `HttpOnly`.",
          "Vérifier que les flows login/logout/refresh token fonctionnent après changement.",
          "Contrôler que le cookie n'est pas accessible via `document.cookie`."
        ]
      },
      "references": [
        {
          "label": "OWASP Session Management Cheat Sheet",
          "url": "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html"
        },
        {
          "label": "CWE-1004",
          "url": "https://cwe.mitre.org/data/definitions/1004.html"
        }
      ]
    },
    {
      "id": "ISSUE-SECURITY-HEADERS",
      "title": "Headers de sécurité manquants ou vides (CSP, HSTS, X-Frame-Options)",
      "priority": "P1",
      "severityFromTool": "medium",
      "category": {
        "owasp": {
          "id": "A05",
          "name": "Security Misconfiguration"
        },
        "cwe": [
          {
            "id": "CWE-693",
            "name": "Protection Mechanism Failure"
          }
        ]
      },
      "evidence": {
        "source": "http",
        "details": "Les headers suivants sont absents ou vides dans la réponse.",
        "observations": [
          "Sur / : `content-security-policy` est vide",
          "Sur / : `strict-transport-security` est vide",
          "Sur / : `x-frame-options` est vide"
        ]
      },
      "impact": {
        "whatCanHappen": "Réduction des protections navigateur: plus de risque d'XSS impactant (sans CSP), clickjacking (sans X-Frame-Options/frame-ancestors), et downgrade/SSL stripping en cas de mauvaise redirection (sans HSTS).",
        "whoIsAffected": "Tous les visiteurs du site.",
        "preconditions": "Dépend des attaques (ex: clickjacking nécessite une page embarquée; XSS nécessite une injection ailleurs)."
      },
      "recommendations": {
        "quickFix": "Activer HSTS (si HTTPS partout) et interdire l'embarquement via `frame-ancestors` (CSP) ou `X-Frame-Options: DENY`.",
        "durableFix": "Définir une CSP adaptée (scripts/frames/images), activer HSTS avec `includeSubDomains` et éventuellement `preload` après validation, et standardiser les headers via middleware serveur (ex: Helmet) + tests automatisés.",
        "verificationSteps": [
          "Vérifier que `Strict-Transport-Security` est présent sur toutes les réponses HTTPS.",
          "Vérifier que la CSP est présente et ne casse pas le frontend.",
          "Tester qu'une page externe ne peut pas embedd le site (clickjacking)."
        ]
      },
      "references": [
        {
          "label": "OWASP Secure Headers Project",
          "url": "https://owasp.org/www-project-secure-headers/"
        },
        {
          "label": "OWASP Cheat Sheet: Content Security Policy",
          "url": "https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html"
        },
        {
          "label": "OWASP Cheat Sheet: HTTP Strict Transport Security",
          "url": "https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html"
        },
        {
          "label": "CWE-693",
          "url": "https://cwe.mitre.org/data/definitions/693.html"
        }
      ]
    }
  ],
  "developerNotes": {
    "safeAssumptions": [
      "TLS supporte TLSv1.2 et TLSv1.3 (données fournies) — aucune faiblesse TLS évidente ici."
    ],
    "unknowns": [
      "Présence/absence réelle de XSS: non déterminable uniquement avec ces données.",
      "Politique complète de redirection HTTP→HTTPS et couverture HSTS sur tous les sous-domaines."
    ]
  }
}
```

---

## 5. Conseils d'implémentation

### Prompt engineering

- **Temperature basse** (0.2–0.3) : réponses factuelles, moins de créativité
- **Max tokens** : 4000–8000 (selon complexité de l'audit)
- **Stop sequences** : aucune (laisser finir le JSON)

### Validation de la sortie

```javascript
function validateAiAnalysis(data) {
  if (!data?.riskSummary) throw new Error('Missing riskSummary');
  if (!data?.issues) throw new Error('Missing issues');
  if (!Array.isArray(data.issues)) throw new Error('issues must be array');
  
  // Vérifier que chaque issue a des preuves
  data.issues.forEach(issue => {
    if (!issue.evidence?.observations || issue.evidence.observations.length === 0) {
      throw new Error(`Issue ${issue.id} lacks evidence.observations`);
    }
  });
  
  return true;
}
```

### Gestion des erreurs

- Si l'IA renvoie du markdown (`` ```json ... ``` ``), le strip avant parsing
- Si JSON invalide : stocker `aiAnalysis = null` + log l'erreur
- Si manque de données : l'IA doit remplir `dataLimitations` et `unknowns`

---

## 6. Exemples de tests

### Cas 1 : Aucun finding

**Entrée** :
```json
{
  "target": "https://secure.example",
  "scan_context": { "environment": "prod", "authenticated": false },
  "nuclei_findings": [],
  "http": { "requests": [] },
  "tls": { "endpoints": [] }
}
```

**Sortie attendue** :
```json
{
  "meta": {
    "target": "https://secure.example",
    "generatedAt": "2025-12-24T12:00:00Z",
    "confidence": "low",
    "dataLimitations": [
      "Aucun résultat de scan fourni.",
      "Impossible de conclure sur l'état de sécurité sans données."
    ]
  },
  "riskSummary": { "overallPriority": "P3", "countsByPriority": { "P0": 0, "P1": 0, "P2": 0, "P3": 0 } },
  "issues": [],
  "developerNotes": {
    "safeAssumptions": [],
    "unknowns": ["Aucune donnée de scan disponible."]
  }
}
```

### Cas 2 : Finding sans preuve (template générique)

**Entrée** :
```json
{
  "nuclei_findings": [
    {
      "templateId": "generic-vuln",
      "severity": "high",
      "matchedAt": null,
      "description": null
    }
  ]
}
```

**Sortie attendue** :
- L'IA **ne doit PAS** créer d'issue sans `evidence.observations`
- Ou créer un issue avec `dataLimitations` expliquant le manque de détails

---

## 7. Intégration recommandée

```javascript
// Backend (worker)
import { analyzeWithAI } from './services/aiAnalysis.js';

const scanResult = buildNormalizedScanResult({ ... });

const aiAnalysis = await analyzeWithAI(scanResult, {
  aiEndpoint: process.env.AI_ANALYSIS_ENDPOINT,
  authToken: process.env.AI_ANALYSIS_TOKEN
});

updateAuditRun(auditId, { result: scanResult, aiAnalysis });
```

```jsx
// Frontend (React)
import AuditAiAnalysis from './components/AuditAiAnalysis';

const audit = await clientAudits.get(id);

return (
  <div>
    {audit.aiAnalysis ? (
      <AuditAiAnalysis analysis={audit.aiAnalysis} />
    ) : (
      <div>Analyse IA non disponible.</div>
    )}
  </div>
);
```

---

**Fichiers modifiés** :
- [backend/services/aiAnalysis.js](../backend/services/aiAnalysis.js) : service qui appelle l'IA
- [backend/workers/scanWorker.js](../backend/workers/scanWorker.js) : intègre l'appel après scan
- [backend/routes/clientAudits.js](../backend/routes/clientAudits.js) : expose `aiAnalysis` via API
- [frontend/src/components/AuditAiAnalysis.jsx](../frontend/src/components/AuditAiAnalysis.jsx) : composant d'affichage
- [backend/client/db.js](../backend/client/db.js) : ajout colonne `ai_analysis_json`

