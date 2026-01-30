import type { ReactNode } from 'react';

export type CardWidgetProps = {
  title: string;
  icon?: ReactNode;
  children?: ReactNode;
  footerActions?: ReactNode;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
};

export default function CardWidget({
  title,
  icon,
  children,
  footerActions,
  loading = false,
  error = null,
  onRetry,
}: CardWidgetProps) {
  return (
    <div className="apple-card p-0 overflow-hidden">
      <div className="px-5 py-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {icon ? (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-gray-100">
              {icon}
            </span>
          ) : null}
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5">
        {loading ? (
          <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
            <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="mt-3 space-y-2">
              <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-3 w-5/6 rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <div className="text-sm font-medium text-red-700 dark:text-red-300">Something went wrong</div>
            <div className="mt-1 text-xs text-red-700/80 dark:text-red-300/80">{error}</div>
            {onRetry ? (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={onRetry}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          children
        )}
      </div>

      {footerActions ? (
        <div className="px-5 py-4 border-t border-gray-200 dark:border-white/10 flex items-center justify-end gap-2">
          {footerActions}
        </div>
      ) : null}
    </div>
  );
}
