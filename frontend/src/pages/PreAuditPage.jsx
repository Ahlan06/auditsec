import { Link } from 'react-router-dom';

const PreAuditPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-black pt-24 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-3 text-gray-900 dark:text-gray-100">Pré-audit & Reconnaissance</h1>
          <p className="text-gray-600 dark:text-gray-400">Préparer un audit, c'est d'abord comprendre le périmètre. Voici en trois étapes claires et pratiques comment je procède pour la reconnaissance, la cartographie et l'archivage des preuves.</p>
        </header>

        <main>
          <section className="apple-card p-6 mb-6 flex flex-col md:flex-row items-start gap-6">
            <img src="/preaudit-osint.svg" alt="Illustration OSINT" className="w-36 h-36 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold mb-2">1 — Reconnaissance OSINT</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-3">Collecte d'indices publics pour dresser une première carte d'attaque : noms de domaine, sous-domaines, services exposés et traces publiques (réseaux sociaux, archives, dépôts publics).</p>
              <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-2">
                <li><strong>Outils:</strong> Google dorking, crt.sh, VirusTotal, Shodan, Sublist3r, Amass.</li>
                <li><strong>Objectifs:</strong> repérer la surface exposée, technologies et points d'entrée potentiels.</li>
                <li><strong>Livrable:</strong> liste priorisée de domaines/sous-domaines et captures d'éléments pertinents.</li>
              </ul>
            </div>
          </section>

          <section className="apple-card p-6 mb-6 flex flex-col md:flex-row items-start gap-6">
            <img src="/preaudit-mapping.svg" alt="Illustration cartographie" className="w-36 h-36 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold mb-2">2 — Cartographie & Scoping</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-3">Nous transformons les découvertes initiales en un plan clair : quels actifs tester, quelles priorités, et ce qui est hors périmètre. Cette étape fixe les règles de sécurité et les attentes.</p>
              <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-2">
                <li><strong>Actions:</strong> inventorier applications, API, services et flux réseau.</li>
                <li><strong>Décisions:</strong> priorisation selon impact business et risques potentiels.</li>
                <li><strong>Règles d'engagement:</strong> autorisation écrite, fenêtres de test et limites techniques.</li>
              </ul>
            </div>
          </section>

          <section className="apple-card p-6 mb-6 flex flex-col md:flex-row items-start gap-6">
            <img src="/preaudit-evidence.svg" alt="Illustration preuves" className="w-36 h-36 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold mb-2">3 — Collecte de preuves</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-3">Capturer des éléments exploitables et vérifiables pour le rapport et la remédiation : captures, logs et PoC bien horodatés et structurés.</p>
              <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-2">
                <li><strong>Que conserver:</strong> captures d'écran, requêtes HTTP, logs, PoC et notes méthodologiques.</li>
                <li><strong>Comment:</strong> stockage chiffré, métadonnées (timestamp, cible, contexte) et dossier de preuve organisé.</li>
                <li><strong>Livrable:</strong> pack de preuves prêt pour revue interne et inclusion dans le rapport final.</li>
              </ul>
            </div>
          </section>

          <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
            <p>Si vous voulez, je peux transformer ces étapes en checklist téléchargeable ou en template de rapport.</p>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <Link to="/guides" className="apple-button px-4 py-2">Retour aux guides</Link>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PreAuditPage;
