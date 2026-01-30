import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Moon, Sun, LogIn, User } from 'lucide-react';
import useCartStore from '../store/cartStore';
import useLanguageStore from '../store/languageStore';
import useThemeStore from '../store/themeStore';

const HeaderApple = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  const { getItemCount, toggleCart } = useCartStore();
  const { t } = useLanguageStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  
  const itemCount = getItemCount();

  const navigation = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Products', path: '/products' },
    { name: 'Guides', path: '/guides' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="apple-header">
      <div className="apple-nav">
        {/* Logo */}
        <Link to="/" className="flex items-center clickable">
          <span className="text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            AuditSec
          </span>
        </Link>

        {/* Navigation Desktop */}
        <nav className="hidden md:flex items-center space-x-8">
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
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-800 dark:text-gray-200 hover:opacity-70 transition-all duration-300 clickable rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 transition-transform duration-300 rotate-0 hover:rotate-90" />
            ) : (
              <Moon className="w-5 h-5 transition-transform duration-300 rotate-0 hover:-rotate-12" />
            )}
          </button>

          {/* Client Login / Dashboard */}
          <Link
            to={typeof window !== 'undefined' && localStorage.getItem('client_token') ? '/client/dashboard' : '/client/login'}
            className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors clickable"
            aria-label="Client login"
          >
            {typeof window !== 'undefined' && localStorage.getItem('client_token') ? (
              <>
                <User className="w-4 h-4" />
                <span>Dashboard</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </>
            )}
          </Link>

          {/* Cart */}
          <button 
            onClick={toggleCart}
            className="relative p-2 text-gray-800 dark:text-gray-200 hover:opacity-70 transition-opacity clickable"
          >
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                {itemCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-800 dark:text-gray-200 hover:opacity-70 transition-opacity"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-3 text-sm rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Link
              to={typeof window !== 'undefined' && localStorage.getItem('client_token') ? '/client/dashboard' : '/client/login'}
              onClick={() => setIsMenuOpen(false)}
              className="block px-4 py-3 text-sm rounded-lg transition-colors text-gray-600 hover:bg-gray-50"
            >
              {typeof window !== 'undefined' && localStorage.getItem('client_token') ? 'Dashboard' : 'Login'}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default HeaderApple;
