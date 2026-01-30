import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, Shield, Terminal, Moon, Sun } from 'lucide-react';
import useCartStore from '../store/cartStore';
import useAppStore from '../store/appStore';
import useThemeStore from '../store/themeStore';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  const { getItemCount, toggleCart } = useCartStore();
  const { 
    isAdminMode, 
    toggleAdminMode, 
    searchQuery, 
    setSearchQuery 
  } = useAppStore();
  const { isDarkMode, toggleTheme } = useThemeStore();

  const itemCount = getItemCount();

  // Navigation mise à jour - TOOLS SUPPRIMÉ - CONTACT AJOUTÉ - TEST 2025
  const navigation = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Categories', path: '/products' },
    { name: 'Guides', path: '/products?category=guides' },
    { name: 'Contact', path: '/contact' },
    // TOOLS SUPPRIMÉ VOLONTAIREMENT !!!
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="fixed top-0 w-full bg-cyber-dark border-b border-cyber-green/30 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Shield className="w-8 h-8 text-green-400 group-hover:text-green-300 transition-colors duration-300 glow" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-cyber-green neon-green">
                AuditSec
              </span>
              <span className="text-xs text-gray-400 -mt-1 tracking-wider">SHOP</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-sm font-medium transition-all duration-300 px-3 py-2 rounded-lg hover:bg-white/5 ${
                  location.pathname === item.path
                    ? 'text-green-400 bg-green-400/10'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search exploits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="cyber-input w-64 pr-10 text-sm"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-400 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10 transition-all duration-300"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Admin Toggle */}
            <button
              onClick={toggleAdminMode}
              className={`p-2 rounded-lg transition-all duration-300 ${
                isAdminMode
                  ? 'text-blue-400 bg-blue-400/20'
                  : 'text-gray-400 hover:text-blue-400 hover:bg-blue-400/10'
              }`}
              title="Toggle Admin Mode"
            >
              <Terminal className="w-5 h-5" />
            </button>

            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative p-2 rounded-lg text-gray-400 hover:text-green-400 hover:bg-green-400/10 transition-all duration-300"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-green-400 to-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse text-[10px]">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-300"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-cyber-green/30 bg-cyber-gray/95 backdrop-blur-sm">
            <div className="px-4 pt-4 pb-6 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search exploits..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="cyber-input w-full pr-10 text-sm"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-400 transition-colors"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Mobile Navigation */}
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 text-base font-medium rounded-lg transition-all duration-300 ${
                    location.pathname === item.path
                      ? 'text-green-400 bg-green-400/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Admin Mode Indicator */}
      {isAdminMode && (
        <div className="bg-blue-500/20 border-b border-blue-500/30 px-4 py-2">
          <div className="max-w-7xl mx-auto">
            <p className="text-blue-400 text-sm font-mono flex items-center">
              <Terminal className="w-4 h-4 inline mr-2" />
              ADMIN MODE ACTIVATED - Enhanced privileges enabled
            </p>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;