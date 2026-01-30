import { useEffect, useMemo, useRef, useState } from 'react';
import ProgressTracker from '../components/client-dashboard/ui/ProgressTracker';
import { EmptyState } from '../components/client-dashboard/ui';
import { useAuditRun } from '../hooks/useAuditRun';
import {
  ComplianceDashboard,
  RealTimeScanMonitor,
  SecurityScoreCard,
  ThreatIntelligenceFeed,
  VulnerabilityHeatmap,
} from '../components/client-dashboard/widgets';

const LS_RUNS_KEY = 'auditsec_scan_runs_v1';
const LS_COMPLIANCE_KEY = 'auditsec_scan_compliance_v1';

const OWASP_TESTS = [
  { id: 'A01', label: 'A01: Broken Access Control' },
  { id: 'A02', label: 'A02: Cryptographic Failures' },
  { id: 'A03', label: 'A03: Injection' },
  { id: 'A04', label: 'A04: Insecure Design' },
  { id: 'A05', label: 'A05: Security Misconfiguration' },
  { id: 'A06', label: 'A06: Vulnerable and Outdated Components' },
  { id: 'A07', label: 'A07: Identification and Authentication Failures' },
  { id: 'A08', label: 'A08: Software and Data Integrity Failures' },
  { id: 'A09', label: 'A09: Security Logging and Monitoring Failures' },
  { id: 'A10', label: 'A10: Server-Side Request Forgery (SSRF)' },
];

const AUTH_METHODS = [
  { id: 'none', label: 'None' },
  { id: 'basic', label: 'Basic' },
  { id: 'oauth', label: 'OAuth' },
  { id: 'apiKey', label: 'API Key' },
];

