import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import useCartStore from '../store/cartStore';
import useThemeStore from '../store/themeStore';

const ProductsPageApple = () => {
  const { addItem, items } = useCartStore();
  const { isDarkMode } = useThemeStore();
  
  // Test products for AuditSec
  const testProducts = [
    {
      id: 'test-1',
      name: 'Security Audit - Starter',
      description: 'Complete security audit for small businesses',
      price: 600,
      category: 'audit',
      features: ['Vulnerability scan', 'Detailed report', '30 days support'],
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400'
    },
    {
      id: 'test-2',
      name: 'Pentest Web Application',
      description: 'In-depth penetration testing of your web application',
      price: 700,
      category: 'pentest',
      features: ['Manual testing', 'Automated testing', 'Executive report', '60 days support'],
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400'
    },
    {
      id: 'test-3',
      name: 'Cybersecurity Training',
      description: 'Complete cybersecurity training for your team',
      price: 550,
      category: 'training',
      features: ['8 hours training', 'Certification', 'Materials included', 'Unlimited support'],
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'
    }
  ];

  const [products] = useState(testProducts);

  const isInCart = (productId) => {
    return items.some(item => item.id === productId);
  };

  const handleAddToCart = (product) => {
    addItem(product);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-black text-white' : 'bg-white text-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className={`text-5xl md:text-6xl font-bold mb-6 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`} style={{ fontFamily: 'SF Pro Display, -apple-system, sans-serif' }}>
            Our Products
          </h1>
          <p className={`text-xl transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Professional cybersecurity solutions
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-[#1d1d1f] hover:bg-[#2d2d2f]' 
                  : 'bg-[#f5f5f7] hover:bg-[#e8e8ed]'
              }`}
              style={{
                boxShadow: isDarkMode 
                  ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
                  : '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              {/* Image */}
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className={`text-2xl font-semibold mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {product.name}
                </h3>
                
                <p className={`text-sm mb-4 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {product.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {product.features.map((feature, index) => (
                    <li 
                      key={index}
                      className={`flex items-start text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      <Check className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Price and CTA */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`text-3xl font-bold transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      €{product.price}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={isInCart(product.id)}
                    className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center space-x-2 ${
                      isInCart(product.id)
                        ? isDarkMode
                          ? 'bg-green-600 text-white cursor-not-allowed'
                          : 'bg-green-500 text-white cursor-not-allowed'
                        : isDarkMode
                          ? 'bg-[#6b7280] hover:bg-[#4b5563] text-white'
                          : 'bg-[#6b7280] hover:bg-[#4b5563] text-white'
                    }`}
                  >
                    {isInCart(product.id) ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info section */}
        <div className={`mt-16 p-8 rounded-2xl text-center transition-colors duration-300 ${
          isDarkMode ? 'bg-[#1d1d1f]' : 'bg-[#f5f5f7]'
        }`}>
          <h2 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Need a custom solution?
          </h2>
          <p className={`mb-6 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Contact us to discuss your specific cybersecurity needs
          </p>
          <a
            href="/contact"
            className={`inline-block px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
              isDarkMode
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            Contact us
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductsPageApple;
