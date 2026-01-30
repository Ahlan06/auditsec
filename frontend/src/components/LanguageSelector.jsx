import { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import useLanguageStore from '../store/languageStore';

const LanguageSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentLanguage, setLanguage, getAvailableLanguages } = useLanguageStore();
  const languages = getAvailableLanguages();
  
  const currentLang = languages.find(lang => lang.code === currentLanguage);

  const handleLanguageChange = (languageCode) => {
    setLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg text-gray-400 hover:text-green-400 hover:bg-green-400/10 transition-all duration-300 group"
        title="Change Language"
      >
        <Globe className="w-5 h-5 group-hover:text-green-400" />
        <span className="hidden md:flex items-center space-x-1">
          <span className="text-lg">{currentLang?.flag}</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Overlay pour fermer le dropdown */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu dropdown */}
          <div className="absolute right-0 mt-2 w-48 glass border border-green-400/20 rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="py-2">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full px-4 py-3 text-left flex items-center space-x-3 transition-all duration-200 ${
                    currentLanguage === language.code
                      ? 'bg-green-400/20 text-green-400 border-l-2 border-green-400'
                      : 'text-gray-300 hover:bg-green-400/10 hover:text-green-400'
                  }`}
                >
                  <span className="text-lg" style={{minWidth: '24px'}}>{language.flag}</span>
                  <div className="flex-1">
                    <div className="font-medium">{language.name}</div>
                    <div className="text-xs opacity-70">{language.code.toUpperCase()}</div>
                  </div>
                  {currentLanguage === language.code && (
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
            
            {/* Footer du dropdown */}
            <div className="border-t border-green-400/20 px-4 py-2">
              <div className="text-xs text-gray-500 font-mono">
                <Globe className="w-3 h-3 inline mr-1" />
                Multi-language support
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;