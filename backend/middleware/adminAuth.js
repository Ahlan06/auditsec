import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Configuration admin (sera initialisée au démarrage)
const ADMIN_CONFIG = {
  username: null,
  passwordHash: null,
  sessionDuration: null
};

// Initialiser le hash du mot de passe au démarrage
const initializeAdmin = async () => {
  // Lire les variables d'environnement au moment de l'initialisation
  ADMIN_CONFIG.username = process.env.ADMIN_USERNAME || 'admin';
  ADMIN_CONFIG.sessionDuration = process.env.ADMIN_SESSION_DURATION || '8h';
  
  const plainPassword = process.env.ADMIN_PASSWORD || 'AuditSec2025!';
  ADMIN_CONFIG.passwordHash = await bcrypt.hash(plainPassword, 12);
  
  console.log('🔐 Admin authentication system initialized');
  console.log(`👤 Admin username: ${ADMIN_CONFIG.username}`);
  console.log(`👤 Admin password: ${plainPassword}`);
};

// Middleware de vérification admin
const verifyAdminToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Accès admin requis' });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }
};

// Route de connexion admin
const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Vérifier le nom d'utilisateur
    if (username !== ADMIN_CONFIG.username) {
      return res.status(401).json({ 
        error: 'Identifiants invalides',
        message: 'Nom d\'utilisateur incorrect'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, ADMIN_CONFIG.passwordHash);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Identifiants invalides',
        message: 'Mot de passe incorrect'
      });
    }

    // Générer le token JWT
    const token = jwt.sign(
      {
        username: ADMIN_CONFIG.username,
        role: 'admin',
        loginTime: new Date().toISOString()
      },
      process.env.JWT_SECRET,
      { expiresIn: ADMIN_CONFIG.sessionDuration }
    );

    // Log de connexion pour la sécurité
    console.log(`🔑 Admin login successful: ${username} at ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      admin: {
        username: ADMIN_CONFIG.username,
        role: 'admin',
        loginTime: new Date().toISOString()
      },
      expiresIn: ADMIN_CONFIG.sessionDuration
    });

  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la connexion' 
    });
  }
};

// Route de vérification du token
const verifyAdminSession = (req, res) => {
  // Si on arrive ici, c'est que le token est valide (grâce au middleware)
  res.json({
    valid: true,
    admin: req.admin,
    message: 'Session admin valide'
  });
};

// Route de déconnexion
const adminLogout = (req, res) => {
  // Log de déconnexion
  console.log(`🔓 Admin logout: ${req.admin.username} at ${new Date().toISOString()}`);
  
  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
};

// Route pour changer le mot de passe admin
const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, ADMIN_CONFIG.passwordHash);
    
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ 
        error: 'Mot de passe actuel incorrect' 
      });
    }

    // Valider le nouveau mot de passe
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ 
        error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' 
      });
    }

    // Hasher le nouveau mot de passe
    ADMIN_CONFIG.passwordHash = await bcrypt.hash(newPassword, 12);

    console.log(`🔄 Admin password changed: ${req.admin.username} at ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });

  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({ 
      error: 'Erreur lors du changement de mot de passe' 
    });
  }
};

export {
  initializeAdmin,
  verifyAdminToken,
  adminLogin,
  verifyAdminSession,
  adminLogout,
  changeAdminPassword
};