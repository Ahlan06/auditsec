import { Shield, Search, Network, CheckCircle, ArrowRight, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ServicesPage = () => {
  const services = [
    {
      id: 'pentest-web',
      icon: Shield,
      title: 'Pentest Web',
      subtitle: 'Sécurisez vos applications web',
      description: 'Protégez vos applications contre les cyberattaques avec notre service de test d\'intrusion web professionnel. Nos experts identifient et exploitent les vulnérabilités critiques (SQLi, XSS, CSRF, injections) avant que les pirates ne le fassent. Vous recevez un rapport PDF détaillé avec preuves de concept, niveau de criticité et recommandations concrètes pour corriger chaque faille. Idéal pour respecter les normes de conformité (RGPD, ISO 27001) et rassurer vos clients sur la sécurité de vos services en ligne.',
      benefits: [
        'Détection des vulnérabilités OWASP Top 10',
        'Tests d\'injection SQL, XSS, CSRF',
        'Analyse des authentifications et sessions',
        'Rapport PDF professionnel avec preuves',
        'Plan de remédiation prioritisé',
        'Support post-audit inclus'
      ],
      price: 'À partir de 350€',
      duration: '2-3 jours',
      color: 'cyber-green'
    },
    {
      id: 'osint',
      icon: Search,
      title: 'OSINT / Détection de fuites',
      subtitle: 'Surveillez votre empreinte numérique',
      description: 'Anticipez les risques d\'exposition de données sensibles grâce à notre service d\'intelligence open source. Nous analysons votre empreinte digitale sur le web visible et dark web pour détecter les fuites d\'informations critiques : identifiants compromis, données clients exposées, informations confidentielles accessibles publiquement. Notre surveillance proactive vous permet d\'agir rapidement avant qu\'une fuite ne cause des dommages réputationnels ou financiers. Vous recevez un rapport d\'analyse détaillé avec cartographie des risques et recommandations de sécurisation.',
      benefits: [
        'Surveillance du dark web et pastebin',
        'Détection de credentials exposés',
        'Analyse de l\'empreinte digitale',
        'Identification des vulnérabilités publiques',
        'Rapport de risques priorisés',
        'Alertes en temps réel (option)'
      ],
      price: 'À partir de 200€',
      duration: '1-2 jours',
      color: 'cyber-blue'
    },
    {
      id: 'audit-reseau',
      icon: Network,
      title: 'Audit de sécurité réseau',
      subtitle: 'Renforcez votre infrastructure',
      description: 'Évaluez la robustesse de votre infrastructure réseau avec notre audit de sécurité complet. Nous analysons vos ports ouverts, services exposés, configurations firewall et détectons les failles exploitables par des attaquants. Notre méthodologie éprouvée identifie les points faibles de votre architecture réseau et fournit des recommandations concrètes pour renforcer votre posture de sécurité. Le rapport d\'audit inclut une cartographie détaillée de votre réseau, l\'inventaire des risques détectés et un plan d\'action prioritaire pour sécuriser vos systèmes critiques.',
      benefits: [
        'Scan des ports et services exposés',
        'Analyse des configurations réseau',
        'Détection de failles critiques',
        'Test de segmentation et firewall',
        'Cartographie réseau complète',
        'Recommandations de durcissement'
      ],
      price: 'À partir de 450€',
      duration: '3-4 jours',
      color: 'cyber-accent'
    }
  ];

  const packs = [
    {
      id: 'starter',
      name: 'Pack Starter',
      tagline: 'Votre première évaluation',
      description: 'Idéal pour une première analyse rapide de votre sécurité. Scan automatisé de vos actifs avec rapport de synthèse identifiant les vulnérabilités majeures.',
      features: [
        'Scan de sécurité automatisé',
        'Rapport de synthèse (10-15 pages)',
        'Identification des failles critiques',
        'Recommandations prioritaires',
        'Support email 48h'
      ],
      price: '150€',
      popular: false,
      cta: 'Order'
    },
    {
      id: 'pro',
      name: 'Pack Pro',
      tagline: 'Solution professionnelle complète',
      description: 'Notre offre la plus demandée par les PME. Pentest web approfondi avec tests manuels, rapport détaillé et réunion de restitution pour comprendre les enjeux et prioriser les actions.',
      features: [
        'Pentest web complet (manuel + auto)',
        'Rapport détaillé (30-40 pages)',
        'Preuves de concept (PoC)',
        'Réunion de restitution (1h)',
        'Plan de remédiation détaillé',
        'Support prioritaire 24h',
        'Re-test après corrections (option)'
      ],
      price: '600€',
      popular: true,
      cta: 'Choisir Pro'
    },
    {
      id: 'premium',
      name: 'Pack Premium',
      tagline: 'Total enterprise security',
      description: 'Solution complète pour sécuriser l\'ensemble de votre organisation. Pentest web + audit réseau + OSINT + session de sensibilisation pour vos équipes. La solution ultime pour une protection à 360°.',
      features: [
        'Pentest web + audit réseau complets',
        'Investigation OSINT approfondie',
        'Rapport exécutif + technique (50+ pages)',
        'Session de sensibilisation équipe (2h)',
        'Réunions de suivi (3 sessions)',
        'Support dédié 12h/24',
        'Re-tests illimités 3 mois',
        'Certification de sécurité'
      ],
      price: '1 200€',
      popular: false,
      cta: 'Solution Enterprise'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-green-400">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-400/10 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-green-400 neon-text font-cyber" style={{fontFamily: 'Orbitron, monospace'}}>Nos Prestations</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8 font-mono">
              Professional cybersecurity services to protect your business 
              contre les menaces digitales. Expertise technique, rapports détaillés, accompagnement.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:ahlan.mira@icloud.com?subject=Demande de devis - Prestations ZeroDay"
                className="bg-green-400 text-black px-8 py-3 text-lg font-bold rounded hover:bg-green-300 transition-colors inline-flex items-center justify-center"
                style={{fontFamily: 'Orbitron, monospace'}}
              >
                <Mail className="w-5 h-5 mr-2" />
                Demander un devis
              </a>
              <a
                href="https://t.me/Ahlan06"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-green-400 text-green-400 hover:bg-green-400 hover:text-black px-8 py-3 font-mono uppercase tracking-wider transition-all duration-300 text-center inline-flex items-center justify-center"
              >
                Consultation gratuite
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-green-400 mb-4 neon-text" style={{fontFamily: 'Orbitron, monospace'}}>
              Services de Cybersécurité
            </h2>
            <p className="text-gray-400 font-mono max-w-2xl mx-auto">
              Des audits de sécurité professionnels adaptés à vos besoins
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                id={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="glass glow-box border border-green-400/20 rounded-lg p-8 hover:border-green-400/50 transition-all duration-300 scroll-mt-20"
              >
                <div className="w-16 h-16 bg-green-400/10 rounded-lg flex items-center justify-center mb-6">
                  <service.icon className="w-8 h-8 text-green-400" />
                </div>

                <h3 className="text-2xl font-bold text-green-400 mb-2 neon-text" style={{fontFamily: 'Orbitron, monospace'}}>
                  {service.title}
                </h3>
                
                <p className="text-green-400/70 text-sm font-mono mb-4">
                  {service.subtitle}
                </p>

                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  {service.description}
                </p>

                <div className="mb-6">
                  <h4 className="text-green-400 font-bold mb-3 font-mono text-sm">
                    Ce qui est inclus :
                  </h4>
                  <ul className="space-y-2">
                    {service.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start text-sm text-gray-400">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-green-400/20 pt-6 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm font-mono">Prix :</span>
                    <span className="text-xl font-bold text-green-400 font-mono neon-text">
                      {service.price}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm font-mono">Durée :</span>
                    <span className="text-green-400 font-mono text-sm">{service.duration}</span>
                  </div>
                </div>

                <a
                  href={`mailto:ahlan.mira@icloud.com?subject=Quote ${service.title}&body=Hello,%0D%0A%0D%0AI would like to get a quote for the ${service.title} service.%0D%0A%0D%0AMy company:%0D%0AMy need:%0D%0A%0D%0AThank you`}
                  className="bg-green-400 text-black px-6 py-3 rounded font-bold hover:bg-green-300 transition-colors w-full text-center inline-flex items-center justify-center"
                  style={{fontFamily: 'Orbitron, monospace'}}
                >
                  Demander un devis
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Packs Section */}
      <section id="packs" className="py-20 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-green-400 mb-4 neon-text" style={{fontFamily: 'Orbitron, monospace'}}>
              Nos Packs
            </h2>
            <p className="text-gray-400 font-mono max-w-2xl mx-auto">
              Des offres complètes adaptées à votre niveau de maturité sécurité
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {packs.map((pack, index) => (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`glass glow-box border p-8 relative ${
                  pack.popular 
                    ? 'border-green-400/50 shadow-glow-green transform scale-105' 
                    : 'border-green-400/20 hover:border-green-400/40'
                } transition-all duration-300`}
              >
                {pack.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-green-400 text-black px-4 py-1 rounded-full text-xs font-bold uppercase">
                      Plus populaire
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-green-400 mb-2 neon-text" style={{fontFamily: 'Orbitron, monospace'}}>
                    {pack.name}
                  </h3>
                  <p className="text-green-400/70 text-sm font-mono mb-4">
                    {pack.tagline}
                  </p>
                  <div className="text-4xl font-bold text-green-400 font-mono mb-2 neon-text">
                    {pack.price}
                  </div>
                  <p className="text-gray-400 text-xs">Prix fixe, tout inclus</p>
                </div>

                <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  {pack.description}
                </p>

                <div className="mb-8">
                  <h4 className="text-green-400 font-bold mb-4 font-mono text-sm">
                    Inclus dans ce pack :
                  </h4>
                  <ul className="space-y-3">
                    {pack.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-sm text-gray-400">
                        <CheckCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={`mailto:ahlan.mira@icloud.com?subject=Order ${pack.name}&body=Hello,%0D%0A%0D%0AI would like to order the ${pack.name}.%0D%0A%0D%0AMy company:%0D%0AMy contact details:%0D%0A%0D%0AThank you`}
                  className={`w-full text-center inline-flex items-center justify-center px-6 py-3 font-bold uppercase tracking-wider transition-all duration-300 rounded ${
                    pack.popular
                      ? 'bg-green-400 text-black hover:bg-green-300'
                      : 'border-2 border-green-400 text-green-400 hover:bg-green-400 hover:text-black'
                  }`}
                  style={{fontFamily: 'Orbitron, monospace'}}
                >
                  {pack.cta}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="glass glow-box border border-green-400/20 rounded-lg p-12"
          >
            <Shield className="w-16 h-16 text-green-400 mx-auto mb-6 animate-pulse" 
                    style={{filter: 'drop-shadow(0 0 20px currentColor)'}} />
            
            <h2 className="text-3xl lg:text-4xl font-bold text-green-400 mb-4 neon-text" style={{fontFamily: 'Orbitron, monospace'}}>
              Besoin d'une solution sur mesure ?
            </h2>
            
            <p className="text-gray-400 text-lg mb-8 font-mono">
              Every business is unique. Let's discuss your specific needs 
              to create a security solution adapted to your context.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:ahlan.mira@icloud.com?subject=Devis personnalisé"
                className="bg-green-400 text-black px-8 py-4 text-lg font-bold rounded hover:bg-green-300 transition-colors inline-flex items-center justify-center"
                style={{fontFamily: 'Orbitron, monospace'}}
              >
                <Mail className="w-5 h-5 mr-2" />
                Demander un devis personnalisé
              </a>
              <a
                href="https://t.me/Ahlan06"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-green-400 text-green-400 hover:bg-green-400 hover:text-black px-8 py-4 font-mono uppercase tracking-wider transition-all duration-300 text-center inline-flex items-center justify-center"
              >
                Consultation Telegram
              </a>
            </div>

            <div className="mt-8 pt-8 border-t border-green-400/20">
              <p className="text-gray-400 text-sm font-mono">
                💬 Réponse sous 24h | 🔒 Confidentialité garantie | ✓ Sans engagement
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-gray-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-green-400 font-mono mb-2 neon-text">5+</div>
              <div className="text-gray-400 font-mono text-sm">Années d'expérience</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 font-mono mb-2 neon-text">100%</div>
              <div className="text-gray-400 font-mono text-sm">Satisfaction client</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 font-mono mb-2 neon-text">24h</div>
              <div className="text-gray-400 font-mono text-sm">Temps de réponse moyen</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
