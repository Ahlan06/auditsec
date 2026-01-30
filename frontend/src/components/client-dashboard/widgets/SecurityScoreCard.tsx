import { useMemo } from 'react';
import SkeletonBlock from '../ui/SkeletonBlock';

export type OwaspBreakdownItem = {
  id: string; // e.g. A01
  label: string;
  score: number; // 0..100
};

export type SecurityScoreCardProps = {
  loading?: boolean;
  score: number; // 0..100
  trendDelta?: number; // +/- points vs last period
  breakdown: OwaspBreakdownItem[];
  industryBenchmark?: number; // 0..100
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function scoreTone(score: number) {
  if (score >= 85) return { pill: 'bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/20', bar: 'bg-green-600' };
  if (score >= 70) return { pill: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20', bar: 'bg-blue-600' };
  if (score >= 55) return { pill: 'bg-yellow-500/10 text-yellow-800 dark:text-yellow-300 border border-yellow-500/20', bar: 'bg-yellow-600' };
  return { pill: 'bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20', bar: 'bg-red-600' };
}

function Trend({ delta }: { delta: number }) {
  const up = delta >= 0;
  const text = `${up ? '↑' : '↓'} ${Math.abs(delta)} pts`;
  const cls = up
    ? 'bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/20'
    : 'bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20';
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{text}</span>;
}

export default function SecurityScoreCard({ loading = false, score, trendDelta = 0, breakdown, industryBenchmark = 78 }: SecurityScoreCardProps) {
  const safeScore = clamp(score, 0, 100);
  const tone = scoreTone(safeScore);

  const benchmarkDelta = useMemo(() => safeScore - clamp(industryBenchmark, 0, 100), [safeScore, industryBenchmark]);
  const benchmarkText = benchmarkDelta >= 0 ? `+${benchmarkDelta} vs industry` : `${benchmarkDelta} vs industry`;

  return (
    <div className="apple-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Security score</div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Global score with OWASP breakdown and benchmark.</div>
        </div>
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${tone.pill}`}>0–100</span>
      </div>

      {loading ? (
        <div className="mt-4 space-y-3">
          <SkeletonBlock className="h-7 w-24" />
          <SkeletonBlock className="h-2 w-full rounded-full" />
          <div className="grid grid-cols-2 gap-2">
            <SkeletonBlock className="h-10 w-full" />
            <SkeletonBlock className="h-10 w-full" />
          </div>
          <SkeletonBlock className="h-24 w-full" />
        </div>
      ) : (
        <>
          <div className="mt-4 flex items-end justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">{safeScore}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">/100</span>
            </div>
            <div className="flex items-center gap-2">
              <Trend delta={trendDelta} />
              <span className="text-xs text-gray-500 dark:text-gray-400">{benchmarkText}</span>
            </div>
          </div>

          <div className="mt-3 h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
            <div className={`h-full ${tone.bar}`} style={{ width: `${safeScore}%` }} />
          </div>

          <div className="mt-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">OWASP breakdown</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Category scores</div>
            </div>
            <div className="mt-3 space-y-3">
              {breakdown.map((b) => {
                const v = clamp(b.score, 0, 100);
                const t = scoreTone(v);
                return (
                  <div key={b.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-700 dark:text-gray-200">{b.label}</span>
                      <span className="text-gray-500 dark:text-gray-400">{v}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                      <div className={`h-full ${t.bar}`} style={{ width: `${v}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Industry benchmark</div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Avg: {clamp(industryBenchmark, 0, 100)}</span>
            </div>
            <div className="mt-3 space-y-2">
              <div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>You</span>
                  <span>{safeScore}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                  <div className={`h-full ${tone.bar}`} style={{ width: `${safeScore}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Industry</span>
                  <span>{clamp(industryBenchmark, 0, 100)}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                  <div className="h-full bg-gray-500" style={{ width: `${clamp(industryBenchmark, 0, 100)}%` }} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
