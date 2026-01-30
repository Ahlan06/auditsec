/**
 * AI Service - Handles AI chat interactions
 */

// Lazy load OpenAI client
let openaiClient = null;

async function getOpenAIClient() {
  if (openaiClient) return openaiClient;

  try {
    const openaiModule = await import('./openaiClient.js');
    openaiClient = openaiModule.default || openaiModule;
    return openaiClient;
  } catch (error) {
    console.warn('[AI Service] OpenAI client not available:', error.message);
    return null;
  }
}

/**
 * Generate system prompt for security context
 */
function generateSystemPrompt() {
  return `You are AuditSec AI, a professional cybersecurity assistant specialized in:

**Core Expertise:**
- Security audits and vulnerability assessments
- Penetration testing methodologies (OWASP, PTES, NIST)
- CVE analysis and exploit research
- Network security and infrastructure hardening
- Web application security (OWASP Top 10)
- Cloud security (AWS, Azure, GCP)
- Compliance frameworks (ISO 27001, SOC 2, PCI-DSS, GDPR)
- Incident response and threat intelligence
- Security automation and DevSecOps

**Response Guidelines:**
1. Provide clear, actionable, and technical responses
2. When discussing vulnerabilities:
   - Explain the risk and impact (CVSS scoring when applicable)
   - Provide step-by-step remediation
   - Include code examples and commands when relevant
   - Reference CVE IDs, CWE categories, and MITRE ATT&CK techniques
3. Use markdown formatting for better readability
4. Include relevant security tools and frameworks
5. Cite industry standards and best practices

**Tone:** Professional, concise, and educational. Assume the user has technical knowledge.`;
}

/**
 * Mock AI response for development/fallback
 */
function generateMockResponse(message) {
  const lowerMessage = message.toLowerCase();

  // Pattern matching for common queries
  if (lowerMessage.includes('sql injection') || lowerMessage.includes('sqli')) {
    return {
      reply: `# SQL Injection (SQLi)

## Overview
SQL Injection is a code injection technique that exploits vulnerabilities in database-driven applications. **OWASP Top 10 #1 (2021)**.

## Risk Assessment
- **CVSS Score:** 9.8 (Critical)
- **CWE-89:** Improper Neutralization of Special Elements used in an SQL Command

## Attack Vectors
\`\`\`sql
-- Example malicious input
' OR '1'='1' --
'; DROP TABLE users; --
UNION SELECT username, password FROM users --
\`\`\`

## Remediation Steps
1. **Use Prepared Statements/Parameterized Queries**
   \`\`\`javascript
   // Node.js with pg
   const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
   \`\`\`

2. **Input Validation**
   - Whitelist validation
   - Type checking
   - Length limits

3. **Principle of Least Privilege**
   - Database user permissions
   - Separate read/write accounts

4. **Web Application Firewall (WAF)**
   - ModSecurity rules
   - Cloud WAF (Cloudflare, AWS WAF)

## Detection Tools
- SQLMap
- Burp Suite Scanner
- OWASP ZAP

## References
- CWE-89: https://cwe.mitre.org/data/definitions/89.html
- OWASP SQLi Cheat Sheet`,
      sources: [
        {
          title: 'OWASP SQL Injection',
          url: 'https://owasp.org/www-community/attacks/SQL_Injection',
          type: 'documentation',
        },
        {
          title: 'CWE-89: SQL Injection',
          url: 'https://cwe.mitre.org/data/definitions/89.html',
          type: 'reference',
        },
      ],
      confidence: 0.95,
    };
  }

  // Generic security response
  return {
    reply: `# Security Analysis

I understand you're asking about: **"${message}"**

## Quick Assessment
To provide the most accurate guidance, I need to analyze this query in the context of:
- **Threat Modeling:** What's the attack surface?
- **Risk Assessment:** What's the potential impact?
- **Mitigation Strategy:** What controls can we implement?

## Common Security Best Practices
1. **Defense in Depth:** Multiple layers of security controls
2. **Zero Trust Architecture:** Never trust, always verify
3. **Principle of Least Privilege:** Minimum necessary access
4. **Security by Design:** Build security from the ground up
5. **Continuous Monitoring:** Real-time threat detection

## Recommended Tools
- **SIEM:** Splunk, ELK Stack, Wazuh
- **Vulnerability Scanners:** Nessus, OpenVAS, Qualys
- **Penetration Testing:** Metasploit, Burp Suite, Kali Linux
- **Code Analysis:** SonarQube, Snyk, Checkmarx

Would you like me to elaborate on any specific security aspect?

---
*Note: This is a development response. Configure OpenAI API for production use.*`,
    sources: [
      {
        title: 'OWASP Top 10',
        url: 'https://owasp.org/www-project-top-ten/',
        type: 'reference',
      },
      {
        title: 'NIST Cybersecurity Framework',
        url: 'https://www.nist.gov/cyberframework',
        type: 'framework',
      },
    ],
    confidence: 0.7,
  };
}

