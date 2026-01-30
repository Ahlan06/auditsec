import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Shield } from 'lucide-react';
import useCartStore from '../store/cartStore';
import useLanguageStore from '../store/languageStore';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  const { getItemCount, toggleCart } = useCartStore();
  const { t } = useLanguageStore();
  
  const itemCount = getItemCount();

  const navigation = [
    { name: t('home'), path: '/' },
    { name: t('products'), path: '/products' },
    { name: t('categories'), path: '/categories' },
    { name: 'Prestations', path: '/services' },
    { name: t('guides'), path: '/guides' },
    { name: t('contact'), path: '/contact' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="apple-header">
      <div className="apple-nav">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 clickable">
          <Shield className="w-6 h-6 text-gray-800" />
          <span className="text-lg font-semibold tracking-tight text-gray-900">
            AuditSec
          </span>
        </Link>

        {/* Navigation Desktop */}
        <nav className="hidden md:flex items-center space-x-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`apple-nav-link ${
                location.pathname === item.path ? 'opacity-100 font-medium' : ''
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="glass rounded-lg px-4 py-2 text-green-400 placeholder-gray-400 w-48 focus:outline-none focus:ring-2 focus:ring-green-400/50 transition-all duration-300 hover:scale-105"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(0,255,0,0.3)',
                    textShadow: '0 0 5px currentColor'
                  }}
                />
                <Search 
                  className="w-4 h-4 absolute right-3 top-3 text-gray-400 transition-colors duration-300 hover:text-green-400" 
                  style={{filter: 'drop-shadow(0 0 5px currentColor)'}}
                />
              </div>
            </form>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 hover:rotate-12 ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-yellow-400' 
                  : 'text-slate-600 hover:text-amber-500'
              }`}
              style={{filter: 'drop-shadow(0 0 10px currentColor)'}}
              title={isDarkMode ? t('lightMode') : t('darkMode')}
            >
              {isDarkMode ? 
                <Sun className="w-5 h-5 animate-pulse" /> : 
                <Moon className="w-5 h-5 transition-transform duration-300 hover:rotate-12" />
              }
            </button>

            {/* Hidden Admin Access (invisible button) */}
            <Link
              to="/admin/login"
              className="opacity-0 w-0 h-0 overflow-hidden absolute"
              tabIndex={-1}
              aria-hidden="true"
            >
              <Terminal className="w-0 h-0" />
            </Link>

            {/* Language Selector */}
            <LanguageSelector />

            {/* Cart */}
            <button 
              onClick={toggleCart}
              className="relative p-2 rounded-lg text-gray-400 hover:text-green-400 transition-all duration-300 hover:scale-110 group"
              style={{filter: 'drop-shadow(0 0 10px currentColor)'}}
            >
              <ShoppingCart className="w-5 h-5 group-hover:animate-bounce" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-400 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold neon-text animate-pulse"
                      style={{
                        boxShadow: '0 0 10px #00ff00',
                        fontFamily: 'Orbitron, monospace'
                      }}>
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-green-400 transition-all duration-300 hover:scale-110"
              style={{filter: 'drop-shadow(0 0 10px currentColor)'}}
            >
              {isMenuOpen ? 
                <X className="w-5 h-5 animate-pulse" /> : 
                <Menu className="w-5 h-5" />
              }
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden glass border-t border-green-400/20 scanlines">
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 text-gray-300 hover:text-green-400 hover:bg-green-400/10 rounded transition-all duration-300 neon-text"
                  style={{
                    fontFamily: 'Orbitron, monospace',
                    textShadow: '0 0 5px currentColor'
                  }}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;