import { useState } from 'react';
import { Globe, ChevronDown, RefreshCw } from 'lucide-react';
import useLanguageStore from '../store/languageStore';

const AutoTranslator = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const { currentLanguage, setLanguage, getAvailableLanguages } = useLanguageStore();
  const languages = getAvailableLanguages();
  
  const currentLang = languages.find(lang => lang.code === currentLanguage);

  const translatePage = async (targetLang) => {
    setIsTranslating(true);
    
    try {
      // Méthode 1 : Google Translate Widget (le plus simple)
      if (window.google && window.google.translate) {
        const googleTranslateElement = window.google.translate.TranslateElement;
        if (googleTranslateElement) {
          // Trigger la traduction Google
          window.google.translate.TranslateElement.getInstance().selectLanguage(targetLang);
        }
      } else {
        // Méthode 2 : Redirection vers Google Translate
        const currentUrl = window.location.href;
        const googleTranslateUrl = `https://translate.google.com/translate?hl=${targetLang}&sl=en&u=${encodeURIComponent(currentUrl)}`;
        
        // Ouvrir dans un nouvel onglet
        const confirmation = window.confirm(
          `Voulez-vous traduire cette page en ${currentLang.name} via Google Translate ?\n\nCela ouvrira la page traduite dans un nouvel onglet.`
        );
        
        if (confirmation) {
          window.open(googleTranslateUrl, '_blank');
        }
      }
      
      setLanguage(targetLang);
    } catch (error) {
      console.error('Translation error:', error);
      
      // Méthode 3 : Fallback - injection du widget Google Translate
      loadGoogleTranslateWidget(targetLang);
    }
    
    setIsTranslating(false);
    setIsOpen(false);
  };

  const loadGoogleTranslateWidget = (targetLang) => {
    // Ajouter le script Google Translate si pas déjà présent
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      
      // Fonction de callback pour initialiser le widget
      window.googleTranslateElementInit = function() {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,fr,es,ru,zh,ar',
            autoDisplay: false,
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
          },
          'google_translate_element'
        );
      };
      
      document.head.appendChild(script);
      
      // Créer le conteneur du widget (invisible)
      if (!document.getElementById('google_translate_element')) {
        const widget = document.createElement('div');
        widget.id = 'google_translate_element';
        widget.style.display = 'none';
        document.body.appendChild(widget);
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg text-gray-400 hover:text-green-400 hover:bg-green-400/10 transition-all duration-300 group"
        title="Auto Translate Page"
        disabled={isTranslating}
      >
        {isTranslating ? (
          <RefreshCw className="w-5 h-5 animate-spin" />
        ) : (
          <Globe className="w-5 h-5 group-hover:text-green-400" />
        )}
        <span className="hidden md:flex items-center space-x-1">
          <span className="text-lg">{currentLang?.flag}</span>
          <span className="text-sm font-mono">{currentLang?.code.toUpperCase()}</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 glass border border-green-400/20 rounded-lg shadow-xl z-50 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-green-400/20 bg-black/50">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-mono text-sm font-bold">Auto Translator</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Powered by Google Translate
              </div>
            </div>
            
            {/* Languages */}
            <div className="py-2 max-h-64 overflow-y-auto">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => translatePage(language.code)}
                  disabled={isTranslating}
                  className={`w-full px-4 py-3 text-left flex items-center space-x-3 transition-all duration-200 disabled:opacity-50 ${
                    currentLanguage === language.code
                      ? 'bg-green-400/20 text-green-400 border-l-2 border-green-400'
                      : 'text-gray-300 hover:bg-green-400/10 hover:text-green-400'
                  }`}
                >
                  <span className="text-lg" style={{minWidth: '24px'}}>{language.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium">{language.name}</div>
                    <div className="text-xs opacity-70">
                      {language.code === 'en' ? 'Original' : 'Auto-translate'}
                    </div>
                  </div>
                  {currentLanguage === language.code && (
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>
            
            {/* Footer */}
            <div className="border-t border-green-400/20 px-4 py-2 bg-black/30">
              <div className="text-xs text-gray-500 font-mono">
                🤖 Automatic page translation
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Quality may vary for technical content
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Hidden Google Translate Widget Container */}
      <div id="google_translate_element" style={{display: 'none'}}></div>
    </div>
  );
};

export default AutoTranslator;