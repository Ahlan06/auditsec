import mongoose from 'mongoose';

const accountProductSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  serviceName: {
    type: String,
    required: true // Ex: "Spotify", "Netflix", "VPN Premium"
  },
  accountType: {
    type: String,
    required: true // Ex: "Premium", "Family", "Business"
  },
  credentials: {
    username: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    additionalInfo: {
      type: Map,
      of: String // Pour des infos supplémentaires comme URL, codes, etc.
    }
  },
  validUntil: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'expired', 'blocked'],
    default: 'available'
  },
  deliveryTemplate: {
    type: String,
    required: true // Template de l'email de livraison
  },
  usageInstructions: {
    type: String,
    required: true // Instructions d'utilisation
  },
  region: {
    type: String,
    default: 'Global' // Région de validité du compte
  },
  features: [{
    type: String // Liste des fonctionnalités incluses
  }],
  warningMessage: {
    type: String,
    default: 'Ce compte est fourni à des fins de test uniquement. Respectez les conditions d\'utilisation du service.'
  }
}, {
  timestamps: true
});

// Index pour optimiser les recherches
accountProductSchema.index({ productId: 1 });
accountProductSchema.index({ serviceName: 1 });
accountProductSchema.index({ status: 1 });
accountProductSchema.index({ validUntil: 1 });

// Méthode pour vérifier la validité
accountProductSchema.methods.isValid = function() {
  return this.status === 'available' && this.validUntil > new Date();
};

// Méthode pour marquer comme vendu
accountProductSchema.methods.markAsSold = function() {
  this.status = 'sold';
  return this.save();
};

// Méthode pour préparer les données de livraison
accountProductSchema.methods.getDeliveryData = function() {
  return {
    serviceName: this.serviceName,
    accountType: this.accountType,
    username: this.credentials.username,
    password: this.credentials.password,
    additionalInfo: Object.fromEntries(this.credentials.additionalInfo || new Map()),
    validUntil: this.validUntil,
    usageInstructions: this.usageInstructions,
    features: this.features,
    warningMessage: this.warningMessage,
    region: this.region
  };
};

export default mongoose.model('AccountProduct', accountProductSchema);