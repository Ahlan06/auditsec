import { useState } from 'react';
import { Link } from 'react-router-dom';
import { clientAuth } from '../services/clientApi';

const ClientForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await clientAuth.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-24 pb-24">
      <div className="max-w-xl md:max-w-2xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 text-gray-900 dark:text-gray-100">Forgot password</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Enter your email. If an account exists, we’ll send a password reset link.
        </p>

        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        {sent && (
          <div className="mb-4 text-sm text-green-600">
            Request sent. Check your inbox (and spam).
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6 apple-card p-8 md:p-10">
          <div>
            <label className="block text-sm md:text-base mb-2">Email</label>
            <input
              className="w-full border rounded-lg px-4 py-3 text-base"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            disabled={loading}
            className="apple-button w-full py-3 md:py-3.5 text-base md:text-lg"
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>

          <div className="text-sm md:text-base text-gray-600 dark:text-gray-400 text-center">
            <Link to="/client/login" className="text-blue-600">Back to sign in</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForgotPasswordPage;
