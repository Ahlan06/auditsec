import { Shield, BookOpen, Video, FileText, Lightbulb, ArrowRight, Download, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { guides } from '../data/guidesData';
import RadialSegments from '../components/RadialSegments'; // Keeping import for future use
import MethodBars from '../components/MethodBars';

const GuidesPageApple = () => {
  const categories = [
    {
      icon: Shield,
      slug: "pre-audit-reconnaissance",
      title: "Pré-audit & Reconnaissance",
      description: "Collecte d'informations, cartographie et définition du périmètre",
      guides: [
        { name: "Reconnaissance OSINT", detail: "Collecte d'indices publics, enumeration de sous-domaines et footprinting" },
        { name: "Cartographie & Scoping", detail: "Identification des actifs critiques, définition des objectifs d'audit" },
        { name: "Collecte de preuves", detail: "Archivage des découvertes, captures et logs pour traçabilité" }
      ],
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: BookOpen,
      slug: "tests-techniques",
      title: "Tests Techniques",
      description: "Méthodologies, outils et techniques d'exploitation contrôlée",
      guides: [
        { name: "Tests d'intrusion (OWASP)", detail: "Analyse manuelle & Burp Suite pour injection, auth, XSS, CSRF" },
        { name: "Scan & Enumeration", detail: "Nmap, Nikto, et scanners vulnérabilités pour cartographier la surface" },
        { name: "Exploitation & PoC", detail: "Exploits contrôlés, preuves et recommandations de mitigation" }
      ],
      color: "from-purple-500 to-pink-600"
    },
    {
      icon: Video,
      slug: "conformite-normes",
      title: "Conformité & Normes",
      description: "Alignement sur ISO27001, bonnes pratiques et exigences réglementaires",
      guides: [
        { name: "ISO27001 Mapping", detail: "Correspondance des constats aux contrôles ISO27001 et mesures recommandées" },
        { name: "PCI-DSS & Privacy", detail: "Conseils pour la protection des données de paiement et conformité RGPD" },
        { name: "Reporting Normatif", detail: "Rapports structurés, preuve d'audit et plan de remédiation" }
      ],
      color: "from-orange-500 to-red-600"
    },
    {
      icon: FileText,
      slug: "remediation-validation",
      title: "Remédiation & Validation",
      description: "Plan d'action, validation et monitoring post-correctif",
      guides: [
        { name: "Plan de Remédiation", detail: "Priorisation des correctifs avec impact & risque estimés" },
        { name: "Retests & Validation", detail: "Vérification de la fermeture des vulnérabilités après correctifs" },
        { name: "Monitoring Continu", detail: "Surveillance, détection et alerting pour maintenir le niveau de sécurité" }
      ],
      color: "from-green-500 to-teal-600"
    },
  ];

  const featuredGuides = [
    {
      title: "Complete Web Pentesting Course",
      description: "Master web application security from basics to advanced exploitation techniques",
      duration: "8 hours",
      modules: 12,
      difficulty: "All Levels",
      badge: "Most Popular"
    },
    {
      title: "OSINT Masterclass",
      description: "Learn professional open-source intelligence gathering and analysis",
      duration: "6 hours",
      modules: 10,
      difficulty: "Intermediate",
      badge: "New"
    },
    {
      title: "Network Security Fundamentals",
      description: "Understand network protocols, scanning, and vulnerability assessment",
      duration: "5 hours",
      modules: 8,
      difficulty: "Beginner",
      badge: "Editor's Choice"
    },
  ];

  const resources = [
    {
      icon: Download,
      title: "Free Resources",
      description: "Downloadable tools, templates, and scripts",
      count: "25+ items"
    },
    {
      icon: Lightbulb,
      title: "Best Practices",
      description: "Industry standards and ethical guidelines",
      count: "15+ articles"
    },
    {
      icon: Clock,
      title: "Quick Tips",
      description: "Short tips and tricks for daily security work",
      count: "50+ tips"
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-20 transition-colors duration-300">
      {/* Hero Section */}
      <section className="apple-section pb-0">
        <div className="max-w-6xl mx-auto px-4 text-center hero-wrapper">
          <div className="hero-decor" aria-hidden="true" />
          <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 mb-6 fade-in">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Knowledge Base</span>
          </div>
          
          <h1 className="hero-title mb-6 fade-in">
            Security Guides
          </h1>
          <p className="hero-subtitle mb-8 fade-in-up max-w-3xl mx-auto" style={{animationDelay: '0.1s'}}>
            Comprehensive guides, tutorials, and resources to enhance your cybersecurity skills
          </p>
          <div className="hero-decor" />
          <div className="mb-8">
            <Link to="/courses" className="apple-button px-6 py-3">
              Access Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="apple-section pt-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="section-title mb-12 text-center">Featured Courses</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredGuides.map((guide, index) => (
              <div
                key={index}
                className="product-card p-8 fade-in-up"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                {guide.badge && (
                  <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                    {guide.badge}
                  </div>
                )}

                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
                  {guide.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                  {guide.description}
                </p>

                <div className="flex items-center gap-4 mb-6 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>{guide.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen size={16} />
                    <span>{guide.modules} modules</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                    {guide.difficulty}
                  </span>
                  {
                    (() => {
                      const matched = guides.find(g => g.title === guide.title);
                      const to = matched ? `/courses/${matched.slug}` : '/courses';
                      return (
                        <Link to={to} className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm flex items-center gap-1 transition-colors">
                          Explore <ArrowRight size={16} />
                        </Link>
                      );
                    })()
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Category (procedures instead of courses) */}
      <section className="apple-section pt-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="section-title mb-6 text-center">Browse by Category</h2>

          <div className="apple-card p-8 mb-10 bg-gray-50 dark:bg-gray-900">
            <MethodBars />
          </div>
        </div>
      </section>

          {/* Section "Mon Parcours d'Audit" retirée à la demande */}

      {/* Additional Resources */}
      <section className="apple-section">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="section-title mb-12 text-center">Additional Resources</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {resources.map((resource, index) => {
              const Icon = resource.icon;
              return (
                <div
                  key={index}
                  className="product-card p-8 text-center fade-in-up"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl mb-4">
                    <Icon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
                    {resource.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                    {resource.description}
                  </p>
                  <span className="text-xs font-medium text-blue-500 dark:text-blue-400">
                    {resource.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="apple-section bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="apple-card p-12">
            <h2 className="text-3xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Ready to Level Up Your Skills?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              Access our premium guides and courses to accelerate your cybersecurity journey
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/services" className="apple-button">
                Explore Services
              </Link>
              <Link to="/contact" className="apple-button-secondary">
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GuidesPageApple;
