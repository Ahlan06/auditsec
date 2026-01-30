import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema(
  {
    // Référence utilisateur
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Type et valeur de la cible
    targetType: {
      type: String,
      enum: ['domain', 'ip', 'email'],
      required: true,
    },
    targetValue: {
      type: String,
      required: true,
      trim: true,
    },

    // Statut de l'audit
    status: {
      type: String,
      enum: ['queued', 'running', 'completed', 'failed'],
      default: 'queued',
      required: true,
      index: true,
    },

    // Progression (0-100)
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // Timestamps d'exécution
    startedAt: {
      type: Date,
      default: null,
    },
    finishedAt: {
      type: Date,
      default: null,
    },

    // Erreur (si failed)
    error: {
      type: String,
      default: null,
    },

    // Résultats de l'audit (JSON flexible)
    results: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // Score de risque (0-100)
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
  },
  {
    timestamps: true, // Ajoute automatiquement createdAt et updatedAt
  }
);

// Index composé pour optimiser les requêtes par utilisateur et date
auditSchema.index({ userId: 1, createdAt: -1 });

// Index pour rechercher par status
auditSchema.index({ status: 1, createdAt: -1 });

// Index pour rechercher par targetValue
auditSchema.index({ targetValue: 1 });

// Méthodes d'instance

// Démarrer l'audit
auditSchema.methods.start = function () {
  this.status = 'running';
  this.startedAt = new Date();
  this.progress = 0;
  return this.save();
};

// Mettre à jour la progression
auditSchema.methods.updateProgress = function (progress) {
  this.progress = Math.min(100, Math.max(0, progress));
  return this.save();
};

// Marquer comme complété
auditSchema.methods.complete = function (results, riskScore = null) {
  this.status = 'completed';
  this.progress = 100;
  this.finishedAt = new Date();
  this.results = results;
  if (riskScore !== null) {
    this.riskScore = riskScore;
  }
  return this.save();
};

// Marquer comme échoué
auditSchema.methods.fail = function (error) {
  this.status = 'failed';
  this.finishedAt = new Date();
  this.error = error;
  return this.save();
};

// Méthodes statiques

// Obtenir les audits en cours pour un utilisateur
auditSchema.statics.getActiveAudits = function (userId) {
  return this.find({
    userId,
    status: { $in: ['queued', 'running'] },
  }).sort({ createdAt: -1 });
};

// Obtenir l'historique des audits pour un utilisateur
auditSchema.statics.getUserHistory = function (userId, limit = 20) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Obtenir les statistiques pour un utilisateur
auditSchema.statics.getUserStats = async function (userId) {
  const stats = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
        },
        failed: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
        },
        running: {
          $sum: { $cond: [{ $eq: ['$status', 'running'] }, 1, 0] },
        },
        queued: {
          $sum: { $cond: [{ $eq: ['$status', 'queued'] }, 1, 0] },
        },
        avgRiskScore: { $avg: '$riskScore' },
      },
    },
  ]);

  return stats.length > 0
    ? stats[0]
    : {
        total: 0,
        completed: 0,
        failed: 0,
        running: 0,
        queued: 0,
        avgRiskScore: null,
      };
};

// Virtuals

// Durée de l'audit (en millisecondes)
auditSchema.virtual('duration').get(function () {
  if (!this.startedAt) return null;
  const end = this.finishedAt || new Date();
  return end - this.startedAt;
});

// Durée formatée
auditSchema.virtual('durationFormatted').get(function () {
  const duration = this.duration;
  if (!duration) return null;

  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
});

// Inclure les virtuals dans les conversions JSON
auditSchema.set('toJSON', { virtuals: true });
auditSchema.set('toObject', { virtuals: true });

const Audit = mongoose.models.Audit || mongoose.model('Audit', auditSchema);

export default Audit;