/**
 * Main chat function
 * @param {Object} params
 * @param {string} params.userId - User ID
 * @param {string} params.message - User message
 * @param {Array} params.history - Conversation history
 * @returns {Promise<{reply: string, sources: Array, metadata: Object}>}
 */
export async function chat({ userId, message, history = [] }) {
  try {
    const client = await getOpenAIClient();

    // If OpenAI not available, use mock
    if (!client || !process.env.OPENAI_API_KEY) {
      console.warn('[AI Service] Using mock response (OpenAI not configured)');
      const mock = generateMockResponse(message);
      return {
        reply: mock.reply,
        sources: mock.sources,
        metadata: {
          model: 'mock',
          tokensUsed: 0,
          processingTime: 0,
          confidence: mock.confidence,
          timestamp: new Date().toISOString(),
        },
      };
    }

    // Construct messages for OpenAI
    const messages = [
      { role: 'system', content: generateSystemPrompt() },
      // Include recent history (last 10 messages)
      ...history.slice(-10).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    const startTime = Date.now();

    // Call OpenAI API
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      messages,
      temperature: 0.7,
      max_tokens: 1500,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
      user: userId,
    });

    const processingTime = Date.now() - startTime;

    const reply = completion.choices[0]?.message?.content || 'No response generated';

    // Extract sources from response (if mentioned)
    const sources = extractSources(reply);

    return {
      reply,
      sources,
      metadata: {
        model: completion.model,
        tokensUsed: completion.usage?.total_tokens || 0,
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        processingTime,
        finishReason: completion.choices[0]?.finish_reason,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('[AI Service] Chat error:', error);

    // Handle specific OpenAI errors
    if (error.status === 429) {
      throw new Error('Rate limit exceeded on AI service');
    }

    if (error.status === 401) {
      throw new Error('AI service authentication failed');
    }

    if (error.status === 400) {
      throw new Error('Invalid request to AI service');
    }

    throw new Error(`AI service error: ${error.message}`);
  }
}

/**
 * Extract sources/references from AI response
 */
function extractSources(text) {
  const sources = [];
  
  // Look for URLs
  const urlRegex = /https?:\/\/[^\s)]+/g;
  const urls = text.match(urlRegex) || [];

  urls.forEach((url) => {
    // Try to extract title from context
    const titleMatch = text.match(new RegExp(`([^\\n]+?)\\s*:?\\s*${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
    sources.push({
      title: titleMatch?.[1]?.trim() || url,
      url,
      type: 'reference',
    });
  });

  return sources;
}

/**
 * Get available AI models
 */
export async function getAvailableModels() {
  return [
    {
      id: 'gpt-4-turbo-preview',
      name: 'GPT-4 Turbo',
      description: 'Most capable model for complex security analysis',
      contextWindow: 128000,
      maxTokens: 4096,
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      description: 'Fast and efficient for general security queries',
      contextWindow: 16385,
      maxTokens: 4096,
    },
  ];
}

export default {
  chat,
  getAvailableModels,
};
