const AuthenticatedScraper = require('./AuthenticatedScraper');

class MarketplaceScraper {
  constructor() {
    this.scraper = new AuthenticatedScraper();
  }

  async searchAllPlatforms(query) {
    const results = {
      poshmark: [],
      mercari: []
    };

    try {
      // Search Poshmark
      try {
        results.poshmark = await this.scraper.searchPoshmark(query);
      } catch (error) {
        console.error('Error searching Poshmark:', error);
      }

      // Search Mercari
      try {
        results.mercari = await this.scraper.searchMercari(query);
      } catch (error) {
        console.error('Error searching Mercari:', error);
      }

      return results;
    } finally {
      await this.scraper.close();
    }
  }

  async getItemDetails(platform, url) {
    try {
      switch (platform.toLowerCase()) {
        case 'poshmark':
          return await this.scraper.getPoshmarkItemDetails(url);
        case 'mercari':
          return await this.scraper.getMercariItemDetails(url);
        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }
    } finally {
      await this.scraper.close();
    }
  }

  async getPriceHistory(platform, query, days = 30) {
    // This is a placeholder for future implementation
    // Will need to track and store historical price data
    return {
      platform,
      query,
      period: `${days} days`,
      history: [],
      averagePrice: 0,
      lowestPrice: 0,
      highestPrice: 0
    };
  }

  async getMarketInsights(query) {
    const results = await this.searchAllPlatforms(query);
    
    const insights = {
      totalListings: 0,
      averagePrice: 0,
      priceRange: { min: Infinity, max: -Infinity },
      platformBreakdown: {
        poshmark: { count: 0, averagePrice: 0 },
        mercari: { count: 0, averagePrice: 0 }
      }
    };

    // Process Poshmark results
    if (results.poshmark.length > 0) {
      insights.platformBreakdown.poshmark.count = results.poshmark.length;
      const poshPrices = results.poshmark
        .map(item => parseFloat(item.price.replace(/[$,]/g, '')))
        .filter(price => !isNaN(price));
      
      if (poshPrices.length > 0) {
        insights.platformBreakdown.poshmark.averagePrice = 
          poshPrices.reduce((a, b) => a + b, 0) / poshPrices.length;
        insights.priceRange.min = Math.min(insights.priceRange.min, ...poshPrices);
        insights.priceRange.max = Math.max(insights.priceRange.max, ...poshPrices);
      }
    }

    // Process Mercari results
    if (results.mercari.length > 0) {
      insights.platformBreakdown.mercari.count = results.mercari.length;
      const mercariPrices = results.mercari
        .map(item => parseFloat(item.price.replace(/[$,]/g, '')))
        .filter(price => !isNaN(price));
      
      if (mercariPrices.length > 0) {
        insights.platformBreakdown.mercari.averagePrice = 
          mercariPrices.reduce((a, b) => a + b, 0) / mercariPrices.length;
        insights.priceRange.min = Math.min(insights.priceRange.min, ...mercariPrices);
        insights.priceRange.max = Math.max(insights.priceRange.max, ...mercariPrices);
      }
    }

    // Calculate overall metrics
    insights.totalListings = 
      insights.platformBreakdown.poshmark.count + 
      insights.platformBreakdown.mercari.count;

    if (insights.totalListings > 0) {
      insights.averagePrice = (
        (insights.platformBreakdown.poshmark.averagePrice * insights.platformBreakdown.poshmark.count) +
        (insights.platformBreakdown.mercari.averagePrice * insights.platformBreakdown.mercari.count)
      ) / insights.totalListings;
    }

    // Handle case where no prices were found
    if (insights.priceRange.min === Infinity) {
      insights.priceRange.min = 0;
    }
    if (insights.priceRange.max === -Infinity) {
      insights.priceRange.max = 0;
    }

    return insights;
  }
}

module.exports = MarketplaceScraper;
