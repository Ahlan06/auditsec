import { X, Minus, Plus, ShoppingBag, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useCartStore from '../store/cartStore';

const Cart = () => {
  const {
    items,
    isOpen,
    total,
    closeCart,
    removeItem,
    updateQuantity,
    getItemCount
  } = useCartStore();

  const itemCount = getItemCount();

  const formatPrice = (price) => `€${price.toFixed(2)}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Cart Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-cyber-gray border-l border-cyber-green shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-cyber-border">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-6 h-6 text-cyber-green" />
                <h2 className="text-xl font-bold text-cyber-green font-mono">
                  CART ({itemCount})
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="p-2 text-gray-400 hover:text-cyber-green transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Content */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <ShoppingBag className="w-16 h-16 text-gray-600 mb-4" />
                  <h3 className="text-lg font-bold text-gray-400 mb-2 font-mono">
                    Cart is empty
                  </h3>
                  <p className="text-gray-500 text-sm font-mono mb-6">
                    Add some cyber tools to get started
                  </p>
                  <Link
                    to="/products"
                    onClick={closeCart}
                    className="cyber-btn"
                  >
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="cyber-card p-4"
                    >
                      <div className="flex items-start space-x-3">
                        {/* Product Image */}
                        <div className="w-16 h-16 bg-cyber-dark border border-cyber-border rounded flex items-center justify-center flex-shrink-0">
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
                          <h4 className="text-cyber-green font-bold text-sm font-mono truncate">
                            {item.name}
                          </h4>
                          <p className="text-gray-400 text-xs font-mono mt-1">
                            {item.category} • {item.type}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-cyber-blue font-bold font-mono">
                              {formatPrice(item.price)}
                            </span>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-6 h-6 flex items-center justify-center border border-cyber-green text-cyber-green hover:bg-cyber-green hover:text-black transition-all text-xs"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-cyber-green font-mono text-sm w-8 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center border border-cyber-green text-cyber-green hover:bg-cyber-green hover:text-black transition-all text-xs"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-cyber-red transition-colors p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-cyber-border p-4">
                {/* Total */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-400 font-mono">Total:</span>
                  <span className="text-2xl font-bold text-cyber-green font-mono price-glow">
                    {formatPrice(total)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Link
                    to="/checkout"
                    onClick={closeCart}
                    className="w-full bg-cyber-green text-black hover:bg-cyber-blue hover:text-white transition-all duration-300 px-4 py-3 font-mono font-bold uppercase tracking-wider text-center block rounded shadow-glow-green hover:shadow-glow-blue"
                  >
                    <CreditCard className="w-5 h-5 inline mr-2" />
                    Proceed to Checkout
                  </Link>
                  
                  <Link
                    to="/cart"
                    onClick={closeCart}
                    className="w-full cyber-btn text-center block"
                  >
                    View Cart Details
                  </Link>
                </div>

                {/* Security Notice */}
                <p className="text-xs text-gray-500 font-mono mt-3 text-center">
                  🔒 Secured by 256-bit SSL encryption
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Cart;