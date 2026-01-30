import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { authApi } from '../services/authApi';

const AuthVerifyEmailPage = () => {
  const token = useAuthStore((s) => s.token);
  const hydrateMe = useAuthStore((s) => s.hydrateMe);
  const location = useLocation();
  const [verificationToken, setVerificationToken] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const t = sp.get('token');
    if (t) setVerificationToken(t);
  }, [location.search]);

  const request = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const data = await authApi.requestEmailVerification();
      if (data?.verifyUrl || data?.devToken) {
        if (data?.devToken) setVerificationToken(data.devToken);
        setMessage(
          `Email request created. ${data?.warning ? 'Note: ' + data.warning : ''}`
        );
      } else {
        setMessage('Si possible, un email de vérification a été envoyé.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const confirm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await authApi.confirmEmailVerification(verificationToken);
      setMessage('Email vérifié.');
      await hydrateMe();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-24 pb-24">
      <div className="max-w-xl md:max-w-2xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900 dark:text-gray-100">Vérification email</h1>

        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        {message && <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">{message}</div>}

        <div className="apple-card p-8 md:p-10 mb-8 space-y-4">
          <h2 className="text-xl font-semibold">Demander un email de vérification</h2>
          <button disabled={!token || loading} className="apple-button py-3 w-full" onClick={request}>
            {token ? (loading ? 'Envoi…' : 'Envoyer') : 'Connecte-toi pour demander'}
          </button>
        </div>

        <form onSubmit={confirm} className="apple-card p-8 md:p-10 space-y-6">
          <h2 className="text-xl font-semibold">Confirmer avec un token</h2>
          <div>
            <label className="block text-sm md:text-base mb-2">Token</label>
            <input className="w-full border rounded-lg px-4 py-3 text-base" value={verificationToken} onChange={(e) => setVerificationToken(e.target.value)} required />
          </div>
          <button disabled={loading} className="apple-button py-3 w-full">{loading ? 'Validation…' : 'Valider'}</button>
          <div className="text-sm text-center"><Link to="/account" className="text-blue-600">Retour compte</Link></div>
        </form>
      </div>
    </div>
  );
};

export default AuthVerifyEmailPage;
