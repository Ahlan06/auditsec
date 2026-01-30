import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { authApi } from '../services/authApi';

const AuthVerifyPhonePage = () => {
  const token = useAuthStore((s) => s.token);
  const hydrateMe = useAuthStore((s) => s.hydrateMe);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const request = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const data = await authApi.requestPhoneVerification(phone);
      if (data?.devCode) {
        setCode(String(data.devCode));
        setMessage('Dev mode: SMS provider not configured. A dev code was generated and prefilled.');
      } else {
        setMessage('Si possible, un code SMS a été envoyé.');
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
      await authApi.confirmPhoneVerification(code);
      setMessage('Téléphone vérifié.');
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
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900 dark:text-gray-100">Vérification téléphone</h1>

        {!token && (
          <div className="mb-4 text-sm text-red-600">
            Connecte-toi d’abord pour vérifier ton téléphone.
          </div>
        )}

        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        {message && <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">{message}</div>}

        <form onSubmit={request} className="apple-card p-8 md:p-10 mb-8 space-y-6">
          <h2 className="text-xl font-semibold">Demander un code</h2>
          <div>
            <label className="block text-sm md:text-base mb-2">Téléphone (E.164, ex: +336...)</label>
            <input className="w-full border rounded-lg px-4 py-3 text-base" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <button disabled={!token || loading} className="apple-button py-3 w-full">
            {token ? (loading ? 'Envoi…' : 'Envoyer') : 'Connecte-toi pour demander'}
          </button>
        </form>

        <form onSubmit={confirm} className="apple-card p-8 md:p-10 space-y-6">
          <h2 className="text-xl font-semibold">Confirmer</h2>
          <div>
            <label className="block text-sm md:text-base mb-2">Code</label>
            <input className="w-full border rounded-lg px-4 py-3 text-base" value={code} onChange={(e) => setCode(e.target.value)} required />
          </div>
          <button disabled={!token || loading} className="apple-button py-3 w-full">
            {token ? (loading ? 'Validation…' : 'Valider') : 'Connecte-toi pour valider'}
          </button>
          <div className="text-sm text-center"><Link to="/account" className="text-blue-600">Retour compte</Link></div>
        </form>
      </div>
    </div>
  );
};

export default AuthVerifyPhonePage;
