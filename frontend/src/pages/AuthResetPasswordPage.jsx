import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../services/authApi';

const AuthResetPasswordPage = () => {
  const [mode, setMode] = useState('token');
  const [token, setToken] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const sp = new URLSearchParams(location.search);
    const t = sp.get('token');
    if (t) {
      setToken(t);
      setMode('token');
    }
  }, [location.search]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      if (mode === 'sms') {
        await authApi.resetPasswordWithSms(phone, code, newPassword);
      } else {
        await authApi.resetPasswordWithToken(token, newPassword);
      }
      setMessage('Mot de passe mis à jour.');
      setTimeout(() => navigate('/auth/login'), 700);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-24 pb-24">
      <div className="max-w-xl md:max-w-2xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900 dark:text-gray-100">Réinitialiser le mot de passe</h1>

        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        {message && <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">{message}</div>}

        <form onSubmit={onSubmit} className="space-y-6 apple-card p-8 md:p-10">
          <div>
            <label className="block text-sm md:text-base mb-2">Méthode</label>
            <select className="w-full border rounded-lg px-4 py-3 text-base" value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="token">Token (email)</option>
              <option value="sms">Code (SMS)</option>
            </select>
          </div>

          {mode === 'sms' ? (
            <>
              <div>
                <label className="block text-sm md:text-base mb-2">Téléphone</label>
                <input className="w-full border rounded-lg px-4 py-3 text-base" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm md:text-base mb-2">Code</label>
                <input className="w-full border rounded-lg px-4 py-3 text-base" value={code} onChange={(e) => setCode(e.target.value)} required />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm md:text-base mb-2">Token</label>
              <input className="w-full border rounded-lg px-4 py-3 text-base" value={token} onChange={(e) => setToken(e.target.value)} required />
            </div>
          )}

          <div>
            <label className="block text-sm md:text-base mb-2">Nouveau mot de passe</label>
            <input className="w-full border rounded-lg px-4 py-3 text-base" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">8 caractères minimum.</p>
          </div>

          <button disabled={loading} className="apple-button w-full py-3">{loading ? 'Validation…' : 'Valider'}</button>
          <div className="text-sm text-center"><Link to="/auth/login" className="text-blue-600">Retour connexion</Link></div>
        </form>
      </div>
    </div>
  );
};

export default AuthResetPasswordPage;
