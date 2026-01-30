import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../services/authApi';

const AuthForgotPasswordPage = () => {
  const [mode, setMode] = useState('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      if (mode === 'sms') {
        await authApi.forgotPasswordSms(phone);
        setMessage('Si un compte existe, un SMS de réinitialisation a été envoyé.');
      } else {
        await authApi.forgotPasswordEmail(email);
        setMessage('Si un compte existe, un email de réinitialisation a été envoyé.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-24 pb-24">
      <div className="max-w-xl md:max-w-2xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900 dark:text-gray-100">Mot de passe oublié</h1>

        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        {message && <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">{message}</div>}

        <form onSubmit={onSubmit} className="space-y-6 apple-card p-8 md:p-10">
          <div>
            <label className="block text-sm md:text-base mb-2">Méthode</label>
            <select className="w-full border rounded-lg px-4 py-3 text-base" value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
          </div>

          {mode === 'sms' ? (
            <div>
              <label className="block text-sm md:text-base mb-2">Téléphone</label>
              <input className="w-full border rounded-lg px-4 py-3 text-base" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
          ) : (
            <div>
              <label className="block text-sm md:text-base mb-2">Email</label>
              <input className="w-full border rounded-lg px-4 py-3 text-base" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          )}

          <button disabled={loading} className="apple-button w-full py-3">{loading ? 'Envoi…' : 'Envoyer'}</button>
          <div className="text-sm text-center">
            <Link to="/auth/login" className="text-blue-600">Retour connexion</Link>
          </div>
          <div className="text-sm text-center">
            <Link to="/auth/reset-password" className="text-blue-600">J’ai déjà un token / code</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthForgotPasswordPage;
