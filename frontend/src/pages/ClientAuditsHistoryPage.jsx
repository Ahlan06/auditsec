import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientAudits } from '../services/clientApi';
import { EmptyState, ErrorState, WidgetSkeleton } from '../components/client-dashboard/ui';
import { apiErrorMessage, classifyApiError } from '../utils/apiError';

const isCompletedStatus = (status) => {
  const s = String(status || '').toLowerCase();
  return s === 'completed' || s === 'done' || s === 'finished';
};

export default function ClientAuditsHistoryPage() {
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

  const completed = useMemo(() => (audits || []).filter((a) => isCompletedStatus(a?.status)), [audits]);

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
        title="Couldn’t load audit history"
        details={apiErrorMessage(error, 'Failed to load audit history')}
        onRetry={load}
      />
    );
  }

  if (!completed.length) {
    return (
      <div className="apple-card">
        <EmptyState
          title="No audit history"
          description="Completed audits will appear here once your scanner provider is configured and runs finish."
          actionLabel="Go to scan"
          onAction={() => navigate('/client/securite/scan')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="apple-card">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100">Audit history</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Only completed audits from the backend are shown.</p>
        </div>
      </div>

      <div className="apple-card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
              <th className="px-4 py-3 font-medium">Target</th>
              <th className="px-4 py-3 font-medium">Finished</th>
              <th className="px-4 py-3 font-medium">Findings</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {completed.map((a) => {
              const findings = a?.result?.findings;
              const findingsCount = Array.isArray(findings) ? findings.length : 0;
              return (
                <tr key={String(a?.id)} className="border-t border-gray-200 dark:border-white/10">
                  <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{a?.target || 'Unknown'}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{String(a?.finished_at || '')}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{findingsCount}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{String(a?.status || '')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
