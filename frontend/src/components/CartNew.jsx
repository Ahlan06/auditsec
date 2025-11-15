import useCartStore from '../store/cartStore';
import useThemeStore from '../store/themeStore';
import useLanguageStore from '../store/languageStore';
import { X, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { items, isOpen, total, toggleCart, removeItem, updateQuantity, clearCart } = useCartStore();
  const { isDarkMode } = useThemeStore();
  const { t } = useLanguageStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={toggleCart}></div>
      
      <div className={`absolute right-0 top-0 h-full w-96 overflow-y-auto transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-black border-l border-green-500' 
          : 'bg-white border-l border-slate-200'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold transition-colors duration-300 ${
              isDarkMode ? 'text-green-400' : 'text-slate-800'
            }`}>{t('cart')}</h2>
            <button 
              onClick={toggleCart}
              className={`transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400 hover:text-white' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {items.length === 0 ? (
            <p className={`text-center py-8 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-slate-500'
            }`}>Your cart is empty</p>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className={`border rounded p-4 transition-colors duration-300 ${
                    isDarkMode ? 'border-gray-700' : 'border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-bold transition-colors duration-300 ${
                        isDarkMode ? 'text-green-400' : 'text-slate-800'
                      }`}>{item.name}</h3>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className={`transition-colors duration-300 ${
                          isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-600'
                        }`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className={`transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-400 hover:text-white' : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className={`transition-colors duration-300 ${
                          isDarkMode ? 'text-white' : 'text-slate-800'
                        }`}>{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className={`transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-400 hover:text-white' : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className={`font-bold transition-colors duration-300 ${
                        isDarkMode ? 'text-green-400' : 'text-emerald-600'
                      }`}>
                        €{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`border-t pt-4 transition-colors duration-300 ${
                isDarkMode ? 'border-gray-700' : 'border-slate-200'
              }`}>
                <div className="flex justify-between items-center mb-4">
                  <span className={`text-lg font-bold transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-slate-800'
                  }`}>Total:</span>
                  <span className={`text-xl font-bold transition-colors duration-300 ${
                    isDarkMode ? 'text-green-400' : 'text-emerald-600'
                  }`}>
                    €{total.toFixed(2)}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <Link
                    to="/checkout"
                    className={`w-full inline-block text-center py-3 rounded font-bold transition-colors ${
                      isDarkMode 
                        ? 'bg-green-400 text-black hover:bg-green-300' 
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    Checkout
                  </Link>
                  <button 
                    onClick={clearCart}
                    className={`w-full border py-2 rounded transition-colors duration-300 ${
                      isDarkMode 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                        : 'border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;