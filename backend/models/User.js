import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String },

    firstName: { type: String },
    lastName: { type: String },

    phone: { type: String, index: true },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },

    // Email verification
    emailVerificationTokenHash: { type: String },
    emailVerificationExpiresAt: { type: Date },

    // Phone verification
    phoneVerificationCodeHash: { type: String },
    phoneVerificationExpiresAt: { type: Date },

    // Phone login (OTP)
    phoneAuthCodeHash: { type: String },
    phoneAuthExpiresAt: { type: Date },

    // Password reset
    passwordResetTokenHash: { type: String },
    passwordResetExpiresAt: { type: Date },
    passwordResetSmsCodeHash: { type: String },
    passwordResetSmsExpiresAt: { type: Date },

    // OAuth identities
    oauth: {
      google: { sub: { type: String } },
      microsoft: { sub: { type: String } },
      apple: { sub: { type: String } },
    },

    // User role and subscription
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user',
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },

    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

// Ensure unique index exists
userSchema.index({ email: 1 }, { unique: true });
// Optional unique phone (sparse = allow many null)
userSchema.index({ phone: 1 }, { unique: true, sparse: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
