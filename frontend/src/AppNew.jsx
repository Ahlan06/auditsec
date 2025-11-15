import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import HeaderApple from './components/HeaderApple';
import FooterApple from './components/FooterApple';
import ScrollToTop from './components/ScrollToTop';
import HomePageSimple from './pages/HomePageSimple';
import ContactPageApple from './pages/ContactPageApple';
import ServicesPageApple from './pages/ServicesPageApple';
import GuidesPageApple from './pages/GuidesPageApple';
import ProductsPageApple from './pages/ProductsPageApple';
import CartPage from './pages/CartPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import CheckoutPage from './pages/CheckoutPage';
import CryptoPaymentPage from './pages/CryptoPaymentPage';
import CartNew from './components/CartNew';

function App() {
  useEffect(() => {
    // Appliquer le style Apple par défaut
    document.body.className = '';
    document.documentElement.className = '';
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-white text-gray-900">
        <HeaderApple />
        <main>
          <Routes>
            <Route path="/" element={<HomePageSimple />} />
            <Route path="/guides" element={<GuidesPageApple />} />
            <Route path="/services" element={<ServicesPageApple />} />
            <Route path="/products" element={<ProductsPageApple />} />
            <Route path="/contact" element={<ContactPageApple />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/crypto-payment" element={<CryptoPaymentPage />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
          </Routes>
        </main>
        <FooterApple />
        <CartNew />
      </div>
    </Router>
  );
}

export default App;