import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { authApi } from '../services/authApi';

const AuthLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [phone, setPhone] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [info, setInfo] = useState('');

  const { login, loginWithPhone, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const next = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    return sp.get('next') || '/account';
  }, [location.search]);

  const onSubmitEmail = async (e) => {
    e.preventDefault();
    setInfo('');
    await login({ email, password });
    navigate(next);
  };

  const onStartPhone = async (e) => {
    e.preventDefault();
    setInfo('');
    try {
      await authApi.phoneStart(phone);
      setInfo('Code sent (if SMS configured).');
    } catch (err) {
      setInfo(err.response?.data?.error || 'Unable to send SMS');
    }
  };

  const onVerifyPhone = async (e) => {
    e.preventDefault();
    setInfo('');
    await loginWithPhone({ phone, code: smsCode });
    navigate(next);
  };

  const oauth = (provider) => {
    window.location.href = authApi.oauthStartUrl(provider, next);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-24 pb-24">
      <div className="max-w-xl md:max-w-2xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900 dark:text-gray-100">Login</h1>

        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        {info && <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">{info}</div>}

        {/* OAuth Section - Priority */}
        <div className="apple-card p-8 md:p-10 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-center">Quick login</h2>
          
          <button 
            type="button" 
            className="w-full bg-white hover:bg-gray-50 text-gray-800 font-medium py-3.5 px-4 border border-gray-300 rounded-lg shadow-sm transition-all duration-200 flex items-center justify-center gap-3 mb-3"
            onClick={() => oauth('google')}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <button 
            type="button" 
            className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium py-3.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 mb-3"
            onClick={() => oauth('microsoft')}
          >
            <svg className="w-5 h-5" viewBox="0 0 23 23">
              <path fill="#f35325" d="M0 0h11v11H0z"/>
              <path fill="#81bc06" d="M12 0h11v11H12z"/>
              <path fill="#05a6f0" d="M0 12h11v11H0z"/>
              <path fill="#ffba08" d="M12 12h11v11H12z"/>
            </svg>
            Continue with Microsoft
          </button>

          <button 
            type="button" 
            className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700 text-white font-medium py-3.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 mb-3"
            onClick={() => oauth('apple')}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Continue with Apple
          </button>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
            OAuth configuration required on backend
          </p>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-gray-900 text-gray-500">or</span>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmitEmail} className="space-y-6 apple-card p-8 md:p-10 mb-10">
          <h2 className="text-xl font-semibold">Email </h2>
          <div>
            <label className="block text-sm md:text-base mb-2">Email</label>
            <input className="w-full border rounded-lg px-4 py-3 text-base" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm md:text-base mb-2">Password</label>
            <input className="w-full border rounded-lg px-4 py-3 text-base" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="flex items-center justify-between">
            <Link to="/auth/forgot-password" className="text-sm text-blue-600">Forgot password?</Link>
            <Link to="/auth/register" className="text-sm text-blue-600">Create account</Link>
          </div>
          <button disabled={isLoading} className="apple-button w-full py-3 md:py-3.5 text-base md:text-lg">{isLoading ? 'Signing in…' : 'Sign in'}</button>
        </form>

        <div className="text-center mt-6">
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

export default AuthLoginPage;
