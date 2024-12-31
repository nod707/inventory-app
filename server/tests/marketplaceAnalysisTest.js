const MarketplaceAnalyzer = require('../services/priceAnalysis/marketplaces/MarketplaceAnalyzer');
const dotenv = require('dotenv');

dotenv.config();

async function testMarketplaceAnalysis() {
  console.log('Starting marketplace analysis test...');
  
  try {
    const analyzer = new MarketplaceAnalyzer();
    
    // Test searching across all platforms
    console.log('\nTesting multi-platform analysis...');
    const searchQuery = 'iphone 14 pro';
    const { insights, listings } = await analyzer.getMarketInsights(searchQuery);
    
    // Display results summary
    console.log(`\nAnalysis Results Summary for "${searchQuery}":`);
    console.log(`Poshmark: ${listings.poshmark.length} listings found`);
    console.log(`Mercari: ${listings.mercari.length} listings found`);
    
    // Display sample listings from each platform
    if (listings.poshmark.length > 0) {
      console.log('\nPoshmark Sample (First 2 items):');
      listings.poshmark.slice(0, 2).forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.title}`);
        console.log(`   Price: ${item.price}`);
        console.log(`   Brand: ${item.brand || 'N/A'}`);
        console.log(`   URL: ${item.url}`);
      });
    }
    
    if (listings.mercari.length > 0) {
      console.log('\nMercari Sample (First 2 items):');
      listings.mercari.slice(0, 2).forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.title}`);
        console.log(`   Price: ${item.price}`);
        console.log(`   Condition: ${item.condition || 'N/A'}`);
        console.log(`   URL: ${item.url}`);
      });
    }
    
    // Display market insights
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
    
    console.log('\nAnalysis completed successfully!');
  } catch (error) {
    console.error('Error during market analysis:', error);
    throw error;
  }
}

// Run the test
testMarketplaceAnalysis().catch(console.error);
