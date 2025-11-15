import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Shield, Code, Lock, Search, ShoppingCart } from 'lucide-react';
import useLanguageStore from '../store/languageStore';
import useThemeStore from '../store/themeStore';
import useCartStore from '../store/cartStore';

const COMMANDS = [
  { 
    text: 'figlet "ZeroDay"', 
    response: `                                              ___
                                          ,o88888
                                       ,o8888888'
                 ,:o:o:oooo.        ,8O88Pd8888"
             ,.::.::o:ooooOoOoO. ,oO8O8Pd888'"
           ,.:.::o:ooOoOoOO8O8OOo.8OOPd8O8O"
          , ..:.::o:ooOoOOOO8OOOOo.FdO8O8"
         , ..:.::o:ooOoOO8O888O8O,COCOO"
        , . ..:.::o:ooOoOOOO8OOOOCOCO"
         . ..:.::o:ooOoOoOO8O8OCCCC"o
            . ..:.::o:ooooOoCoCCC"o:o
            . ..:.::o:o:,cooooCo"oo:o:
         \`   . . ..:.:cocoooo"'o:o:::'
         .\`   . ..::ccccoc"'o:o:o:::'
        :.:.    ,c:cccc"':.:.:.:.:.'
      ..:.:"'\`::::c:"'..:.:.:.:.:.'
    ...:.'.:.::::"'    . . . . .'
   .. . ....:."' \`   .  . . ''
 . . . ...."'
 .. . ."'     -rzk06-
.
------------------------------------------------`, 
    delay: 2000 
  },
  { text: 'whoami', response: 'hacker', delay: 1000 },
  { text: 'ls -la /shop/products', response: 'drwxr-xr-x  5 root root 4096 Nov 10 2025 osint_tools/\ndrwxr-xr-x  3 root root 4096 Nov 10 2025 pentest_kits/\ndrwxr-xr-x  4 root root 4096 Nov 10 2025 security_guides/', delay: 2000 },
  { text: './start_shopping.sh', response: 'Ready to hack (ethically)!', delay: 1500 }
];

