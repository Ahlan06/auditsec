import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Legend, Tooltip } from 'chart.js';
import { clientProjects } from '../services/clientApi';
import { EmptyState, ErrorState, SkeletonBlock, WidgetSkeleton } from '../components/client-dashboard/ui';
import { apiErrorMessage, classifyApiError } from '../utils/apiError';

ChartJS.register(ArcElement, Tooltip, Legend);

const decodeBase64Url = (value) => {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  return atob(padded);
};

const decodeClientToken = (token) => {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const json = decodeBase64Url(parts[1]);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const formatShortDate = (date) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(date);

const formatTime = (date) =>
  new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(date);

const ClientDashboardPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const token = typeof window !== 'undefined' ? localStorage.getItem('client_token') : null;
  const userName = useMemo(() => {
    const payload = decodeClientToken(token);
    const email = payload?.email;
    if (email && typeof email === 'string') return email.split('@')[0];
    return 'there';
  }, [token]);
  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clientProjects.list();
      setProjects(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const hasAnyAudits = useMemo(() => (projects || []).length > 0, [projects]);

  const audits = useMemo(() => {
    return (projects || []).map((p, idx) => {
      const status = (p.status || 'pending').toString();
      const createdAtRaw = p.created_at || p.createdAt || null;
      const createdAt = createdAtRaw ? new Date(createdAtRaw) : null;
      return {
        id: p.id,
        name: p.name || `Audit #${p.id}`,
        status,
        createdAt,
        target: p.target_url,
        lastResult: p.last_result || null,
      };
    });
  }, [projects]);

  const auditsInProgress = useMemo(
    () => audits.filter((a) => a.status !== 'completed').slice(0, 3),
    [audits]
  );
  const recentProjects = useMemo(() => {
    const sorted = [...audits].sort((a, b) => {
      const ta = a.createdAt ? a.createdAt.getTime() : 0;
      const tb = b.createdAt ? b.createdAt.getTime() : 0;
      return tb - ta;
    });
    return sorted.slice(0, 3);
  }, [audits]);

  const statusCounts = useMemo(() => {
    const completed = audits.filter((a) => a.status === 'completed').length;
    const inProgress = audits.filter((a) => a.status === 'running' || a.status === 'queued' || a.status === 'pending').length;
    const waiting = Math.max(0, audits.length - completed - inProgress);
    return { completed, inProgress, waiting };
  }, [audits]);

  const pieData = useMemo(
    () => ({
      labels: ['Completed', 'In progress', 'Waiting'],
      datasets: [
        {
          data: [statusCounts.completed, statusCounts.inProgress, statusCounts.waiting],
          backgroundColor: ['rgba(34, 197, 94, 0.75)', 'rgba(59, 130, 246, 0.75)', 'rgba(245, 158, 11, 0.75)'],
          borderColor: ['rgba(34, 197, 94, 1)', 'rgba(59, 130, 246, 1)', 'rgba(245, 158, 11, 1)'],
          borderWidth: 1,
        },
      ],
    }),
    [statusCounts]
  );

  const activeAuditsCount = useMemo(() => audits.filter((a) => a.status !== 'completed').length, [audits]);

  const completedWithResults = useMemo(
    () => audits.filter((a) => a.status === 'completed' && a.lastResult && Array.isArray(a.lastResult.findings)),
    [audits]
  );

  const criticalAlerts = useMemo(() => {
    const alerts = [];
    for (const a of completedWithResults) {
      for (const f of a.lastResult.findings || []) {
        const sev = (f?.severity || '').toString().toLowerCase();
        const priority = sev === 'high' || sev === 'critical' ? 'P1' : 'P2';
        const title = (f?.title || 'Finding').toString();
        const asset = (a.target || '').toString() || (f?.path || '').toString() || 'Unknown asset';
        alerts.push({
          id: `${a.id}-${f?.id || title}`,
          title,
          priority,
          asset,
        });
      }
    }

    // Keep only the most important / recent-ish
    const ranked = alerts.sort((x, y) => (x.priority === y.priority ? 0 : x.priority === 'P1' ? -1 : 1));
    return ranked.slice(0, 6);
  }, [completedWithResults]);

  const globalSecurityScore = useMemo(() => {
    if (!completedWithResults.length) return null;
    const weights = { critical: 20, high: 12, medium: 6, low: 2 };
    let penalty = 0;
    for (const a of completedWithResults) {
      for (const f of a.lastResult.findings || []) {
        const sev = (f?.severity || '').toString().toLowerCase();
        penalty += weights[sev] ?? 4;
      }
    }
    return Math.max(0, Math.min(100, 100 - penalty));
  }, [completedWithResults]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="apple-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="text-sm text-gray-600 dark:text-gray-400">Dashboard</div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
              Hello {userName}, welcome to auditSec
            </h1>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-4">
              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-4 py-3">
                <SkeletonBlock className="h-3 w-24" />
                <div className="mt-2 flex items-baseline gap-2">
                  <SkeletonBlock className="h-6 w-14" />
                  <SkeletonBlock className="h-4 w-10" />
                </div>
                <div className="mt-3 h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                  <SkeletonBlock className="h-full w-2/3 rounded-full" />
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-4 py-3">
                <SkeletonBlock className="h-3 w-24" />
                <div className="mt-2">
                  <SkeletonBlock className="h-6 w-10" />
                </div>
                <div className="mt-3">
                  <SkeletonBlock className="h-3 w-28" />
                </div>
              </div>
            </div>
          ) : (
            hasAnyAudits ? (
              <div className="grid grid-cols-2 gap-3 sm:flex sm:gap-4">
                {typeof globalSecurityScore === 'number' ? (
                  <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-4 py-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Global security</div>
                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">{globalSecurityScore}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">/100</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                        style={{ width: `${globalSecurityScore}%` }}
                      />
                    </div>
                  </div>
                ) : null}

                <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-4 py-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Active audits</div>
                  <div className="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-100">{activeAuditsCount}</div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">In progress / pending</div>
                </div>
              </div>
            ) : null
          )}
        </div>
      </div>

      {error && !loading ? (
        <ErrorState
          kind={classifyApiError(error)}
          title="Couldn’t load dashboard"
          details={apiErrorMessage(error, 'Failed to load projects')}
          onRetry={load}
        />
      ) : null}

      {loading ? (
        <div className="space-y-4">
          {/* Row 1 skeleton */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <WidgetSkeleton lines={5} />
            </div>
            <div className="lg:col-span-4">
              <WidgetSkeleton lines={4} />
            </div>
            <div className="apple-card lg:col-span-3">
              <SkeletonBlock className="h-4 w-28" />
              <div className="mt-4 h-44">
                <SkeletonBlock className="h-full w-full rounded-xl" />
              </div>
            </div>
          </div>

          {/* Row 2 skeleton */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <WidgetSkeleton lines={6} />
            </div>
            <div className="apple-card lg:col-span-3">
              <SkeletonBlock className="h-4 w-40" />
              <div className="mt-3 space-y-2">
                <SkeletonBlock className="h-4 w-2/3" />
                <SkeletonBlock className="h-3 w-1/2" />
              </div>
              <div className="mt-4">
                <SkeletonBlock className="h-40 w-full rounded-xl" />
              </div>
            </div>
            <div className="apple-card lg:col-span-4">
              <SkeletonBlock className="h-4 w-44" />
              <div className="mt-4 space-y-3">
                <SkeletonBlock className="h-4 w-2/3" />
                <SkeletonBlock className="h-3 w-1/3" />
                <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                  <SkeletonBlock className="h-full w-1/2 rounded-full" />
                </div>
                <SkeletonBlock className="h-3 w-32" />
              </div>
            </div>
          </div>

          {/* Row 3 skeleton */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <WidgetSkeleton lines={5} />
            </div>
            <div className="apple-card lg:col-span-6">
              <SkeletonBlock className="h-4 w-32" />
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                  <SkeletonBlock className="h-4 w-24" />
                  <div className="mt-2 space-y-2">
                    <SkeletonBlock className="h-3 w-full" />
                    <SkeletonBlock className="h-3 w-2/3" />
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                  <SkeletonBlock className="h-4 w-24" />
                  <div className="mt-2 space-y-2">
                    <SkeletonBlock className="h-3 w-full" />
                    <SkeletonBlock className="h-3 w-2/3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : !error ? (
        <>
          {!hasAnyAudits ? (
            <div className="apple-card">
              <EmptyState
                title="No audits yet"
                description="Your dashboard will populate once you create and run your first audit."
              />
            </div>
          ) : (
            <>
              {/* Row 1 */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                {/* 1. Audits in progress */}
                <div className="apple-card lg:col-span-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Audits in progress</h2>
                    <button
                      type="button"
                      onClick={() => navigate('/client/audits/en-cours')}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:opacity-80"
                    >
                      View all
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {auditsInProgress.map((a) => (
                      <div
                        key={a.id}
                        className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{a.name}</div>
                            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">{a.target}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => navigate('/client/audits/en-cours')}
                            className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            Open
                          </button>
                        </div>
                      </div>
                    ))}

                    {auditsInProgress.length === 0 ? (
                      <EmptyState
                        title="No active audits"
                        description="You have no audits in progress right now."
                        actionLabel="View audits"
                        onAction={() => navigate('/client/audits/en-cours')}
                      />
                    ) : null}
                  </div>
                </div>

                {/* 2. Recent projects */}
                <div className="apple-card lg:col-span-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent projects</h2>
                  <div className="mt-4 space-y-3">
                    {recentProjects.map((p) => (
                      <div key={p.id} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{p.name}</div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">{p.target}</div>
                      </div>
                    ))}
                    {recentProjects.length === 0 ? (
                      <EmptyState title="No projects" description="Create a project to start your first audit." />
                    ) : null}
                  </div>
                </div>

                {/* 3. Stats pie */}
                <div className="apple-card lg:col-span-3">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Statistics</h2>
                  <div className="mt-4">
                    <div className="h-44">
                      <Pie
                        data={pieData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { position: 'bottom' } },
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: alerts only if derived from results */}
              {criticalAlerts.length ? (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                  <div className="apple-card lg:col-span-12">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Critical alerts</h2>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Derived from last scan results</span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {criticalAlerts.map((a) => (
                        <div key={a.id} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{a.title}</div>
                              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">Asset: {a.asset}</div>
                            </div>
                            <span
                              className={
                                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ' +
                                (a.priority === 'P1'
                                  ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                                  : 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-500/20')
                              }
                            >
                              {a.priority}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </>
      ) : null}
    </div>
  );
};

export default ClientDashboardPage;
