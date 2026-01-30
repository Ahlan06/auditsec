import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { authApi } from '../services/authApi';

const AccountPage = () => {
  const { user, logout, hydrateMe } = useAuthStore();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    hydrateMe().catch(() => {});
  }, [hydrateMe]);

  const onLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const [requestInfo, setRequestInfo] = useState('');
  const requestEmail = async () => {
    setRequestInfo('');
    try {
      await authApi.requestEmailVerification();
      setRequestInfo('Email de vérification demandé (si SMTP configuré).');
    } catch (err) {
      setRequestInfo(err.response?.data?.error || 'Erreur');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-24 pb-24">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100">My Account</h1>
          <button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg transition-all duration-200 shadow-lg" onClick={onLogout}>
            Sign out
          </button>
        </div>

        {error && <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg">{error}</div>}

        <div className="apple-card p-8 md:p-10 mb-6">
          <h2 className="text-2xl font-semibold mb-6">Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-4">
              <div>
                <span className="block text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">Email</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">{user?.email || '—'}</span>
              </div>
              <div>
                <span className="block text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">Phone</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">{user?.phone || '—'}</span>
              </div>
              <div>
                <span className="block text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">Full Name</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">{[user?.firstName, user?.lastName].filter(Boolean).join(' ') || '—'}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <span className="block text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">Email Verified</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${user?.emailVerified ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'}`}>
                  {user?.emailVerified ? '✓ Verified' : '✗ Not verified'}
                </span>
              </div>
              <div>
                <span className="block text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide mb-1">Phone Verified</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${user?.phoneVerified ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'}`}>
                  {user?.phoneVerified ? '✓ Verified' : '✗ Not verified'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="apple-card p-8 md:p-10">
            <h2 className="text-2xl font-semibold mb-6">Verification</h2>
            <div className="space-y-3">
              <button className="apple-button py-3 w-full" onClick={requestEmail}>Request email verification</button>
              <Link className="apple-button py-3 w-full text-center block" to="/auth/verify-email">Confirm email</Link>
              <Link className="apple-button py-3 w-full text-center block" to="/auth/verify-phone">Verify phone</Link>
              {requestInfo && <p className="text-sm text-gray-700 dark:text-gray-300 mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">{requestInfo}</p>}
            </div>
          </div>

          <div className="apple-card p-8 md:p-10">
            <h2 className="text-2xl font-semibold mb-6">Security</h2>
            <div className="space-y-3">
              <Link className="apple-button py-3 w-full text-center block" to="/auth/forgot-password">Reset password</Link>
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Your account is protected by JWT authentication. All API routes are secured via <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs">/api/auth/me</code>.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
