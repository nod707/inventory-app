const mongoose = require('mongoose');

const platformStatusSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['mercari', 'poshmark', 'ebay']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in_progress', 'completed', 'failed'],
    default: 'pending'
  },
  attempts: {
    type: Number,
    default: 0
  },
  lastAttempt: {
    type: Date
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

const postingStatusSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  platforms: [platformStatusSchema],
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
}, { timestamps: true });

// Indexes for efficient querying
postingStatusSchema.index({ product: 1, user: 1 });
postingStatusSchema.index({ 'platforms.name': 1, 'platforms.status': 1 });
postingStatusSchema.index({ completed: 1, createdAt: -1 });

module.exports = mongoose.model('PostingStatus', postingStatusSchema);
