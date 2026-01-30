import { Link } from 'react-router-dom';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-black pt-24 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900 dark:text-gray-100">Terms and Conditions</h1>
        
        <div className="apple-card p-8 md:p-10 space-y-8">
          <p className="text-sm text-gray-600 dark:text-gray-400">Last updated: December 24, 2025</p>

          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              By accessing or using AuditSec's AI-powered cybersecurity platform (the "Service"), you agree to be bound by these Terms and Conditions. 
              If you disagree with any part of these terms, you may not access the Service.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              AuditSec provides an artificial intelligence-based security analysis platform designed for cybersecurity professionals, 
              penetration testers, and security researchers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Subscription Plans</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              AuditSec offers monthly and annual subscription plans. By subscribing, you agree to pay the fees associated with your chosen plan.
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Monthly subscriptions renew automatically each month</li>
              <li>Annual subscriptions renew automatically each year</li>
              <li>Pricing is subject to change with 30 days' notice</li>
              <li>You may cancel your subscription at any time</li>
              <li>Refunds are handled on a case-by-case basis within 14 days of initial purchase</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Acceptable Use</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Products are delivered via email download links after successful payment</li>
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Attempt to gain unauthorized access to any systems or networks</li>
              <li>Use the AI capabilities to perform security testing without proper authorization</li>
              <li>Share your account credentials with others</li>
              <li>Reverse engineer, decompile, or disassemble the Service</li>
              <li>Use the Service to harm, threaten, or harass any individual or organization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Ethical Hacking and Legal Compliance</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              AuditSec is designed for authorized security testing only. You acknowledge and agree that:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>You will only use the Service on systems you own or have explicit written permission to test</li>
              <li>You are solely responsible for ensuring compliance with all applicable laws and regulations</li>
              <li>You will obtain all necessary authorizations before conducting security assessments</li>
              <li>AuditSec is not responsible for any misuse of the platform or its AI capabilities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
            <p className="text-gray-700 dark:text-gray-300">
              The Service, including its AI models, algorithms, user interface, and all related intellectual property, 
              is owned by AuditSec. You are granted a limited, non-exclusive, non-transferable license to use the Service 
              solely for your internal business purposes in accordance with these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Data and Privacy</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Your use of the Service is also governed by our Privacy Policy. By using the Service, you acknowledge that:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Data you input into the AI system may be processed to improve service quality</li>
              <li>We implement industry-standard security measures to protect your data</li>
              <li>You retain ownership of any data you upload or generate using the Service</li>
              <li>We do not share your proprietary security findings with third parties</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Service Availability</h2>
            <p className="text-gray-700 dark:text-gray-300">
              While we strive to maintain 99.9% uptime, we do not guarantee uninterrupted access to the Service. 
              We reserve the right to modify, suspend, or discontinue the Service at any time with reasonable notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-700 dark:text-gray-300">
              To the maximum extent permitted by law, AuditSec shall not be liable for any indirect, incidental, special, 
              consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, 
              or any loss of data, use, goodwill, or other intangible losses resulting from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Indemnification</h2>
            <p className="text-gray-700 dark:text-gray-300">
              You agree to indemnify and hold harmless AuditSec and its officers, directors, employees, and agents from any 
              claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Service 
              or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
            <p className="text-gray-700 dark:text-gray-300">
              We reserve the right to terminate or suspend your account and access to the Service immediately, without prior 
              notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use 
              the Service will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
            <p className="text-gray-700 dark:text-gray-300">
              We reserve the right to modify these Terms at any time. We will provide notice of significant changes by 
              posting the new Terms on this page and updating the "Last updated" date. Your continued use of the Service 
              after such changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
            <p className="text-gray-700 dark:text-gray-300">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which 
              AuditSec operates, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
            <p className="text-gray-700 dark:text-gray-300">
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="text-gray-700 dark:text-gray-300 mt-3">
              Email: legal@auditsec.com<br />
              Support: contact@auditsec.com
            </p>
          </section>
        </div>

        <div className="text-center mt-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
