const PoshmarkScraper = require('./scrapers/PoshmarkScraper');
const TheRealRealScraper = require('./scrapers/TheRealRealScraper');
const EbayScraper = require('./scrapers/EbayScraper');
const MercariScraper = require('./scrapers/MercariScraper');
const SimilarityAnalyzer = require('./ai/SimilarityAnalyzer');

class PriceAnalysisService {
  constructor() {
    this.scrapers = {
      poshmark: PoshmarkScraper,
      therealreal: TheRealRealScraper,
      ebay: EbayScraper,
      mercari: MercariScraper,
      // Add more scrapers as they're implemented
    };
    this.similarityAnalyzer = SimilarityAnalyzer;
    this.similarityThreshold = 0.7; // Minimum similarity score to consider an item similar
  }

  async analyzePricing(query, imageUrl) {
    try {
      const results = await this.gatherListings(query, imageUrl);
      const analysis = this.calculatePriceMetrics(results);
      return {
        recommendations: this.generateRecommendations(analysis),
        similarItems: results,
        metrics: analysis
      };
    } catch (error) {
      console.error('Price analysis error:', error);
      throw error;
    }
  }

  async gatherListings(query, imageUrl) {
    const sourceItem = { title: query, imageUrl };
    const allListings = [];

    // Gather listings from all platforms in parallel
    const scrapePromises = Object.entries(this.scrapers).map(async ([platform, scraper]) => {
      try {
        const listings = await scraper.searchListings(query, imageUrl);
        // Get top 10 most similar items from each platform
        const similarListings = [];
        for (const listing of listings) {
          try {
            const similarity = await this.similarityAnalyzer.analyzeSimilarity(sourceItem, listing);
            if (similarity.overallSimilarity >= this.similarityThreshold) {
              similarListings.push({
                ...listing,
                similarity: similarity.overallSimilarity
              });
            }
          } catch (error) {
            console.error('Error analyzing similarity:', error);
          }
        }
        
        // Sort by similarity and take top 10
        return similarListings
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 10);
      } catch (error) {
        console.error(`Error scraping ${platform}:`, error);
        return [];
      }
    });

    const results = await Promise.all(scrapePromises);
    return results.flat();
  }

  calculatePriceMetrics(listings) {
    if (listings.length === 0) {
      return null;
    }

    const prices = listings.map(item => parseFloat(item.price));
    const weights = listings.map(item => item.similarity);

    // Calculate weighted statistics
    const weightedPrices = prices.map((price, i) => price * weights[i]);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

    const metrics = {
      count: listings.length,
      min: Math.min(...prices),
      max: Math.max(...prices),
      median: this.calculateMedian(prices),
      weightedAverage: weightedPrices.reduce((sum, price) => sum + price, 0) / totalWeight,
      standardDeviation: this.calculateStandardDeviation(prices),
      priceDistribution: this.calculatePriceDistribution(prices),
      recentTrends: this.analyzeRecentTrends(listings)
    };

    return metrics;
  }

  calculateMedian(prices) {
    const sorted = [...prices].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    return sorted[middle];
  }

  calculateStandardDeviation(prices) {
    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const squaredDiffs = prices.map(price => Math.pow(price - mean, 2));
    const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / prices.length;
    return Math.sqrt(variance);
  }

  calculatePriceDistribution(prices) {
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min;
    const buckets = 5;
    const bucketSize = range / buckets;

    const distribution = Array(buckets).fill(0);
    prices.forEach(price => {
      const bucketIndex = Math.min(
        Math.floor((price - min) / bucketSize),
        buckets - 1
      );
      distribution[bucketIndex]++;
    });

    return distribution.map((count, i) => ({
      range: {
        min: min + (i * bucketSize),
        max: min + ((i + 1) * bucketSize)
      },
      count,
      percentage: (count / prices.length) * 100
    }));
  }

  analyzeRecentTrends(listings) {
    // Sort by timestamp
    const sorted = [...listings].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    // Split into recent and older listings
    const recentCutoff = new Date();
    recentCutoff.setDate(recentCutoff.getDate() - 30); // Last 30 days

    const recent = sorted.filter(item => 
      new Date(item.timestamp) >= recentCutoff
    );
    const older = sorted.filter(item => 
      new Date(item.timestamp) < recentCutoff
    );

    if (recent.length === 0 || older.length === 0) {
      return null;
    }

    const recentAvg = recent.reduce((sum, item) => sum + parseFloat(item.price), 0) / recent.length;
    const olderAvg = older.reduce((sum, item) => sum + parseFloat(item.price), 0) / older.length;

    return {
      recentAveragePrice: recentAvg,
      priceChange: recentAvg - olderAvg,
      priceChangePercentage: ((recentAvg - olderAvg) / olderAvg) * 100
    };
  }

  generateRecommendations(analysis) {
    if (!analysis) {
      return {
        suggestedPrice: null,
        confidence: 0,
        reasoning: 'Insufficient data for price analysis'
      };
    }

    const {
      weightedAverage,
      standardDeviation,
      recentTrends,
      priceDistribution
    } = analysis;

    // Base price on weighted average
    let suggestedPrice = weightedAverage;
    let confidence = 0.5;
    let reasoning = [];

    // Adjust for recent trends
    if (recentTrends) {
      if (Math.abs(recentTrends.priceChangePercentage) > 10) {
        suggestedPrice = recentTrends.recentAveragePrice;
        reasoning.push(`Recent price ${recentTrends.priceChange > 0 ? 'increase' : 'decrease'} of ${Math.abs(recentTrends.priceChangePercentage).toFixed(1)}%`);
      }
    }

    // Adjust confidence based on data quality
    if (analysis.count >= 10) {
      confidence += 0.2;
      reasoning.push('Good sample size of similar items');
    }

    if (standardDeviation / weightedAverage < 0.2) {
      confidence += 0.2;
      reasoning.push('Consistent pricing across listings');
    }

    // Find most common price range
    const mostCommonPriceRange = priceDistribution.reduce((prev, curr) => 
      curr.count > prev.count ? curr : prev
    );

    if (mostCommonPriceRange.percentage > 40) {
      confidence += 0.1;
      reasoning.push(`Strong price clustering around ${mostCommonPriceRange.range.min.toFixed(2)} - ${mostCommonPriceRange.range.max.toFixed(2)}`);
    }

    return {
      suggestedPrice: Math.round(suggestedPrice * 100) / 100,
      confidence: Math.min(confidence, 1),
      reasoning: reasoning.join('. ')
    };
  }
}

module.exports = new PriceAnalysisService();
