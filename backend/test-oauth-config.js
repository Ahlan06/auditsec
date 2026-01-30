import 'dotenv/config';
import { getOAuthClients } from './modules/auth/oauth/oauthClients.js';

(async () => {
  console.log('🔍 Vérification de la configuration OAuth...\n');

  // Check env vars
  const requiredVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'BACKEND_URL', 'FRONTEND_URL', 'JWT_SECRET'];
  const missing = requiredVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.error('❌ Variables manquantes:', missing.join(', '));
    console.log('\nAjoutez-les dans backend/.env');
    console.log('Voir GOOGLE_OAUTH_SETUP.md pour les instructions complètes\n');
    process.exit(1);
  }

  console.log('✅ Variables d\'environnement présentes');
  console.log('  GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...');
  console.log('  GOOGLE_CLIENT_SECRET:', '****' + process.env.GOOGLE_CLIENT_SECRET.slice(-4));
  console.log('  BACKEND_URL:', process.env.BACKEND_URL);
  console.log('  FRONTEND_URL:', process.env.FRONTEND_URL);
  console.log('  JWT_SECRET:', process.env.JWT_SECRET ? '(configuré)' : '(manquant!)');
  console.log('');

  // Check OAuth clients
  try {
    const clients = await getOAuthClients();
    const configuredProviders = Object.keys(clients).filter(p => clients[p]);
    
    console.log('✅ Clients OAuth initialisés:');
    configuredProviders.forEach(provider => {
      console.log(`  - ${provider}: configuré`);
    });
    
    if (configuredProviders.length === 0) {
      console.log('  (aucun provider configuré)');
    }
    
    console.log('');
    console.log('🎉 Configuration OAuth valide!\n');
    console.log('📍 URLs de test:');
    console.log('  Login page: http://localhost:5174/auth/login');
    console.log('  OAuth start (Google): http://localhost:3001/api/auth/oauth/google');
    console.log('  OAuth callback: http://localhost:3001/api/auth/oauth/google/callback');
    console.log('');
    console.log('💡 Prochaine étape:');
    console.log('  1. Démarrer le backend: npm start');
    console.log('  2. Démarrer le frontend: cd ../frontend && npm run dev');
    console.log('  3. Aller sur http://localhost:5174/auth/login');
    console.log('  4. Cliquer sur "Continuer avec Google"');
    console.log('');
  } catch (err) {
    console.error('❌ Erreur lors de l\'initialisation des clients OAuth:');
    console.error('  ', err.message);
    console.log('');
    process.exit(1);
  }
})();
