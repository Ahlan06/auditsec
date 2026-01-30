import type { ReactNode } from 'react';

export type StatBadgeTone = 'success' | 'warning' | 'error' | 'info' | 'neutral';

export type StatBadgeProps = {
  tone?: StatBadgeTone;
  label: string;
  icon?: ReactNode;
  showIcon?: boolean;
  animated?: boolean;
  tooltip?: string;
};

const toneClass: Record<StatBadgeTone, string> = {
  success: 'bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/20',
  warning: 'bg-yellow-500/10 text-yellow-800 dark:text-yellow-200 border border-yellow-500/20',
  error: 'bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20',
  info: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20',
  neutral: 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border border-gray-500/20',
};

export default function StatBadge({
  tone = 'neutral',
  label,
  icon,
  showIcon = Boolean(icon),
  animated = false,
  tooltip,
}: StatBadgeProps) {
  return (
    <span className="group relative inline-flex">
      <span
        className={
          'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ' +
          toneClass[tone] +
          (animated ? ' animate-pulse' : '')
        }
      >
        {showIcon && icon ? <span className="inline-flex">{icon}</span> : null}
        <span>{label}</span>
      </span>

      {tooltip ? (
        <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 w-max -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-2 py-1 text-[11px] text-gray-700 dark:text-gray-200 shadow-sm">
            {tooltip}
          </span>
        </span>
      ) : null}
    </span>
  );
}
