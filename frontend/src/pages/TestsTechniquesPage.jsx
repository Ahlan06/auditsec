import { Link } from 'react-router-dom';

const TestsTechniquesPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-black pt-24 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-3 text-gray-900 dark:text-gray-100">Technical Testing</h1>
          <p className="text-gray-600 dark:text-gray-400">A practical, methodical approach to evaluate the technical security of a site or application: principles, tools, and deliverables.</p>
        </header>

        <main>
          <section className="apple-card p-6 mb-6 flex flex-col md:flex-row items-start gap-6">
            <img src="/tests-techniques.svg" alt="Testing illustration" className="w-36 h-36 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold mb-2">1 — Penetration Testing (OWASP)</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-3">Focus on common application vulnerabilities (OWASP Top 10): injection, authentication, access control, XSS, CSRF, etc.</p>
              <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-2">
                <li><strong>Approach:</strong> combine automated scanning with manual analysis (Burp Suite, Repeater).</li>
                <li><strong>Goals:</strong> reproduce relevant attack scenarios and document PoCs.</li>
                <li><strong>Deliverable:</strong> vulnerability descriptions, associated risk, and technical recommendations.</li>
              </ul>
            </div>
          </section>

          <section className="apple-card p-6 mb-6 flex flex-col md:flex-row items-start gap-6">
            <img src="/tests-techniques.svg" alt="Scanning illustration" className="w-36 h-36 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold mb-2">2 — Scanning & Enumeration</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-3">Identify exposed services, versions, and risky configurations with tools like Nmap, Nikto, and vulnerability scanners.</p>
              <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-2">
                <li><strong>Actions:</strong> port discovery, version detection, fingerprinting, and configuration tests.</li>
                <li><strong>Goals:</strong> reduce attack surface and target manual testing.</li>
                <li><strong>Deliverable:</strong> technical inventory and prioritized test list.</li>
              </ul>
            </div>
          </section>

          <section className="apple-card p-6 mb-6 flex flex-col md:flex-row items-start gap-6">
            <img src="/tests-techniques.svg" alt="Exploitation illustration" className="w-36 h-36 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold mb-2">3 — Exploitation & PoC</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-3">Controlled exploitation to validate real impact and create actionable technical proof for remediation.</p>
              <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400 space-y-2">
                <li><strong>Method:</strong> controlled exploits, PoC scripts, and testing in a safe environment.</li>
                <li><strong>Safety:</strong> follow rules of engagement, avoid destructive actions.</li>
                <li><strong>Deliverable:</strong> detailed PoC, reproduction steps, and fix recommendations.</li>
              </ul>
            </div>
          </section>

          <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
            <p>Would you like these sections converted into a printable checklist or a technical testing report template?</p>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <Link to="/guides" className="apple-button px-4 py-2">Back to Guides</Link>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TestsTechniquesPage;
