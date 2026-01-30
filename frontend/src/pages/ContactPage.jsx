import { Mail, MessageCircle, Shield, Terminal, ExternalLink } from 'lucide-react';
import useLanguageStore from '../store/languageStore';

const ContactPage = () => {
  const { t } = useLanguageStore();
  const handleTelegramClick = () => {
    window.open('https://t.me/Ahlan06', '_blank');
  };

  const handleEmailClick = () => {
    window.location.href = 'mailto:ahlan.mira@icloud.com';
  };

  return (
    <div className="min-h-screen bg-black text-green-400 matrix-bg">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Shield className="w-20 h-20 text-green-400 drop-shadow-xl animate-pulse" 
                     style={{filter: 'drop-shadow(0 0 20px currentColor)'}} />
              <div className="absolute inset-0 w-20 h-20 border-2 border-green-400/30 rounded-full animate-ping"></div>
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-6 neon-text" 
              style={{fontFamily: 'Orbitron, monospace'}}
              data-text={t('contactTitle')}>
            {t('contactTitle')}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {t('contactSubtitle')}
          </p>
        </div>

        {/* Contact Methods */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            
            {/* Telegram Contact */}
            <div 
              onClick={handleTelegramClick}
              className="glass glow-box p-8 rounded-lg border border-green-400/20 cursor-pointer hover:border-green-400/40 transition-all duration-300 hover:scale-105 group"
            >
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <MessageCircle className="w-16 h-16 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" 
                                  style={{filter: 'drop-shadow(0 0 15px currentColor)'}} />
                    <ExternalLink className="w-6 h-6 text-gray-400 absolute -top-2 -right-2" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-blue-400 mb-4" style={{fontFamily: 'Orbitron, monospace'}}>
                  {t('telegram')}
                </h3>
                <p className="text-gray-300 mb-4">
                  {t('telegramDesc')}
                </p>
                <div className="bg-black/30 rounded-lg p-4 font-mono text-sm">
                  <span className="text-blue-400">@Ahlan06</span>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  {t('telegramFeatures')}
                </div>
              </div>
            </div>

            {/* Email Contact */}
            <div 
              onClick={handleEmailClick}
              className="glass glow-box p-8 rounded-lg border border-green-400/20 cursor-pointer hover:border-green-400/40 transition-all duration-300 hover:scale-105 group"
            >
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <Mail className="w-16 h-16 text-red-400 group-hover:text-red-300 transition-colors duration-300" 
                          style={{filter: 'drop-shadow(0 0 15px currentColor)'}} />
                    <ExternalLink className="w-6 h-6 text-gray-400 absolute -top-2 -right-2" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-red-400 mb-4" style={{fontFamily: 'Orbitron, monospace'}}>
                  {t('email')}
                </h3>
                <p className="text-gray-300 mb-4">
                  {t('emailDesc')}
                </p>
                <div className="bg-black/30 rounded-lg p-4 font-mono text-sm">
                  <span className="text-red-400">ahlan.mira@icloud.com</span>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  {t('emailFeatures')}
                </div>
              </div>
            </div>
          </div>

          {/* Terminal-style info */}
          <div className="glass glow-box rounded-lg border border-green-400/20 overflow-hidden mb-8">
            <div className="bg-black/50 px-4 py-3 border-b border-green-400/20 flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-mono text-sm">contact@auditsec:~#</span>
            </div>
            <div className="p-6 font-mono text-sm">
              <div className="text-green-400 mb-2">$ cat contact_info.txt</div>
              <div className="text-gray-300 space-y-1">
                <div><span className="text-yellow-400">Telegram:</span> https://t.me/Ahlan06</div>
                <div><span className="text-yellow-400">Email:</span> ahlan.mira@icloud.com</div>
                <div><span className="text-yellow-400">Response_time:</span> {"< 24h"}</div>
                <div><span className="text-yellow-400">Languages:</span> Français, English</div>
                <div><span className="text-yellow-400">Timezone:</span> Europe/Paris (UTC+1)</div>
              </div>
            </div>
          </div>

          {/* FAQ rapide */}
          <div className="glass glow-box p-8 rounded-lg border border-green-400/20">
            <h3 className="text-2xl font-bold text-green-400 mb-6" style={{fontFamily: 'Orbitron, monospace'}}>
              {t('faqTitle')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-bold text-yellow-400 mb-2">🔧 {t('techSupport')}</h4>
                <p className="text-gray-300 text-sm">
                  {t('techSupportDesc')}
                </p>
              </div>
              <div>
                <h4 className="text-lg font-bold text-yellow-400 mb-2">💳 {t('payments')}</h4>
                <p className="text-gray-300 text-sm">
                  {t('paymentsDesc')}
                </p>
              </div>
              <div>
                <h4 className="text-lg font-bold text-yellow-400 mb-2">📦 {t('products')}</h4>
                <p className="text-gray-300 text-sm">
                  {t('productsDesc')}
                </p>
              </div>
              <div>
                <h4 className="text-lg font-bold text-yellow-400 mb-2">🤝 {t('partnerships')}</h4>
                <p className="text-gray-300 text-sm">
                  {t('partnershipsDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg px-4 py-2">
              <Shield className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-300 text-sm font-mono">
                {t('securityNotice')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;