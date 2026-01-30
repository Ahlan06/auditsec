import { useEffect, useMemo, useRef, useState } from 'react';

export type RealTimeScanMonitorProps = {
  title?: string;
  status: 'idle' | 'running' | 'paused' | 'completed';
  progress: number; // 0..100
  findingsCount: number;
  etaSeconds?: number;
  intensity?: 'Light' | 'Medium' | 'Aggressive';
  simulateResources?: boolean;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function fmtEta(seconds?: number) {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds)) return '—';
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m <= 0) return `${r}s`;
  return `${m}m ${String(r).padStart(2, '0')}s`;
}

function statusPill(status: RealTimeScanMonitorProps['status']) {
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border ';
  if (status === 'running') return base + 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20';
  if (status === 'paused') return base + 'bg-yellow-500/10 text-yellow-800 dark:text-yellow-300 border-yellow-500/20';
  if (status === 'completed') return base + 'bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20';
  return base + 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20';
}

export default function RealTimeScanMonitor({
  title = 'Real-time scan monitor',
  status,
  progress,
  findingsCount,
  etaSeconds,
  intensity = 'Medium',
  simulateResources = true,
}: RealTimeScanMonitorProps) {
  const [cpuPct, setCpuPct] = useState(0);
  const [memPct, setMemPct] = useState(0);
  const tickRef = useRef<number | null>(null);

  const p = clamp(progress, 0, 100);

  const targetCpu = useMemo(() => {
    const base = intensity === 'Aggressive' ? 72 : intensity === 'Light' ? 38 : 55;
    const swing = intensity === 'Aggressive' ? 18 : intensity === 'Light' ? 10 : 14;
    return clamp(base + (Math.random() * swing - swing / 2), 10, 95);
  }, [intensity, status]);

  const targetMem = useMemo(() => {
    const base = intensity === 'Aggressive' ? 68 : intensity === 'Light' ? 40 : 52;
    const swing = intensity === 'Aggressive' ? 14 : intensity === 'Light' ? 8 : 10;
    return clamp(base + (Math.random() * swing - swing / 2), 10, 90);
  }, [intensity, status]);

  useEffect(() => {
    if (!simulateResources) return;
    if (status !== 'running') {
      if (tickRef.current) window.clearInterval(tickRef.current);
      tickRef.current = null;
      return;
    }

    tickRef.current = window.setInterval(() => {
      setCpuPct((v) => clamp(v + (targetCpu - v) * 0.25, 0, 100));
      setMemPct((v) => clamp(v + (targetMem - v) * 0.2, 0, 100));
    }, 800);

    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
      tickRef.current = null;
    };
  }, [simulateResources, status, targetCpu, targetMem]);

  return (
    <div className="apple-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Live progress, findings counter, and resource usage.</div>
        </div>
        <span className={statusPill(status)}>{status}</span>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Progress</span>
          <span>{p}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
          <div className="h-full bg-blue-600" style={{ width: `${p}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Estimated completion</span>
          <span>{fmtEta(etaSeconds)}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">Findings</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{findingsCount}</div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">Real-time counter</div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400">CPU</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{Math.round(cpuPct)}%</div>
          </div>
          <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
            <div className="h-full bg-purple-600" style={{ width: `${clamp(cpuPct, 0, 100)}%` }} />
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">Resource usage</div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500 dark:text-gray-400">Memory</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{Math.round(memPct)}%</div>
          </div>
          <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
            <div className="h-full bg-green-600" style={{ width: `${clamp(memPct, 0, 100)}%` }} />
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">Resource usage</div>
        </div>
      </div>
    </div>
  );
}
