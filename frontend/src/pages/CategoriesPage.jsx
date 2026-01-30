import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wrench, 
  GraduationCap, 
  Database, 
  UserCheck,
  Shield,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import useLanguageStore from '../store/languageStore';

const CategoriesPage = () => {
  const { t } = useLanguageStore();
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const categories = [
    {
      id: 'tools',
      name: t('toolsCategory'),
      icon: Wrench,
      description: t('toolsCategoryDesc'),
      longDescription: t('toolsLongDesc'),
      gradient: 'from-blue-500 to-cyan-600',
      count: 45,
      examples: [t('nmapScripts'), t('burpExtensions'), t('customExploits'), t('networkScanners')],
      price: t('priceFrom15')
    },
    {
      id: 'formation',
      name: t('formationCategory'),
      icon: GraduationCap,
      description: t('formationCategoryDesc'),
      longDescription: t('formationLongDesc'),
      gradient: 'from-purple-500 to-pink-600',
      count: 28,
      examples: [t('ethicalHackingCourse'), t('webPentestTraining'), t('oscpPrep'), t('bugBountyGuide')],
      price: t('priceFrom25')
    },
    {
      id: 'database',
      name: t('databaseCategory'),
      icon: Database,
      description: t('databaseCategoryDesc'),
      longDescription: t('databaseLongDesc'),
      gradient: 'from-green-500 to-teal-600',
      count: 32,
      examples: [t('wordlistsPremium'), t('vulnerabilityDB'), t('osintCollections'), t('payloadLibraries')],
      price: t('priceFrom10')
    },
    {
      id: 'comptes',
      name: t('comptesCategory'),
      icon: UserCheck,
      description: t('comptesCategoryDesc'),
      longDescription: t('comptesLongDesc'),
      gradient: 'from-orange-500 to-red-600',
      count: 15,
      examples: [t('spotifyPremium'), t('netflixAccount'), t('vpnPremium'), t('cloudServices')],
      price: t('priceFrom5'),
      warning: true
    }
  ];

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Header Section */}
      <section className="apple-section">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-20 fade-in">
            <h1 className="section-title mb-6">
              {t('productCategories')}
            </h1>
            <p className="hero-subtitle max-w-3xl mx-auto">
              {t('categoriesSubtitle')}
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Link
                  key={category.id}
                  to={`/${category.id === 'comptes' ? 'comptes' : `products?category=${category.id}`}`}
                  className="product-card clickable p-8 fade-in-up"
                  style={{animationDelay: `${index * 0.1}s`}}
                  onMouseEnter={() => setHoveredCategory(category.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center transition-transform duration-300 ${hoveredCategory === category.id ? 'scale-110' : ''}`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="card-title mb-1">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-500">{category.count} produits</p>
                      </div>
                    </div>
                    <ArrowRight className={`w-6 h-6 text-gray-400 transition-all duration-300 ${hoveredCategory === category.id ? 'translate-x-2 text-gray-900' : ''}`} />
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {category.description}
                  </p>

                  {/* Expanded Info on Hover */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      hoveredCategory === category.id 
                        ? 'max-h-96 opacity-100' 
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="space-y-4 pt-4 border-t border-gray-700">
                      <p className="text-sm text-gray-400">
                        {category.longDescription}
                      </p>
                      
                      <div>
                        <h4 className="text-green-400 font-bold mb-2 text-sm">Exemples de produits :</h4>
                        <div className="flex flex-wrap gap-2">
                          {category.examples.map((example, idx) => (
                            <span key={idx} className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs">
                              {example}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-green-400 font-bold">{category.price}</span>
                        {category.warning && (
                          <span className="text-yellow-400 text-xs flex items-center">
                            <Shield className="w-3 h-3 mr-1" />
                            Legal use only
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Warning Section for Comptes */}
        <div className="glass glow-box p-6 rounded-lg border border-yellow-400/20 mb-16">
          <div className="flex items-start space-x-4">
            <Shield className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-yellow-400 font-bold font-mono mb-2">
                ⚠️ Important Information About Accounts
              </h4>
              <ul className="text-gray-400 text-sm font-mono space-y-1 leading-relaxed">
                <li>• All accounts are provided for security testing purposes only</li>
                <li>• Strictly legal use and authorized by terms of service</li>
                <li>• Instant delivery via secure email after payment</li>
                <li>• 24/7 technical support available for all products</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Featured Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8 neon-text" style={{fontFamily: 'Orbitron, monospace'}}>
            Commencer Maintenant
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/products"
              className="glass glow-box px-8 py-4 rounded-lg font-bold text-green-400 border border-green-400/30 hover:border-green-400 transition-all duration-300 hover:scale-105 neon-text"
              style={{
                fontFamily: 'Orbitron, monospace',
                backgroundColor: 'rgba(0,255,0,0.1)',
                textShadow: '0 0 10px currentColor'
              }}
            >
              <Zap className="w-5 h-5 inline mr-2" />
              Voir Tous les Produits
            </Link>
            <Link 
              to="/products?featured=true"
              className="glass px-8 py-4 rounded-lg font-bold text-gray-400 border border-gray-500/30 hover:border-gray-400 hover:text-white transition-all duration-300 hover:scale-105"
              style={{fontFamily: 'Orbitron, monospace'}}
            >
              <Star className="w-5 h-5 inline mr-2" />
              Produits Populaires
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;