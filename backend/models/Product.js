import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  longDescription: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['tools', 'formation', 'database', 'comptes', 'pentest', 'osint', 'guides', 'videos']
  },
  type: {
    type: String,
    required: true,
    enum: ['script', 'pdf', 'video', 'pack', 'tool', 'course', 'account', 'database', 'wordlist']
  },
  image: {
    type: String,
    default: '/images/default-product.jpg'
  },
  fileUrl: {
    type: String,
    required: true // S3 key or file identifier
  },
  fileSize: {
    type: String,
    default: 'N/A'
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  featured: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  stripeProductId: {
    type: String,
    unique: true,
    sparse: true
  },
  stripePriceId: {
    type: String,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
});

// Index for search and filtering
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, active: 1 });
productSchema.index({ featured: 1, active: 1 });

export default mongoose.model('Product', productSchema);