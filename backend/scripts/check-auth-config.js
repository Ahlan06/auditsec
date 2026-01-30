// Script de test rapide pour vérifier quel système d'auth est utilisé

console.log('🔍 Configuration actuelle:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`ENABLE_MONGO: ${process.env.ENABLE_MONGO || 'non défini'}`);
console.log(`MONGODB_URI: ${process.env.MONGODB_URI || 'non défini'}`);
console.log(`DATABASE_URL: ${process.env.DATABASE_URL || 'non défini'}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

console.log('\n📌 Routes d\'authentification disponibles:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('1. /api/auth/login          → MongoDB (si ENABLE_MONGO=true)');
console.log('2. /api/client/auth/login   → SQLite (toujours disponible)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

console.log('\n✅ Pour tester la connexion:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Email:    test@auditsec.com');
console.log('Password: Test123456!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

console.log('\n💡 URLs de connexion:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Frontend: http://localhost:5173/auth/login');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
