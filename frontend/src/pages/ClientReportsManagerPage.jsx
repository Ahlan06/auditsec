import { useEffect, useMemo, useState } from 'react';
import { clientProjects } from '../services/clientApi';

const STORAGE_KEY = 'auditsec_client_reports_v1';

const formatDate = (date) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(date);

const formatBytes = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const rounded = value >= 10 || unit === 0 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${units[unit]}`;
};

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const STATUS_OPTIONS = ['Generated', 'In progress', 'Error'];
const FORMAT_OPTIONS = ['PDF', 'HTML', 'JSON'];

const templates = [
  {
    key: 'standard',
    title: 'Standard template',
    description: 'Balanced report with an executive summary and key findings.',
  },
  {
    key: 'detailed',
    title: 'Detailed template',
    description: 'Full detail: methodology, evidence, and remediation guidance.',
  },
  {
    key: 'executive',
    title: 'Executive template',
    description: 'High-level report for leadership with risk and priorities.',
  },
  {
    key: 'technical',
    title: 'Technical template',
    description: 'Developer-ready details with reproduction steps and fixes.',
  },
];

const pillClassByStatus = {
  Generated: 'bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/20',
  'In progress': 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20',
  Error: 'bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20',
};

function Pill({ text, className }) {
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${className}`}>{text}</span>;
}

function buildReportContent({ name, auditName, templateKey, format }) {
  const base = {
    name,
    audit: auditName,
    template: templateKey,
    generatedAt: new Date().toISOString(),
    sections: ['Executive summary', 'Findings', 'Recommendations'],
  };

  if (format === 'JSON') {
    return {
      mime: 'application/json',
      ext: 'json',
      text: JSON.stringify(base, null, 2),
    };
  }

  if (format === 'HTML') {
    return {
      mime: 'text/html',
      ext: 'html',
      text: `<!doctype html><html><head><meta charset="utf-8"/><title>${name}</title></head><body><h1>${name}</h1><p><strong>Audit:</strong> ${auditName}</p><p><strong>Template:</strong> ${templateKey}</p><p><strong>Generated:</strong> ${new Date().toLocaleString()}</p><hr/><h2>Executive summary</h2><p>Placeholder content for preview.</p><h2>Findings</h2><ul><li>Example finding A</li><li>Example finding B</li></ul><h2>Recommendations</h2><ol><li>Fix input validation</li><li>Harden headers</li></ol></body></html>`,
    };
  }

  // "PDF" placeholder: we generate a simple text blob with a .pdf extension.
  return {
    mime: 'application/pdf',
    ext: 'pdf',
    text: `Report: ${name}\nAudit: ${auditName}\nTemplate: ${templateKey}\nGenerated: ${new Date().toLocaleString()}\n\n(Placeholder PDF content)\n`,
  };
}

function downloadBlob({ filename, mime, text }) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return blob.size;
}

