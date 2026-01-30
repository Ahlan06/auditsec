import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const AuthOAuthCallbackPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const acceptOAuthToken = useAuthStore((s) => s.acceptOAuthToken);
  const [error, setError] = useState('');

  const { token, provider, next } = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return {
      token: sp.get('token'),
      provider: sp.get('provider'),
      next: sp.get('next'),
    };
  }, [location.search]);

  const safeNext = useMemo(() => {
    const raw = String(next || '').trim();
    if (!raw) return '/account';
    if (!raw.startsWith('/')) return '/account';
    if (raw.startsWith('//')) return '/account';
    if (raw.includes('://')) return '/account';
    return raw;
  }, [next]);

  useEffect(() => {
    (async () => {
      if (!token) {
        setError('Token manquant');
        return;
      }
      try {
        await acceptOAuthToken(token);
        navigate(safeNext, { replace: true });
      } catch {
        setError('OAuth échoué');
      }
    })();
  }, [token, acceptOAuthToken, navigate, safeNext]);

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-24 pb-24">
      <div className="max-w-xl md:max-w-2xl mx-auto px-6">
        <div className="apple-card p-8 md:p-10">
          <h1 className="text-2xl font-semibold mb-2">OAuth callback</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Provider: {provider || 'unknown'}</p>
          {error ? (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          ) : (
            <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">Connexion…</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthOAuthCallbackPage;
