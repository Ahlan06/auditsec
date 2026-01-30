import type { ReactNode } from 'react';

export type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
};

export default function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <div className="apple-card">
      <div className="flex items-start gap-3">
        {icon ? (
          <div className="h-10 w-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black flex items-center justify-center text-gray-900 dark:text-gray-100">
            {icon}
          </div>
        ) : null}
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</div>
          {description ? <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</div> : null}
          {actionLabel && onAction ? (
            <div className="mt-3">
              <button
                type="button"
                onClick={onAction}
                className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {actionLabel}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
