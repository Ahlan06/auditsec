# Analyse IA AppSec intégrée

## C'est quoi ?

Après chaque scan (httpx + nuclei), **l'IA analyse automatiquement** les résultats et génère :
- **Priorités** (P0/P1/P2/P3) basées sur sévérité + exploitabilité + impact
- **Preuves** extraites des données réelles (headers, findings nuclei, TLS)
- **Explications développeur** (impact, qui est affecté, préconditions)
- **Correctifs** (quick fix + durable fix + étapes de vérification)
- **Références OWASP + CWE**

**Règle stricte** : l'IA **ne peut jamais inventer** de vulnérabilités. Si un élément de preuve manque, elle renvoie `unknown`.

## Où c'est intégré ?

### 1. Backend (automatique)
- **Worker** ([backend/workers/scanWorker.js](../backend/workers/scanWorker.js)) :
  - Après le scan, appelle `analyzeWithAI()` si `AI_ANALYSIS_ENDPOINT` configuré
  - Stocke l'analyse dans `audits.ai_analysis_json`

- **Service IA** ([backend/services/aiAnalysis.js](../backend/services/aiAnalysis.js)) :
  - Transforme les résultats du scan en format JSON pour l'IA
  - Envoie le prompt system + résultats au modèle
  - Parse et valide la réponse JSON

- **API** ([backend/routes/clientAudits.js](../backend/routes/clientAudits.js)) :
  - `GET /api/client/audits` : renvoie `audit.aiAnalysis` pour chaque audit
  - `GET /api/client/audits/:id` : idem
  - `GET /api/client/audits/:id/status` : inclut `aiRiskSummary` (léger, pour polling)

### 2. Frontend (affichage)
- **Composant** ([frontend/src/components/AuditAiAnalysis.jsx](../frontend/src/components/AuditAiAnalysis.jsx)) :
  - Affiche le risque global (priorité P0/P1/P2/P3)
  - Liste les issues avec preuves + impact + correctifs
  - Références OWASP/CWE cliquables
  - Notes développeur (hypothèses vérifiées + unknowns)

- **Hook** ([frontend/src/hooks/useAuditRun.js](../frontend/src/hooks/useAuditRun.js)) :
  - Polling automatique du status audit
  - Récupère `aiAnalysis` quand le scan est terminé

## Configuration (variables d'environnement)

```bash
# backend/.env ou process.env

# URL de ton endpoint IA (backend ou gateway IA)
AI_ANALYSIS_ENDPOINT=http://localhost:3001/api/client/ai/analyze
# ou si tu as un endpoint dédié OpenAI/Claude/DeepSeek

# Token d'auth (optionnel, si ton endpoint IA nécessite un Bearer token)
AI_ANALYSIS_TOKEN=your_secret_token_here
```

**Si `AI_ANALYSIS_ENDPOINT` n'est PAS configuré** :
- Le worker skip l'analyse IA (pas d'erreur)
- `aiAnalysis` reste `null`
- L'UI affiche "Analyse IA non disponible"

## Utiliser un endpoint IA custom

Le service attend une API type `POST /analyze` avec ce format :

**Requête** :
```json
{
  "systemPrompt": "Tu es un expert AppSec...",
  "userMessage": "{ \"target\": \"https://...\", \"nuclei_findings\": [...] }",
  "temperature": 0.3
}
```

**Réponse** :
```json
{
  "reply": "{ \"meta\": {...}, \"riskSummary\": {...}, \"issues\": [...] }"
}
```

Exemple d'implémentation (OpenAI, Claude, DeepSeek) dans `backend/services/aiAnalysis.js`.

## Utiliser l'IA gateway existante (client/ai)

Si tu veux **réutiliser** ton IA gateway déjà en place (`/api/client/ai/conversations/:id/messages`), adapte l'endpoint :

```bash
AI_ANALYSIS_ENDPOINT=http://localhost:3001/api/client/ai/scan-analysis
```

Puis crée une route dédiée qui :
1. Reçoit `{ scanResult: {...} }`
2. Crée une conversation temporaire
3. Envoie systemPrompt + scanResult au modèle
4. Renvoie le JSON parse

## Format JSON complet (entrée → sortie)

Voir fichier [APPSEC_AI_PROMPT.md](./APPSEC_AI_PROMPT.md) pour :
- Template du prompt system complet
- Schéma d'entrée JSON (nuclei, http, tls)
- Schéma de sortie JSON (meta, riskSummary, issues[], developerNotes)
- Exemples réels

## Tester l'intégration

1. Lance Redis + worker + backend :
   ```bash
   docker run --rm -p 6379:6379 redis:7-alpine
   npm run dev:scan-worker  # terminal 1
   npm run dev              # terminal 2
   ```

2. Configure `AI_ANALYSIS_ENDPOINT` (ton IA ou mock)

3. Crée + lance un audit via l'UI ou l'API :
   ```bash
   curl -X POST http://localhost:3001/api/client/audits \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"target": "https://example.com"}'
   
   curl -X POST http://localhost:3001/api/client/audits/1/run \
     -H "Authorization: Bearer <token>"
   ```

4. Attends la fin du scan (status `completed`)

5. Récupère l'analyse :
   ```bash
   curl http://localhost:3001/api/client/audits/1 \
     -H "Authorization: Bearer <token>"
   ```

   Tu verras `audit.aiAnalysis` avec :
   - `riskSummary.overallPriority` : P0/P1/P2/P3
   - `issues[]` : liste des vulns avec preuves + OWASP + correctifs

## Afficher l'analyse dans l'UI

Importe le composant dans ta page de résultats :

```jsx
import AuditAiAnalysis from '../components/AuditAiAnalysis';

// Dans ta page
const audit = useAuditDetails(id); // ou useAuditRun

return (
  <div>
    {/* Résultats bruts */}
    <RawFindings findings={audit.result?.nuclei?.findings} />
    
    {/* Analyse IA */}
    {audit.aiAnalysis ? (
      <AuditAiAnalysis analysis={audit.aiAnalysis} />
    ) : null}
  </div>
);
```

## Sécurité & confidentialité

- Les résultats de scan **ne sortent jamais du backend** directement vers un LLM externe.
- Le `AI_ANALYSIS_ENDPOINT` peut pointer vers :
  - Ton propre modèle self-hosted (Ollama, vLLM, etc.)
  - Un gateway IA interne qui log/filtre avant d'appeler un LLM tiers
  - Un endpoint cloud (OpenAI/Claude) avec un service key côté backend uniquement

- **Jamais de clé API IA côté frontend**.

## Désactiver l'analyse IA

Retire ou commente `AI_ANALYSIS_ENDPOINT` dans ton `.env` :
- Le worker continuera de scanner normalement
- `aiAnalysis` restera `null`
- Pas d'appel réseau externe

---

**Architecture résumée** :

```
Scan terminé (worker)
  → analyzeWithAI(scanResult)
    → POST AI_ANALYSIS_ENDPOINT { systemPrompt, userMessage: JSON(scanResult) }
      → LLM renvoie JSON { riskSummary, issues[] }
  → updateAuditRun({ aiAnalysis: ... })
    → SQLite audits.ai_analysis_json
  → Frontend récupère via GET /audits/:id
    → AuditAiAnalysis composant affiche
```
