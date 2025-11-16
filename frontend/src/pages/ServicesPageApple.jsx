import { Shield, Search, Network, CheckCircle, Mail, Send } from 'lucide-react';
import { useTheme } from '../store/themeStore';

const ServicesPage = () => {
  const { isDarkMode } = useTheme();
  const services = [
    {
      id: 'pentest-web',
      icon: Shield,
      title: 'Web Penetration Testing',
      subtitle: 'Secure your web applications',
      description: 'Professional penetration testing to identify and fix critical vulnerabilities before attackers exploit them.',
      benefits: [
        'OWASP Top 10 vulnerability detection',
        'SQL injection and XSS testing',
        'Authentication and session analysis',
        'Detailed PDF report with evidence',
        'Prioritized remediation plan'
      ],
      price: '€99',
      duration: '2-3 days',
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      id: 'osint',
      icon: Search,
      title: 'OSINT / Leak Detection',
      subtitle: 'Monitor your digital footprint',
      description: 'Open-source intelligence gathering to detect exposed data and credentials on surface and dark web.',
      benefits: [
        'Dark web monitoring',
        'Exposed credentials detection',
        'Digital footprint analysis',
        'Risk assessment report',
        'Real-time alerts (optional)'
      ],
      price: '€49',
      duration: '1-2 days',
      gradient: 'from-green-500 to-teal-600'
    },
    {
      id: 'audit-reseau',
      icon: Network,
      title: 'Network Security Audit',
      subtitle: 'Strengthen your infrastructure',
      description: 'Comprehensive network audit to identify exposed services, misconfigurations, and critical vulnerabilities.',
      benefits: [
        'Port and service scanning',
        'Network configuration analysis',
        'Critical flaw detection',
        'Network mapping',
        'Hardening recommendations'
      ],
      price: '€149',
      duration: '3-4 days',
      gradient: 'from-orange-500 to-red-600'
    }
  ];

  const packs = [
    {
      id: 'starter',
      name: 'Starter Pack',
      description: 'Perfect for your first security assessment',
      features: [
        'Automated security scan',
        'Synthesis report (10-15 pages)',
        'Critical vulnerabilities identified',
        '48h email support'
      ],
      price: '€39',
      popular: false
    },
    {
      id: 'pro',
      name: 'Professional Pack',
      description: 'Complete security audit for growing businesses',
      features: [
        'Manual penetration testing',
        'Comprehensive report (30+ pages)',
        'Priority recommendations',
        'Follow-up consultation',
        '24h priority support'
      ],
      price: '€149',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise Pack',
      description: 'Full-scale security assessment for enterprises',
      features: [
        'Multi-target testing',
        'Executive summary included',
        'Compliance reporting',
        'Dedicated security consultant',
        'Annual retesting discount',
        '24/7 priority support'
      ],
      price: '€299',
      popular: false
    }
  ];

  const handleContactClick = (service) => {
    const subject = `Request for ${service}`;
    const body = `Hello,\n\nI'm interested in your ${service} service.\n\nPlease provide more information.\n\nThank you.`;
    window.location.href = `mailto:ahlan.mira@icloud.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero Section */}
      <section className="apple-section">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-gray-100 rounded-full">
            <span className="text-sm font-medium text-gray-600">Professional Security Services</span>
          </div>
          
          <h1 className="hero-title mb-6 fade-in">
            Cybersecurity Services
          </h1>
          
          <p className="hero-subtitle mb-12 fade-in-up" style={{animationDelay: '0.1s', maxWidth: '700px', margin: '0 auto 3rem'}}>
            Expert security assessments to protect your digital assets and strengthen your security posture
          </p>
        </div>
      </section>

      <div className="spacer"></div>

      {/* Services Section */}
      <section className="apple-section bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="section-title text-center mb-16">Our Services</h2>

          <div className="space-y-12">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <div 
                  key={service.id}
                  className="apple-card p-10 fade-in-up"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="grid md:grid-cols-2 gap-10">
                    {/* Left side - Info */}
                    <div>
                      <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${service.gradient} rounded-2xl mb-4`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="card-title mb-2">{service.title}</h3>
                      <p className="text-gray-500 mb-4">{service.subtitle}</p>
                      
                      <p className="text-gray-600 leading-relaxed mb-6">
                        {service.description}
                      </p>

                      <div className="flex items-center gap-6 mb-6">
                        <div>
                          <div className="text-sm text-gray-500">Starting at</div>
                          <div className="text-2xl font-semibold text-gray-900">{service.price}</div>
                        </div>
                        <div className="h-12 w-px bg-gray-200"></div>
                        <div>
                          <div className="text-sm text-gray-500">Duration</div>
                          <div className="text-lg font-medium text-gray-900">{service.duration}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleContactClick(service.title)}
                        className="apple-button clickable flex items-center gap-2"
                      >
                        <Mail size={18} />
                        Request Quote
                      </button>
                    </div>

                    {/* Right side - Benefits */}
                    <div className="bg-white rounded-xl p-8">
                      <h4 className="font-semibold text-gray-900 mb-4">What's included:</h4>
                      <ul className="space-y-3">
                        {service.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="spacer"></div>

      {/* Packs Section */}
      <section className="apple-section">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="section-title mb-6">Service Packages</h2>
            <p className="hero-subtitle">Choose the package that fits your needs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {packs.map((pack, index) => (
              <div
                key={pack.id}
                className={`product-card p-8 relative fade-in-up ${
                  pack.popular ? 'ring-2 ring-blue-500' : ''
                }`}
                style={{animationDelay: `${index * 0.1}s`}}
              >
                {pack.popular && (
                  <div className="absolute top-0 right-8 transform -translate-y-1/2">
                    <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Popular
                    </div>
                  </div>
                )}

                <h3 className="card-title mb-2">{pack.name}</h3>
                <p className="text-gray-500 mb-6">{pack.description}</p>

                <div className="text-4xl font-bold text-gray-900 mb-8">
                  {pack.price}
                </div>

                <ul className="space-y-3 mb-8">
                  {pack.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleContactClick(pack.name)}
                  className={`w-full py-3 px-4 rounded-full font-medium transition-all duration-300 clickable ${
                    pack.popular
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="spacer"></div>

      {/* CTA Section */}
      <section className={`py-20 transition-colors duration-300 ${
        isDarkMode ? 'bg-[#1d1d1f]' : 'bg-gray-50'
      }`}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className={`text-3xl font-bold mb-6 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Need a custom solution?
          </h2>
          <p className={`text-lg mb-8 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Contact us for a tailored security assessment plan
          </p>
          <button
            onClick={() => handleContactClick('Custom Solution')}
            className={`inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
              isDarkMode
                ? 'bg-gray-900 text-white hover:bg-gray-800 border border-gray-700'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            <Send size={18} />
            Contact Us
          </button>
        </div>
      </section>

      <div className="spacer"></div>
    </div>
  );
};

export default ServicesPage;
