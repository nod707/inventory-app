const MarketplaceScraper = require('../services/priceAnalysis/scrapers/MarketplaceScraper');
const dotenv = require('dotenv');

dotenv.config();

async function testMarketplaceScraper() {
  console.log('Starting Marketplace scraping test...');
  
  try {
    const scraper = new MarketplaceScraper();
    
    // Test searching across all platforms
    console.log('\nTesting multi-platform search...');
    const searchQuery = 'iphone 14 pro';
    const searchResults = await scraper.searchAllPlatforms(searchQuery);
    
    // Display results summary
    console.log(`\nSearch Results Summary for "${searchQuery}":`);
    console.log(`Poshmark: ${searchResults.poshmark.length} results`);
    console.log(`Mercari: ${searchResults.mercari.length} results`);
    
    // Display sample results from each platform
    if (searchResults.poshmark.length > 0) {
      console.log('\nPoshmark Sample (First 2 items):');
      searchResults.poshmark.slice(0, 2).forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.title}`);
        console.log(`   Price: ${item.price}`);
        console.log(`   URL: ${item.url}`);
      });
    }
    
    if (searchResults.mercari.length > 0) {
      console.log('\nMercari Sample (First 2 items):');
      searchResults.mercari.slice(0, 2).forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.title}`);
        console.log(`   Price: ${item.price}`);
        console.log(`   URL: ${item.url}`);
      });
    }
    
    // Get market insights
    console.log('\nGetting market insights...');
    const insights = await scraper.getMarketInsights(searchQuery);
    
    console.log('\nMarket Insights:');
    console.log('Total Listings:', insights.totalListings);
    console.log('Average Price:', `$${insights.averagePrice.toFixed(2)}`);
    console.log('Price Range:', `$${insights.priceRange.min.toFixed(2)} - $${insights.priceRange.max.toFixed(2)}`);
    console.log('\nPlatform Breakdown:');
    console.log('Poshmark:', {
      count: insights.platformBreakdown.poshmark.count,
      averagePrice: `$${insights.platformBreakdown.poshmark.averagePrice.toFixed(2)}`
    });
    console.log('Mercari:', {
      count: insights.platformBreakdown.mercari.count,
      averagePrice: `$${insights.platformBreakdown.mercari.averagePrice.toFixed(2)}`
    });
    
    console.log('\nScraping test completed successfully!');
  } catch (error) {
    console.error('Error during scraping test:', error);
    throw error;
  }
}

// Run the test
testMarketplaceScraper().catch(console.error);
