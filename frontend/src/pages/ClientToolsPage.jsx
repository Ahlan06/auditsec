import { useEffect, useMemo, useState } from 'react';
import { FiCheck, FiChevronDown } from 'react-icons/fi';

const STORAGE_KEY = 'auditsec_client_tools_v1';

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const formatDateTime = (iso) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

function Pill({ text, tone = 'neutral' }) {
  const cls =
    tone === 'success'
      ? 'bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/20'
      : tone === 'warning'
        ? 'bg-yellow-500/10 text-yellow-800 dark:text-yellow-200 border border-yellow-500/20'
        : tone === 'danger'
          ? 'bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20'
          : 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border border-gray-500/20';

  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{text}</span>;
}

function Card({ title, description, isOpen, onToggle, children, badge }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</div>
              {badge}
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</div>
          </div>
          <span className={"mt-1 text-gray-500 dark:text-gray-400 transition-transform " + (isOpen ? 'rotate-180' : '')}>
            <FiChevronDown size={18} />
          </span>
        </div>
      </button>

      {isOpen && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

function downloadText({ filename, text, mime = 'text/plain' }) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function ClientToolsPage() {
  const [openKey, setOpenKey] = useState('scanner');

  const [state, setState] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? safeParse(raw) : null;
    if (parsed && typeof parsed === 'object') return parsed;

    return {
      scanner: {
        url: 'https://example.com',
        scanType: 'Quick',
        running: false,
        history: [
          {
            id: 'scan-1',
            url: 'https://example.com',
            type: 'Quick',
            startedAtIso: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
            status: 'Completed',
            findings: 3,
          },
        ],
      },
      monitoring: {
        site: 'https://status.example.com',
        frequency: '15 min',
        alertsOnChange: true,
        sites: [
          {
            id: 'mon-1',
            url: 'https://status.example.com',
            frequency: '15 min',
            alertsOnChange: true,
            lastCheckedIso: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
          },
        ],
        alerts: [
          {
            id: 'al-1',
            siteUrl: 'https://status.example.com',
            event: 'Content change detected (demo)',
            atIso: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
          },
        ],
      },
      pentest: {
        step: 1,
        targetsText: 'api.example.com\n192.0.2.10',
        intensity: 'Medium',
        running: false,
        reports: [
          {
            id: 'pt-1',
            createdAtIso: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
            targets: ['api.example.com'],
            intensity: 'Low',
            status: 'Completed',
          },
        ],
      },
      compliance: {
        checklist: {
          lawfulBasis: false,
          dataMinimization: true,
          retention: false,
          accessControl: true,
          incidentPlan: false,
          vendorManagement: false,
          isoLogging: true,
          isoRisk: false,
        },
      },
      policies: {
        type: 'Security policy',
        orgName: 'ACME Security',
        contact: 'security@acme.com',
        generated: '',
      },
    };
  });

  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const showNotice = (text) => {
    setNotice(text);
    setError('');
    window.setTimeout(() => setNotice(''), 2500);
  };

  const showError = (text) => {
    setError(text);
    setNotice('');
    window.setTimeout(() => setError(''), 3500);
  };

  // 1) Vulnerability scanner
  const runScan = () => {
    const url = state.scanner.url.trim();
    if (!isValidUrl(url)) {
      showError('Please enter a valid URL (http/https).');
      return;
    }

    const id = `scan-${Date.now()}`;
    const startedAtIso = new Date().toISOString();

    setState((prev) => ({
      ...prev,
      scanner: {
        ...prev.scanner,
        running: true,
        history: [
          {
            id,
            url,
            type: prev.scanner.scanType,
            startedAtIso,
            status: 'Running',
            findings: 0,
          },
          ...prev.scanner.history,
        ],
      },
    }));

    window.setTimeout(() => {
      const findings = state.scanner.scanType === 'Quick' ? 2 + (id.length % 3) : 6 + (id.length % 5);
      setState((prev) => ({
        ...prev,
        scanner: {
          ...prev.scanner,
          running: false,
          history: prev.scanner.history.map((h) => (h.id === id ? { ...h, status: 'Completed', findings } : h)),
        },
      }));
      showNotice('Scan completed (demo).');
    }, 1100);
  };

  // 2) Monitoring
  const addMonitoredSite = () => {
    const url = state.monitoring.site.trim();
    if (!isValidUrl(url)) {
      showError('Please enter a valid site URL (http/https).');
      return;
    }

    const id = `mon-${Date.now()}`;
    setState((prev) => ({
      ...prev,
      monitoring: {
        ...prev.monitoring,
        sites: [
          {
            id,
            url,
            frequency: prev.monitoring.frequency,
            alertsOnChange: prev.monitoring.alertsOnChange,
            lastCheckedIso: new Date().toISOString(),
          },
          ...prev.monitoring.sites,
        ],
      },
    }));
    showNotice('Site added to monitoring (demo).');
  };

  const simulateChange = (siteUrl) => {
    const id = `al-${Date.now()}`;
    setState((prev) => ({
      ...prev,
      monitoring: {
        ...prev.monitoring,
        alerts: [
          {
            id,
            siteUrl,
            event: 'Content change detected (demo)',
            atIso: new Date().toISOString(),
          },
          ...prev.monitoring.alerts,
        ],
      },
    }));
    showNotice('Alert created (demo).');
  };

  // 3) Pentest wizard
  const pentestTargets = useMemo(() => {
    return state.pentest.targetsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
  }, [state.pentest.targetsText]);

  const startPentest = () => {
    if (pentestTargets.length === 0) {
      showError('Please add at least one target (domain or IP).');
      return;
    }

    const id = `pt-${Date.now()}`;
    const createdAtIso = new Date().toISOString();

    setState((prev) => ({
      ...prev,
      pentest: {
        ...prev.pentest,
        running: true,
        reports: [
          {
            id,
            createdAtIso,
            targets: pentestTargets,
            intensity: prev.pentest.intensity,
            status: 'Running',
          },
          ...prev.pentest.reports,
        ],
      },
    }));

    window.setTimeout(() => {
      setState((prev) => ({
        ...prev,
        pentest: {
          ...prev.pentest,
          running: false,
          step: 1,
          reports: prev.pentest.reports.map((r) => (r.id === id ? { ...r, status: 'Completed' } : r)),
        },
      }));
      showNotice('Pentest report generated (demo).');
    }, 1400);
  };

  // 4) Compliance checklist
  const checklistItems = [
    { key: 'lawfulBasis', label: 'GDPR: Lawful basis documented' },
    { key: 'dataMinimization', label: 'GDPR: Data minimization applied' },
    { key: 'retention', label: 'GDPR: Retention policy defined' },
    { key: 'accessControl', label: 'ISO: Access control enforced' },
    { key: 'incidentPlan', label: 'ISO: Incident response plan ready' },
    { key: 'vendorManagement', label: 'GDPR/ISO: Vendor management in place' },
    { key: 'isoLogging', label: 'ISO: Centralized logging enabled' },
    { key: 'isoRisk', label: 'ISO: Risk assessment completed' },
  ];

  const complianceStats = useMemo(() => {
    const values = Object.values(state.compliance.checklist);
    const done = values.filter(Boolean).length;
    return { done, total: values.length };
  }, [state.compliance.checklist]);

  const generateComplianceDocs = () => {
    const lines = checklistItems.map((i) => `- [${state.compliance.checklist[i.key] ? 'x' : ' '}] ${i.label}`);
    const action = checklistItems
      .filter((i) => !state.compliance.checklist[i.key])
      .map((i) => `- Action: address “${i.label}”`);

    const text = [
      '# Compliance checklist (demo)',
      '',
      `Progress: ${complianceStats.done}/${complianceStats.total}`,
      '',
      '## Checklist',
      ...lines,
      '',
      '## Action plan',
      ...(action.length ? action : ['- No pending actions.']),
      '',
      `Generated: ${new Date().toISOString()}`,
    ].join('\n');

    downloadText({ filename: 'compliance-checklist.md', text, mime: 'text/markdown' });
    showNotice('Documentation generated (demo).');
  };

  // 5) Policy generator
  const generatePolicy = () => {
    const { type, orgName, contact } = state.policies;
    const header = `${type} — ${orgName}`;

    const text = [
      header,
      '='.repeat(header.length),
      '',
      `Organization: ${orgName}`,
      `Contact: ${contact}`,
      `Generated: ${new Date().toISOString()}`,
      '',
      '---',
      '',
      type === 'NDA template'
        ? 'This NDA template is provided as a draft. Customize clauses to your context.'
        : type === 'Incident report'
          ? 'Incident report draft: describe timeline, scope, impact, remediation, and lessons learned.'
          : 'Security policy draft: define objectives, responsibilities, access control, logging, and incident response.',
      '',
      '## Sections',
      '- Scope',
      '- Definitions',
      '- Responsibilities',
      '- Controls & procedures',
      '- Review cycle',
      '',
      '---',
      'Demo content only. Backend wiring can persist and version these documents.',
    ].join('\n');

    setState((prev) => ({ ...prev, policies: { ...prev.policies, generated: text } }));
    showNotice('Policy generated (demo).');
  };

  const exportPolicy = () => {
    if (!state.policies.generated) {
      showError('Generate a document first.');
      return;
    }
    const ext = state.policies.type === 'NDA template' ? 'md' : 'md';
    downloadText({ filename: `${state.policies.type.toLowerCase().replace(/\s+/g, '-')}.${ext}`, text: state.policies.generated, mime: 'text/markdown' });
  };

  return (
    <div className="space-y-4">
      <div className="apple-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">Security tools</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Run scans, monitor sites, execute guided pentests, and generate compliance/policy docs.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {notice && <div className="text-sm text-green-700 dark:text-green-300">{notice}</div>}
            {error && <div className="text-sm text-red-600 dark:text-red-300">{error}</div>}
          </div>
        </div>
      </div>

      <div className="apple-card">
        <div className="grid grid-cols-1 gap-4">
          {/* 1. Scanner */}
          <Card
            title="Vulnerability scanner"
            description="Scan a target URL using quick or full mode, and review scan history."
            isOpen={openKey === 'scanner'}
            onToggle={() => setOpenKey((k) => (k === 'scanner' ? '' : 'scanner'))}
            badge={state.scanner.running ? <Pill text="Running" tone="warning" /> : <Pill text="Ready" />}
          >
            <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">URL</div>
                <input
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-sm"
                  value={state.scanner.url}
                  onChange={(e) => setState((prev) => ({ ...prev, scanner: { ...prev.scanner, url: e.target.value } }))}
                  placeholder="https://target.tld"
                />
              </div>
              <div className="lg:col-span-3">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Scan type</div>
                <select
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-sm"
                  value={state.scanner.scanType}
                  onChange={(e) => setState((prev) => ({ ...prev, scanner: { ...prev.scanner, scanType: e.target.value } }))}
                >
                  <option value="Quick">Quick</option>
                  <option value="Full">Full</option>
                </select>
              </div>
              <div className="lg:col-span-3 flex items-end">
                <button
                  type="button"
                  onClick={runScan}
                  disabled={state.scanner.running}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  Run scan
                </button>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-0 overflow-hidden">
              <div className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">Scan history</div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-300">
                    <tr>
                      <th className="text-left font-medium px-4 py-3">Started</th>
                      <th className="text-left font-medium px-4 py-3">URL</th>
                      <th className="text-left font-medium px-4 py-3">Type</th>
                      <th className="text-left font-medium px-4 py-3">Status</th>
                      <th className="text-left font-medium px-4 py-3">Findings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                    {state.scanner.history.map((h) => (
                      <tr key={h.id} className="bg-white dark:bg-black">
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatDateTime(h.startedAtIso)}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{h.url}</td>
                        <td className="px-4 py-3"><Pill text={h.type} /></td>
                        <td className="px-4 py-3">
                          <Pill
                            text={h.status}
                            tone={h.status === 'Completed' ? 'success' : h.status === 'Running' ? 'warning' : 'danger'}
                          />
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{h.findings}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* 2. Monitoring */}
          <Card
            title="Website monitoring"
            description="Track a website and get alerts when content changes (demo simulation)."
            isOpen={openKey === 'monitoring'}
            onToggle={() => setOpenKey((k) => (k === 'monitoring' ? '' : 'monitoring'))}
            badge={<Pill text={`${state.monitoring.sites.length} sites`} />}
          >
            <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Site URL</div>
                <input
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-sm"
                  value={state.monitoring.site}
                  onChange={(e) => setState((prev) => ({ ...prev, monitoring: { ...prev.monitoring, site: e.target.value } }))}
                  placeholder="https://site.tld"
                />
              </div>
              <div className="lg:col-span-3">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Check frequency</div>
                <select
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-sm"
                  value={state.monitoring.frequency}
                  onChange={(e) => setState((prev) => ({ ...prev, monitoring: { ...prev.monitoring, frequency: e.target.value } }))}
                >
                  <option value="5 min">5 min</option>
                  <option value="15 min">15 min</option>
                  <option value="1 hour">1 hour</option>
                  <option value="24 hours">24 hours</option>
                </select>
              </div>
              <div className="lg:col-span-3 flex items-end">
                <button
                  type="button"
                  onClick={addMonitoredSite}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Add site
                </button>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Alerts on change</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Create an alert when a change is detected.</div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setState((prev) => ({
                      ...prev,
                      monitoring: { ...prev.monitoring, alertsOnChange: !prev.monitoring.alertsOnChange },
                    }))
                  }
                  className={
                    'h-7 w-12 rounded-full border transition-colors ' +
                    (state.monitoring.alertsOnChange
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700')
                  }
                  aria-label="Toggle alerts"
                >
                  <span
                    className={
                      'block h-6 w-6 rounded-full bg-white dark:bg-black shadow-sm transform transition-transform ' +
                      (state.monitoring.alertsOnChange ? 'translate-x-5' : 'translate-x-0.5')
                    }
                  />
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="lg:col-span-7 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-0 overflow-hidden">
                <div className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">Monitored sites</div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-300">
                      <tr>
                        <th className="text-left font-medium px-4 py-3">Site</th>
                        <th className="text-left font-medium px-4 py-3">Frequency</th>
                        <th className="text-left font-medium px-4 py-3">Last checked</th>
                        <th className="text-left font-medium px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                      {state.monitoring.sites.map((s) => (
                        <tr key={s.id} className="bg-white dark:bg-black">
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{s.url}</td>
                          <td className="px-4 py-3"><Pill text={s.frequency} /></td>
                          <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatDateTime(s.lastCheckedIso)}</td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => simulateChange(s.url)}
                              className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              Simulate change
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="lg:col-span-5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-0 overflow-hidden">
                <div className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">Alerts</div>
                <div className="divide-y divide-gray-200 dark:divide-white/10">
                  {state.monitoring.alerts.slice(0, 6).map((a) => (
                    <div key={a.id} className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{a.event}</div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{a.siteUrl} • {formatDateTime(a.atIso)}</div>
                    </div>
                  ))}
                  {state.monitoring.alerts.length === 0 && (
                    <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No alerts yet.</div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* 3. Pentest */}
          <Card
            title="Penetration testing"
            description="Step-by-step wizard: targets, intensity, and auto-generated report (demo)."
            isOpen={openKey === 'pentest'}
            onToggle={() => setOpenKey((k) => (k === 'pentest' ? '' : 'pentest'))}
            badge={state.pentest.running ? <Pill text="Running" tone="warning" /> : <Pill text="Wizard" />}
          >
            <div className="mt-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Wizard</div>
                <Pill text={`Step ${state.pentest.step}/3`} />
              </div>

              {state.pentest.step === 1 && (
                <div className="mt-3">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Targets (one per line)</div>
                  <textarea
                    className="w-full min-h-[96px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-sm"
                    value={state.pentest.targetsText}
                    onChange={(e) => setState((prev) => ({ ...prev, pentest: { ...prev.pentest, targetsText: e.target.value } }))}
                    placeholder="domain.tld\n192.0.2.10"
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setState((prev) => ({ ...prev, pentest: { ...prev.pentest, step: 2 } }))}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {state.pentest.step === 2 && (
                <div className="mt-3 grid grid-cols-1 gap-3">
                  <div>
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Intensity</div>
                    <select
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-sm"
                      value={state.pentest.intensity}
                      onChange={(e) => setState((prev) => ({ ...prev, pentest: { ...prev.pentest, intensity: e.target.value } }))}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setState((prev) => ({ ...prev, pentest: { ...prev.pentest, step: 1 } }))}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setState((prev) => ({ ...prev, pentest: { ...prev.pentest, step: 3 } }))}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {state.pentest.step === 3 && (
                <div className="mt-3">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Review</div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">Targets: {pentestTargets.join(', ') || '—'}</div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Intensity: {state.pentest.intensity}</div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setState((prev) => ({ ...prev, pentest: { ...prev.pentest, step: 2 } }))}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={startPentest}
                      disabled={state.pentest.running}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      Start pentest
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-0 overflow-hidden">
              <div className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">Reports</div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-300">
                    <tr>
                      <th className="text-left font-medium px-4 py-3">Created</th>
                      <th className="text-left font-medium px-4 py-3">Targets</th>
                      <th className="text-left font-medium px-4 py-3">Intensity</th>
                      <th className="text-left font-medium px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                    {state.pentest.reports.map((r) => (
                      <tr key={r.id} className="bg-white dark:bg-black">
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatDateTime(r.createdAtIso)}</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{r.targets.join(', ')}</td>
                        <td className="px-4 py-3"><Pill text={r.intensity} /></td>
                        <td className="px-4 py-3">
                          <Pill text={r.status} tone={r.status === 'Completed' ? 'success' : 'warning'} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* 4. Compliance */}
          <Card
            title="GDPR / ISO compliance"
            description="Interactive checklist, generated documentation, and action plan."
            isOpen={openKey === 'compliance'}
            onToggle={() => setOpenKey((k) => (k === 'compliance' ? '' : 'compliance'))}
            badge={<Pill text={`${complianceStats.done}/${complianceStats.total}`} />}
          >
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="lg:col-span-8 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Checklist</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Check items as you complete them.</div>
                  </div>
                  <button
                    type="button"
                    onClick={generateComplianceDocs}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Generate docs
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  {checklistItems.map((i) => (
                    <label
                      key={i.key}
                      className="flex items-start gap-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                    >
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={Boolean(state.compliance.checklist[i.key])}
                        onChange={(e) =>
                          setState((prev) => ({
                            ...prev,
                            compliance: {
                              ...prev.compliance,
                              checklist: { ...prev.compliance.checklist, [i.key]: e.target.checked },
                            },
                          }))
                        }
                      />
                      <span className="text-sm text-gray-800 dark:text-gray-200">{i.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Action plan</div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Outstanding items to address.</div>
                <ul className="mt-3 space-y-2">
                  {checklistItems
                    .filter((i) => !state.compliance.checklist[i.key])
                    .slice(0, 6)
                    .map((i) => (
                      <li key={i.key} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="mt-0.5 text-gray-500 dark:text-gray-400">•</span>
                        <span>{i.label}</span>
                      </li>
                    ))}
                  {checklistItems.every((i) => state.compliance.checklist[i.key]) && (
                    <li className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-green-600 dark:text-green-400"><FiCheck size={16} /></span>
                      <span>All items completed.</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </Card>

          {/* 5. Policy generator */}
          <Card
            title="Policy generator"
            description="Generate drafts: security policy, NDA template, and incident reports."
            isOpen={openKey === 'policies'}
            onToggle={() => setOpenKey((k) => (k === 'policies' ? '' : 'policies'))}
            badge={state.policies.generated ? <Pill text="Generated" tone="success" /> : <Pill text="Draft" />}
          >
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="lg:col-span-5 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Inputs</div>
                <div className="mt-3 grid grid-cols-1 gap-3">
                  <div>
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Document type</div>
                    <select
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-sm"
                      value={state.policies.type}
                      onChange={(e) => setState((prev) => ({ ...prev, policies: { ...prev.policies, type: e.target.value } }))}
                    >
                      <option value="Security policy">Security policy</option>
                      <option value="NDA template">NDA template</option>
                      <option value="Incident report">Incident report</option>
                    </select>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Organization</div>
                    <input
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-sm"
                      value={state.policies.orgName}
                      onChange={(e) => setState((prev) => ({ ...prev, policies: { ...prev.policies, orgName: e.target.value } }))}
                      placeholder="Your company"
                    />
                  </div>

                  <div>
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Contact</div>
                    <input
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-sm"
                      value={state.policies.contact}
                      onChange={(e) => setState((prev) => ({ ...prev, policies: { ...prev.policies, contact: e.target.value } }))}
                      placeholder="security@company.com"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={generatePolicy}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Generate
                    </button>
                    <button
                      type="button"
                      onClick={exportPolicy}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Preview</div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Generated content (demo).</div>

                <pre className="mt-3 whitespace-pre-wrap text-xs text-gray-700 dark:text-gray-300 max-h-80 overflow-auto">
                  {state.policies.generated || 'Generate a document to preview it here.'}
                </pre>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        Note: These tools are UI demos. Backend wiring can connect to real scans, monitoring checks, and report generation.
      </div>
    </div>
  );
}
