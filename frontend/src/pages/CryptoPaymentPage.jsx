import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Copy, CheckCircle, Clock, AlertCircle, Bitcoin } from 'lucide-react';
import useThemeStore from '../store/themeStore';
import { isApiConfigured, paymentAPI } from '../services/api';

const CryptoPaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode } = useThemeStore();
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [checkingPayment, setCheckingPayment] = useState(false);

  const paymentData = location.state || {};

  useEffect(() => {
    if (!isApiConfigured) return;

    // Check payment status every 30 seconds
    const checkInterval = setInterval(async () => {
      if (paymentData.orderId) {
        setCheckingPayment(true);
        try {
          const status = await paymentAPI.checkCryptoPaymentStatus(paymentData.orderId);
          if (status.status === 'completed') {
            navigate('/payment-success', {
              state: {
                orderId: paymentData.orderId,
                paymentMethod: paymentData.currency
              }
            });
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
        } finally {
          setCheckingPayment(false);
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkInterval);
  }, [paymentData.orderId, navigate]);

  useEffect(() => {
    // Countdown timer
    if (paymentData.expiresAt) {
      const updateTimer = () => {
        const now = new Date();
        const expires = new Date(paymentData.expiresAt);
        const diff = expires - now;

        if (diff <= 0) {
          setTimeLeft('Expired');
        } else {
          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
      };

      updateTimer();
      const timer = setInterval(updateTimer, 1000);
      return () => clearInterval(timer);
    }
  }, [paymentData.expiresAt]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!paymentData.paymentAddress) {
    return (
      <div className={`min-h-screen pt-20 p-4 ${isDarkMode ? 'bg-black text-green-400' : 'bg-gray-50 text-gray-900'}`}>
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-4">Payment Not Found</h2>
          <button
            onClick={() => navigate('/checkout')}
            className={`px-6 py-3 rounded font-bold ${isDarkMode ? 'bg-green-600 text-black' : 'bg-emerald-600 text-white'}`}
          >
            Back to Checkout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-20 p-4 ${isDarkMode ? 'bg-black text-green-400' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-2xl mx-auto">
        <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-900 border-green-500/20' : 'bg-white border-gray-200'}`}>
          
          {/* Header */}
          <div className="text-center mb-6">
            <Bitcoin className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-green-400' : 'text-emerald-600'}`} />
            <h1 className="text-2xl font-bold mb-2">Crypto Payment</h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Send exactly the amount indicated to the address below
            </p>
          </div>

          {/* Timer */}
          {timeLeft && (
            <div className={`mb-6 p-4 rounded border flex items-center justify-center ${
              isDarkMode ? 'bg-yellow-900/20 border-yellow-500/50 text-yellow-400' : 'bg-yellow-50 border-yellow-300 text-yellow-700' 
            }`}>
              <Clock className="w-5 h-5 mr-2" />
              <span className="font-bold">Time remaining: {timeLeft}</span>
            </div>
          )}

          {/* Amount */}
          <div className={`mb-6 p-6 rounded border text-center ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-50 border-gray-300'}`}>
            <p className="text-sm mb-2">Amount to send</p>
            <p className="text-3xl font-bold mb-1">
              {paymentData.amount} {paymentData.currency?.toUpperCase()}
            </p>
          </div>

          {/* QR Code */}
          {paymentData.qrCodeUrl && (
            <div className="mb-6 text-center">
              <img
                src={paymentData.qrCodeUrl} 
                alt="QR Code"
                className="mx-auto border-4 border-green-500 rounded"
              />
              <p className="text-xs mt-2 text-gray-500">Scan with your crypto wallet</p>
            </div>
          )}

          {/* Address */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Payment address</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={paymentData.paymentAddress}
                readOnly
                className={`flex-1 px-3 py-2 rounded border font-mono text-sm ${isDarkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-gray-100 border-gray-300'}`}
              />
              <button
                onClick={() => copyToClipboard(paymentData.paymentAddress)}
                className={`px-4 py-2 rounded font-bold flex items-center ${
                  isDarkMode ? 'bg-green-600 text-black' : 'bg-emerald-600 text-white'
                }`}
              >
                {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className={`p-4 rounded border ${isDarkMode ? 'bg-blue-900/20 border-blue-500/50 text-blue-400' : 'bg-blue-50 border-blue-300 text-blue-700'}`}>
            <h3 className="font-bold mb-2">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Copy the payment address above</li>
              <li>Open your crypto wallet ({paymentData.currency?.toUpperCase()})</li>
              <li>Send exactly {paymentData.amount} {paymentData.currency?.toUpperCase()}</li>
              <li>Wait for confirmation (may take 10-30 min)</li>
              <li>You will receive an email with your download links</li>
            </ol>
          </div>

          {/* Status Check */}
          <div className="mt-6 text-center">
            <button
              onClick={async () => {
                setCheckingPayment(true);
                try {
                  const status = await paymentAPI.checkCryptoPaymentStatus(paymentData.orderId);
                  if (status.status === 'completed') {
                    navigate('/payment-success', {
                      state: {
                        orderId: paymentData.orderId,
                        paymentMethod: paymentData.currency
                      }
                    });
                  } else {
                    alert('Payment pending. Please wait...');
                  }
                } catch (error) {
                  alert('Error checking payment');
                } finally {
                  setCheckingPayment(false);
                }
              }}
              disabled={checkingPayment}
              className={`px-6 py-2 rounded font-bold ${
                checkingPayment
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : isDarkMode ? 'bg-gray-700 text-green-400 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {checkingPayment ? 'Checking...' : 'Check Payment'}
            </button>
          </div>

          {/* Warning */}
          <div className={`mt-6 p-4 rounded border ${isDarkMode ? 'bg-red-900/20 border-red-500/50 text-red-400' : 'bg-red-50 border-red-300 text-red-700'}`}>
            <p className="text-sm">
              ⚠️ <strong>Important:</strong> Only send {paymentData.currency?.toUpperCase()} to this address.
              Any other crypto or incorrect amount will be lost.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoPaymentPage;
