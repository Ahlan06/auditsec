import { useMemo } from 'react';

export type ComplianceItem = {
  id: string;
  label: string;
  required: boolean;
  done: boolean;
};

export type ComplianceStandard = {
  id: 'GDPR' | 'ISO27001' | 'NIST';
  title: string;
  items: ComplianceItem[];
};

export type ComplianceDashboardProps = {
  standards: ComplianceStandard[];
  onToggleItem: (standardId: ComplianceStandard['id'], itemId: string) => void;
  onGenerateReport: () => void;
};

function pct(done: number, total: number) {
  if (!total) return 0;
  return Math.round((done / total) * 100);
}

export default function ComplianceDashboard({ standards, onToggleItem, onGenerateReport }: ComplianceDashboardProps) {
  const summaries = useMemo(() => {
    return standards.map((s) => {
      const required = s.items.filter((i) => i.required);
      const done = required.filter((i) => i.done).length;
      const missing = required.filter((i) => !i.done);
      return {
        id: s.id,
        title: s.title,
        done,
        total: required.length,
        pct: pct(done, required.length),
        missing,
      };
    });
  }, [standards]);

  return (
    <div className="apple-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Compliance dashboard</div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">RGPD / ISO 27001 / NIST checklists with progress and missing requirements.</div>
        </div>
        <button
          type="button"
          onClick={onGenerateReport}
          className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          Generate report
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {summaries.map((s) => (
          <div key={s.id} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{s.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{s.pct}%</div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
              <div className="h-full bg-blue-600" style={{ width: `${s.pct}%` }} />
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {s.done}/{s.total} required controls complete
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-3">
          {standards.map((s) => (
            <div key={s.id} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{s.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Checklist</div>
              </div>
              <div className="mt-3 space-y-2">
                {s.items.map((i) => {
                  const missing = i.required && !i.done;
                  return (
                    <label
                      key={i.id}
                      className={
                        'flex items-start gap-3 rounded-xl border px-3 py-2 ' +
                        (missing
                          ? 'border-red-500/20 bg-red-500/5'
                          : 'border-gray-200 dark:border-white/10 bg-white dark:bg-black')
                      }
                    >
                      <input type="checkbox" checked={i.done} onChange={() => onToggleItem(s.id, i.id)} className="mt-1" />
                      <span className="min-w-0">
                        <span className="block text-sm text-gray-800 dark:text-gray-200">{i.label}</span>
                        {missing ? <span className="block text-xs text-red-700 dark:text-red-300">Missing requirement</span> : null}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Missing requirements</div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Highlighted items that are required but not complete.</div>

            <div className="mt-3 space-y-2">
              {summaries.every((s) => s.missing.length === 0) ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">No missing required items.</div>
              ) : (
                summaries
                  .filter((s) => s.missing.length)
                  .map((s) => (
                    <div key={s.id} className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                      <div className="text-xs font-semibold text-red-700 dark:text-red-300">{s.title}</div>
                      <ul className="mt-2 space-y-1">
                        {s.missing.slice(0, 6).map((m) => (
                          <li key={m.id} className="text-xs text-red-700/80 dark:text-red-300/80">
                            {m.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
