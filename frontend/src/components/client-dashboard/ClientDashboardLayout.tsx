import { useEffect, useMemo, useState } from 'react';
import { FiMenu, FiMoon, FiSun, FiUser } from 'react-icons/fi';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { clientAuth } from '../../services/clientApi';
import useThemeStore from '../../store/themeStore';
import ClientSidebar from './ClientSidebar';
import { NotificationBell } from './ui';

type ClientTokenPayload = {
  id?: number;
  email?: string;
  exp?: number;
  iat?: number;
};

const decodeBase64Url = (value: string): string => {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  return atob(padded);
};

const decodeClientToken = (token: string | null): ClientTokenPayload | null => {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const json = decodeBase64Url(parts[1]);
    return JSON.parse(json) as ClientTokenPayload;
  } catch {
    return null;
  }
};

export default function ClientDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useThemeStore();

  const isAssistant = useMemo(() => location.pathname.startsWith('/client/assistant'), [location.pathname]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  const NOTIFS_KEY = 'auditsec_client_notifications_v1';
  const [notifications, setNotifications] = useState(() => {
    try {
      const raw = localStorage.getItem(NOTIFS_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // ignore
    }

    // Seed with a few demo notifications.
    return [
      {
        id: 'n-1',
        title: 'New security alert',
        body: 'A new high severity issue was detected during monitoring.',
        category: 'Security',
        createdAtIso: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
        read: false,
      },
      {
        id: 'n-2',
        title: 'System update',
        body: 'Client portal settings have been updated.',
        category: 'System',
        createdAtIso: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        read: false,
      },
      {
        id: 'n-3',
        title: 'Audit status',
        body: 'Your audit is still in progress. Next ETA: 24h.',
        category: 'Audit',
        createdAtIso: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        read: false,
      },
    ];
  });

  const token = typeof window !== 'undefined' ? localStorage.getItem('client_token') : null;

  const user = useMemo(() => {
    const payload = decodeClientToken(token);
    const email = payload?.email;
    const displayName = email ? email.split('@')[0] : 'Client';
    return { email: email || 'client@auditsec', displayName };
  }, [token]);

  useEffect(() => {
    // TEMPORAIRE : Authentification désactivée pour tests
    setAuthChecking(false);
    
    /* AUTHENTIFICATION DÉSACTIVÉE TEMPORAIREMENT
    if (!token) {
      navigate('/client/login', { replace: true });
      return;
    }
    setAuthChecking(false);
    */
  }, [navigate, token]);

  useEffect(() => {
    try {
      localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifications));
    } catch {
      // ignore
    }
  }, [notifications]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const logout = () => {
    clientAuth.logout();
    navigate('/client/login');
  };

  const onMarkNotificationRead = (id: string) => {
    setNotifications((prev) => {
      const next = prev.map((n: any) => (n.id === id ? { ...n, read: true } : n));
      try {
        localStorage.setItem(NOTIFS_KEY, JSON.stringify(next));
        return next;
      } catch {
        return prev;
      }
    });
  };

  const pageTitle = useMemo(() => {
    const p = location.pathname;
    if (p.startsWith('/client/assistant')) return 'AI Assistant';
    if (p.startsWith('/client/securite/scan')) return 'Vulnerability scan';
    if (p.startsWith('/client/securite/surveillance')) return 'Monitoring';
    if (p.startsWith('/client/securite/alertes')) return 'Alerts';
    if (p.startsWith('/client/audits/en-cours')) return 'In-progress audits';
    if (p.startsWith('/client/audits/historique')) return 'Audit history';
    if (p.startsWith('/client/rapports')) return 'Reports';
    if (p.startsWith('/client/outils')) return 'Security tools';
    if (p.startsWith('/client/compte/profil')) return 'Profile';
    if (p.startsWith('/client/compte/abonnement')) return 'Subscription';
    if (p.startsWith('/client/compte/facturation')) return 'Billing';
    if (p.startsWith('/client/compte/parametres')) return 'Settings';
    if (p.startsWith('/client/osint-box')) return 'OSINT Box';
    if (p.startsWith('/client/audit-scan')) return 'Audit Scan';
    if (p.startsWith('/client/assets')) return 'Assets';
    if (p.startsWith('/client/support')) return 'Support';
    return 'Dashboard';
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-black dark:text-gray-100 transition-colors duration-300">
      <ClientSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={logout}
        loading={authChecking}
      />

      {/* Main column */}
      <div className="md:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-30 glass-apple border-b border-gray-200 dark:border-white/10">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="md:hidden p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <FiMenu size={20} />
              </button>
              <div>
                <div className="text-sm font-semibold">{pageTitle}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{location.pathname}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-800 dark:text-gray-200 hover:opacity-70 transition-all duration-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Toggle theme"
                title="Theme"
                type="button"
              >
                {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>

              <NotificationBell notifications={notifications} onMarkRead={onMarkNotificationRead} />
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Profile"
                title="Profile"
              >
                <FiUser size={20} />
                <span className="hidden sm:inline text-sm">{user.displayName}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="px-4 sm:px-6 py-6">
          <div className={isAssistant ? 'max-w-none' : 'max-w-6xl mx-auto'}>
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-white/10 px-4 sm:px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <span>auditSec Client • {new Date().getFullYear()}</span>
            <span>Secure area</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
