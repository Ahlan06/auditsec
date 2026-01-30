import { useEffect, useState } from 'react';
import type { IconType } from 'react-icons';
import {
  FiBell,
  FiChevronDown,
  FiClock,
  FiCreditCard,
  FiEye,
  FiFileText,
  FiHelpCircle,
  FiHome,
  FiMessageSquare,
  FiSearch,
  FiSettings,
  FiShield,
  FiTool,
  FiUser,
} from 'react-icons/fi';
import { RiReceiptLine } from 'react-icons/ri';
import { NavLink, useLocation } from 'react-router-dom';
import { SidebarSkeleton } from './ui';

export type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  user: { displayName: string; email: string };
  onLogout: () => void;
  loading?: boolean;
};

type Item = {
  key: string;
  label: string;
  icon: IconType;
  to?: string;
  badge?: number;
  children?: Array<{ key: string; label: string; icon: IconType; to: string; badge?: number }>;
};

type Section = {
  title: string;
  items: Item[];
};

const sections: Section[] = [
  {
    title: 'MAIN MENU',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: FiHome, to: '/client/dashboard' },
      {
        key: 'audits',
        label: 'Audits',
        icon: FiShield,
        children: [
          { key: 'audits-in-progress', label: 'In-progress audits', icon: FiShield, to: '/client/audits/en-cours' },
          { key: 'audits-history', label: 'Audit history', icon: FiClock, to: '/client/audits/historique' },
        ],
      },
      { key: 'assistant', label: 'AI Assistant', icon: FiMessageSquare, to: '/client/assistant' },
      { key: 'reports', label: 'Reports', icon: FiFileText, to: '/client/rapports' },
      { key: 'security-tools', label: 'Security tools', icon: FiTool, to: '/client/outils' },
    ],
  },
  {
    title: 'SECURITY',
    items: [
      { key: 'vuln-scan', label: 'Vulnerability scan', icon: FiSearch, to: '/client/securite/scan' },
      { key: 'monitoring', label: 'Monitoring', icon: FiEye, to: '/client/securite/surveillance' },
      { key: 'alerts', label: 'Alerts', icon: FiBell, to: '/client/securite/alertes' },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { key: 'profile', label: 'Profile', icon: FiUser, to: '/client/compte/profil' },
      { key: 'subscription', label: 'Subscription', icon: FiCreditCard, to: '/client/compte/abonnement' },
      { key: 'billing', label: 'Billing', icon: RiReceiptLine, to: '/client/compte/facturation' },
      { key: 'settings', label: 'Settings', icon: FiSettings, to: '/client/compte/parametres' },
      { key: 'support', label: 'Support', icon: FiHelpCircle, to: '/client/support' },
    ],
  },
];

const isItemActive = (pathname: string, item: Item) => {
  if (item.to && pathname === item.to) return true;
  if (item.to && pathname.startsWith(item.to + '/')) return true;
  if (item.children) return item.children.some((c) => pathname === c.to || pathname.startsWith(c.to + '/'));
  return false;
};

export default function ClientSidebar({ isOpen, onClose, user, onLogout, loading = false }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      <aside
        className={
          'fixed inset-y-0 left-0 z-50 w-72 border-r border-gray-200 dark:border-white/10 ' +
          'glass-apple transform transition-transform duration-200 ' +
          'md:translate-x-0 ' +
          (isOpen ? 'translate-x-0' : '-translate-x-full')
        }
      >
        {loading ? (
          <SidebarSkeleton />
        ) : (
          <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black flex items-center justify-center">
                <span className="text-sm font-semibold tracking-tight text-gray-900 dark:text-gray-100">aS</span>
              </div>
              <div>
                <div className="text-sm font-semibold tracking-tight text-gray-900 dark:text-gray-100">auditSec</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Client portal</div>
              </div>
            </div>
            <button
              type="button"
              className="md:hidden p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={onClose}
              aria-label="Close menu"
            >
              <span className="text-gray-900 dark:text-gray-100">×</span>
            </button>
          </div>

          {/* Sections */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
            {sections.map((section) => (
              <div key={section.title}>
                <div className="px-3 pb-2 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {section.title}
                </div>
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <SidebarItem key={item.key} item={item} pathname={location.pathname} />
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* User */}
          <div className="border-t border-gray-200 dark:border-white/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">{user.displayName}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
          </div>
        )}
      </aside>
    </>
  );
}

function SidebarItem({ item, pathname }: { item: Item; pathname: string }) {
  const active = isItemActive(pathname, item);
  const [open, setOpen] = useState(active);

  useEffect(() => {
    if (active) setOpen(true);
  }, [active]);

  if (item.children && item.children.length) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={
            'group w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm border transition-colors ' +
            (active
              ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100'
              : 'border-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700')
          }
          title={item.label}
        >
          <span className="flex items-center gap-3">
            <item.icon size={16} />
            <span>{item.label}</span>
          </span>
          <span className="flex items-center gap-2">
            {typeof item.badge === 'number' && item.badge > 0 && <Badge value={item.badge} />}
            <span className={"transition-transform " + (open ? 'rotate-180' : '')}>
              <FiChevronDown size={16} />
            </span>
          </span>
        </button>

        {/* Tooltip */}
        <Tooltip label={item.label} />

        {open && (
          <div className="mt-1 ml-6 space-y-1">
            {item.children.map((child) => (
              <NavLink
                key={child.key}
                to={child.to}
                title={child.label}
                className={({ isActive }) =>
                  'group relative flex items-center justify-between rounded-lg px-3 py-2 text-sm border transition-colors ' +
                  (isActive
                    ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100'
                    : 'border-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700')
                }
              >
                <span className="flex items-center gap-3">
                  <child.icon size={16} />
                  <span>{child.label}</span>
                </span>
                {typeof child.badge === 'number' && child.badge > 0 && <Badge value={child.badge} />}
                <Tooltip label={child.label} />
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!item.to) return null;

  return (
    <NavLink
      to={item.to}
      title={item.label}
      className={({ isActive }) =>
        'group relative flex items-center justify-between rounded-lg px-3 py-2 text-sm border transition-colors ' +
        (isActive
          ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100'
          : 'border-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700')
      }
    >
      <span className="flex items-center gap-3">
        <item.icon size={16} />
        <span>{item.label}</span>
      </span>
      {typeof item.badge === 'number' && item.badge > 0 && <Badge value={item.badge} />}
      <Tooltip label={item.label} />
    </NavLink>
  );
}

function Badge({ value }: { value: number }) {
  return (
    <span className="inline-flex min-w-5 justify-center rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-semibold text-white">
      {value}
    </span>
  );
}

function Tooltip({ label }: { label: string }) {
  return (
    <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-black px-2 py-1 text-xs text-gray-900 dark:text-gray-100 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
      {label}
    </span>
  );
}
