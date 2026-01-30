import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clientAuth } from '../services/clientApi';

const useQuery = () => {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
};

const ClientResetPasswordPage = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const token = query.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid link.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await clientAuth.resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate('/client/login'), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-24 pb-24">
      <div className="max-w-xl md:max-w-2xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gray-900 dark:text-gray-100">Reset password</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Choose a new password.
        </p>

        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        {done && <div className="mb-4 text-sm text-green-600">Password updated. Redirecting…</div>}

        <form onSubmit={onSubmit} className="space-y-6 apple-card p-8 md:p-10">
          <div>
            <label className="block text-sm md:text-base mb-2">New password</label>
            <input
              className="w-full border rounded-lg px-4 py-3 text-base"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm md:text-base mb-2">Confirm password</label>
            <input
              className="w-full border rounded-lg px-4 py-3 text-base"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>

          <button
            disabled={loading}
            className="apple-button w-full py-3 md:py-3.5 text-base md:text-lg"
          >
            {loading ? 'Updating…' : 'Update password'}
          </button>

          <div className="text-sm md:text-base text-gray-600 dark:text-gray-400 text-center">
            <Link to="/client/login" className="text-blue-600">Back to sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientResetPasswordPage;
