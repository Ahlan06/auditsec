import { Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, X, CreditCard, ShoppingBag } from 'lucide-react';
import useCartStore from '../store/cartStore';
import useThemeStore from '../store/themeStore';

const CartPage = () => {
  const {
    items,
    total,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount
  } = useCartStore();
  
  const { isDarkMode } = useThemeStore();

  const itemCount = getItemCount();
  const formatPrice = (price) => `€${price.toFixed(2)}`;

  const handleClearCart = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
      clearCart();
    }
  };

  if (items.length === 0) {
    return (
      <div className={`min-h-screen py-20 ${
        isDarkMode ? 'bg-black text-green-400' : 'bg-gray-50 text-gray-900'
      }`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShoppingBag className={`w-24 h-24 mx-auto mb-8 ${
              isDarkMode ? 'text-green-400' : 'text-gray-400'
            }`} />
            <h1 className={`text-3xl font-bold mb-4 ${
              isDarkMode ? 'text-green-400' : 'text-gray-900'
            }`}>
              Votre panier est vide
            </h1>
            <p className={`mb-8 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Vous n'avez pas encore ajouté de produits à votre panier.
            </p>
            <Link
              to="/products"
              className={`inline-flex items-center px-8 py-3 rounded-full font-semibold transition-all ${
                  isDarkMode 
                    ? 'bg-[#6b7280] hover:bg-[#4b5563] text-white' 
                    : 'bg-[#6b7280] hover:bg-[#4b5563] text-white'
              }`}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Parcourir les produits
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-8 pt-20 ${
      isDarkMode 
        ? 'bg-black text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Mon Panier
            </h1>
            <p className={`${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {itemCount} article{itemCount !== 1 ? 's' : ''} dans votre panier
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className={`inline-flex items-center px-4 py-2 rounded-full font-semibold ${
                  isDarkMode 
                    ? 'bg-[#6b7280] hover:bg-[#4b5563] text-white' 
                    : 'bg-[#6b7280] hover:bg-[#4b5563] text-white'
                } transition-all`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continuer les achats
            </Link>
            
            <button
              onClick={handleClearCart}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                isDarkMode 
                  ? 'border-red-500 text-red-400 hover:bg-red-500 hover:text-black' 
                  : 'border-red-500 text-red-600 hover:bg-red-500 hover:text-white'
              }`}
            >
              Vider le panier
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className={`p-6 rounded-lg border ${
                isDarkMode 
                  ? 'bg-gray-900 border-green-500/20 text-green-400' 
                  : 'bg-white border-gray-200 text-gray-900'
              }`}>
                <div className="flex items-start space-x-4">
                  {/* Product Image */}
                  <div className={`w-24 h-24 rounded flex items-center justify-center flex-shrink-0 ${
                    isDarkMode ? 'bg-gray-800 border-green-500/30' : 'bg-gray-100 border-gray-300'
                  } border`}>
                    <img
                      src={item.image || '/images/default-product.jpg'}
                      alt={item.name}
                      className="w-full h-full object-cover rounded"
                      onError={(e) => {
                        e.target.src = '/images/default-product.jpg';
                      }}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.id}`}
                      className={`text-lg font-bold hover:underline ${
                        isDarkMode ? 'text-green-400' : 'text-gray-900'
                      }`}
                    >
                      {item.name}
                    </Link>
                    
                    <p className={`text-sm mt-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {item.description}
                    </p>
                    
                    <div className={`flex items-center space-x-4 mt-2 text-xs ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      <span className="capitalize">{item.category}</span>
                      <span>{item.type}</span>
                      <span>{item.fileSize}</span>
                    </div>
                  </div>

                  {/* Price and Controls */}
                  <div className="flex flex-col items-end space-y-3">
                    <button
                      onClick={() => removeItem(item.id)}
                      className={`p-1 rounded transition-colors ${
                        isDarkMode 
                          ? 'text-gray-400 hover:text-red-400' 
                          : 'text-gray-400 hover:text-red-600'
                      }`}
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        isDarkMode ? 'text-green-400' : 'text-emerald-600'
                      }`}>
                        {formatPrice(item.price)}
                      </div>
                      <div className={`text-xs ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        par licence
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className={`w-8 h-8 flex items-center justify-center border rounded transition-colors ${
                          isDarkMode 
                            ? 'border-green-500 text-green-400 hover:bg-green-500 hover:text-black' 
                            : 'border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white'
                        }`}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      
                      <span className={`text-lg w-12 text-center ${
                        isDarkMode ? 'text-green-400' : 'text-emerald-600'
                      }`}>
                        {item.quantity}
                      </span>
                      
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className={`w-8 h-8 flex items-center justify-center border rounded transition-colors ${
                          isDarkMode 
                            ? 'border-green-500 text-green-400 hover:bg-green-500 hover:text-black' 
                            : 'border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className={`text-lg font-bold ${
                      isDarkMode ? 'text-green-400' : 'text-emerald-600'
                    }`}>
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className={`p-6 rounded-lg border sticky top-24 ${
              isDarkMode 
                ? 'bg-gray-900 border-green-500/20 text-green-400' 
                : 'bg-white border-gray-200 text-gray-900'
            }`}>
              <h3 className={`text-xl font-bold mb-6 ${
                isDarkMode ? 'text-green-400' : 'text-gray-900'
              }`}>
                Order Summary
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Sous-total ({itemCount} article{itemCount !== 1 ? 's' : ''}):
                  </span>
                  <span className={isDarkMode ? 'text-green-400' : 'text-emerald-600'}>
                    {formatPrice(total)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Frais de traitement:
                  </span>
                  <span className={isDarkMode ? 'text-green-400' : 'text-emerald-600'}>
                    €0.00
                  </span>
                </div>
                
                <div className={`border-t pt-4 ${
                  isDarkMode ? 'border-green-500/20' : 'border-gray-200'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className={`text-lg font-bold ${
                      isDarkMode ? 'text-green-400' : 'text-gray-900'
                    }`}>
                      Total:
                    </span>
                    <span className={`text-2xl font-bold ${
                      isDarkMode ? 'text-green-400' : 'text-emerald-600'
                    }`}>
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to="/checkout"
                className={`w-full inline-flex items-center justify-center px-6 py-4 rounded-full font-semibold transition-all ${
                  isDarkMode 
                    ? 'bg-[#6b7280] hover:bg-[#4b5563] text-white' 
                    : 'bg-[#6b7280] hover:bg-[#4b5563] text-white'
                }`}
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Procéder au paiement
              </Link>

              <div className="text-center mt-4">
                <p className={`text-xs ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  🔒 Sécurisé par chiffrement SSL 256-bit
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;