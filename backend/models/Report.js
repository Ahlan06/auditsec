import mongoose from 'mongoose';
import crypto from 'crypto';

// Sous-schéma pour les tokens de téléchargement
const downloadTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    usedAt: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    // Référence à l'audit source
    auditId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Audit',
      required: true,
      index: true,
    },

    // Référence utilisateur
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Type de rapport
    type: {
      type: String,
      enum: ['pdf', 'json'],
      required: true,
    },

    // Clé S3 du fichier stocké
    s3Key: {
      type: String,
      required: true,
    },

    // Taille du fichier (en bytes)
    size: {
      type: Number,
      required: true,
      min: 0,
    },

    // Hash SHA256 du fichier pour vérification d'intégrité
    hash: {
      type: String,
      required: true,
    },

    // Tokens de téléchargement sécurisés
    downloadTokens: {
      type: [downloadTokenSchema],
      default: [],
    },
  },
  {
    timestamps: true, // Ajoute automatiquement createdAt et updatedAt
  }
);

// Index composé pour optimiser les requêtes
reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ auditId: 1 });
reportSchema.index({ 'downloadTokens.token': 1 }, { sparse: true });

// Méthodes d'instance

/**
 * Génère un token de téléchargement unique valide 24h
 * @returns {Object} - { token, expiresAt }
 */
reportSchema.methods.generateDownloadToken = function () {
  // Générer un token unique et sécurisé
  const token = crypto.randomBytes(32).toString('hex');
  
  // Expiration 24h par défaut
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Ajouter le token au tableau
  this.downloadTokens.push({
    token,
    expiresAt,
    usedAt: null,
    createdAt: new Date(),
  });

  return { token, expiresAt };
};

/**
 * Génère et sauvegarde un token de téléchargement
 * @param {number} expirationHours - Durée de validité en heures (défaut: 24h)
 * @returns {Promise<Object>} - { token, expiresAt, downloadUrl }
 */
reportSchema.methods.createDownloadToken = async function (expirationHours = 24) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);

  this.downloadTokens.push({
    token,
    expiresAt,
    usedAt: null,
    createdAt: new Date(),
  });

  await this.save();

  return {
    token,
    expiresAt,
    downloadUrl: `/api/downloads/${token}`,
  };
};

/**
 * Vérifie et marque un token comme utilisé
 * @param {string} token - Token à vérifier
 * @returns {boolean} - true si le token est valide
 */
reportSchema.methods.validateAndUseToken = function (token) {
  const tokenDoc = this.downloadTokens.find((t) => t.token === token);

  if (!tokenDoc) {
    return false; // Token inexistant
  }

  if (tokenDoc.usedAt) {
    return false; // Token déjà utilisé
  }

  if (tokenDoc.expiresAt < new Date()) {
    return false; // Token expiré
  }

  // Marquer comme utilisé
  tokenDoc.usedAt = new Date();
  return true;
};

/**
 * Nettoie les tokens expirés
 */
reportSchema.methods.cleanExpiredTokens = function () {
  const now = new Date();
  this.downloadTokens = this.downloadTokens.filter((t) => t.expiresAt > now);
  return this.save();
};

// Méthodes statiques

/**
 * Trouve un rapport par token de téléchargement
 * @param {string} token - Token de téléchargement
 * @returns {Promise<Report|null>}
 */
reportSchema.statics.findByDownloadToken = function (token) {
  return this.findOne({
    'downloadTokens.token': token,
  });
};

/**
 * Obtient tous les rapports d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {number} limit - Limite de résultats
 * @returns {Promise<Report[]>}
 */
reportSchema.statics.getUserReports = function (userId, limit = 50) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('auditId', 'targetType targetValue status riskScore createdAt');
};

/**
 * Obtient les rapports liés à un audit
 * @param {string} auditId - ID de l'audit
 * @returns {Promise<Report[]>}
 */
reportSchema.statics.getAuditReports = function (auditId) {
  return this.find({ auditId }).sort({ createdAt: -1 });
};

/**
 * Nettoie les tokens expirés de tous les rapports
 * @returns {Promise<void>}
 */
reportSchema.statics.cleanAllExpiredTokens = async function () {
  const now = new Date();
  
  await this.updateMany(
    {},
    {
      $pull: {
        downloadTokens: { expiresAt: { $lt: now } },
      },
    }
  );
};

/**
 * Obtient les statistiques des rapports pour un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>}
 */
reportSchema.statics.getUserReportStats = async function (userId) {
  const stats = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        totalPdf: {
          $sum: { $cond: [{ $eq: ['$type', 'pdf'] }, 1, 0] },
        },
        totalJson: {
          $sum: { $cond: [{ $eq: ['$type', 'json'] }, 1, 0] },
        },
        totalSize: { $sum: '$size' },
      },
    },
  ]);

  return stats.length > 0
    ? stats[0]
    : {
        total: 0,
        totalPdf: 0,
        totalJson: 0,
        totalSize: 0,
      };
};

// Virtuals

/**
 * Taille formatée en Ko/Mo/Go
 */
reportSchema.virtual('sizeFormatted').get(function () {
  const bytes = this.size;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
});

/**
 * Nombre de tokens actifs (non expirés et non utilisés)
 */
reportSchema.virtual('activeTokensCount').get(function () {
  const now = new Date();
  return this.downloadTokens.filter((t) => !t.usedAt && t.expiresAt > now).length;
});

/**
 * URL de téléchargement avec le dernier token valide
 */
reportSchema.virtual('downloadUrl').get(function () {
  const now = new Date();
  const validToken = this.downloadTokens
    .filter((t) => !t.usedAt && t.expiresAt > now)
    .sort((a, b) => b.createdAt - a.createdAt)[0];

  return validToken ? `/api/downloads/${validToken.token}` : null;
});

// Inclure les virtuals dans les conversions JSON
reportSchema.set('toJSON', { virtuals: true });
reportSchema.set('toObject', { virtuals: true });

// Middleware pre-save pour nettoyer automatiquement les anciens tokens
reportSchema.pre('save', function (next) {
  // Limiter à 10 tokens maximum par rapport
  if (this.downloadTokens.length > 10) {
    this.downloadTokens = this.downloadTokens
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10);
  }
  next();
});

const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);

export default Report;
