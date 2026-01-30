import type { ReactNode } from 'react';

export type ProgressStepStatus = 'pending' | 'active' | 'done' | 'error';

export type ProgressStepAction = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

export type ProgressStep = {
  id: string;
  title: string;
  description?: string;
  status: ProgressStepStatus;
  etaMinutes?: number;
  actions?: ProgressStepAction[];
};

export type ProgressTrackerProps = {
  title?: string;
  steps: ProgressStep[];
  estimatedTotalMinutes?: number;
  footer?: ReactNode;
};

const statusPill: Record<ProgressStepStatus, string> = {
  pending: 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border border-gray-500/20',
  active: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20',
  done: 'bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/20',
  error: 'bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20',
};

function Pill({ text, className }: { text: string; className: string }) {
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${className}`}>{text}</span>;
}

export default function ProgressTracker({ title = 'Progress', steps, estimatedTotalMinutes, footer }: ProgressTrackerProps) {
  const total = steps.length || 1;
  const done = steps.filter((s) => s.status === 'done').length;
  const pct = Math.round((done / total) * 100);

  const computedEta =
    typeof estimatedTotalMinutes === 'number'
      ? estimatedTotalMinutes
      : steps.reduce((acc, s) => acc + (typeof s.etaMinutes === 'number' ? s.etaMinutes : 0), 0) || undefined;

  return (
    <div className="apple-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {pct}% complete{computedEta ? ` • Estimated: ${computedEta} min` : ''}
          </div>
        </div>
        <Pill text={`${done}/${steps.length}`} className="bg-gray-500/10 text-gray-700 dark:text-gray-300 border border-gray-500/20" />
      </div>

      <div className="mt-4 h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
        <div className="h-full bg-blue-600" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-4 space-y-2">
        {steps.map((s, idx) => (
          <div key={s.id} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {idx + 1}. {s.title}
                  </div>
                  <Pill text={s.status} className={statusPill[s.status]} />
                </div>
                {s.description ? <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{s.description}</div> : null}
                {typeof s.etaMinutes === 'number' ? (
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">ETA: {s.etaMinutes} min</div>
                ) : null}
              </div>

              {s.actions && s.actions.length ? (
                <div className="flex items-center gap-2">
                  {s.actions.map((a) => (
                    <button
                      key={a.label}
                      type="button"
                      onClick={a.onClick}
                      disabled={a.disabled}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {footer ? <div className="mt-4 flex justify-end">{footer}</div> : null}
    </div>
  );
}
