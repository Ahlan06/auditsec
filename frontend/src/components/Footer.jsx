import { Link } from 'react-router-dom';
import { Shield, Mail, Github, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Products',
      links: [
        { name: 'Pentest Tools', href: '/products?category=pentest' },
        { name: 'OSINT Suites', href: '/products?category=osint' },
        { name: 'Security Guides', href: '/products?category=guides' },
        { name: 'Video Training', href: '/products?category=videos' },
      ]
    },
    {
      title: 'Services',
      links: [
        { name: 'Pentest Web', href: '/services#pentest-web' },
        { name: 'OSINT / Détection', href: '/services#osint' },
        { name: 'Audit Réseau', href: '/services#audit-reseau' },
        { name: 'Nos Packs', href: '/services#packs' },
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Documentation', href: '/docs' },
        { name: 'Contact Support', href: '/contact' },
        { name: 'FAQ', href: '/faq' },
        { name: 'Download Issues', href: '/support' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Usage Policy', href: '/usage' },
        { name: 'GDPR Compliance', href: '/gdpr' },
      ]
    }
  ];

  return (
    <footer className="bg-cyber-gray border-t border-cyber-green/30 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Shield className="w-8 h-8 text-cyber-green animate-pulse" />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-cyber-green">AuditSec</span>
                <span className="text-xs text-cyber-green/70 -mt-1">SHOP</span>
              </div>
            </Link>
            
            <p className="text-gray-400 text-sm mb-4 font-mono">
              Empowering ethical hackers with premium digital tools and resources 
              for legitimate security testing.
            </p>

            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-cyber-green transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-cyber-blue transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="mailto:ahlan.mira@icloud.com"
                className="text-gray-400 hover:text-cyber-accent transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-cyber-green font-bold mb-4 font-mono uppercase tracking-wider">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-cyber-green transition-colors text-sm font-mono"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Security Notice */}
        <div className="mt-12 pt-8 border-t border-cyber-border">
          <div className="bg-cyber-dark border border-cyber-accent/30 rounded p-4 mb-6">
            <h4 className="text-cyber-accent font-bold mb-2 font-mono">
              ⚠️ SECURITY & LEGAL NOTICE
            </h4>
            <p className="text-gray-400 text-sm font-mono leading-relaxed">
              All products sold on AuditSec are intended for <strong className="text-cyber-green">legal</strong> and 
              <strong className="text-cyber-green"> ethical</strong> security testing purposes only. 
              Users are responsible for compliance with all applicable laws and regulations. 
              Unauthorized use of these tools may violate local, state, and federal laws.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-cyber-border">
          <div className="text-gray-400 text-sm font-mono mb-4 md:mb-0">
            © {currentYear} AuditSec. All rights reserved.
          </div>
          
          <div className="flex items-center space-x-6 text-sm font-mono">
            <span className="text-gray-400">
              Secured by <span className="text-cyber-green">256-bit SSL</span>
            </span>
            <span className="text-gray-400">
              Powered by <span className="text-cyber-blue">Stripe</span>
            </span>
          </div>
        </div>

        {/* Terminal-style signature */}
        <div className="mt-6 text-center">
          <p className="text-cyber-green text-xs font-mono opacity-60">
            <span className="animate-pulse">{'>'}</span> 
            {' '}Happy ethical hacking! 
            <span className="animate-pulse">{'_'}</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;