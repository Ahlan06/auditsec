import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientAudits } from '../services/clientApi';
import { EmptyState, ErrorState, WidgetSkeleton } from '../components/client-dashboard/ui';
import { apiErrorMessage, classifyApiError } from '../utils/apiError';

const isInProgressStatus = (status) => {
  const s = String(status || '').toLowerCase();
  return s === 'queued' || s === 'running' || s === 'pending_provider' || s === 'in_progress';
};

export default function ClientAuditsInProgressPage() {
  const navigate = useNavigate();
  const mountedRef = useRef(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [audits, setAudits] = useState([]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await clientAudits.list();
      if (mountedRef.current) setAudits(Array.isArray(list) ? list : []);
    } catch (err) {
      if (mountedRef.current) setError(err);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const inProgress = useMemo(
    () => (audits || []).filter((a) => isInProgressStatus(a?.status)),
    [audits]
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <WidgetSkeleton lines={6} />
        <WidgetSkeleton lines={6} />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        kind={classifyApiError(error)}
        title="Couldn’t load audits"
        details={apiErrorMessage(error, 'Failed to load audits')}
        onRetry={load}
      />
    );
  }

  if (!inProgress.length) {
    return (
      <div className="apple-card">
        <EmptyState
          title="No active audits"
          description="Nothing is running right now. Start a scan from Vulnerability scan."
          actionLabel="Go to scan"
          onAction={() => navigate('/client/securite/scan')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="apple-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">In-progress audits</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Jobs are shown as provided by your backend.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/client/securite/scan')}
            className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            New scan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {inProgress.map((a) => (
          <div key={String(a?.id)} className="apple-card">
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{a?.target || 'Unknown target'}</div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Status: {String(a?.status || 'unknown')}</div>
            {a?.created_at ? (
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Created: {String(a.created_at)}</div>
            ) : null}
            {a?.started_at ? (
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Started: {String(a.started_at)}</div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
