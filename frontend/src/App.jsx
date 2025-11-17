import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import HeaderApple from './components/HeaderApple';
import FooterApple from './components/FooterApple';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import SuccessPage from './pages/SuccessPage';
import DownloadPage from './pages/DownloadPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import GuidesPage from './pages/GuidesPage';
import GuideDetailPage from './pages/GuideDetailPage';
import CategoryListPage from './pages/CategoryListPage';
import Cart from './components/Cart';
import useThemeStore from './store/themeStore';
import './App.css';

function App() {
  const { initializeTheme } = useThemeStore();

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return (
    <Router>
      <div className="min-h-screen font-sans">
        <HeaderApple />
        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/download/:token" element={<DownloadPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/guides" element={<GuidesPage />} />
            <Route path="/category/:categoryId" element={<CategoryListPage />} />
            <Route path="/guide/:slug" element={<GuideDetailPage />} />
          </Routes>
        </main>
        <FooterApple />
        <Cart />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
              fontFamily: 'var(--font-mono)',
            },
            success: {
              iconTheme: {
                primary: 'var(--color-success)',
                secondary: 'var(--bg-secondary)',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--color-danger)',
                secondary: 'var(--bg-secondary)',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
