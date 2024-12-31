class RateLimiter {
  constructor() {
    this.limits = {
      ebay: {
        calls: 5000,  // Calls per day
        interval: 24 * 60 * 60 * 1000,  // 24 hours in milliseconds
        concurrent: 10  // Maximum concurrent requests
      },
      poshmark: {
        calls: 1000,  // Calls per hour
        interval: 60 * 60 * 1000,  // 1 hour in milliseconds
        concurrent: 5
      },
      mercari: {
        calls: 2000,  // Calls per hour
        interval: 60 * 60 * 1000,  // 1 hour in milliseconds
        concurrent: 5
      }
    };

    // Initialize tracking objects
    this.usage = {};
    this.queues = {};
    this.activeRequests = {};

    // Initialize for each platform
    Object.keys(this.limits).forEach(platform => {
      this.usage[platform] = [];
      this.queues[platform] = [];
      this.activeRequests[platform] = 0;
    });
  }

  async acquireToken(platform) {
    if (!this.limits[platform]) {
      throw new Error(`Unknown platform: ${platform}`);
    }

    // Clean up old usage data
    this.cleanupUsage(platform);

    // Check if we're within rate limits
    if (!this.checkRateLimit(platform)) {
      throw new Error(`Rate limit exceeded for ${platform}`);
    }

    // Check concurrent requests
    if (this.activeRequests[platform] >= this.limits[platform].concurrent) {
      // Wait for a slot to become available
      await new Promise(resolve => {
        this.queues[platform].push(resolve);
      });
    }

    // Increment active requests
    this.activeRequests[platform]++;
    
    // Record usage
    this.usage[platform].push(Date.now());

    return true;
  }

  releaseToken(platform) {
    if (!this.limits[platform]) {
      throw new Error(`Unknown platform: ${platform}`);
    }

    // Decrement active requests
    this.activeRequests[platform]--;

    // Process queue if there are waiting requests
    if (this.queues[platform].length > 0 && 
        this.activeRequests[platform] < this.limits[platform].concurrent) {
      const next = this.queues[platform].shift();
      next();
    }
  }

  checkRateLimit(platform) {
    const limit = this.limits[platform];
    const currentUsage = this.usage[platform].length;
    return currentUsage < limit.calls;
  }

  cleanupUsage(platform) {
    const limit = this.limits[platform];
    const now = Date.now();
    this.usage[platform] = this.usage[platform].filter(
      timestamp => now - timestamp < limit.interval
    );
  }

  async withRateLimit(platform, fn) {
    try {
      await this.acquireToken(platform);
      return await fn();
    } finally {
      this.releaseToken(platform);
    }
  }

  getRemainingCalls(platform) {
    this.cleanupUsage(platform);
    return this.limits[platform].calls - this.usage[platform].length;
  }

  getResetTime(platform) {
    if (this.usage[platform].length === 0) {
      return null;
    }
    const oldestCall = Math.min(...this.usage[platform]);
    return new Date(oldestCall + this.limits[platform].interval);
  }
}

module.exports = new RateLimiter();
