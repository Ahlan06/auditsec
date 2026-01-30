import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { clientAudits } from '../services/clientApi';

const TERMINAL = new Set(['completed', 'completed_with_errors', 'failed']);

const toUiSeverity = (sev) => {
  const s = String(sev || 'info').toLowerCase();
  if (s === 'critical') return 'Critical';
  if (s === 'high') return 'High';
  if (s === 'medium') return 'Medium';
  if (s === 'low') return 'Low';
  return 'Info';
};

export function mapNucleiToUiFindings(auditResult) {
  const findings = auditResult?.nuclei?.findings || [];
  if (!Array.isArray(findings)) return [];

  return findings.map((f) => {
    const title = f.name || f.templateId || 'Nuclei finding';
    const location = f.matchedAt || f.host || auditResult?.target || '';
    return {
      key: `${f.templateId || 'tmpl'}:${String(location)}`,
      title,
      severity: toUiSeverity(f.severity),
      type: 'Nuclei',
      // Best-effort: we don't have a reliable OWASP mapping per template in this MVP.
      owasp: 'A09',
      location,
      evidence: f.description || f.templateId || '',
      raw: f,
    };
  });
}

export function useAuditRun({ pollIntervalMs = 1500 } = {}) {
  const [auditId, setAuditId] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);
  const [result, setResult] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  const startedAtRef = useRef(null);
  const timerRef = useRef(null);

  const isRunning = useMemo(() => {
    const s = String(status || '').toLowerCase();
    return s === 'queued' || s === 'running';
  }, [status]);

  const isTerminal = useMemo(() => TERMINAL.has(String(status || '').toLowerCase()), [status]);

  const progressPct = useMemo(() => {
    const s = String(status || '').toLowerCase();
    if (s === 'idle') return 0;
    if (s === 'queued') return 10;
    if (s === 'running') {
      const startedAt = startedAtRef.current;
      if (!startedAt) return 35;
      const elapsed = Date.now() - startedAt;
      // Smooth progress up to 92% while running; completion sets 100.
      return Math.min(92, 35 + Math.round(elapsed / 1000));
    }
    if (TERMINAL.has(s)) return 100;
    return 0;
  }, [status]);

  const stopPolling = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const pollOnce = useCallback(
    async (id) => {
      const s = await clientAudits.status(id);
      setStatus(s.status || 'idle');
      setSummary(s.summary || null);

      const lowered = String(s.status || '').toLowerCase();
      if (TERMINAL.has(lowered)) {
        stopPolling();
        const full = await clientAudits.get(id);
        // backend returns { ...row, result: parsed }
        setResult(full?.result || null);
      }

      if (lowered === 'failed') {
        setError(String(s.errorText || 'Audit failed.'));
      }
    },
    [stopPolling]
  );

  const startPolling = useCallback(
    (id) => {
      stopPolling();
      timerRef.current = window.setInterval(() => {
        pollOnce(id).catch((e) => {
          setError(String(e?.response?.data?.message || e?.message || 'Polling failed'));
        });
      }, pollIntervalMs);
    },
    [pollIntervalMs, pollOnce, stopPolling]
  );

  const start = useCallback(
    async ({ target, mode } = {}) => {
      setError('');
      setResult(null);
      setSummary(null);
      setJobId(null);
      setAuditId(null);
      setIsPaused(false);

      const created = await clientAudits.create(target, mode);
      const id = created?.id ?? created?.audit_id;
      if (!id) throw new Error('Audit id missing from create() response');

      setAuditId(id);
      startedAtRef.current = Date.now();
      setStatus('queued');

      const runResp = await clientAudits.run(id);
      setJobId(runResp?.jobId || null);

      // initial poll immediately
      await pollOnce(id);

      startPolling(id);

      return { auditId: id, jobId: runResp?.jobId || null };
    },
    [pollOnce, startPolling]
  );

  const pause = useCallback(() => {
    setIsPaused(true);
    stopPolling();
  }, [stopPolling]);

  const resume = useCallback(() => {
    setIsPaused(false);
    if (auditId && !TERMINAL.has(String(status || '').toLowerCase())) {
      startPolling(auditId);
    }
  }, [auditId, startPolling, status]);

  const reset = useCallback(() => {
    stopPolling();
    setAuditId(null);
    setJobId(null);
    setStatus('idle');
    setError('');
    setSummary(null);
    setResult(null);
    setIsPaused(false);
    startedAtRef.current = null;
  }, [stopPolling]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const uiFindings = useMemo(() => mapNucleiToUiFindings(result), [result]);

  return {
    auditId,
    jobId,
    status,
    isRunning,
    isTerminal,
    isPaused,
    progressPct,
    summary,
    result,
    uiFindings,
    error,
    start,
    pause,
    resume,
    reset,
  };
}
