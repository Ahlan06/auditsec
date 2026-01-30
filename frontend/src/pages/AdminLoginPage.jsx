import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, Eye, EyeOff, Terminal } from 'lucide-react';

const AdminLoginPage = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        // Sauvegarder le token et les informations admin
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.admin));
        navigate('/admin/dashboard');
      } else {
        setError(data.message || data.error || 'Erreur de connexion');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-black text-green-400 matrix-bg">
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Logo et Title */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Shield className="w-16 h-16 text-green-400 drop-shadow-xl animate-pulse" 
                       style={{filter: 'drop-shadow(0 0 20px currentColor)'}} />
                <div className="absolute inset-0 w-16 h-16 border-2 border-green-400/30 rounded-full animate-ping"></div>
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4 neon-text" 
                style={{fontFamily: 'Orbitron, monospace'}}
                data-text="Admin Panel">
              Admin Panel
            </h1>
            <p className="text-gray-400">
              Accès sécurisé à l'administration AuditSec
            </p>
          </div>

          {/* Terminal Login Form */}
          <div className="glass glow-box rounded-lg border border-green-400/20 overflow-hidden">
            {/* Terminal Header */}
            <div className="bg-black/50 px-4 py-3 border-b border-green-400/20 flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-mono text-sm">root@auditsec-admin:~#</span>
            </div>

            {/* Login Form */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-500/20 border border-red-500 rounded p-3 text-red-300 text-sm font-mono">
                    ❌ {error}
                  </div>
                )}

                {/* Username */}
                <div>
                  <label className="block text-green-400 font-mono mb-2 text-sm">
                    <User className="w-4 h-4 inline mr-2" />
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={credentials.username}
                    onChange={handleInputChange}
                    className="w-full glass bg-black/30 border border-green-400/30 rounded px-4 py-3 text-green-400 placeholder-gray-500 focus:outline-none focus:border-green-400 font-mono"
                    placeholder="Entrez votre nom d'utilisateur"
                    required
                    autoComplete="username"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-green-400 font-mono mb-2 text-sm">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={credentials.password}
                      onChange={handleInputChange}
                      className="w-full glass bg-black/30 border border-green-400/30 rounded px-4 py-3 pr-12 text-green-400 placeholder-gray-500 focus:outline-none focus:border-green-400 font-mono"
                      placeholder="Entrez votre mot de passe"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-400 text-black hover:bg-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 px-6 py-3 font-bold rounded font-mono uppercase tracking-wider hover:scale-105"
                  style={{
                    boxShadow: '0 0 20px rgba(0,255,0,0.3)',
                    textShadow: '0 0 5px rgba(0,0,0,0.5)'
                  }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>Connexion...</span>
                    </div>
                  ) : (
                    'Se connecter'
                  )}
                </button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-6 p-4 bg-gray-900/50 border border-gray-700 rounded">
                <h4 className="text-yellow-400 font-bold font-mono mb-2 text-sm">
                  🔑 Configuration des identifiants :
                </h4>
                <div className="font-mono text-xs text-gray-300 space-y-1">
                  <div>Vous pouvez configurer vos identifiants dans le fichier <strong>.env</strong></div>
                  <div className="text-yellow-300">ADMIN_USERNAME et ADMIN_PASSWORD</div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500 font-mono">
                  🔒 Connexion sécurisée • Accès administrateur uniquement
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;