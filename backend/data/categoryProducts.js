// Exemples de produits pour les nouvelles catégories
export const categoryProducts = {
  tools: [
    {
      name: 'Advanced Nmap Scripts Pack',
      description: 'Collection de scripts Nmap personnalisés pour la reconnaissance avancée',
      longDescription: 'Plus de 50 scripts Nmap optimisés pour la détection de services, l\'énumération avancée et la découverte de vulnérabilités. Inclut des scripts pour SMB, HTTP, SSH, FTP et bien plus.',
      price: 24.99,
      category: 'tools',
      type: 'script',
      tags: ['nmap', 'reconnaissance', 'automation'],
      featured: true,
      fileSize: '12 MB'
    },
    {
      name: 'Custom Burp Extensions Suite',
      description: 'Extensions Burp Suite pour l\'audit avancé d\'applications web',
      longDescription: 'Collection d\'extensions Burp Suite développées par des experts en sécurité pour automatiser les tests de sécurité web.',
      price: 39.99,
      category: 'tools',
      type: 'tool',
      tags: ['burp', 'web', 'audit'],
      featured: false,
      fileSize: '8 MB'
    }
  ],

  formation: [
    {
      name: 'Ethical Hacking Masterclass',
      description: 'Formation complète en hacking éthique de A à Z',
      longDescription: 'Course complète de 20+ heures couvrant tous les aspects du hacking éthique, du footprinting à l\'exploitation avancée. Inclus labs pratiques et certificat.',
      price: 89.99,
      category: 'formation',
      type: 'course',
      tags: ['ethique', 'hacking', 'certification'],
      featured: true,
      fileSize: '4.5 GB'
    },
    {
      name: 'Bug Bounty Hunter Guide',
      description: 'Guide pratique pour devenir un chasseur de primes efficace',
      longDescription: 'Méthodologie complète pour identifier et exploiter les vulnérabilités dans le cadre de programmes bug bounty.',
      price: 49.99,
      category: 'formation',
      type: 'course',
      tags: ['bug bounty', 'vulnerabilites', 'methodologie'],
      featured: false,
      fileSize: '2.1 GB'
    }
  ],

  database: [
    {
      name: 'Ultimate Wordlists Collection',
      description: 'Collection premium de wordlists pour brute force et fuzzing',
      longDescription: 'Plus de 100 wordlists spécialisées pour différents types d\'attaques : passwords, directories, subdomains, etc.',
      price: 19.99,
      category: 'database',
      type: 'wordlist',
      tags: ['wordlist', 'brute force', 'fuzzing'],
      featured: true,
      fileSize: '850 MB'
    },
    {
      name: 'OSINT Data Collection',
      description: 'Base de données OSINT avec millions d\'entrées',
      longDescription: 'Collection massive de données OSINT incluant emails, numéros de téléphone, adresses et informations publiques.',
      price: 34.99,
      category: 'database',
      type: 'database',
      tags: ['osint', 'reconnaissance', 'data'],
      featured: false,
      fileSize: '1.2 GB'
    }
  ],

  comptes: [
    {
      name: 'Spotify Premium Account',
      description: 'Compte Spotify Premium valide 12 mois',
      longDescription: 'Accès complet à Spotify Premium avec toutes les fonctionnalités : musique sans pub, qualité haute définition, téléchargement offline.',
      price: 12.99,
      category: 'comptes',
      type: 'account',
      tags: ['spotify', 'premium', 'music'],
      featured: true,
      accountDetails: {
        serviceName: 'Spotify',
        accountType: 'Premium Individual',
        validityMonths: 12,
        features: ['Sans publicité', 'Qualité haute définition', 'Téléchargement offline', 'Lecture aléatoire illimitée'],
        region: 'Global'
      }
    },
    {
      name: 'Netflix Premium Account',
      description: 'Compte Netflix Premium 4K valide 6 mois',
      longDescription: 'Accès Netflix Premium avec streaming 4K Ultra HD, 4 écrans simultanés et téléchargement sur tous les appareils.',
      price: 18.99,
      category: 'comptes',
      type: 'account',
      tags: ['netflix', 'premium', '4k'],
      featured: true,
      accountDetails: {
        serviceName: 'Netflix',
        accountType: 'Premium 4K',
        validityMonths: 6,
        features: ['Streaming 4K Ultra HD', '4 écrans simultanés', 'Téléchargement illimité', 'Catalogue complet'],
        region: 'Global'
      }
    },
    {
      name: 'VPN Premium Account',
      description: 'Compte VPN premium avec serveurs mondiaux',
      longDescription: 'Accès VPN premium avec plus de 3000 serveurs dans 94 pays, bande passante illimitée et protection maximale.',
      price: 8.99,
      category: 'comptes',
      type: 'account',
      tags: ['vpn', 'premium', 'security'],
      featured: false,
      accountDetails: {
        serviceName: 'ExpressVPN',
        accountType: 'Premium',
        validityMonths: 3,
        features: ['3000+ serveurs', '94 pays', 'Bande passante illimitée', 'Kill Switch', 'No logs'],
        region: 'Global'
      }
    }
  ]
};

// Template d'email pour la livraison des comptes
export const accountDeliveryTemplate = {
  subject: '🔐 Vos identifiants de compte - AuditSec',
  html: `
    <div style="font-family: 'Courier New', monospace; background: #000; color: #00ff00; padding: 20px; border: 2px solid #00ff00;">
      <h2 style="text-align: center; text-shadow: 0 0 10px #00ff00;">AuditSec - Livraison Compte</h2>
      
      <div style="background: rgba(0,255,0,0.1); padding: 15px; margin: 20px 0; border: 1px solid #00ff00;">
        <h3>🎯 Service: {{serviceName}} ({{accountType}})</h3>
        
        <div style="background: #111; padding: 15px; margin: 10px 0;">
          <strong>Identifiants de connexion:</strong><br>
          <strong>Username:</strong> {{username}}<br>
          <strong>Password:</strong> {{password}}<br>
          {{#if additionalInfo}}
          <strong>Infos supplémentaires:</strong><br>
          {{#each additionalInfo}}
          <strong>{{@key}}:</strong> {{this}}<br>
          {{/each}}
          {{/if}}
        </div>

        <div style="background: #111; padding: 15px; margin: 10px 0;">
          <strong>📅 Validité:</strong> Jusqu'au {{validUntil}}<br>
          <strong>🌍 Région:</strong> {{region}}<br>
          
          <strong>✨ Fonctionnalités incluses:</strong><br>
          <ul>
          {{#each features}}
            <li>{{this}}</li>
          {{/each}}
          </ul>
        </div>

        <div style="background: #111; padding: 15px; margin: 10px 0;">
          <strong>📋 Instructions d'utilisation:</strong><br>
          {{usageInstructions}}
        </div>

        <div style="background: rgba(255,255,0,0.1); padding: 10px; border: 1px solid #ffff00; color: #ffff00;">
          <strong>⚠️ IMPORTANT:</strong><br>
          {{warningMessage}}
        </div>
      </div>

      <p style="text-align: center; font-size: 12px; color: #666;">
        Ce produit vous a été livré par AuditSec<br>
        Pour toute question: ahlan.mira@icloud.com
      </p>
    </div>
  `
};