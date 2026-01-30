// AI-powered AppSec scan interpretation service
// Transforms raw scan results into developer-friendly risk analysis

const SYSTEM_PROMPT = `Tu es un expert en sécurité applicative (AppSec) et en pentest défensif.

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

Format de sortie JSON attendu:
{
  "meta": {
    "target": "string",
    "generatedAt": "ISO8601 string",
    "confidence": "low|medium|high",
    "dataLimitations": ["string"]
  },
  "riskSummary": {
    "overallPriority": "P0|P1|P2|P3",
    "countsByPriority": { "P0": 0, "P1": 0, "P2": 0, "P3": 0 }
  },
  "issues": [
    {
      "id": "string",
      "title": "string",
      "priority": "P0|P1|P2|P3",
      "severityFromTool": "string",
      "category": {
        "owasp": { "id": "string", "name": "string" },
        "cwe": [{ "id": "string", "name": "string" }]
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
      "references": [{ "label": "string", "url": "string" }]
    }
  ],
  "developerNotes": {
    "safeAssumptions": ["string"],
    "unknowns": ["string"]
  }
}`;

function buildAnalysisInput(scanResult) {
  const target = scanResult?.target || 'unknown';
  const mode = scanResult?.mode || 'passive';
  
  return {
    target,
    scan_context: {
      environment: 'unknown',
      authenticated: false,
      notes: `Scan mode: ${mode}. Coverage limited to publicly accessible endpoints.`
    },
    nuclei_findings: (scanResult?.nuclei?.findings || []).map(f => ({
      templateId: f.templateId || 'unknown',
      name: f.name || null,
      severity: f.severity || 'unknown',
      matchedAt: f.matchedAt || null,
      tags: f.tags || [],
      description: f.description || null,
      raw: f.raw || null
    })),
    http: {
      requests: (scanResult?.httpx?.assets || []).map(a => ({
        url: a.url || a.input || null,
        method: 'GET',
        status: a.statusCode || null,
        response_headers: {
          server: a.webserver || null,
          'content-type': a.contentType || null,
          // Add more headers if available in httpx raw data
        },
        body_snippet: null
      }))
    },
    tls: {
      endpoints: [] // TLS info not captured by httpx/nuclei in current setup
    }
  };
}

function safeJsonParse(text, fallback = null) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

export async function analyzeWithAI(scanResult, { aiEndpoint, authToken } = {}) {
  if (!aiEndpoint) {
    // AI disabled or not configured
    return null;
  }

  const input = buildAnalysisInput(scanResult);
  
  try {
    // Call the AI gateway (same pattern as /client/ai/conversations/:id/messages)
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch(aiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify({
        systemPrompt: SYSTEM_PROMPT,
        userMessage: JSON.stringify(input, null, 2),
        temperature: 0.3, // Lower temp for consistent, factual output
      }),
      timeout: 60_000
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI endpoint returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    // Extract JSON from AI response (handle markdown code blocks if present)
    let jsonText = data?.reply || data?.message || '';
    
    // Strip markdown code fences if present
    jsonText = jsonText.replace(/^```json\s*/m, '').replace(/\s*```$/m, '').trim();
    
    const analysis = safeJsonParse(jsonText);
    
    if (!analysis || !analysis.riskSummary) {
      throw new Error('AI returned invalid analysis format');
    }
    
    return analysis;
    
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('AI analysis failed:', err.message);
    return {
      meta: {
        target: scanResult?.target || 'unknown',
        generatedAt: new Date().toISOString(),
        confidence: 'low',
        dataLimitations: ['AI analysis failed: ' + err.message]
      },
      riskSummary: {
        overallPriority: 'P3',
        countsByPriority: { P0: 0, P1: 0, P2: 0, P3: 0 }
      },
      issues: [],
      developerNotes: {
        safeAssumptions: [],
        unknowns: ['AI analysis could not be completed.']
      }
    };
  }
}
