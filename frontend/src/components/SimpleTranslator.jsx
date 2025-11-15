import { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

const SimpleTranslator = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  // Traductions ultra-simples pour les textes les plus importants
  const quickTranslate = (text, targetLang) => {
    const translations = {
      'ZeroDay Shop': 'ZeroDay Shop', // Nom de marque - ne pas traduire
      'Premium Digital Tools for Ethical Hackers': {
        fr: 'Outils Numériques Premium pour Hackers Éthiques',
        es: 'Herramientas Digitales Premium para Hackers Éticos',
        ru: 'Премиум Цифровые Инструменты для Этичных Хакеров',
        zh: '道德黑客的优质数字工具',
        ar: 'أدوات رقمية متميزة للقراصنة الأخلاقيين'
      },
      'Browse Products': {
        fr: 'Parcourir les Produits',
        es: 'Explorar Productos', 
        ru: 'Просмотр Продуктов',
        zh: '浏览产品',
        ar: 'تصفح المنتجات'
      },
      'Contact': {
        fr: 'Contact',
        es: 'Contacto',
        ru: 'Контакт',
        zh: '联系我们',
        ar: 'اتصل بنا'
      }
    };

    return translations[text]?.[targetLang] || text;
  };

  const translatePage = (langCode) => {
    setCurrentLang(langCode);
    setIsOpen(false);

    if (langCode === 'en') {
      // Langue originale - ne rien faire
      return;
    }

    // Traduction simple des éléments texte visibles
    const elementsToTranslate = document.querySelectorAll('h1, h2, h3, p, button, a');
    
    elementsToTranslate.forEach(element => {
      const originalText = element.textContent.trim();
      const translatedText = quickTranslate(originalText, langCode);
      
      if (translatedText !== originalText) {
        element.textContent = translatedText;
      }
    });

    // Notification à l'utilisateur
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed; 
        top: 20px; 
        right: 20px; 
        background: rgba(0,0,0,0.9); 
        color: #00ff00; 
        padding: 12px 20px; 
        border-radius: 8px; 
        border: 1px solid #00ff00; 
        z-index: 9999;
        font-family: monospace;
        box-shadow: 0 0 20px rgba(0,255,0,0.3);
      ">
        ${currentLanguage.flag} Page traduite en ${currentLanguage.name}
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  };

  const openGoogleTranslate = (langCode) => {
    const currentUrl = window.location.href;
    const googleTranslateUrl = `https://translate.google.com/translate?hl=${langCode}&sl=en&u=${encodeURIComponent(currentUrl)}`;
    window.open(googleTranslateUrl, '_blank');
    setCurrentLang(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg text-gray-400 hover:text-green-400 hover:bg-green-400/10 transition-all duration-300 group"
        title="Translate Page"
      >
        <Globe className="w-5 h-5 group-hover:text-green-400" />
        <span className="hidden md:flex items-center space-x-1">
          <span className="text-lg">{currentLanguage.flag}</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute right-0 mt-2 w-56 glass border border-green-400/20 rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-green-400/20 bg-black/50">
              <div className="text-green-400 font-mono text-sm font-bold">
                🌍 Page Translator
              </div>
            </div>
            
            <div className="py-2">
              {languages.map((language) => (
                <div key={language.code}>
                  <button
                    onClick={() => translatePage(language.code)}
                    className={`w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-green-400/10 hover:text-green-400 transition-colors ${
                      currentLang === language.code ? 'text-green-400' : 'text-gray-300'
                    }`}
                  >
                    <span className="text-lg">{language.flag}</span>
                    <div className="flex-1">
                      <div className="font-medium">{language.name}</div>
                      <div className="text-xs opacity-70">
                        {language.code === 'en' ? 'Original' : 'Quick translate'}
                      </div>
                    </div>
                  </button>
                  
                  {language.code !== 'en' && (
                    <button
                      onClick={() => openGoogleTranslate(language.code)}
                      className="w-full px-4 py-1 text-left text-xs text-gray-500 hover:text-gray-400 hover:bg-gray-800/50"
                    >
                      📖 Via Google Translate (complet)
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SimpleTranslator;