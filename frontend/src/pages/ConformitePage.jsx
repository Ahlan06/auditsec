import { Link } from 'react-router-dom';

const ConformitePage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-black pt-24 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-3 text-gray-900 dark:text-gray-100">Compliance & Standards</h1>
          <p className="text-gray-600 dark:text-gray-400">Alignment with ISO 27001, best practices, and regulatory requirements — how we translate technical findings into compliant controls and actions.</p>
        </header>

        <main>
          <section className="apple-card p-6 mb-6 flex flex-col md:flex-row items-start gap-6">
            <img src="/conformite.svg" alt="Compliance illustration" className="w-36 h-36 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold mb-2">ISO 27001 Mapping</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-3">We map every finding to the relevant ISO 27001 controls to help embed fixes in your Information Security Management System (ISMS).</p>
              <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-2">
                <li><strong>Deliverable:</strong> finding-to-ISO control matrix with prioritized recommendations.</li>
                <li><strong>Benefit:</strong> streamlines formal audits and evidence of compliance.</li>
              </ul>
            </div>
          </section>

          <section className="apple-card p-6 mb-6 flex flex-col md:flex-row items-start gap-6">
            <img src="/conformite.svg" alt="PCI-DSS illustration" className="w-36 h-36 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold mb-2">PCI-DSS & Privacy</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-3">Practical guidance to protect payment data and align with GDPR requirements where applicable.</p>
              <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-2">
                <li><strong>Focus:</strong> segmentation, logging, encryption of sensitive data.</li>
                <li><strong>Deliverable:</strong> technical recommendations and an action plan for compliance.</li>
              </ul>
            </div>
          </section>

          <section className="apple-card p-6 mb-6 flex flex-col md:flex-row items-start gap-6">
            <img src="/conformite.svg" alt="Reporting illustration" className="w-36 h-36 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold mb-2">Regulatory Reporting</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-3">Structured reports designed for decision-makers and to meet regulatory audit requirements.</p>
              <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-2">
                <li><strong>Types:</strong> executive summary, technical report, and evidence pack.</li>
                <li><strong>Goal:</strong> clarity, prioritization, and proof for remediation.</li>
              </ul>
            </div>
          </section>

          <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
            <p>I can export these mappings to Excel/CSV or generate a report template aligned with auditor expectations — tell me your preferred format.</p>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <Link to="/guides" className="apple-button px-4 py-2">Back to Guides</Link>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ConformitePage;
