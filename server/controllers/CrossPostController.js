const PostingStatus = require('../models/PostingStatus');
const PoshmarkPlatform = require('../services/marketplaces/platforms/PoshmarkPlatform');
const { MarketplaceError } = require('../services/marketplaces/errorHandler');
const Product = require('../models/Product');
const User = require('../models/User');

class CrossPostController {
  constructor() {
    this.platforms = {
      poshmark: PoshmarkPlatform,
      // Add other platforms as they're implemented
    };
  }

  async startCrossPosting(userId, productId, targetPlatforms) {
    try {
      // Validate input
      if (!Array.isArray(targetPlatforms) || targetPlatforms.length === 0) {
        throw new Error('No target platforms specified');
      }

      // Validate platforms
      const invalidPlatforms = targetPlatforms.filter(
        platform => !this.platforms[platform]
      );
      if (invalidPlatforms.length > 0) {
        throw new Error(`Invalid platforms: ${invalidPlatforms.join(', ')}`);
      }

      // Get product and user
      const [product, user] = await Promise.all([
        Product.findById(productId),
        User.findById(userId)
      ]);

      if (!product) throw new Error('Product not found');
      if (!user) throw new Error('User not found');

      // Create posting status record
      const postingStatus = await PostingStatus.create({
        user: userId,
        product: productId,
        platforms: targetPlatforms.map(platform => ({
          name: platform,
          status: 'pending'
        }))
      });

      // Start posting process asynchronously
      this.processCrossPosting(postingStatus._id, product, targetPlatforms);

      return {
        statusId: postingStatus._id,
        message: 'Cross-posting started'
      };
    } catch (error) {
      console.error('Failed to start cross-posting:', error);
      throw error;
    }
  }

  async processCrossPosting(statusId, product, platforms) {
    const status = await PostingStatus.findById(statusId);
    
    for (const platformName of platforms) {
      try {
        // Update status to in_progress
        await this.updatePlatformStatus(statusId, platformName, 'in_progress');

        // Get platform instance
        const platform = this.platforms[platformName];
        
        // Create listing
        const result = await platform.createListing(product);

        // Update status to completed with listing info
        await this.updatePlatformStatus(statusId, platformName, 'completed', {
          listingId: result.id,
          listingUrl: result.url
        });
      } catch (error) {
        console.error(`Failed to post to ${platformName}:`, error);
        
        // Update status to failed with error info
        await this.updatePlatformStatus(statusId, platformName, 'failed', {
          error: error instanceof MarketplaceError ? 
            error.message : 
            'An unexpected error occurred'
        });
      }
    }

    // Mark overall status as completed
    await PostingStatus.findByIdAndUpdate(statusId, {
      completed: true,
      completedAt: new Date()
    });
  }

  async updatePlatformStatus(statusId, platform, status, data = {}) {
    await PostingStatus.updateOne(
      { 
        _id: statusId,
        'platforms.name': platform 
      },
      { 
        $set: {
          'platforms.$.status': status,
          'platforms.$.lastUpdated': new Date(),
          'platforms.$.data': data
        }
      }
    );
  }

  async getStatus(statusId, userId) {
    const status = await PostingStatus.findById(statusId)
      .populate('product', 'title images')
      .populate('user', 'name email');

    if (!status) {
      throw new Error('Status not found');
    }

    if (status.user.toString() !== userId) {
      throw new Error('Unauthorized');
    }

    return status;
  }

  async getHistory(userId, productId = null) {
    const query = { user: userId };
    if (productId) {
      query.product = productId;
    }

    return PostingStatus.find(query)
      .sort({ createdAt: -1 })
      .populate('product', 'title images')
      .limit(50);
  }

  async retryFailedPlatforms(statusId, userId) {
    const status = await PostingStatus.findById(statusId);
    
    if (!status) {
      throw new Error('Status not found');
    }

    if (status.user.toString() !== userId) {
      throw new Error('Unauthorized');
    }

    const failedPlatforms = status.platforms
      .filter(p => p.status === 'failed')
      .map(p => p.name);

    if (failedPlatforms.length === 0) {
      throw new Error('No failed platforms to retry');
    }

    const product = await Product.findById(status.product);
    
    // Start new posting process for failed platforms
    return this.startCrossPosting(userId, product._id, failedPlatforms);
  }
}

module.exports = new CrossPostController();
