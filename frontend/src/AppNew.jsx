import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import HeaderApple from './components/HeaderApple';
import FooterApple from './components/FooterApple';
import ScrollToTop from './components/ScrollToTop';
import ApiErrorBoundary from './components/ApiErrorBoundary';
import { UpgradeRequiredModal } from './components/UpgradeRequired';
import HomePageSimple from './pages/HomePageSimple';
import ContactPageApple from './pages/ContactPageApple';
import ServicesPageApple from './pages/ServicesPageApple';
import GuidesPageApple from './pages/GuidesPageApple';
import ProductsPageApple from './pages/ProductsPageApple';
import PreAuditPage from './pages/PreAuditPage';
import TestsTechniquesPage from './pages/TestsTechniquesPage';
import ConformitePage from './pages/ConformitePage';
import RemediationPage from './pages/RemediationPage';
import CourseListPage from './pages/CourseListPage';
import CourseDetailPage from './pages/CourseDetailPage';
import CourseMockPage from './pages/CourseMockPage';
import CartPage from './pages/CartPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import CheckoutPage from './pages/CheckoutPage';
import CryptoPaymentPage from './pages/CryptoPaymentPage';
import CartNew from './components/CartNew';
import ClientLoginPage from './pages/ClientLoginPage';
import ClientRegisterPage from './pages/ClientRegisterPage';
import ClientDashboardPage from './pages/ClientDashboardPage';
import ClientOsintBoxPage from './pages/ClientOsintBoxPage';
import ClientAuditScanPage from './pages/ClientAuditScanPage';
import ClientAssetsPage from './pages/ClientAssetsPage';
import ClientSupportPage from './pages/ClientSupportPage';
import ClientMonitoringPage from './pages/ClientMonitoringPage';
import ClientForgotPasswordPage from './pages/ClientForgotPasswordPage';
import ClientResetPasswordPage from './pages/ClientResetPasswordPage';
import ClientAuditsInProgressPage from './pages/ClientAuditsInProgressPage';
import ClientAuditsHistoryPage from './pages/ClientAuditsHistoryPage';
import ClientReportsManagerPage from './pages/ClientReportsManagerPage';
import ClientProfilePage from './pages/ClientProfilePage';
import ClientSubscriptionPage from './pages/ClientSubscriptionPage';
import ClientToolsPage from './pages/ClientToolsPage';
import ClientAuditWorkflowPage from './pages/ClientAuditWorkflowPage';
import ClientAssistantPage from './pages/ClientAssistantPageNew.jsx';
import ClientSectionPage from './components/client-dashboard/ClientSectionPage.tsx';
import ClientDashboardLayout from './components/client-dashboard/ClientDashboardLayout';

import AuthLoginPage from './pages/AuthLoginPage';
import AuthRegisterPage from './pages/AuthRegisterPage';
import AuthForgotPasswordPage from './pages/AuthForgotPasswordPage';
import AuthResetPasswordPage from './pages/AuthResetPasswordPage';
import AuthVerifyEmailPage from './pages/AuthVerifyEmailPage';
import AuthVerifyPhonePage from './pages/AuthVerifyPhonePage';
import AuthOAuthCallbackPage from './pages/AuthOAuthCallbackPage';
import AccountPage from './pages/AccountPage';
import TermsPage from './pages/TermsPage';
import ProtectedRoute from './components/ProtectedRoute';

function AppShell() {
  const location = useLocation();
  const isClientArea = location.pathname.startsWith('/client');

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {!isClientArea && <HeaderApple />}
      <main>
        <Routes>
          <Route path="/" element={<HomePageSimple />} />
          <Route path="/guides" element={<GuidesPageApple />} />
          <Route path="/guides/pre-audit-reconnaissance" element={<PreAuditPage />} />
          <Route path="/guides/tests-techniques" element={<TestsTechniquesPage />} />
          <Route path="/guides/conformite-normes" element={<ConformitePage />} />
          <Route path="/guides/remediation-validation" element={<RemediationPage />} />
          <Route path="/services" element={<ServicesPageApple />} />
          <Route path="/products" element={<ProductsPageApple />} />
          <Route path="/contact" element={<ContactPageApple />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/crypto-payment" element={<CryptoPaymentPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />

          {/* Auth (MongoDB-backed) */}
          <Route path="/auth/login" element={<AuthLoginPage />} />
          <Route path="/auth/register" element={<AuthRegisterPage />} />
          <Route path="/auth/forgot-password" element={<AuthForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<AuthResetPasswordPage />} />
          <Route path="/auth/verify-email" element={<AuthVerifyEmailPage />} />
          <Route path="/auth/verify-phone" element={<AuthVerifyPhonePage />} />
          <Route path="/auth/oauth/callback" element={<AuthOAuthCallbackPage />} />

          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />

          {/* Client auth pages - redirect to main auth */}
          <Route path="/client/login" element={<Navigate to="/auth/login" replace />} />
          <Route path="/client/register" element={<Navigate to="/auth/register" replace />} />
          <Route path="/client/forgot-password" element={<Navigate to="/auth/forgot-password" replace />} />
          <Route path="/client/reset-password" element={<Navigate to="/auth/reset-password" replace />} />

          {/* Client dashboard layout */}
          <Route path="/client" element={<ClientDashboardLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ClientDashboardPage />} />

            <Route path="assistant" element={<ClientAssistantPage />} />

            {/* Sidebar placeholder routes */}
            <Route
              path="audits/en-cours"
              element={<ClientAuditsInProgressPage />}
            />
            <Route
              path="audits/historique"
              element={<ClientAuditsHistoryPage />}
            />
            <Route
              path="rapports"
              element={<ClientReportsManagerPage />}
            />
            <Route
              path="outils"
              element={<ClientToolsPage />}
            />
            <Route
              path="securite/scan"
              element={<ClientAuditWorkflowPage />}
            />
            <Route
              path="securite/surveillance"
              element={<ClientMonitoringPage />}
            />
            <Route
              path="securite/alertes"
              element={<ClientSectionPage title="Alerts" description="View your security alerts and notifications." />}
            />
            <Route
              path="compte/profil"
              element={<ClientProfilePage />}
            />
            <Route
              path="compte/abonnement"
              element={<ClientSubscriptionPage />}
            />
            <Route
              path="compte/facturation"
              element={<ClientSectionPage title="Billing" description="Review invoices and payment information." />}
            />
            <Route
              path="compte/parametres"
              element={<ClientSectionPage title="Settings" description="Adjust your account settings." />}
            />

            <Route path="osint-box" element={<ClientOsintBoxPage />} />
            <Route path="audit-scan" element={<ClientAuditScanPage />} />
            <Route path="assets" element={<ClientAssetsPage />} />
            <Route path="support" element={<ClientSupportPage />} />
          </Route>

          {/* Courses routes (restored) */}
          <Route path="/courses" element={<CourseListPage />} />
          <Route path="/courses/:slug" element={<CourseDetailPage />} />
          <Route path="/courses-mock" element={<CourseMockPage />} />
        </Routes>
      </main>
      {!isClientArea && <FooterApple />}
      {!isClientArea && <CartNew />}
    </div>
  );
}

function App() {
  useEffect(() => {
    // Appliquer le style Apple par défaut
    document.body.className = '';
    document.documentElement.className = '';
  }, []);

  return (
    <Router>
      <ApiErrorBoundary>
        <ScrollToTop />
        <AppShell />
        <UpgradeRequiredModal />
      </ApiErrorBoundary>
    </Router>
  );
}

export default App;