const SEVERITIES = ['Critical', 'High', 'Medium', 'Low', 'Info'];

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function isValidUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function downloadBlob(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function toXml(run) {
  const esc = (v) =>
    String(v)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&apos;');

  const findingsXml = (run.findings || [])
    .map(
      (f) => `\n    <finding key="${esc(f.key)}">\n      <title>${esc(f.title)}</title>\n      <severity>${esc(f.severity)}</severity>\n      <type>${esc(f.type)}</type>\n      <owasp>${esc(f.owasp)}</owasp>\n      <location>${esc(f.location)}</location>\n      <evidence>${esc(f.evidence || '')}</evidence>\n    </finding>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<scanRun id="${esc(run.id)}">\n  <createdAt>${esc(run.createdAt)}</createdAt>\n  <targetUrl>${esc(run.targetUrl)}</targetUrl>\n  <authMethod>${esc(run.authMethod)}</authMethod>\n  <intensity>${esc(run.intensity)}</intensity>\n  <rateLimitRps>${esc(run.rateLimitRps)}</rateLimitRps>\n  <scheduled>${esc(run.scheduled ? 'true' : 'false')}</scheduled>\n  <scheduledAt>${esc(run.scheduledAt || '')}</scheduledAt>\n  <tests>${(run.tests || []).map((t) => `\n    <test>${esc(t)}</test>`).join('')}\n  </tests>\n  <scopeBoundaries>${esc(run.scopeBoundaries || '')}</scopeBoundaries>\n  <exclusions>${(run.exclusions || []).map((e) => `\n    <rule>${esc(e)}</rule>`).join('')}\n  </exclusions>\n  <findings>${findingsXml}\n  </findings>\n</scanRun>`;
}

function printToPdf(run) {
  const w = window.open('', '_blank', 'noopener,noreferrer');
  if (!w) return;

  const css = `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial; padding: 24px; }
    h1 { font-size: 18px; margin: 0 0 12px; }
    h2 { font-size: 14px; margin: 18px 0 8px; }
    .meta { font-size: 12px; color: #444; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #f7f7f7; }
    .pill { display: inline-block; padding: 2px 8px; border-radius: 999px; border: 1px solid #ddd; }
  `;

  const rows = (run.findings || [])
    .map(
      (f) => `
        <tr>
          <td>${String(f.title)}</td>
          <td><span class="pill">${String(f.severity)}</span></td>
          <td>${String(f.type)}</td>
          <td>${String(f.owasp)}</td>
          <td>${String(f.location)}</td>
        </tr>
      `
    )
    .join('');

  w.document.open();
  w.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Scan Report</title>
        <style>${css}</style>
      </head>
      <body>
        <h1>Vulnerability Scan Report</h1>
        <div class="meta">
          <div><strong>Target:</strong> ${String(run.targetUrl)}</div>
          <div><strong>Created:</strong> ${String(run.createdAt)}</div>
          <div><strong>Intensity:</strong> ${String(run.intensity)} · <strong>Auth:</strong> ${String(run.authMethod)}</div>
        </div>

        <h2>Findings</h2>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Severity</th>
              <th>Type</th>
              <th>OWASP</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="5">No findings</td></tr>'}
          </tbody>
        </table>
      </body>
    </html>
  `);
  w.document.close();

  // Allow layout, then print.
  setTimeout(() => {
    w.focus();
    w.print();
  }, 50);
}

function findingKey(f) {
  return `${f.owasp}|${f.type}|${f.location}|${f.title}`;
}

function severityPill(sev) {
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border ';
  if (sev === 'Critical') return base + 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20';
  if (sev === 'High') return base + 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20';
  if (sev === 'Medium') return base + 'bg-yellow-500/10 text-yellow-800 dark:text-yellow-300 border-yellow-500/20';
  if (sev === 'Low') return base + 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20';
  return base + 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20';
}

function remediationFor(finding) {
  const type = (finding.type || '').toLowerCase();
  const owasp = (finding.owasp || '').toUpperCase();

  if (type.includes('sql') || owasp === 'A03') {
    return {
      title: 'Use parameterized queries',
      steps: [
        'Replace dynamic SQL string concatenation with parameterized queries / prepared statements.',
        'Validate and normalize inputs at the boundary (schema validation).',
        'Apply least privilege to the database user.',
        'Add regression tests for the vulnerable endpoint.',
      ],
      snippet: `// Example (Node.js / PostgreSQL)
const { rows } = await db.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);`,
    };
  }

  if (type.includes('xss') || owasp === 'A05') {
    return {
      title: 'Output encode + tighten CSP',
      steps: [
        'Escape/encode untrusted content on output (context-aware).',
        'Avoid dangerouslySetInnerHTML unless absolutely necessary.',
        'Add a strict Content-Security-Policy and remove unsafe-inline.',
        'Sanitize stored user content before rendering.',
      ],
      snippet: `// React: avoid raw HTML injection
<div>{userSuppliedText}</div>

// If you must render HTML, sanitize first (server-side or trusted sanitizer).`,
    };
  }

  if (type.includes('auth') || owasp === 'A07') {
    return {
      title: 'Harden authentication & session handling',
      steps: [
        'Enforce MFA for privileged roles and admin access.',
        'Use short-lived tokens and rotate refresh tokens.',
        'Add rate limiting and account lockout policies.',
        'Ensure secure cookie flags (HttpOnly, Secure, SameSite).',
      ],
      snippet: `// Express cookie example
res.cookie('session', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax'
});`,
    };
  }

  return {
    title: 'General remediation',
    steps: [
      'Confirm the vulnerable input and reproduce safely.',
      'Apply a targeted fix with least privilege and strict validation.',
      'Add automated tests to prevent regressions.',
      'Re-run the scan to validate the fix.',
    ],
    snippet: `// Tip: add validation at the boundary
// Example using zod/joi/yup (choose one)
// Validate request payloads before using them.`,
  };
}

