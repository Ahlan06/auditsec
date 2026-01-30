import { useMemo } from 'react';

const PRIORITY_COLORS = {
  P0: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800' },
  P1: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' },
  P2: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-800' },
  P3: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
};

export default function AuditAiAnalysis({ analysis }) {
  const meta = analysis?.meta || {};
  const riskSummary = analysis?.riskSummary || {};
  const issues = analysis?.issues || [];
  const devNotes = analysis?.developerNotes || {};

  const confidenceLabel = useMemo(() => {
    const c = (meta.confidence || 'unknown').toLowerCase();
    if (c === 'high') return { label: 'Haute', color: 'text-green-600 dark:text-green-400' };
    if (c === 'medium') return { label: 'Moyenne', color: 'text-yellow-600 dark:text-yellow-400' };
    if (c === 'low') return { label: 'Faible', color: 'text-red-600 dark:text-red-400' };
    return { label: 'Inconnue', color: 'text-gray-500 dark:text-gray-400' };
  }, [meta.confidence]);

  const overallPriorityColors = useMemo(() => {
    return PRIORITY_COLORS[riskSummary.overallPriority] || PRIORITY_COLORS.P3;
  }, [riskSummary.overallPriority]);

  if (!analysis) {
    return (
      <div className="apple-card">
        <div className="text-sm text-gray-500 dark:text-gray-400">Analyse IA non disponible.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header: Risk Summary */}
      <div className="apple-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Analyse AppSec (IA)</h2>
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Cible: <span className="font-mono text-xs">{meta.target || 'unknown'}</span>
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Confiance: <span className={confidenceLabel.color}>{confidenceLabel.label}</span>
            </div>
          </div>
          <div className={`rounded-xl border px-4 py-2 ${overallPriorityColors.border} ${overallPriorityColors.bg}`}>
            <div className="text-xs text-gray-600 dark:text-gray-400">Priorité globale</div>
            <div className={`text-2xl font-bold ${overallPriorityColors.text}`}>{riskSummary.overallPriority || 'P3'}</div>
          </div>
        </div>

        {/* Priority counts */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {['P0', 'P1', 'P2', 'P3'].map((p) => {
            const count = riskSummary.countsByPriority?.[p] || 0;
            const colors = PRIORITY_COLORS[p];
            return (
              <div key={p} className={`rounded-lg border px-3 py-2 ${colors.border} ${colors.bg}`}>
                <div className="text-xs text-gray-600 dark:text-gray-400">{p}</div>
                <div className={`text-lg font-semibold ${colors.text}`}>{count}</div>
              </div>
            );
          })}
        </div>

        {/* Data limitations */}
        {meta.dataLimitations && meta.dataLimitations.length > 0 ? (
          <div className="mt-4 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2">
            <div className="text-xs font-medium text-yellow-800 dark:text-yellow-300">Limitations des données :</div>
            <ul className="mt-1 space-y-1 text-xs text-yellow-700 dark:text-yellow-400">
              {meta.dataLimitations.map((lim, idx) => (
                <li key={idx}>• {lim}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {/* Issues List */}
      {issues.length > 0 ? (
        <div className="space-y-3">
          {issues.map((issue, idx) => {
            const colors = PRIORITY_COLORS[issue.priority] || PRIORITY_COLORS.P3;
            return (
              <div key={idx} className={`apple-card border ${colors.border}`}>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`rounded px-2 py-0.5 text-xs font-semibold ${colors.bg} ${colors.text}`}>
                        {issue.priority}
                      </span>
                      {issue.category?.owasp?.id ? (
                        <span className="rounded bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs text-gray-700 dark:text-gray-300">
                          {issue.category.owasp.id}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-2 text-base font-semibold text-gray-900 dark:text-gray-100">{issue.title}</h3>
                    {issue.category?.owasp?.name ? (
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{issue.category.owasp.name}</div>
                    ) : null}
                  </div>
                </div>

                {/* Evidence */}
                <div className="mt-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-3 py-2">
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Preuves ({issue.evidence?.source})</div>
                  <div className="mt-1 text-sm text-gray-900 dark:text-gray-100">{issue.evidence?.details}</div>
                  {issue.evidence?.observations && issue.evidence.observations.length > 0 ? (
                    <ul className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-300">
                      {issue.evidence.observations.map((obs, i) => (
                        <li key={i} className="font-mono">
                          • {obs}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                {/* Impact */}
                <div className="mt-3">
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Impact</div>
                  <div className="mt-1 text-sm text-gray-900 dark:text-gray-100">{issue.impact?.whatCanHappen}</div>
                  {issue.impact?.whoIsAffected ? (
                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">Affecté: {issue.impact.whoIsAffected}</div>
                  ) : null}
                </div>

                {/* Recommendations */}
                <div className="mt-3">
                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Correctifs</div>
                  <div className="mt-2 space-y-2">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Quick fix:</div>
                      <div className="text-sm text-gray-900 dark:text-gray-100">{issue.recommendations?.quickFix}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Durable fix:</div>
                      <div className="text-sm text-gray-900 dark:text-gray-100">{issue.recommendations?.durableFix}</div>
                    </div>
                  </div>
                  {issue.recommendations?.verificationSteps && issue.recommendations.verificationSteps.length > 0 ? (
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Vérification:</div>
                      <ul className="mt-1 space-y-1 text-xs text-gray-600 dark:text-gray-300">
                        {issue.recommendations.verificationSteps.map((step, i) => (
                          <li key={i}>• {step}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>

                {/* References */}
                {issue.references && issue.references.length > 0 ? (
                  <div className="mt-3">
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Références</div>
                    <ul className="mt-1 space-y-1">
                      {issue.references.map((ref, i) => (
                        <li key={i}>
                          <a
                            href={ref.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {ref.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="apple-card">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">Aucune vulnérabilité détectée.</div>
        </div>
      )}

      {/* Developer notes */}
      {(devNotes.safeAssumptions?.length > 0 || devNotes.unknowns?.length > 0) ? (
        <div className="apple-card">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notes développeur</h3>
          {devNotes.safeAssumptions?.length > 0 ? (
            <div className="mt-2">
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Hypothèses vérifiées :</div>
              <ul className="mt-1 space-y-1 text-xs text-gray-600 dark:text-gray-300">
                {devNotes.safeAssumptions.map((a, i) => (
                  <li key={i}>• {a}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {devNotes.unknowns?.length > 0 ? (
            <div className="mt-3">
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Non déterminé :</div>
              <ul className="mt-1 space-y-1 text-xs text-gray-600 dark:text-gray-300">
                {devNotes.unknowns.map((u, i) => (
                  <li key={i}>• {u}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
