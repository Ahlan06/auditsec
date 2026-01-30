import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, Shield, Sun, Moon, Terminal } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Categories', path: '/products' },
    { name: 'Guides', path: '/products?category=guides' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="fixed top-0 w-full bg-black border-b border-green-500 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-green-400" />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-green-400">AuditSec</span>
              <span className="text-xs text-gray-400 -mt-1">SHOP</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`text-sm font-medium px-3 py-2 rounded transition-colors ${
                  location.pathname === item.path
                    ? 'text-green-400 bg-green-400/10'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-400 w-48"
                />
                <Search className="w-4 h-4 absolute right-3 top-3 text-gray-400" />
              </div>
            </div>

            {/* Cart */}
            <button className="p-2 text-gray-400 hover:text-green-400">
              <ShoppingCart className="w-5 h-5" />
            </button>

            {/* Theme Toggle */}
            <button className="p-2 text-gray-400 hover:text-yellow-400">
              <Sun className="w-5 h-5" />
            </button>

            {/* Mobile Menu */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-700 bg-black">
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded"
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