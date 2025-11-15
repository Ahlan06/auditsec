import { Link } from 'react-router-dom';
import { Shield, Lock, Code, ArrowRight, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import TerminalMac from '../components/TerminalMac';

const HomePage = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const terminalCommands = [
    'Initiating secure connection...',
    'Loading AuditSec services...',
    'Professional cybersecurity services available ✓',
    'Explore services now →'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="hero-section fade-in">
        <div className="max-w-6xl mx-auto px-4">
          <div className="inline-block mb-6 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Premium Cybersecurity Services</span>
          </div>
          
          <h1 className="hero-title mb-6 fade-in-up" style={{ animationDelay: '0.1s' }}>
            AuditSec
          </h1>
          
          <p className="hero-subtitle mb-8 fade-in-up" style={{ animationDelay: '0.2s', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Professional security auditing and pentesting services for ethical hackers and security researchers
          </p>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-12 fade-in-up" style={{ animationDelay: '0.25s' }}>
            by Ahlan Mira
          </p>

          <div className="cta-section fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/services">
              <button className="apple-button clickable flex items-center gap-2">
                View Services
                <ArrowRight size={18} />
              </button>
            </Link>
            <Link to="/contact">
              <button className="apple-button-secondary clickable">
                Contact Us
              </button>
            </Link>
          </div>
        </div>
      </section>

      <div className="spacer"></div>

      {/* Terminal Demo Section */}
      <section className="apple-section fade-in-up" style={{ opacity: scrollY > 100 ? 1 : 0, transition: 'opacity 0.6s' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title text-center mb-16">
            Built for <span className="gradient-text">Professionals</span>
          </h2>
          
          <div className="scale-in">
            <TerminalMac 
              commands={terminalCommands}
              title="auditsec — bash"
              autoPlay={scrollY > 100}
            />
          </div>
        </div>
      </section>

      <div className="spacer"></div>

      {/* Features Section */}
      <section className="apple-section bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-title text-center mb-20">
            Everything you need
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="apple-card fade-in-up text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="card-title mb-4">OSINT Tools</h3>
              <p className="text-gray-600 leading-relaxed">
                Professional reconnaissance and intelligence gathering tools for comprehensive security assessments
              </p>
            </div>

            {/* Feature 2 */}
            <div className="apple-card fade-in-up text-center" style={{ animationDelay: '0.1s' }}>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-6">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h3 className="card-title mb-4">Pentest Kits</h3>
              <p className="text-gray-600 leading-relaxed">
                Complete penetration testing suites with cutting-edge methodologies and tools
              </p>
            </div>

            {/* Feature 3 */}
            <div className="apple-card fade-in-up text-center" style={{ animationDelay: '0.2s' }}>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl mb-6">
                <Code className="w-8 h-8 text-white" />
              </div>
              <h3 className="card-title mb-4">Expert Guides</h3>
              <p className="text-gray-600 leading-relaxed">
                Comprehensive documentation and training materials from industry experts
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="spacer"></div>

      {/* CTA Section */}
      <section className="apple-section text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="section-title mb-8">
            Ready to elevate your security game?
          </h2>
          <p className="hero-subtitle mb-12">
            Join hundreds of security professionals who trust AuditSec
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle size={20} className="text-green-500" />
              <span>Instant delivery</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle size={20} className="text-green-500" />
              <span>Secure payment</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle size={20} className="text-green-500" />
              <span>Expert support</span>
            </div>
          </div>

          <Link to="/services">
            <button className="apple-button clickable">
              Explore Services
            </button>
          </Link>
        </div>
      </section>

      <div className="spacer"></div>
    </div>
  );
};

export default HomePage;