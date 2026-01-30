import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Download, Mail, ArrowRight } from 'lucide-react';

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // In a real app, fetch order details from the backend
      setTimeout(() => {
        setOrderDetails({
          orderId: 'ZD-' + Date.now(),
          email: 'customer@example.com',
          total: 29.99,
          items: [
            {
              name: 'AuditSec Recon Pack',
              price: 29.99
            }
          ]
        });
        setLoading(false);
      }, 1000);
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="cyber-spinner w-12 h-12 mx-auto mb-4"></div>
          <p className="text-cyber-green font-mono">Processing your order...</p>
        </div>
      </div>
    );
  }

  if (!sessionId || !orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-cyber-red font-mono mb-4">
            Order Not Found
          </h1>
          <Link to="/products" className="cyber-btn">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <CheckCircle className="w-24 h-24 text-cyber-green mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-cyber-green font-cyber mb-4">
            Payment Successful!
          </h1>
          <p className="text-gray-400 font-mono text-lg">
            Your order has been processed and download links are on their way.
          </p>
        </div>

        <div className="cyber-card p-8 mb-8">
          <h2 className="text-2xl font-bold text-cyber-green font-mono mb-6">
            Order Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-cyber-blue font-mono font-bold mb-2">Order ID</h3>
              <p className="text-gray-300 font-mono">{orderDetails.orderId}</p>
            </div>
            <div>
              <h3 className="text-cyber-blue font-mono font-bold mb-2">Email</h3>
              <p className="text-gray-300 font-mono">{orderDetails.email}</p>
            </div>
          </div>

          <div className="border-t border-cyber-border pt-6">
            <h3 className="text-cyber-blue font-mono font-bold mb-4">Items Purchased</h3>
            {orderDetails.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2">
                <span className="text-gray-300 font-mono">{item.name}</span>
                <span className="text-cyber-green font-mono font-bold">
                  €{item.price.toFixed(2)}
                </span>
              </div>
            ))}
            <div className="border-t border-cyber-border pt-2 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-cyber-green font-mono">Total:</span>
                <span className="text-2xl font-bold text-cyber-blue font-mono">
                  €{orderDetails.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="cyber-card p-6">
            <div className="flex items-start space-x-4">
              <Mail className="w-8 h-8 text-cyber-blue flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-cyber-blue font-mono font-bold mb-2">
                  Check Your Email
                </h3>
                <p className="text-gray-400 font-mono text-sm">
                  Download links have been sent to {orderDetails.email}. 
                  Links will expire in 24 hours.
                </p>
              </div>
            </div>
          </div>

          <div className="cyber-card p-6">
            <div className="flex items-start space-x-4">
              <Download className="w-8 h-8 text-cyber-green flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-cyber-green font-mono font-bold mb-2">
                  Instant Access
                </h3>
                <p className="text-gray-400 font-mono text-sm">
                  Your digital products are ready for download. 
                  All files include documentation and setup guides.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="cyber-card p-6 border-cyber-accent mb-8">
          <h3 className="text-cyber-accent font-mono font-bold mb-4">
            ⚠️ Important Security Reminder
          </h3>
          <ul className="text-gray-400 font-mono text-sm space-y-2">
            <li>• Use these tools only for authorized testing</li>
            <li>• Ensure you have proper permissions before scanning</li>
            <li>• Follow all applicable laws and regulations</li>
            <li>• Keep your tools updated for best security practices</li>
          </ul>
        </div>

        <div className="text-center">
          <Link
            to="/products"
            className="cyber-btn px-8 py-3 text-lg inline-flex items-center"
          >
            Continue Shopping
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;