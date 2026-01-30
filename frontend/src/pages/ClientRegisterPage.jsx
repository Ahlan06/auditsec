import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { clientAuth } from '../services/clientApi';

const ClientRegisterPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await clientAuth.register(email, password);
      navigate('/client/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-24 pb-24">
      <div className="max-w-xl md:max-w-2xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900 dark:text-gray-100">Create Account</h1>
        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-6 apple-card p-8 md:p-10">
          <div>
            <label className="block text-sm md:text-base mb-2">Email</label>
            <input className="w-full border rounded-lg px-4 py-3 text-base" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm md:text-base mb-2">Password</label>
            <input className="w-full border rounded-lg px-4 py-3 text-base" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          </div>
          <button disabled={loading} className="apple-button w-full py-3 md:py-3.5 text-base md:text-lg">{loading ? 'Creating…' : 'Create account'}</button>
          <div className="text-sm md:text-base text-gray-600 dark:text-gray-400 text-center">Already have an account? <Link to="/client/login" className="text-blue-600">Sign in</Link></div>
        </form>
      </div>
    </div>
  );
};

export default ClientRegisterPage;
