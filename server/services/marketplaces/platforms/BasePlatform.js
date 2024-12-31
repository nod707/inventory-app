const { MarketplaceErrorHandler } = require('../errorHandler');
const rateLimiter = require('../rateLimiter');
const oauthManager = require('../auth/oauthManager');

class BasePlatform {
  constructor(platformName) {
    this.platformName = platformName;
    this.errorHandler = MarketplaceErrorHandler;
    this.rateLimiter = rateLimiter;
    this.oauthManager = oauthManager;
  }

  async executeWithRetry(operation, maxRetries = 3) {
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.rateLimiter.withRateLimit(this.platformName, async () => {
          const token = await this.oauthManager.getAccessToken(this.platformName);
          return await operation(token);
        });
      } catch (error) {
        lastError = this.errorHandler.handleError(this.platformName, error);
        
        if (!this.errorHandler.isRetryable(lastError) || attempt === maxRetries) {
          throw lastError;
        }

        const delay = this.errorHandler.getRetryDelay(lastError);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw lastError;
  }

  // Platform-specific methods to be implemented by child classes
  async authenticate(credentials) {
    throw new Error('authenticate() must be implemented');
  }

  async createListing(product) {
    throw new Error('createListing() must be implemented');
  }

  async updateListing(listingId, updates) {
    throw new Error('updateListing() must be implemented');
  }

  async deleteListing(listingId) {
    throw new Error('deleteListing() must be implemented');
  }

  async getListing(listingId) {
    throw new Error('getListing() must be implemented');
  }

  validateProduct(product) {
    throw new Error('validateProduct() must be implemented');
  }

  formatImages(images) {
    throw new Error('formatImages() must be implemented');
  }
}

module.exports = BasePlatform;
