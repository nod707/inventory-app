const mercariService = require('./mercariService');
const poshmarkService = require('./poshmarkService');
const ebayService = require('./ebayService');
const PostingStatus = require('../../models/PostingStatus');
const Product = require('../../models/Product');

class CrossPostingService {
  constructor() {
    this.services = {
      mercari: mercariService,
      poshmark: poshmarkService,
      ebay: ebayService,
    };
    this.maxRetries = 3;
    this.retryDelay = 2000; // 2 seconds
  }

  async crossPostProduct(productId, platforms, userId) {
    try {
      // Get product details
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      // Create posting status records
      const postingStatus = await PostingStatus.create({
        product: productId,
        user: userId,
        platforms: platforms.map(platform => ({
          name: platform,
          status: 'pending',
          attempts: 0
        }))
      });

      // Post to each platform asynchronously
      const postingPromises = platforms.map(platform => 
        this.postToPlatform(platform, product, postingStatus._id)
      );

      // Wait for all posting attempts to complete
      const results = await Promise.allSettled(postingPromises);
      
      // Update final status
      const finalStatus = await PostingStatus.findById(postingStatus._id);
      finalStatus.completed = true;
      finalStatus.completedAt = new Date();
      await finalStatus.save();

      return {
        statusId: postingStatus._id,
        results: results.map((result, index) => ({
          platform: platforms[index],
          success: result.status === 'fulfilled',
          data: result.status === 'fulfilled' ? result.value : null,
          error: result.status === 'rejected' ? result.reason.message : null
        }))
      };
    } catch (error) {
      console.error('Cross-posting failed:', error);
      throw error;
    }
  }

  async postToPlatform(platform, product, statusId, attempt = 1) {
    try {
      // Update status to 'in_progress'
      await this.updatePlatformStatus(statusId, platform, 'in_progress', attempt);

      // Get the appropriate service
      const service = this.services[platform.toLowerCase()];
      if (!service) {
        throw new Error(`Unsupported platform: ${platform}`);
      }

      // Format images for the platform
      const formattedImages = await this.prepareImages(product.images, platform);
      
      // Create the listing
      const result = await service.createListing({
        ...product.toObject(),
        images: formattedImages
      });

      // Update status to 'completed'
      await this.updatePlatformStatus(statusId, platform, 'completed', attempt, {
        listingId: result.listingId,
        listingUrl: result.url
      });

      return result;
    } catch (error) {
      console.error(`Posting to ${platform} failed (attempt ${attempt}):`, error);

      // Retry logic
      if (attempt < this.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.postToPlatform(platform, product, statusId, attempt + 1);
      }

      // Update status to 'failed' if all retries are exhausted
      await this.updatePlatformStatus(statusId, platform, 'failed', attempt, {
        error: error.message
      });

      throw error;
    }
  }

  async prepareImages(images, platform) {
    // Platform-specific image formatting
    switch (platform.toLowerCase()) {
      case 'mercari':
        return this.formatMercariImages(images);
      case 'poshmark':
        return this.formatPoshmarkImages(images);
      case 'ebay':
        return this.formatEbayImages(images);
      default:
        return images;
    }
  }

  async formatMercariImages(images) {
    // Mercari specific image requirements
    return images.slice(0, 8).map(image => ({
      url: image,
      position: images.indexOf(image)
    }));
  }

  async formatPoshmarkImages(images) {
    // Poshmark specific image requirements
    return images.slice(0, 8);
  }

  async formatEbayImages(images) {
    // eBay specific image requirements
    return images.slice(0, 12);
  }

  async updatePlatformStatus(statusId, platform, status, attempt, data = {}) {
    try {
      await PostingStatus.updateOne(
        { 
          _id: statusId,
          'platforms.name': platform 
        },
        { 
          $set: {
            'platforms.$.status': status,
            'platforms.$.attempts': attempt,
            'platforms.$.lastAttempt': new Date(),
            'platforms.$.data': data
          }
        }
      );
    } catch (error) {
      console.error('Failed to update posting status:', error);
    }
  }

  async getPostingStatus(statusId) {
    try {
      const status = await PostingStatus.findById(statusId)
        .populate('product', 'title images')
        .populate('user', 'name email');
      return status;
    } catch (error) {
      console.error('Failed to get posting status:', error);
      throw error;
    }
  }
}

module.exports = new CrossPostingService();