export default function ClientReportsManagerPage() {
  const [projects, setProjects] = useState([]);
  const [loadingAudits, setLoadingAudits] = useState(true);
  const [error, setError] = useState('');
  const [actionNotice, setActionNotice] = useState('');
  const [actionError, setActionError] = useState('');

  const [reports, setReports] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  // Quick actions / generator
  const [showGenerator, setShowGenerator] = useState(false);
  const [genName, setGenName] = useState('');
  const [genAuditId, setGenAuditId] = useState('');
  const [genFormat, setGenFormat] = useState('PDF');
  const [genTemplate, setGenTemplate] = useState('standard');

  // Share UI (inline)
  const [shareOpenId, setShareOpenId] = useState(null);
  const [sharePermission, setSharePermission] = useState('View');
  const [shareEmail, setShareEmail] = useState('');
  const [shareLink, setShareLink] = useState('');

  // Scheduler
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [autoEmail, setAutoEmail] = useState(false);
  const [recurrence, setRecurrence] = useState('Weekly');
  const [scheduleTime, setScheduleTime] = useState('09:00');

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? safeJsonParse(raw) : null;
    if (Array.isArray(parsed)) {
      setReports(parsed);
      if (parsed.length) setSelectedId(parsed[0].id);
    } else {
      // Seed with a few example reports
      const seed = [
        {
          id: 'rpt-1',
          name: 'Web Security Report — Q4',
          auditName: 'Quarterly Web App Audit',
          generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          format: 'PDF',
          sizeBytes: 842_000,
          status: 'Generated',
          templateKey: 'executive',
          archived: false,
        },
        {
          id: 'rpt-2',
          name: 'Vulnerability Scan Export',
          auditName: 'API Surface Scan',
          generatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          format: 'JSON',
          sizeBytes: 35_200,
          status: 'Generated',
          templateKey: 'technical',
          archived: false,
        },
        {
          id: 'rpt-3',
          name: 'Compliance Snapshot',
          auditName: 'PCI-DSS Review',
          generatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          format: 'HTML',
          sizeBytes: 120_400,
          status: 'In progress',
          templateKey: 'standard',
          archived: false,
        },
      ];
      setReports(seed);
      setSelectedId(seed[0].id);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }, [reports]);

  const flashNotice = (text) => {
    setActionNotice(text);
    setActionError('');
    window.setTimeout(() => setActionNotice(''), 2500);
  };

  const flashActionError = (text) => {
    setActionError(text);
    setActionNotice('');
    window.setTimeout(() => setActionError(''), 3500);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingAudits(true);
      setError('');
      try {
        const data = await clientProjects.list();
        if (mounted) setProjects(data);
      } catch (err) {
        if (mounted) setError(err.response?.data?.error || 'Failed to load audits');
      } finally {
        if (mounted) setLoadingAudits(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const audits = useMemo(() => {
    const list = (projects || []).map((p) => ({
      id: String(p.id ?? ''),
      name: (p.name || `Audit #${p.id}`).toString(),
    }));
    return list;
  }, [projects]);

  const selected = useMemo(() => reports.find((r) => r.id === selectedId) || null, [reports, selectedId]);

  const visibleReports = useMemo(() => reports.filter((r) => !r.archived), [reports]);

  const resetShare = () => {
    setShareEmail('');
    setSharePermission('View');
    setShareLink('');
  };

  const onGenerateNew = async () => {
    setError('');

    const auditName = audits.find((a) => a.id === genAuditId)?.name || (genAuditId ? `Audit #${genAuditId}` : 'Unlinked audit');
    const name = genName.trim() || `Report — ${auditName}`;

    const id = `rpt-${Date.now()}`;
    const now = new Date().toISOString();

    const newReport = {
      id,
      name,
      auditName,
      generatedAt: now,
      format: genFormat,
      sizeBytes: 0,
      status: 'In progress',
      templateKey: genTemplate,
      archived: false,
    };

    setReports((prev) => [newReport, ...prev]);
    setSelectedId(id);

    // Simulate generation finishing.
    setTimeout(() => {
      setReports((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          return { ...r, status: 'Generated', sizeBytes: 180_000 + (id.length % 10) * 11_000 };
        })
      );
    }, 1100);

    setShowGenerator(false);
    setGenName('');
  };

  const onPreview = (report) => {
    setSelectedId(report.id);
  };

  const onDownload = (report) => {
    const content = buildReportContent({
      name: report.name,
      auditName: report.auditName,
      templateKey: report.templateKey,
      format: report.format,
    });

    const safeName = report.name.replace(/[^a-z0-9\-\s_\.]/gi, '').trim().replace(/\s+/g, ' ');
    const filename = `${safeName || 'report'}.${content.ext}`;
    const bytes = downloadBlob({ filename, mime: content.mime, text: content.text });

    setReports((prev) => prev.map((r) => (r.id === report.id ? { ...r, sizeBytes: r.sizeBytes || bytes } : r)));
  };

  const onArchive = (report) => {
    const prevReports = reports;
    const nextReports = prevReports.map((r) => (r.id === report.id ? { ...r, archived: true } : r));

    // Optimistic UI update
    setReports(nextReports);
    flashNotice('Report archived.');

    // Persist + rollback on failure
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextReports));
    } catch {
      setReports(prevReports);
      flashActionError('Failed to archive report. Please try again.');
      return;
    }

    if (selectedId === report.id) setSelectedId(null);
    if (shareOpenId === report.id) {
      setShareOpenId(null);
      resetShare();
    }
  };

  const onShare = (report) => {
    if (shareOpenId === report.id) {
      setShareOpenId(null);
      resetShare();
      return;
    }
    setShareOpenId(report.id);
    resetShare();
    setSelectedId(report.id);
  };

  const createShareLink = () => {
    // Placeholder share link: no backend yet.
    const token = Math.random().toString(36).slice(2, 10);
    const link = `${window.location.origin}/client/rapports?share=${token}&perm=${encodeURIComponent(sharePermission.toLowerCase())}`;
    setShareLink(link);
  };

  const copyShareLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
    } catch {
      // Fallback: select text via prompt.
      window.prompt('Copy share link:', shareLink);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="apple-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">Reports</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Manage generated reports, templates, and automation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowGenerator((v) => !v)}
              className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Generate new report
            </button>
          </div>
        </div>

        {/* Quick actions + generator */}
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="lg:col-span-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Quick actions</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => selected && onPreview(selected)}
                disabled={!selected}
                className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Preview
              </button>
              <button
                type="button"
                onClick={() => selected && onDownload(selected)}
                disabled={!selected || selected.status !== 'Generated'}
                className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Download
              </button>
              <button
                type="button"
                onClick={() => selected && onShare(selected)}
                disabled={!selected}
                className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Share
              </button>
              <button
                type="button"
                onClick={() => selected && onArchive(selected)}
                disabled={!selected}
                className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Archive
              </button>
            </div>
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              Sharing is UI-only for now (backend permissions coming next).
            </div>
          </div>

          <div className="lg:col-span-8 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Generate</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Create a new report from an audit.</div>
              </div>
              <button
                type="button"
                onClick={() => setShowGenerator((v) => !v)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:opacity-80"
              >
                {showGenerator ? 'Hide' : 'Show'}
              </button>
            </div>

            {showGenerator && (
              <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Audit</label>
                  <select
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-sm"
                    value={genAuditId}
                    onChange={(e) => setGenAuditId(e.target.value)}
                    disabled={loadingAudits}
                  >
                    <option value="">Select an audit…</option>
                    {audits.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  {loadingAudits && <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Loading audits…</div>}
                </div>

                <div className="lg:col-span-3">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Template</label>
                  <select
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-sm"
                    value={genTemplate}
                    onChange={(e) => setGenTemplate(e.target.value)}
                  >
                    {templates.map((t) => (
                      <option key={t.key} value={t.key}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Format</label>
                  <select
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-sm"
                    value={genFormat}
                    onChange={(e) => setGenFormat(e.target.value)}
                  >
                    {FORMAT_OPTIONS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-3">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Report name</label>
                  <input
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-sm"
                    placeholder="Optional…"
                    value={genName}
                    onChange={(e) => setGenName(e.target.value)}
                  />
                </div>

                <div className="lg:col-span-12 flex justify-end">
                  <button
                    type="button"
                    onClick={onGenerateNew}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Generate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}
      {actionNotice && <div className="text-sm text-green-700 dark:text-green-300">{actionNotice}</div>}
      {actionError && <div className="text-sm text-red-600 dark:text-red-300">{actionError}</div>}

      {/* Reports list */}
      <div className="apple-card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Generated reports</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{visibleReports.length} reports</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/40 text-gray-600 dark:text-gray-300">
              <tr>
                <th className="text-left font-medium px-4 py-3">Report</th>
                <th className="text-left font-medium px-4 py-3">Linked audit</th>
                <th className="text-left font-medium px-4 py-3">Generated</th>
                <th className="text-left font-medium px-4 py-3">Format</th>
                <th className="text-left font-medium px-4 py-3">Size</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th className="text-left font-medium px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/10">
              {visibleReports.map((r) => (
                <tr
                  key={r.id}
                  className={
                    'bg-white dark:bg-black ' +
                    (r.id === selectedId ? 'bg-gray-50 dark:bg-gray-900/30' : '')
                  }
                >
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setSelectedId(r.id)}
                      className="text-left"
                      title="Select report"
                    >
                      <div className="font-medium text-gray-900 dark:text-gray-100">{r.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Template: {r.templateKey}</div>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{r.auditName}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatDate(new Date(r.generatedAt))}</td>
                  <td className="px-4 py-3">
                    <Pill
                      text={r.format}
                      className="bg-gray-500/10 text-gray-700 dark:text-gray-300 border border-gray-500/20"
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{formatBytes(r.sizeBytes)}</td>
                  <td className="px-4 py-3">
                    <Pill text={r.status} className={pillClassByStatus[r.status] || pillClassByStatus.Generated} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onPreview(r)}
                        className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => onDownload(r)}
                        disabled={r.status !== 'Generated'}
                        className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                      >
                        Download
                      </button>
                      <button
                        type="button"
                        onClick={() => onShare(r)}
                        className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        Share
                      </button>
                      <button
                        type="button"
                        onClick={() => onArchive(r)}
                        className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        Archive
                      </button>
                    </div>

                    {shareOpenId === r.id && (
                      <div className="mt-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-3">
                        <div className="text-xs font-medium text-gray-700 dark:text-gray-200">Share (permissions)</div>
                        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <div className="sm:col-span-1">
                            <label className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1">Permission</label>
                            <select
                              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-2 py-2 text-xs"
                              value={sharePermission}
                              onChange={(e) => setSharePermission(e.target.value)}
                            >
                              <option value="View">View</option>
                              <option value="Edit">Edit</option>
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[11px] text-gray-500 dark:text-gray-400 mb-1">Invite email (optional)</label>
                            <input
                              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-2 py-2 text-xs"
                              placeholder="name@company.com"
                              value={shareEmail}
                              onChange={(e) => setShareEmail(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={createShareLink}
                            className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            Create link
                          </button>
                          {shareLink && (
                            <button
                              type="button"
                              onClick={copyShareLink}
                              className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              Copy
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onShare(r)}
                            className="ml-auto text-xs text-blue-600 dark:text-blue-400 hover:opacity-80"
                          >
                            Close
                          </button>
                        </div>

                        {shareLink && (
                          <div className="mt-2 text-[11px] text-gray-500 dark:text-gray-400 break-all">{shareLink}</div>
                        )}
                        {shareEmail && (
                          <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                            Invite target: {shareEmail}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {visibleReports.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                    No reports yet. Generate your first report above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Templates */}
      <div className="apple-card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Report templates</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Choose the right format for your audience.</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {templates.map((t) => (
            <div key={t.key} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">{t.title}</div>
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">{t.description}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setGenTemplate(t.key);
                    setShowGenerator(true);
                  }}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Use
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scheduler */}
      <div className="apple-card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Scheduler</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Automate generation, emails, and recurring reports.</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="lg:col-span-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Automatic generation</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Generate reports automatically.</div>
              </div>
              <button
                type="button"
                onClick={() => setAutoGenerate((v) => !v)}
                className={
                  'h-7 w-12 rounded-full border transition-colors ' +
                  (autoGenerate
                    ? 'bg-blue-600 border-blue-600'
                    : 'bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700')
                }
                aria-label="Toggle automatic generation"
              >
                <span
                  className={
                    'block h-6 w-6 rounded-full bg-white dark:bg-black shadow-sm transform transition-transform ' +
                    (autoGenerate ? 'translate-x-5' : 'translate-x-0.5')
                  }
                />
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Automatic email sending</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Email reports when ready.</div>
              </div>
              <button
                type="button"
                onClick={() => setAutoEmail((v) => !v)}
                className={
                  'h-7 w-12 rounded-full border transition-colors ' +
                  (autoEmail
                    ? 'bg-blue-600 border-blue-600'
                    : 'bg-gray-200 dark:bg-gray-800 border-gray-300 dark:border-gray-700')
                }
                aria-label="Toggle automatic email sending"
              >
                <span
                  className={
                    'block h-6 w-6 rounded-full bg-white dark:bg-black shadow-sm transform transition-transform ' +
                    (autoEmail ? 'translate-x-5' : 'translate-x-0.5')
                  }
                />
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Recurrence</label>
                <select
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-sm"
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value)}
                >
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Time</label>
                <input
                  type="time"
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-3 py-2 text-sm"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              This scheduler UI is ready; backend execution can be wired next.
            </div>
          </div>
        </div>
      </div>

      {/* Preview panel */}
      {selected && (
        <div className="apple-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Preview</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{selected.name}</div>
            </div>
            <div className="flex items-center gap-2">
              <Pill text={selected.format} className="bg-gray-500/10 text-gray-700 dark:text-gray-300 border border-gray-500/20" />
              <Pill text={selected.status} className={pillClassByStatus[selected.status] || pillClassByStatus.Generated} />
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
            {selected.format === 'HTML' ? (
              <div className="text-sm text-gray-700 dark:text-gray-300">
                HTML preview is available via download for now.
              </div>
            ) : selected.format === 'JSON' ? (
              <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
                {buildReportContent({
                  name: selected.name,
                  auditName: selected.auditName,
                  templateKey: selected.templateKey,
                  format: 'JSON',
                }).text}
              </pre>
            ) : (
              <div className="text-sm text-gray-700 dark:text-gray-300">
                PDF preview is not rendered inline. Use Download.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
