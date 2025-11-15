import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Download, Mail, Home, Shield } from 'lucide-react';
import useThemeStore from '../store/themeStore';

const PaymentSuccessPage = () => {
  const { isDarkMode } = useThemeStore();
  const location = useLocation();
  
  // Get payment data from navigation
  const paymentData = location.state || {
    paymentMethod: 'stripe',
    total: 0,
    email: '',
    items: 0
  };

  useEffect(() => {
    // Here we could send a confirmation email
    console.log('Payment successful:', paymentData);
  }, [paymentData]);

  return (
    <div className={`min-h-screen py-8 pt-20 ${
      isDarkMode ? 'bg-black text-green-400' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${
            isDarkMode ? 'bg-green-500/10 border-2 border-green-500' : 'bg-emerald-100 border-2 border-emerald-500'
          }`}>
            <CheckCircle className={`w-12 h-12 ${
              isDarkMode ? 'text-green-400' : 'text-emerald-600'
            }`} />
          </div>
          
          <h1 className={`text-4xl font-bold mb-4 ${
            isDarkMode ? 'text-green-400' : 'text-gray-900'
          }`}>
            Payment Successful!
          </h1>
          
          <p className={`text-lg ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Your order has been processed successfully
          </p>
        </div>

        {/* Payment Details */}
        <div className={`bg-gradient-to-r rounded-lg p-6 mb-8 ${
          isDarkMode 
            ? 'from-gray-900 to-gray-800 border border-green-500/20' 
            : 'from-white to-gray-50 border border-gray-200'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className={`text-lg font-bold mb-4 ${
                isDarkMode ? 'text-green-400' : 'text-gray-900'
              }`}>
                Order Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Payment method:
                  </span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {paymentData.paymentMethod === 'stripe' ? 'Credit Card' : 'Cryptocurrency'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Number of items:
                  </span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {paymentData.items}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                    Total paid:
                  </span>
                  <span className={`font-bold text-lg ${
                    isDarkMode ? 'text-green-400' : 'text-emerald-600'
                  }`}>
                    €{paymentData.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className={`text-lg font-bold mb-4 ${
                isDarkMode ? 'text-green-400' : 'text-gray-900'
              }`}>
                Delivery
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className={`w-5 h-5 ${
                    isDarkMode ? 'text-green-400' : 'text-emerald-600'
                  }`} />
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Confirmation email sent
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {paymentData.email}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Download className={`w-5 h-5 ${
                    isDarkMode ? 'text-green-400' : 'text-emerald-600'
                  }`} />
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Download links available
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Expires in 24h
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className={`rounded-lg p-6 mb-8 ${
          isDarkMode 
            ? 'bg-blue-900/20 border border-blue-500/30' 
            : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-start space-x-3">
            <Shield className={`w-6 h-6 mt-1 ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`} />
            <div>
              <h4 className={`font-bold mb-2 ${
                isDarkMode ? 'text-blue-400' : 'text-blue-900'
              }`}>
                Important - Ethical Use
              </h4>
              <p className={`text-sm leading-relaxed ${
                isDarkMode ? 'text-blue-200' : 'text-blue-800'
              }`}>
                The tools you have purchased are intended exclusively for ethical and legal purposes. 
                Make sure to respect all local laws and obtain appropriate authorizations 
                before using these security tools.
              </p>
            </div>
          </div>
        </div>

        {/* Download Links Simulation */}
        <div className={`rounded-lg p-6 mb-8 ${
          isDarkMode ? 'bg-gray-900 border border-green-500/20' : 'bg-white border border-gray-200'
        }`}>
          <h3 className={`text-lg font-bold mb-4 ${
            isDarkMode ? 'text-green-400' : 'text-gray-900'
          }`}>
            Your Downloads
          </h3>
          
          <div className="space-y-3">
            {/* These links would be dynamic in production */}
            {['OSINT Toolkit Pro', 'Web Penetration Testing Kit', 'Cybersecurity Guide 2025'].slice(0, paymentData.items).map((product, index) => (
              <div key={index} className={`flex items-center justify-between p-4 rounded-lg ${
                isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isDarkMode ? 'bg-green-500/20' : 'bg-emerald-100'
                  }`}>
                    <Download className={`w-5 h-5 ${
                      isDarkMode ? 'text-green-400' : 'text-emerald-600'
                    }`} />
                  </div>
                  <div>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {product}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      ZIP Archive • 15.2 MB
                    </p>
                  </div>
                </div>
                
                <button className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDarkMode 
                    ? 'bg-green-600 hover:bg-green-700 text-black' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}>
                  Download
                </button>
              </div>
            ))}
          </div>
          
          <div className={`mt-4 p-3 rounded-lg ${
            isDarkMode ? 'bg-yellow-900/20 border border-yellow-500/30' : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <p className={`text-xs ${
              isDarkMode ? 'text-yellow-200' : 'text-yellow-800'
            }`}>
              ⚠️ These links will expire in 24 hours for security reasons. 
              Download your files now.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="text-center space-y-4">
          <Link
            to="/"
            className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
              isDarkMode 
                ? 'bg-green-600 hover:bg-green-700 text-black' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <Home className="w-5 h-5 mr-2" />
            Back to home
          </Link>
          
          <div>
            <Link
              to="/products"
              className={`text-sm underline ${
                isDarkMode ? 'text-green-400 hover:text-green-300' : 'text-emerald-600 hover:text-emerald-700'
              }`}
            >
              Continue shopping
            </Link>
          </div>
        </div>

        {/* Support */}
        <div className="text-center mt-8">
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Issue with your order?{' '}
            <Link 
              to="/contact"
              className={`underline ${
                isDarkMode ? 'text-green-400 hover:text-green-300' : 'text-emerald-600 hover:text-emerald-700'
              }`}
            >
              Contact our support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;