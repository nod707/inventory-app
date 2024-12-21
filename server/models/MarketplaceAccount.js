const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const marketplaceAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  platform: {
    type: String,
    enum: ['poshmark', 'mercari'],
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    select: false // Password won't be returned in queries by default
  },
  sessionToken: {
    type: String,
    select: false
  },
  sessionExpiry: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSync: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for quick lookups
marketplaceAccountSchema.index({ userId: 1, platform: 1 }, { unique: true });

// Hash password before saving
marketplaceAccountSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to check if session needs refresh
marketplaceAccountSchema.methods.needsRefresh = function() {
  if (!this.sessionExpiry) return true;
  const buffer = 5 * 60 * 1000; // 5 minutes buffer
  return new Date(this.sessionExpiry).getTime() - buffer < Date.now();
};

const MarketplaceAccount = mongoose.model('MarketplaceAccount', marketplaceAccountSchema);

module.exports = MarketplaceAccount;