const HomePage = () => {
  const [typedText, setTypedText] = useState('');
  const [commandIndex, setCommandIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [animationStarted, setAnimationStarted] = useState(false);
  const { t } = useLanguageStore();
  const { isDarkMode } = useThemeStore();
  const { addItem } = useCartStore();

  // Produits de démonstration
  const demoProducts = [
    {
      id: 1,
      name: "OSINT Toolkit Pro",
      description: "Suite complète d'outils d'investigation en ligne",
      price: 29.99,
      category: "tools",
      image: "/api/placeholder/200/150"
    },
    {
      id: 2,
      name: "Web Penetration Testing Kit",
      description: "Scripts avancés pour tests d'intrusion web",
      price: 49.99,
      category: "tools", 
      image: "/api/placeholder/200/150"
    },
    {
      id: 3,
      name: "Cybersecurity Guide 2025",
      description: "Guide complet de sécurité informatique",
      price: 19.99,
      category: "guides",
      image: "/api/placeholder/200/150"
    }
  ];

  const handleAddToCart = (product) => {
    addItem(product);
    // Vous pourriez ajouter une notification toast ici
  };

  const commands = COMMANDS;

  useEffect(() => {
    // Cursor blinking effect
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    if (!animationStarted && commandIndex === 0) {
      setAnimationStarted(true);
      setTypedText('root@zeroday:~# ');
    }
  }, [animationStarted, commandIndex]);

  useEffect(() => {
    if (animationStarted && commandIndex < commands.length) {
      const currentCommand = commands[commandIndex];
      let charIndex = 0;

      const typeCommand = () => {
        if (charIndex < currentCommand.text.length) {
          setTypedText(prev => prev + currentCommand.text[charIndex]);
          charIndex++;
          setTimeout(typeCommand, 100 + Math.random() * 100); // Random typing speed
        } else {
          // Command finished typing, show response after delay
          setTimeout(() => {
            setTypedText(prev => prev + '\n' + currentCommand.response + '\nroot@zeroday:~# ');
            setCommandIndex(prev => prev + 1);
          }, currentCommand.delay);
        }
      };

      setTimeout(typeCommand, 500);
    }
  }, [commandIndex, commands, animationStarted]);

  return (
    <div className={`min-h-screen pt-16 matrix-bg transition-all duration-500 ${
      isDarkMode 
        ? 'bg-black text-green-400' 
        : 'bg-gradient-to-br from-white to-slate-50 text-slate-800'
    }`}>
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-20 relative">
        <div className="text-center relative z-10">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Shield className={`w-20 h-20 drop-shadow-xl transition-colors duration-300 ${
                isDarkMode 
                  ? 'text-green-400 animate-pulse' 
                  : 'text-emerald-600'
              }`} 
                     style={{filter: 'drop-shadow(0 0 20px currentColor)'}} />
              <div className={`absolute inset-0 w-20 h-20 border-2 rounded-full transition-colors duration-300 ${
                isDarkMode 
                  ? 'border-green-400/30 animate-ping' 
                  : 'border-emerald-400/50 animate-pulse'
              }`}></div>
            </div>
          </div>
          <h1 className={`text-6xl font-bold mb-4 transition-colors duration-300 ${
            isDarkMode 
              ? 'text-green-400 neon-text' 
              : 'text-emerald-600'
          }`} 
              style={{fontFamily: 'Orbitron, monospace'}}
              data-text={t('title')}>
            {t('title')}
          </h1>
          <p className={`text-2xl mb-12 transition-colors duration-300 ${
            isDarkMode 
              ? 'text-gray-300' 
              : 'text-slate-600 font-medium'
          }`}>
            {t('subtitle')}
          </p>
          <Link 
            to="/products"
            className={`inline-block px-8 py-4 rounded-lg font-bold border transition-all duration-300 hover:scale-105 ${
              isDarkMode 
                ? 'glass glow-box text-green-400 border-green-400/30 hover:border-green-400 neon-text'
                : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 hover:border-emerald-700 shadow-lg hover:shadow-xl'
            }`}
            style={isDarkMode ? {
              fontFamily: 'Orbitron, monospace',
              backgroundColor: 'rgba(0,255,0,0.1)',
              textShadow: '0 0 10px currentColor',
              boxShadow: '0 0 20px rgba(0,255,0,0.3)'
            } : {
              fontFamily: 'Orbitron, monospace',
              boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
            }}
          >
            {t('browseProducts')}
          </Link>
        </div>
      </div>

      {/* Terminal Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className={`rounded-lg p-6 font-mono border transition-all duration-300 ${
          isDarkMode 
            ? 'glass glow-box border-green-400/20'
            : 'bg-white border-slate-200 shadow-2xl'
        }`}
             style={isDarkMode ? {
               backgroundColor: 'rgba(0,0,0,0.8)',
               boxShadow: '0 0 30px rgba(0,255,0,0.2)',
               backdropFilter: 'blur(10px)'
             } : {
               backgroundColor: 'rgba(255,255,255,0.95)',
               boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
               backdropFilter: 'blur(10px)'
             }}
        >
          <div className="flex items-center mb-4">
            <Terminal className={`w-5 h-5 mr-2 transition-colors duration-300 ${
              isDarkMode ? 'text-green-400' : 'text-emerald-600'
            }`} 
                     style={{filter: 'drop-shadow(0 0 5px currentColor)'}} />
            <span className={`transition-colors duration-300 ${
              isDarkMode ? 'text-green-400 neon-text' : 'text-emerald-600 font-semibold'
            }`}>root@zeroday:~#</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="whitespace-pre-wrap">
              {typedText}
              <span className={`inline-block w-2 h-4 transition-all duration-300 ${
                isDarkMode ? 'bg-green-400' : 'bg-emerald-600'
              } ${showCursor ? 'opacity-100' : 'opacity-0'}`}></span>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className={`text-center p-8 border rounded-lg transition-all duration-300 hover:scale-105 group ${
            isDarkMode 
              ? 'glass glow-box border-green-400/20 hover:border-green-400/50'
              : 'bg-white border-slate-200 hover:border-emerald-300 shadow-lg hover:shadow-2xl'
          }`}>
            <div className="relative mb-6">
              <Search className={`w-12 h-12 mx-auto drop-shadow-lg group-hover:animate-pulse transition-all duration-300 ${
                isDarkMode ? 'text-green-400' : 'text-emerald-600'
              }`} 
                     style={{filter: 'drop-shadow(0 0 10px currentColor)'}} />
            </div>
            <h3 className={`text-xl font-bold mb-4 transition-colors duration-300 ${
              isDarkMode ? 'text-green-400 neon-text' : 'text-slate-800'
            }`} style={{fontFamily: 'Orbitron, monospace'}}>
              {t('osintTools')}
            </h3>
            <p className={`leading-relaxed transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-slate-600'
            }`}>{t('osintDesc')}</p>
          </div>
          
          <div className={`text-center p-8 border rounded-lg transition-all duration-300 hover:scale-105 group ${
            isDarkMode 
              ? 'glass glow-box border-green-400/20 hover:border-green-400/50'
              : 'bg-white border-slate-200 hover:border-emerald-300 shadow-lg hover:shadow-2xl'
          }`}>
            <div className="relative mb-6">
              <Lock className={`w-12 h-12 mx-auto drop-shadow-lg group-hover:animate-pulse transition-all duration-300 ${
                isDarkMode ? 'text-green-400' : 'text-emerald-600'
              }`} 
                   style={{filter: 'drop-shadow(0 0 10px currentColor)'}} />
            </div>
            <h3 className={`text-xl font-bold mb-4 transition-colors duration-300 ${
              isDarkMode ? 'text-green-400 neon-text' : 'text-slate-800'
            }`} style={{fontFamily: 'Orbitron, monospace'}}>
              {t('pentestKits')}
            </h3>
            <p className={`leading-relaxed transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-slate-600'
            }`}>{t('pentestDesc')}</p>
          </div>
          
          <div className={`text-center p-8 border rounded-lg transition-all duration-300 hover:scale-105 group ${
            isDarkMode 
              ? 'glass glow-box border-green-400/20 hover:border-green-400/50'
              : 'bg-white border-slate-200 hover:border-emerald-300 shadow-lg hover:shadow-2xl'
          }`}>
            <div className="relative mb-6">
              <Code className={`w-12 h-12 mx-auto drop-shadow-lg group-hover:animate-pulse transition-all duration-300 ${
                isDarkMode ? 'text-green-400' : 'text-emerald-600'
              }`} 
                    style={{filter: 'drop-shadow(0 0 10px currentColor)'}} />
            </div>
            <h3 className={`text-xl font-bold mb-4 transition-colors duration-300 ${
              isDarkMode ? 'text-green-400 neon-text' : 'text-slate-800'
            }`} style={{fontFamily: 'Orbitron, monospace'}}>
              {t('digitalGuides')}
            </h3>
            <p className={`leading-relaxed transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-slate-600'
            }`}>{t('guidesDesc')}</p>
          </div>
        </div>
      </div>

      {/* Demo Products Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className={`text-3xl font-bold mb-8 text-center transition-colors duration-300 ${
          isDarkMode ? 'text-green-400 neon-text' : 'text-slate-800'
        }`} style={{fontFamily: 'Orbitron, monospace'}}>
          Produits Populaires
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {demoProducts.map((product) => (
            <div key={product.id} className={`rounded-lg border p-6 transition-all duration-300 hover:scale-105 ${
              isDarkMode 
                ? 'bg-gray-900 border-green-500/20 hover:border-green-500/50' 
                : 'bg-white border-slate-200 hover:border-emerald-300 shadow-lg hover:shadow-xl'
            }`}>
              <div className={`w-full h-32 rounded mb-4 flex items-center justify-center ${
                isDarkMode ? 'bg-gray-800' : 'bg-slate-100'
              }`}>
                <Code className={`w-12 h-12 ${
                  isDarkMode ? 'text-green-400' : 'text-emerald-600'
                }`} />
              </div>
              
              <h3 className={`text-lg font-bold mb-2 transition-colors duration-300 ${
                isDarkMode ? 'text-green-400' : 'text-slate-800'
              }`}>
                {product.name}
              </h3>
              
              <p className={`text-sm mb-4 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-slate-600'
              }`}>
                {product.description}
              </p>
              
              <div className="flex items-center justify-between">
                <span className={`text-xl font-bold transition-colors duration-300 ${
                  isDarkMode ? 'text-green-400' : 'text-emerald-600'
                }`}>
                  €{product.price}
                </span>
                
                <button
                  onClick={() => handleAddToCart(product)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
                    isDarkMode 
                      ? 'bg-green-600 hover:bg-green-700 text-black' 
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Ajouter</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="glass glow-box p-8 rounded-lg border border-green-400/20">
          <h2 className="text-3xl font-bold mb-4 neon-text" style={{fontFamily: 'Orbitron, monospace'}}>
            Ready to Level Up Your Security Skills?
          </h2>
          <p className="text-gray-400 mb-6 text-lg">
            Join thousands of ethical hackers who trust ZeroDay Shop for their professional tools
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/products"
              className="glass glow-box px-6 py-3 rounded-lg font-bold text-green-400 border border-green-400/30 hover:border-green-400 transition-all duration-300 hover:scale-105 neon-text"
              style={{
                fontFamily: 'Orbitron, monospace',
                backgroundColor: 'rgba(0,255,0,0.1)',
                textShadow: '0 0 10px currentColor'
              }}
            >
              Explore Products
            </Link>
            <Link 
              to="/categories"
              className="glass px-6 py-3 rounded-lg font-bold text-gray-400 border border-gray-500/30 hover:border-gray-400 hover:text-white transition-all duration-300 hover:scale-105"
              style={{fontFamily: 'Orbitron, monospace'}}
            >
              Browse Categories
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;