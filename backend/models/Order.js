import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  customerEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  customerName: {
    type: String,
    trim: true
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: String,
    price: Number,
    quantity: {
      type: Number,
      default: 1
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'eur'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    default: 'stripe'
  },
  stripeSessionId: {
    type: String,
    unique: true,
    sparse: true
  },
  stripePaymentIntentId: {
    type: String,
    unique: true,
    sparse: true
  },
  cryptoPaymentData: {
    currency: String, // bitcoin, ethereum, litecoin
    amount: String,   // Amount in crypto
    address: String,  // Payment address
    reference: String, // Unique payment reference
    transactionHash: String,
    confirmedAt: Date,
    expiresAt: Date
  },
  downloadTokens: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    token: {
      type: String,
      unique: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    used: {
      type: Boolean,
      default: false
    },
    usedAt: Date
  }],
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: Date,
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Index for efficient queries
orderSchema.index({ customerEmail: 1, createdAt: -1 });
orderSchema.index({ stripeSessionId: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ 'downloadTokens.token': 1 });

export default mongoose.model('Order', orderSchema);