const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  purchaseLocation: {
    type: String,
    required: true,
    index: true
  },
  purchasePrice: {
    type: Number,
    required: true,
    index: true
  },
  sellingLocation: {
    type: String,
    required: true,
    index: true
  },
  sellingPrice: {
    type: Number,
    required: true,
    index: true
  },
  dimensions: {
    type: [Number],
    required: true,
  },
  purchaseDate: {
    type: Date,
    required: true,
    index: true
  },
  soldDate: {
    type: Date,
    index: true
  },
  imageUrl: {
    type: String,
    required: true,
  },
  images: [{
    originalPath: String,
    thumbnailPath: String,
    filename: String,
    dimensions: {
      width: Number,
      height: Number,
      aspectRatio: Number
    },
    physicalDimensions: {
      widthInches: Number,
      heightInches: Number
    },
    format: String,
    size: Number
  }],
  hashtags: [{
    type: String,
    index: true
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  originalListing: {
    seller: String,
    url: String,
    marketplace: String,
    importedAt: Date
  }
});

// Calculate profit margin
productSchema.virtual('profitMargin').get(function() {
  return ((this.sellingPrice - this.purchasePrice) / this.purchasePrice) * 100;
});

// Create compound indexes for common queries
productSchema.index({ userId: 1, createdAt: -1 });
productSchema.index({ userId: 1, soldDate: 1 });
productSchema.index({ userId: 1, purchaseDate: 1 });
productSchema.index({ hashtags: 1, userId: 1 });

module.exports = mongoose.model('Product', productSchema);
