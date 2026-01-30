import { Link } from 'react-router-dom';
import { Shield, Lock, Code, ArrowRight, CheckCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import TerminalMac from '../components/TerminalMac';
import useThemeStore from '../store/themeStore';

const HomePage = () => {
  const [scrollY, setScrollY] = useState(0);
  const { isDarkMode } = useThemeStore();
  const [visitorInfo, setVisitorInfo] = useState({
    ip: null,
    latitude: null,
    longitude: null,
    country: null,
    timezone: null,
    localTime: null,
    poste: null,
  });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const getBrowserLabel = () => {
      const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
      if (/edg\//i.test(ua)) {
        const m = ua.match(/edg\/(\d+)/i);
        return m?.[1] ? `Edge ${m[1]}` : 'Edge';
      }
      if (/chrome\//i.test(ua) && !/edg\//i.test(ua)) {
        const m = ua.match(/chrome\/(\d+)/i);
        return m?.[1] ? `Chrome ${m[1]}` : 'Chrome';
      }
      if (/firefox\//i.test(ua)) {
        const m = ua.match(/firefox\/(\d+)/i);
        return m?.[1] ? `Firefox ${m[1]}` : 'Firefox';
      }
      // Safari usually has Version/x.y
      if (/safari\//i.test(ua) && !/chrome\//i.test(ua)) {
        const m = ua.match(/version\/(\d+)/i);
        return m?.[1] ? `Safari ${m[1]}` : 'Safari';
      }
      return 'Unknown browser';
    };

    const getPlatformLabel = () => {
      const nav = typeof navigator !== 'undefined' ? navigator : null;
      const platform = nav?.userAgentData?.platform || nav?.platform || '';
      if (platform) return platform;
      const ua = nav?.userAgent || '';
      if (/windows/i.test(ua)) return 'Windows';
      if (/mac os/i.test(ua)) return 'macOS';
      if (/android/i.test(ua)) return 'Android';
      if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
      if (/linux/i.test(ua)) return 'Linux';
      return 'Unknown OS';
    };

    const fetchVisitorInfo = async () => {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || null;
      const poste = `${getPlatformLabel()} / ${getBrowserLabel()}`;

      try {
        const res = await fetch('https://ipwho.is/?output=json', {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });
        const json = await res.json();

        const ip = json?.ip || null;
        const latitude = typeof json?.latitude === 'number' ? json.latitude : null;
        const longitude = typeof json?.longitude === 'number' ? json.longitude : null;
        const country = json?.country || null;
        const timezone = tz || json?.timezone?.id || null;
        const localTime = new Date().toLocaleString('fr-FR', {
          timeZone: timezone || undefined,
          hour12: false,
        });

        if (!isCancelled) {
          setVisitorInfo({ ip, latitude, longitude, country, timezone, localTime, poste });
        }
      } catch {
        const localTime = new Date().toLocaleString('fr-FR', {
          timeZone: tz || undefined,
          hour12: false,
        });
        if (!isCancelled) {
          setVisitorInfo({
            ip: null,
            latitude: null,
            longitude: null,
            country: null,
            timezone: tz,
            localTime,
            poste,
          });
        }
      }
    };

    fetchVisitorInfo();

    return () => {
      isCancelled = true;
    };
  }, []);

  const terminalCommands = useMemo(() => {
    const rawIp = visitorInfo.ip;
    const ip = rawIp ? String(rawIp).trim() : 'resolving…';
    const latitude = typeof visitorInfo.latitude === 'number' ? visitorInfo.latitude.toFixed(6) : 'unknown';
    const longitude = typeof visitorInfo.longitude === 'number' ? visitorInfo.longitude.toFixed(6) : 'unknown';
    const country = visitorInfo.country || 'unknown';
    const timezone = visitorInfo.timezone || 'unknown';
    const localTime = visitorInfo.localTime || 'resolving…';
    const poste = String(visitorInfo.poste || 'unknown').replace(/undefined/g, '').replace(/\s+/g, ' ').trim();

    return [
      '#whoami\n' +
        `Public IP: ${ip}\n` +
        `Local time: ${localTime}\n` +
        `Timezone: ${timezone}\n` +
        `Location: ${latitude}, ${longitude}\n` +
        `Country: ${country}\n` +
        `Device: ${poste}`,
    ];
  }, [visitorInfo]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="hero-section fade-in">
        <div className="max-w-6xl mx-auto px-4">
          <div className="inline-block mb-6 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Premium Cybersecurity Services</span>
          </div>

          <div className="mb-3 flex justify-center">
            <img
              src={isDarkMode ? '/brand/auditsec-hero-a1 blanc.svg' : '/brand/auditsec-hero-a1.svg'}
              alt="AuditSec"
              className="w-48 h-48 sm:w-60 sm:h-60 md:w-80 md:h-80 lg:w-96 lg:h-96 opacity-90"
              loading="eager"
              decoding="async"
            />
          </div>
          
          <h1 className="hero-title mb-5 fade-in-up" style={{ animationDelay: '0.1s' }}>
            AuditSec
          </h1>
          
          <p className="hero-subtitle mb-8 fade-in-up" style={{ animationDelay: '0.2s', maxWidth: '600px', margin: '0 auto 2rem' }}>
            Artificial Intelligence auditing and pentesting services for ethical hackers and security researchers
          </p>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-12 fade-in-up" style={{ animationDelay: '0.25s' }}>
            by Ahlan Mira
          </p>

          <div className="cta-section fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/services">
              <button className="apple-button hero-cta clickable flex items-center gap-2">
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
            Built for <span className="gradient-text-cta">Professionals</span>
          </h2>
          
          <div className="scale-in">
            <TerminalMac 
              commands={terminalCommands}
              title="auditsec — bash"
              autoPlay={scrollY > 100}
              showLeadingPrompt={false}
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
              <h3 className="card-title mb-4">Assistant IA</h3>
              <p className="text-gray-600 leading-relaxed">
                AI is available to scan, measure the risk of incidents, and help you make the right decisions.
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