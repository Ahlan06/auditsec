import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Bitcoin, Loader2, AlertCircle } from 'lucide-react';
import useCartStore from '../store/cartStore';
import useThemeStore from '../store/themeStore';
import { isApiConfigured, paymentAPI } from '../services/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCartStore();
  const { isDarkMode } = useThemeStore();
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [cryptoCurrency, setCryptoCurrency] = useState('bitcoin');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

  const handleStripePayment = async () => {
    try {
      setIsProcessing(true);
      setError('');

      if (!isApiConfigured) {
        throw new Error('Payments are disabled in demo mode (API not configured).');
      }

      if (!stripePublicKey) {
        throw new Error('Stripe is not configured for this deployment.');
      }

      if (!window.Stripe) {
        throw new Error('Stripe.js is not available.');
      }

      // Préparer les items pour l'API avec toutes les données produit
      const cartItems = items.map(item => ({
        productId: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        quantity: item.quantity || 1
      }));

      console.log('🛒 Sending cart items to backend:', cartItems);

      // Create Stripe session
      const { sessionId } = await paymentAPI.createStripeSession(cartItems, email);

      // Charger Stripe
      const stripe = window.Stripe(stripePublicKey);
      
      // Rediriger vers Stripe Checkout
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        throw new Error(error.message);
      }
    } catch (err) {
      console.error('Stripe payment error:', err);
      setError(err.message || 'Payment error');
      setIsProcessing(false);
    }
  };

  const handleCryptoPayment = async () => {
    try {
      setIsProcessing(true);
      setError('');

      if (!isApiConfigured) {
        throw new Error('Crypto payments are disabled in demo mode (API not configured).');
      }

      // Prepare items for API
      const cartItems = items.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }));

      // Create crypto payment
      const cryptoData = await paymentAPI.createCryptoPayment(
        cartItems,
        email,
        cryptoCurrency
      );

      // Redirect to crypto payment page with info
      navigate('/crypto-payment', {
        state: {
          orderId: cryptoData.orderId,
          paymentAddress: cryptoData.paymentAddress,
          amount: cryptoData.amount,
          currency: cryptoData.currency,
          qrCodeUrl: cryptoData.qrCodeUrl,
          expiresAt: cryptoData.expiresAt
        }
      });
    } catch (err) {
      console.error('Crypto payment error:', err);
      setError(err.message || 'Error creating crypto payment');
      setIsProcessing(false);
    }
  };

  const handlePayment = () => {
    if (paymentMethod === 'stripe') {
      handleStripePayment();
    } else {
      handleCryptoPayment();
    }
  };

  return (
    <div className={`min-h-screen pt-20 p-4 ${isDarkMode ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-md mx-auto">
        <h1 className={`text-2xl mb-6 font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Secure Checkout</h1>
        
        {/* Payment method */}
        <div className="mb-6">
          <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Payment Method</h3>
          <div className="space-y-2">
            <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
              paymentMethod === 'stripe' 
                ? isDarkMode ? 'border-[#6b7280] bg-[#6b7280]/10' : 'border-[#6b7280] bg-gray-50'
                : isDarkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-300 hover:border-gray-400'
            }`}>
              <input
                type="radio"
                value="stripe"
                checked={paymentMethod === 'stripe'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-3"
              />
              <CreditCard className="w-5 h-5 mr-2" />
              <span>Credit Card</span>
            </label>
            
            <label className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
              paymentMethod === 'crypto' 
                ? isDarkMode ? 'border-[#6b7280] bg-[#6b7280]/10' : 'border-[#6b7280] bg-gray-50'
                : isDarkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-300 hover:border-gray-400'
            }`}>
              <input
                type="radio"
                value="crypto"
                checked={paymentMethod === 'crypto'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-3"
              />
              <Bitcoin className="w-5 h-5 mr-2" />
              <span>Cryptomonnaies</span>
            </label>
          </div>
        </div>

        {/* Crypto Currency Selection (if crypto selected) */}
        {paymentMethod === 'crypto' && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Cryptomonnaie</h3>
            <select
              value={cryptoCurrency}
              onChange={(e) => setCryptoCurrency(e.target.value)}
              className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white border-gray-300'}`}
            >
              <option value="bitcoin">Bitcoin (BTC)</option>
              <option value="ethereum">Ethereum (ETH)</option>
              <option value="litecoin">Litecoin (LTC)</option>
            </select>
          </div>
        )}

        {/* Email */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-3 py-2 rounded border ${isDarkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white border-gray-300'}`}
            placeholder="votre@email.com"
            disabled={isProcessing}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className={`mb-6 p-4 rounded border flex items-start ${isDarkMode ? 'bg-red-900/20 border-red-500/50 text-red-400' : 'bg-red-50 border-red-300 text-red-700'}`}>
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        
        {/* Total */}
        <div className={`p-4 rounded-lg border mb-6 ${isDarkMode ? 'bg-[#1d1d1f] border-gray-800' : 'bg-gray-100 border-gray-300'}`}>
          <div className="flex justify-between items-center">
            <span className={`font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total TTC:</span>
            <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>€{(total * 1.2).toFixed(2)}</span>
          </div>
        </div>
        
        {/* Payment button */}
        <button 
          onClick={handlePayment}
          disabled={!email.trim() || isProcessing}
          className={`w-full py-3 rounded-full font-semibold transition-all flex items-center justify-center ${
            email.trim() && !isProcessing
                ? isDarkMode ? 'bg-[#6b7280] hover:bg-[#4b5563] text-white' : 'bg-[#6b7280] hover:bg-[#4b5563] text-white'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Traitement...
            </>
          ) : (
            paymentMethod === 'stripe' ? 'Payer par Carte' : 'Payer en Crypto'
          )}
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
