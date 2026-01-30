import { useMemo } from 'react';

export type ThreatItem = {
  id: string;
  kind: 'CVE' | 'News';
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  source: string;
  summary: string;
  recommendedActions: string[];
  affected?: string[];
  publishedAt: string;
};

export type ThreatIntelligenceFeedProps = {
  title?: string;
  items?: ThreatItem[];
};

function pill(sev: ThreatItem['severity']) {
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border ';
  if (sev === 'Critical') return base + 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20';
  if (sev === 'High') return base + 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20';
  if (sev === 'Medium') return base + 'bg-yellow-500/10 text-yellow-800 dark:text-yellow-300 border-yellow-500/20';
  return base + 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20';
}

const defaultItems: ThreatItem[] = [
  {
    id: 'cve-2025-0001',
    kind: 'CVE',
    title: 'CVE-2025-0001: Auth bypass in popular OAuth middleware',
    severity: 'Critical',
    source: 'CVE Feed',
    publishedAt: '2025-12-15',
    summary: 'Improper token validation can allow authentication bypass under specific proxy configurations.',
    affected: ['Node.js', 'Express', 'OAuth middleware'],
    recommendedActions: ['Upgrade to patched version', 'Add explicit issuer/audience checks', 'Verify proxy header handling'],
  },
  {
    id: 'cve-2025-0188',
    kind: 'CVE',
    title: 'CVE-2025-0188: Prototype pollution in request parser',
    severity: 'High',
    source: 'CVE Feed',
    publishedAt: '2025-12-10',
    summary: 'Certain payload shapes can mutate object prototypes, enabling downstream logic manipulation.',
    affected: ['Node.js', 'HTTP parsing'],
    recommendedActions: ['Upgrade dependency', 'Harden input validation', 'Add regression tests for malicious payloads'],
  },
  {
    id: 'news-1',
    kind: 'News',
    title: 'Industry: Rise in credential stuffing targeting SaaS login pages',
    severity: 'Medium',
    source: 'Security News',
    publishedAt: '2025-12-18',
    summary: 'Attackers increasingly automate login attempts; rate limiting and MFA adoption are the key mitigations.',
    recommendedActions: ['Enforce MFA', 'Add bot mitigation', 'Enable adaptive rate limiting & lockouts'],
  },
  {
    id: 'news-2',
    kind: 'News',
    title: 'Guidance: Logging + monitoring requirements tightened for audits',
    severity: 'Low',
    source: 'Security News',
    publishedAt: '2025-12-12',
    summary: 'Organizations are expected to retain security logs and prove detection coverage for key events.',
    recommendedActions: ['Centralize logs', 'Define alerting rules', 'Run periodic detection drills'],
  },
];

export default function ThreatIntelligenceFeed({ title = 'Threat intelligence feed', items }: ThreatIntelligenceFeedProps) {
  const list = useMemo(() => (items && items.length ? items : defaultItems), [items]);

  return (
    <div className="apple-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">CVEs affecting similar stacks, industry news, and recommended actions.</div>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">{list.length} items</span>
      </div>

      <div className="mt-4 space-y-3">
        {list.map((t) => (
          <div key={t.id} className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t.kind}</span>
                  <span className={pill(t.severity)}>{t.severity}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{t.publishedAt}</span>
                </div>
                <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{t.title}</div>
                <div className="mt-2 text-sm text-gray-700 dark:text-gray-200">{t.summary}</div>
                {t.affected && t.affected.length ? (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">Affected: {t.affected.join(', ')}</div>
                ) : null}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{t.source}</div>
            </div>

            <div className="mt-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-3">
              <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">Recommended actions</div>
              <ul className="mt-2 space-y-1">
                {t.recommendedActions.slice(0, 4).map((a) => (
                  <li key={a} className="text-xs text-gray-700 dark:text-gray-200">
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
