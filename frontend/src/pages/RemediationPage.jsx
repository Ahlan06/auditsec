import { Link } from 'react-router-dom';

const RemediationPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-black pt-24 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-3 text-gray-900 dark:text-gray-100">Remédiation & Validation</h1>
          <p className="text-gray-600 dark:text-gray-400">Plan d'action, validation et monitoring post-correctif — comment nous transformons les constats en actions concrètes et vérifiables.</p>
        </header>

        <main>
          <section className="apple-card p-6 mb-6 flex flex-col md:flex-row items-start gap-6">
            <img src="/remediation.svg" alt="Illustration remédiation" className="w-36 h-36 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold mb-2">Plan de Remédiation</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-3">Priorisation des correctifs basée sur l'impact et le risque. Nous fournissons un plan actionnable avec mesures et ressources estimées.</p>
              <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-2">
                <li><strong>Priorisation:</strong> classification par risque et coût/effort.</li>
                <li><strong>Livrable:</strong> plan séquencé avec responsables et échéances.</li>
              </ul>
            </div>
          </section>

          <section className="apple-card p-6 mb-6 flex flex-col md:flex-row items-start gap-6">
            <img src="/remediation.svg" alt="Illustration retest" className="w-36 h-36 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold mb-2">Retests & Validation</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-3">Après chaque correction, nous réévaluons les points identifiés pour confirmer la fermeture des vulnérabilités.</p>
              <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-2">
                <li><strong>Processus:</strong> retests ciblés, vérification des PoC et confirmation documentaire.</li>
                <li><strong>Livrable:</strong> verdict par correctif et rapport de validation.</li>
              </ul>
            </div>
          </section>

          <section className="apple-card p-6 mb-6 flex flex-col md:flex-row items-start gap-6">
            <img src="/remediation.svg" alt="Illustration monitoring" className="w-36 h-36 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold mb-2">Monitoring Continu</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-3">Surveillance et alerting pour détecter régressions et nouvelles vulnérabilités — maintien du niveau de sécurité acquis.</p>
              <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-2">
                <li><strong>Mise en place:</strong> alertes, scans périodiques et intégration aux pipelines.</li>
                <li><strong>Livrable:</strong> rapports périodiques et actions recommandées.</li>
              </ul>
            </div>
          </section>

          <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
            <p>Je peux générer un plan de remédiation détaillé (CSV/Excel) ou un rapport de validation prêt à être partagé avec les équipes techniques.</p>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <Link to="/guides" className="apple-button px-4 py-2">Retour aux guides</Link>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RemediationPage;