export default function ClientAuditWorkflowPage() {
  const [step, setStep] = useState(0);

  // Step 1: scope
  const [targetUrl, setTargetUrl] = useState('');
  const [authMethod, setAuthMethod] = useState('none');
  const [basicUser, setBasicUser] = useState('');
  const [basicPass, setBasicPass] = useState('');
  const [oauthToken, setOauthToken] = useState('');
  const [apiKeyHeader, setApiKeyHeader] = useState('X-API-Key');
  const [apiKeyValue, setApiKeyValue] = useState('');
  const [scopeBoundaries, setScopeBoundaries] = useState('');
  const [exclusionsText, setExclusionsText] = useState('');

  // Step 2: configuration
  const [selectedTests, setSelectedTests] = useState(() => OWASP_TESTS.map((t) => t.id));
  const [intensity, setIntensity] = useState('Medium');
  const [rateLimitRps, setRateLimitRps] = useState(5);
  const [scheduled, setScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');

  // Step 3: execution
  const [runState, setRunState] = useState('idle'); // idle | running | paused | completed
  const [progress, setProgress] = useState(0);
  const [findings, setFindings] = useState([]);
  const [auditJobId, setAuditJobId] = useState(null);
  const [scanError, setScanError] = useState('');
  const [estimatedTotalSeconds, setEstimatedTotalSeconds] = useState(120);
  const startedAtRef = useRef(null);
  const tickRef = useRef(null);
  const persistedAuditIdRef = useRef(null);

  const auditRun = useAuditRun({ pollIntervalMs: 1500 });

  // Step 4+5
  const [severityFilter, setSeverityFilter] = useState(() => new Set(SEVERITIES));
  const [typeFilter, setTypeFilter] = useState('All');
  const [owaspFilter, setOwaspFilter] = useState('All');
  const [previousRunId, setPreviousRunId] = useState('');
  const [compliance, setCompliance] = useState(() => ({}));

  const complianceStandards = useMemo(
    () => [
      {
        id: 'GDPR',
        title: 'RGPD (GDPR)',
        items: [
          { id: 'gdpr_dpia', label: 'DPIA performed for high-risk processing', required: true, done: false },
          { id: 'gdpr_retention', label: 'Data retention policy defined', required: true, done: false },
          { id: 'gdpr_breach', label: 'Breach notification procedure documented', required: true, done: false },
          { id: 'gdpr_access', label: 'Access control & least privilege enforced', required: true, done: false },
        ],
      },
      {
        id: 'ISO27001',
        title: 'ISO 27001',
        items: [
          { id: 'iso_asset', label: 'Asset inventory maintained', required: true, done: false },
          { id: 'iso_logging', label: 'Logging & monitoring controls in place', required: true, done: false },
          { id: 'iso_patch', label: 'Patch management process defined', required: true, done: false },
          { id: 'iso_incident', label: 'Incident response runbooks available', required: true, done: false },
        ],
      },
      {
        id: 'NIST',
        title: 'NIST',
        items: [
          { id: 'nist_id', label: 'Identify: asset + risk context documented', required: true, done: false },
          { id: 'nist_protect', label: 'Protect: MFA + secure configuration baselines', required: true, done: false },
          { id: 'nist_detect', label: 'Detect: alerts for key security events', required: true, done: false },
          { id: 'nist_respond', label: 'Respond: escalation paths and playbooks', required: true, done: false },
        ],
      },
    ],
    []
  );

  // Load compliance map once (persists across runs)
  useEffect(() => {
    const raw = localStorage.getItem(LS_COMPLIANCE_KEY);
    const parsed = raw ? safeJsonParse(raw, {}) : {};
    setCompliance(parsed && typeof parsed === 'object' ? parsed : {});
  }, []);

  const exclusions = useMemo(
    () =>
      exclusionsText
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean),
    [exclusionsText]
  );

  const isStep1Valid = useMemo(() => !!targetUrl && isValidUrl(targetUrl), [targetUrl]);
  const isStep2Valid = useMemo(() => selectedTests.length > 0 && rateLimitRps > 0, [selectedTests, rateLimitRps]);

  const allRuns = useMemo(() => {
    const raw = localStorage.getItem(LS_RUNS_KEY);
    const parsed = raw ? safeJsonParse(raw, []) : [];
    return Array.isArray(parsed) ? parsed : [];
  }, []);

  const relevantRuns = useMemo(() => {
    const url = (targetUrl || '').trim();
    if (!url) return [];
    return allRuns.filter((r) => r && r.targetUrl === url).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }, [allRuns, targetUrl]);

  const lastPersistedRunIdRef = useRef(null);

  const availableTypes = useMemo(() => {
    const set = new Set();
    findings.forEach((f) => set.add(f.type));
    return ['All', ...Array.from(set).sort()];
  }, [findings]);

  const availableOwasp = useMemo(() => {
    const set = new Set();
    findings.forEach((f) => set.add(f.owasp));
    return ['All', ...Array.from(set).sort()];
  }, [findings]);

  const filteredFindings = useMemo(() => {
    const sevSet = severityFilter;
    return findings
      .filter((f) => sevSet.has(f.severity))
      .filter((f) => (typeFilter === 'All' ? true : f.type === typeFilter))
      .filter((f) => (owaspFilter === 'All' ? true : f.owasp === owaspFilter));
  }, [findings, severityFilter, typeFilter, owaspFilter]);

  const etaSeconds = useMemo(() => {
    if (runState === 'idle') return estimatedTotalSeconds;
    if (!startedAtRef.current) return estimatedTotalSeconds;
    const elapsed = Math.max(0, (Date.now() - startedAtRef.current) / 1000);
    const pct = Math.max(1, progress);
    const totalEstimate = Math.max(1, (elapsed / pct) * 100);
    const remaining = Math.max(0, totalEstimate - elapsed);
    return Math.round(remaining);
  }, [estimatedTotalSeconds, progress, runState]);

  const steps = useMemo(() => {
    const s = [
      { id: 'scope', title: 'Scope definition', description: 'Target, auth, boundaries, exclusions' },
      { id: 'config', title: 'Scan configuration', description: 'OWASP tests, intensity, rate limiting, schedule' },
      { id: 'exec', title: 'Execution', description: 'Live progress, findings, ETA, pause/resume' },
      { id: 'results', title: 'Results', description: 'Tree, filters, export, compare' },
      { id: 'remediation', title: 'Remediation', description: 'Fix steps, snippets, re-test, compliance' },
    ];

    return s.map((x, idx) => {
      let status = 'pending';
      if (idx < step) status = 'done';
      if (idx === step) status = 'active';
      if (idx === 2 && (runState === 'running' || runState === 'paused')) status = 'active';
      if (idx === 3 && runState !== 'completed') status = step === 3 ? 'active' : status;
      return { ...x, status };
    });
  }, [step, runState]);

  const estimatedTotalMinutes = useMemo(() => {
    const base = intensity === 'Light' ? 2 : intensity === 'Aggressive' ? 6 : 4;
    const testsFactor = Math.max(1, Math.round(selectedTests.length / 3));
    return base + testsFactor;
  }, [intensity, selectedTests.length]);

  const canGoNext = useMemo(() => {
    if (step === 0) return isStep1Valid;
    if (step === 1) return isStep2Valid;
    if (step === 2) return runState === 'completed';
    if (step === 3) return true;
    return false;
  }, [step, isStep1Valid, isStep2Valid, runState]);

  const goNext = () => setStep((s) => Math.min(4, s + 1));
  const goPrev = () => setStep((s) => Math.max(0, s - 1));

  const stopTimer = () => {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  useEffect(() => () => stopTimer(), []);

  // Sync backend job status into the existing UI state machine.
  useEffect(() => {
    if (!auditRun.auditId) return;

    setAuditJobId(auditRun.auditId);
    setProgress(auditRun.progressPct);

    if (auditRun.error) setScanError(auditRun.error);

    const s = String(auditRun.status || '').toLowerCase();
    if (auditRun.isPaused) {
      setRunState('paused');
      return;
    }
    if (s === 'queued' || s === 'running') {
      setRunState('running');
      return;
    }
    if (s === 'completed' || s === 'completed_with_errors') {
      setRunState('completed');
      return;
    }
    if (s === 'failed') {
      setRunState('idle');
      return;
    }
  }, [auditRun.auditId, auditRun.error, auditRun.isPaused, auditRun.progressPct, auditRun.status]);

  // When results arrive, map them into the existing findings UI.
  useEffect(() => {
    if (!auditRun.auditId) return;
    if (!auditRun.isTerminal) return;
    setFindings(auditRun.uiFindings || []);

    // Persist the run once per audit.
    if (persistedAuditIdRef.current === auditRun.auditId) return;
    persistedAuditIdRef.current = auditRun.auditId;

    persistRun({
      id: `audit_${auditRun.auditId}`,
      createdAt: nowIso(),
      targetUrl,
      authMethod,
      intensity,
      rateLimitRps,
      scheduled,
      scheduledAt: scheduled ? scheduledAt : '',
      tests: selectedTests,
      scopeBoundaries,
      exclusions,
      findings: auditRun.uiFindings || [],
    });
  }, [
    auditRun.auditId,
    auditRun.isTerminal,
    auditRun.uiFindings,
    authMethod,
    exclusions,
    intensity,
    rateLimitRps,
    scheduled,
    scheduledAt,
    scopeBoundaries,
    selectedTests,
    targetUrl,
  ]);

  const persistRun = (run) => {
    const raw = localStorage.getItem(LS_RUNS_KEY);
    const list = raw ? safeJsonParse(raw, []) : [];
    const next = Array.isArray(list) ? list.slice() : [];
    next.unshift(run);
    localStorage.setItem(LS_RUNS_KEY, JSON.stringify(next.slice(0, 50)));
  };

  const startScan = async () => {
    stopTimer();
    setScanError('');
    setFindings([]);

    // This UI used to simulate scans. We now create a backend audit job.
    // Actual active scanning requires a configured provider/worker.
    setEstimatedTotalSeconds(180);
    setRunState('running');
    setProgress(5);
    startedAtRef.current = Date.now();

    try {
      // Default to passive (non-intrusive). Active mode is gated (plan + verified target).
      const started = await auditRun.start({ target: targetUrl, mode: 'passive' });
      setAuditJobId(started?.auditId ?? null);
      setProgress(10);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to start audit.';
      setScanError(String(message));
      setRunState('idle');
      setProgress(0);
    }
  };

  const pauseScan = () => {
    if (runState !== 'running') return;
    auditRun.pause();
    stopTimer();
    setRunState('paused');
  };

  const resumeScan = () => {
    if (runState !== 'paused') return;
    auditRun.resume();
    setRunState('running');
  };

  const toggleComplianceItem = (standardId, itemId) => {
    setCompliance((prev) => {
      const next = { ...prev };
      const key = `${standardId}:${itemId}`;
      next[key] = !prev[key];
      localStorage.setItem(LS_COMPLIANCE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const generateComplianceReport = () => {
    const report = {
      generatedAt: nowIso(),
      targetUrl,
      standards: complianceStandards.map((s) => {
        const items = s.items.map((i) => ({
          id: i.id,
          label: i.label,
          required: i.required,
          done: Boolean(compliance[`${s.id}:${i.id}`]),
        }));
        const required = items.filter((x) => x.required);
        const done = required.filter((x) => x.done).length;
        return {
          id: s.id,
          title: s.title,
          progressPct: required.length ? Math.round((done / required.length) * 100) : 0,
          items,
        };
      }),
    };

    downloadBlob(`compliance_${Date.now()}.json`, JSON.stringify(report, null, 2), 'application/json');
  };

  const owaspBreakdown = useMemo(() => {
    const by = new Map();
    OWASP_TESTS.forEach((t) => by.set(t.id, { id: t.id, label: t.label, count: 0 }));
    findings.forEach((f) => {
      const row = by.get(f.owasp);
      if (row) row.count += 1;
    });
    // Convert counts into scores: more findings => lower score
    return Array.from(by.values()).map((r) => {
      const penalty = Math.min(60, r.count * 12);
      return { id: r.id, label: r.label, score: Math.max(0, 100 - penalty) };
    });
  }, [findings]);

  const securityScore = useMemo(() => {
    const penalty = findings.reduce((acc, f) => {
      if (f.severity === 'Critical') return acc + 18;
      if (f.severity === 'High') return acc + 12;
      if (f.severity === 'Medium') return acc + 7;
      if (f.severity === 'Low') return acc + 3;
      return acc + 1;
    }, 0);
    return Math.max(0, Math.min(100, 92 - penalty));
  }, [findings]);

  const trendDelta = useMemo(() => {
    const prev = relevantRuns[0];
    if (!prev) return 0;
    const prevPenalty = (prev.findings || []).reduce((acc, f) => {
      const sev = f.severity;
      if (sev === 'Critical') return acc + 18;
      if (sev === 'High') return acc + 12;
      if (sev === 'Medium') return acc + 7;
      if (sev === 'Low') return acc + 3;
      return acc + 1;
    }, 0);
    const prevScore = Math.max(0, Math.min(100, 92 - prevPenalty));
    return securityScore - prevScore;
  }, [relevantRuns, securityScore]);

  const heatmapItems = useMemo(() => {
    // Create a heatmap from known locations in findings; add a few common endpoints if empty
    const base = findings.length
      ? findings
      : [
          { title: 'No issues yet', severity: 'Info', type: 'Info', owasp: 'A09', location: '/api/health', evidence: 'N/A' },
          { title: 'No issues yet', severity: 'Info', type: 'Info', owasp: 'A09', location: '/api/status', evidence: 'N/A' },
        ];

    return base.map((f) => ({
      id: f.key || findingKey(f),
      endpoint: f.location,
      severity: f.severity,
      type: f.type,
      owasp: f.owasp,
      details: f.evidence ? `Evidence: ${f.evidence}` : undefined,
    }));
  }, [findings]);

  const toggleSeverity = (sev) => {
    setSeverityFilter((prev) => {
      const next = new Set(prev);
      if (next.has(sev)) next.delete(sev);
      else next.add(sev);
      return next;
    });
  };

  const saveCompliance = (next) => {
    setCompliance(next);
    localStorage.setItem(LS_COMPLIANCE_KEY, JSON.stringify(next));
  };

  const setFindingCompliance = (key, status) => {
    const next = { ...compliance, [key]: { ...(compliance[key] || {}), status, updatedAt: nowIso() } };
    saveCompliance(next);
  };

  const complianceSummary = useMemo(() => {
    const counts = { Open: 0, Fixed: 0, 'Accepted risk': 0, 'Not applicable': 0 };
    findings.forEach((f) => {
      const st = compliance?.[f.key]?.status || 'Open';
      if (counts[st] !== undefined) counts[st] += 1;
      else counts.Open += 1;
    });
    return counts;
  }, [findings, compliance]);

  const selectedPreviousRun = useMemo(() => {
    if (!previousRunId) return null;
    return relevantRuns.find((r) => r.id === previousRunId) || null;
  }, [previousRunId, relevantRuns]);

  const comparison = useMemo(() => {
    if (!selectedPreviousRun) return null;
    const prevSet = new Set((selectedPreviousRun.findings || []).map((f) => f.key || findingKey(f)));
    const currSet = new Set(findings.map((f) => f.key));

    const added = [];
    const resolved = [];

    findings.forEach((f) => {
      if (!prevSet.has(f.key)) added.push(f);
    });

    (selectedPreviousRun.findings || []).forEach((f) => {
      const key = f.key || findingKey(f);
      if (!currSet.has(key)) resolved.push({ ...f, key });
    });

    return { added, resolved };
  }, [selectedPreviousRun, findings]);

  const footer = (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={goPrev}
        disabled={step === 0}
        className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        Back
      </button>
      <button
        type="button"
        onClick={goNext}
        disabled={step >= 4 || !canGoNext}
        className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="apple-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Vulnerability scan</div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
              Audit workflow
            </h1>
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Configure, run, review results, and track remediation in 5 steps.
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Step</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{step + 1}/5</span>
          </div>
        </div>
      </div>

      <ProgressTracker title="Audit workflow" steps={steps} estimatedTotalMinutes={estimatedTotalMinutes} footer={footer} />

      {step === 0 ? (
        <div className="apple-card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Step 1 — Scope definition</h2>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">URL / API endpoint</label>
              <input
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://example.com or https://api.example.com/v1"
                className="mt-2 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
              />
              {targetUrl && !isValidUrl(targetUrl) ? (
                <div className="mt-2 text-xs text-red-600 dark:text-red-300">Enter a valid URL.</div>
              ) : null}

              <div className="mt-5">
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">Authentication method</label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {AUTH_METHODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setAuthMethod(m.id)}
                      className={
                        'rounded-xl border px-3 py-2 text-sm transition-colors ' +
                        (authMethod === m.id
                          ? 'border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                          : 'border-gray-200 dark:border-white/10 bg-white dark:bg-black text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800')
                      }
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {authMethod === 'basic' ? (
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Username</div>
                      <input
                        value={basicUser}
                        onChange={(e) => setBasicUser(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Password</div>
                      <input
                        value={basicPass}
                        onChange={(e) => setBasicPass(e.target.value)}
                        type="password"
                        className="mt-1 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                ) : null}

                {authMethod === 'oauth' ? (
                  <div className="mt-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400">OAuth bearer token</div>
                    <input
                      value={oauthToken}
                      onChange={(e) => setOauthToken(e.target.value)}
                      placeholder="Bearer ..."
                      className="mt-1 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
                    />
                  </div>
                ) : null}

                {authMethod === 'apiKey' ? (
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Header name</div>
                      <input
                        value={apiKeyHeader}
                        onChange={(e) => setApiKeyHeader(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">API key value</div>
                      <input
                        value={apiKeyValue}
                        onChange={(e) => setApiKeyValue(e.target.value)}
                        type="password"
                        className="mt-1 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Scope boundaries</div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Define what is in-scope and out-of-scope.</div>
                <textarea
                  value={scopeBoundaries}
                  onChange={(e) => setScopeBoundaries(e.target.value)}
                  rows={6}
                  placeholder="Example: Only /api/v1/*, exclude admin endpoints"
                  className="mt-3 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Exclusion rules</div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">One rule per line (paths, patterns, endpoints).</div>
                <textarea
                  value={exclusionsText}
                  onChange={(e) => setExclusionsText(e.target.value)}
                  rows={6}
                  placeholder="/logout\n/admin/*\n/api/internal/*"
                  className="mt-3 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
                />
                {exclusions.length ? (
                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">{exclusions.length} exclusion rule(s)</div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="apple-card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Step 2 — Scan configuration</h2>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Select OWASP tests</div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Choose the categories to include.</div>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {OWASP_TESTS.map((t) => {
                    const checked = selectedTests.includes(t.id);
                    return (
                      <label key={t.id} className="flex items-start gap-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-3 py-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const on = e.target.checked;
                            setSelectedTests((prev) => {
                              if (on) return Array.from(new Set([...prev, t.id]));
                              return prev.filter((x) => x !== t.id);
                            });
                          }}
                          className="mt-1"
                        />
                        <span className="text-sm text-gray-800 dark:text-gray-200">{t.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Intensity</div>
                <select
                  value={intensity}
                  onChange={(e) => setIntensity(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
                >
                  <option>Light</option>
                  <option>Medium</option>
                  <option>Aggressive</option>
                </select>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Rate limiting</div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Requests per second (RPS)</div>
                <input
                  type="number"
                  min={1}
                  value={rateLimitRps}
                  onChange={(e) => setRateLimitRps(Number(e.target.value || 0))}
                  className="mt-2 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Scheduled scan</div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Run later at a chosen time.</div>
                  </div>
                  <input type="checkbox" checked={scheduled} onChange={(e) => setScheduled(e.target.checked)} />
                </div>

                {scheduled ? (
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="mt-3 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4">
          <div className="apple-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Step 3 — Execution</h2>
                <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">Live progress, real-time findings, ETA, and pause/resume.</div>
              </div>
              <div className="flex items-center gap-2">
                {runState === 'idle' ? (
                  <button
                    type="button"
                    disabled={!isStep1Valid || !isStep2Valid}
                    onClick={startScan}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    Start
                  </button>
                ) : null}
                {runState === 'running' ? (
                  <button
                    type="button"
                    onClick={pauseScan}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Pause
                  </button>
                ) : null}
                {runState === 'paused' ? (
                  <button
                    type="button"
                    onClick={resumeScan}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Resume
                  </button>
                ) : null}
                {runState === 'completed' ? (
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    View results
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {scanError ? (
            <div className="apple-card">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Unable to run active scan</div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">{scanError}</div>
              {auditJobId ? (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">Audit job id: {String(auditJobId)}</div>
              ) : null}
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Configure a scanning provider/worker + ownership verification to enable active audits.
              </div>
            </div>
          ) : null}

          <RealTimeScanMonitor
            status={runState}
            progress={progress}
            findingsCount={findings.length}
            etaSeconds={etaSeconds}
            intensity={intensity}
            simulateResources={false}
          />

          <div className="apple-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Real-time findings</div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Findings appear as the scan progresses.</div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{findings.length} total</div>
            </div>

            <div className="mt-4 space-y-2">
              {findings.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">No findings yet.</div>
              ) : (
                findings
                  .slice()
                  .sort((a, b) => SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity))
                  .map((f) => (
                    <div key={f.key} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{f.title}</div>
                          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                            {f.type} · {f.owasp} · {f.location}
                          </div>
                        </div>
                        <span className={severityPill(f.severity)}>{f.severity}</span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <div className="apple-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Step 4 — Results</h2>
                <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">Explore findings, filter, export, and compare.</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const run = {
                      id: `run_${Date.now()}`,
                      createdAt: nowIso(),
                      targetUrl,
                      authMethod,
                      intensity,
                      rateLimitRps,
                      scheduled,
                      scheduledAt: scheduled ? scheduledAt : '',
                      tests: selectedTests,
                      scopeBoundaries,
                      exclusions,
                      findings,
                    };
                    downloadBlob(`scan_${Date.now()}.json`, JSON.stringify(run, null, 2), 'application/json');
                  }}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Export JSON
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const run = {
                      id: `run_${Date.now()}`,
                      createdAt: nowIso(),
                      targetUrl,
                      authMethod,
                      intensity,
                      rateLimitRps,
                      scheduled,
                      scheduledAt: scheduled ? scheduledAt : '',
                      tests: selectedTests,
                      scopeBoundaries,
                      exclusions,
                      findings,
                    };
                    downloadBlob(`scan_${Date.now()}.xml`, toXml(run), 'application/xml');
                  }}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Export XML
                </button>
                <button
                  type="button"
                  onClick={() =>
                    printToPdf({
                      id: `run_${Date.now()}`,
                      createdAt: nowIso(),
                      targetUrl,
                      authMethod,
                      intensity,
                      rateLimitRps,
                      scheduled,
                      scheduledAt: scheduled ? scheduledAt : '',
                      tests: selectedTests,
                      scopeBoundaries,
                      exclusions,
                      findings,
                    })
                  }
                  className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Export PDF
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Filters</div>

                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Severity</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {SEVERITIES.map((sev) => (
                          <button
                            key={sev}
                            type="button"
                            onClick={() => toggleSeverity(sev)}
                            className={
                              'rounded-full border px-3 py-1 text-xs font-semibold transition-colors ' +
                              (severityFilter.has(sev)
                                ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100'
                                : 'bg-white dark:bg-black border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800')
                            }
                          >
                            {sev}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Type</div>
                      <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
                      >
                        {availableTypes.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">OWASP category</div>
                      <select
                        value={owaspFilter}
                        onChange={(e) => setOwaspFilter(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
                      >
                        {availableOwasp.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Compare with previous scans</div>
                      <select
                        value={previousRunId}
                        onChange={(e) => setPreviousRunId(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
                      >
                        <option value="">Select a previous run</option>
                        {relevantRuns.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.createdAt} ({(r.findings || []).length} findings)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {comparison ? (
                    <div className="mt-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Comparison</div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">New vs resolved findings.</div>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400">New</div>
                          <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{comparison.added.length}</div>
                        </div>
                        <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Resolved</div>
                          <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{comparison.resolved.length}</div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="lg:col-span-4">
                <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Summary</div>
                  <div className="mt-3 space-y-2">
                    {SEVERITIES.map((sev) => {
                      const count = filteredFindings.filter((f) => f.severity === sev).length;
                      return (
                        <div key={sev} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-200">{sev}</span>
                          <span className="text-gray-900 dark:text-gray-100 font-semibold">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <SecurityScoreCard
                score={securityScore}
                trendDelta={trendDelta}
                breakdown={owaspBreakdown.slice(0, 5)}
                industryBenchmark={78}
              />
            </div>
            <div className="lg:col-span-6">
              <VulnerabilityHeatmap items={heatmapItems} />
            </div>
          </div>

          <div className="apple-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Interactive vulnerability tree</div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Grouped by OWASP category and type.</div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{filteredFindings.length} shown</div>
            </div>

            {filteredFindings.length === 0 ? (
              <div className="mt-4">
                <EmptyState title="No results" description="No findings match your current filters." />
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {Object.entries(
                  filteredFindings.reduce((acc, f) => {
                    acc[f.owasp] = acc[f.owasp] || {};
                    acc[f.owasp][f.type] = acc[f.owasp][f.type] || [];
                    acc[f.owasp][f.type].push(f);
                    return acc;
                  }, {})
                )
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([owasp, byType]) => (
                    <details key={owasp} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4" open>
                      <summary className="cursor-pointer select-none text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {owasp}
                      </summary>

                      <div className="mt-3 space-y-2">
                        {Object.entries(byType)
                          .sort(([a], [b]) => a.localeCompare(b))
                          .map(([type, items]) => (
                            <details key={type} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                              <summary className="cursor-pointer select-none text-sm font-medium text-gray-900 dark:text-gray-100">
                                {type} <span className="text-xs text-gray-500 dark:text-gray-400">({items.length})</span>
                              </summary>
                              <div className="mt-3 space-y-2">
                                {items.map((f) => (
                                  <div key={f.key} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0">
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{f.title}</div>
                                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">{f.location}</div>
                                        {f.evidence ? (
                                          <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">Evidence: {f.evidence}</div>
                                        ) : null}
                                      </div>
                                      <span className={severityPill(f.severity)}>{f.severity}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </details>
                          ))}
                      </div>
                    </details>
                  ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-4">
          <div className="apple-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Step 5 — Remediation</h2>
                <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  Step-by-step fixes, code snippets, re-test, and compliance tracking.
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRunState('idle');
                    setProgress(0);
                    setFindings([]);
                    setStep(2);
                  }}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Re-test
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Object.entries(complianceSummary).map(([k, v]) => (
                <div key={k} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400">{k}</div>
                  <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{v}</div>
                </div>
              ))}
            </div>
          </div>

          <ComplianceDashboard
            standards={complianceStandards.map((s) => ({
              ...s,
              items: s.items.map((i) => ({ ...i, done: Boolean(compliance[`${s.id}:${i.id}`]) })),
            }))}
            onToggleItem={toggleComplianceItem}
            onGenerateReport={generateComplianceReport}
          />

          <ThreatIntelligenceFeed />

          <div className="apple-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Fix recommendations</div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Generated remediation per finding type/category.</div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{findings.length} total</div>
            </div>

            <div className="mt-4 space-y-3">
              {findings.length === 0 ? (
                <EmptyState title="No findings" description="Run a scan to generate remediation guidance." />
              ) : (
                findings.map((f) => {
                  const rec = remediationFor(f);
                  const status = compliance?.[f.key]?.status || 'Open';
                  return (
                    <div key={f.key} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{f.title}</div>
                            <span className={severityPill(f.severity)}>{f.severity}</span>
                          </div>
                          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                            {f.type} · {f.owasp} · {f.location}
                          </div>
                        </div>
                        <div className="min-w-[180px]">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Compliance</div>
                          <select
                            value={status}
                            onChange={(e) => setFindingCompliance(f.key, e.target.value)}
                            className="mt-1 w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                          >
                            <option>Open</option>
                            <option>Fixed</option>
                            <option>Accepted risk</option>
                            <option>Not applicable</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{rec.title}</div>
                        <ol className="mt-2 list-decimal ml-5 space-y-1 text-sm text-gray-700 dark:text-gray-200">
                          {rec.steps.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ol>
                        <div className="mt-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Code snippet</div>
                          <pre className="mt-2 overflow-x-auto rounded-xl border border-gray-200 dark:border-white/10 bg-black/90 text-white p-4 text-xs">
                            {rec.snippet}
                          </pre>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
