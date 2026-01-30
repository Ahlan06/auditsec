import { useMemo, useState } from 'react';
import { FiBell } from 'react-icons/fi';

export type NotificationCategory = 'Security' | 'System' | 'Audit';

export type NotificationItem = {
  id: string;
  title: string;
  body?: string;
  category: NotificationCategory;
  createdAtIso: string;
  read: boolean;
};

export type NotificationBellProps = {
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
};

const categoryPill: Record<NotificationCategory, string> = {
  Security: 'bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20',
  System: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20',
  Audit: 'bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/20',
};

function Pill({ text, className }: { text: string; className: string }) {
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${className}`}>{text}</span>;
}

const formatDateTime = (iso: string) => {
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

export default function NotificationBell({ notifications, onMarkRead }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Notifications"
        title="Notifications"
      >
        <FiBell size={20} />
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 inline-flex min-w-5 justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-black shadow-sm overflow-hidden z-40">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-white/10">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Categories: Security, System, Audit
            </div>
          </div>

          <div className="max-h-96 overflow-auto divide-y divide-gray-200 dark:divide-white/10">
            {notifications.length ? (
              notifications.map((n) => (
                <div key={n.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className={'text-sm font-medium truncate ' + (n.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-gray-100')}>
                          {n.title}
                        </div>
                        <Pill text={n.category} className={categoryPill[n.category]} />
                      </div>
                      {n.body ? <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{n.body}</div> : null}
                      <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">{formatDateTime(n.createdAtIso)}</div>
                    </div>
                    {!n.read ? (
                      <button
                        type="button"
                        onClick={() => onMarkRead(n.id)}
                        className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        Mark read
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">No notifications</div>
            )}
          </div>

          <div className="px-4 py-3 border-t border-gray-200 dark:border-white/10 flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:opacity-80"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
