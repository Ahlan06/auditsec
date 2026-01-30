import type { ReactNode } from 'react';

export type ErrorKind = 'network' | 'permission' | 'missing' | 'timeout' | 'unknown';

export type ErrorStateProps = {
  kind?: ErrorKind;
  title?: string;
  message?: string;
  details?: string;
  onRetry?: () => void;
  actionLabel?: string;
  icon?: ReactNode;
};

const defaultCopy: Record<ErrorKind, { title: string; message: string }> = {
  network: {
    title: 'Network error',
    message: 'We could not reach the server. Check your connection and try again.',
  },
  permission: {
    title: 'Permission denied',
    message: 'Your account does not have access to this resource.',
  },
  missing: {
    title: 'Missing data',
    message: 'Some required data is missing or unavailable.',
  },
  timeout: {
    title: 'Request timeout',
    message: 'The server took too long to respond. Please retry.',
  },
  unknown: {
    title: 'Something went wrong',
    message: 'An unexpected error occurred. Please try again.',
  },
};

export default function ErrorState({
  kind = 'unknown',
  title,
  message,
  details,
  onRetry,
  actionLabel = 'Retry',
  icon,
}: ErrorStateProps) {
  const copy = defaultCopy[kind];

  return (
    <div className="apple-card border border-red-500/20 bg-red-500/5">
      <div className="flex items-start gap-3">
        {icon ? (
          <div className="h-10 w-10 rounded-xl border border-red-500/20 bg-white/70 dark:bg-black/40 flex items-center justify-center text-red-700 dark:text-red-300">
            {icon}
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-red-700 dark:text-red-300">{title || copy.title}</div>
          <div className="mt-1 text-xs text-red-700/80 dark:text-red-300/80">{message || copy.message}</div>
          {details ? <div className="mt-2 text-[11px] text-red-700/70 dark:text-red-300/70 break-words">{details}</div> : null}
          {onRetry ? (
            <div className="mt-3">
              <button
                type="button"
                onClick={onRetry}
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
