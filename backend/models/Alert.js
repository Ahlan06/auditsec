import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    // Référence utilisateur
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Type d'alerte
    type: {
      type: String,
      enum: ['security', 'vulnerability', 'scan_complete', 'system', 'warning'],
      required: true,
    },

    // Niveau de sévérité
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      required: true,
    },

    // Titre de l'alerte
    title: {
      type: String,
      required: true,
    },

    // Message détaillé
    message: {
      type: String,
      required: true,
    },

    // Statut de l'alerte
    status: {
      type: String,
      enum: ['unread', 'read', 'archived'],
      default: 'unread',
      index: true,
    },

    // Référence optionnelle à un audit
    auditId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Audit',
      default: null,
    },

    // Métadonnées additionnelles
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // Date de lecture
    readAt: {
      type: Date,
      default: null,
    },

    // Date d'archivage
    archivedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index composé pour optimiser les requêtes
alertSchema.index({ userId: 1, createdAt: -1 });
alertSchema.index({ userId: 1, status: 1 });
alertSchema.index({ severity: 1, status: 1 });

// Méthodes d'instance

alertSchema.methods.markAsRead = function () {
  this.status = 'read';
  this.readAt = new Date();
  return this.save();
};

alertSchema.methods.archive = function () {
  this.status = 'archived';
  this.archivedAt = new Date();
  return this.save();
};

// Méthodes statiques

alertSchema.statics.getUnreadCount = function (userId) {
  return this.countDocuments({ userId, status: 'unread' });
};

alertSchema.statics.getUserAlerts = function (userId, limit = 50) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('auditId', 'targetType targetValue status');
};

const Alert = mongoose.models.Alert || mongoose.model('Alert', alertSchema);

export default Alert;
