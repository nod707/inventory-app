const EbayScraper = require('../services/priceAnalysis/scrapers/EbayScraper');

async function testEbayScraper() {
  const scraper = new EbayScraper();
  
  // Test queries
  const queries = [
    "Nike Air Jordan 1 High Chicago",
    "Louis Vuitton Neverfull MM",
    "Levi's 501 Original Jeans"
  ];

  for (const query of queries) {
    console.log(`\nTesting query: "${query}"`);
    
    try {
      const listings = await scraper.searchListings(query);
      console.log(`Found ${listings.length} listings`);
      
      if (listings.length > 0) {
        // Show sample listing
        console.log('\nSample listing:');
        console.log(listings[0]);
        
        // Calculate and show price statistics
        const stats = scraper.calculatePriceStats(listings);
        console.log('\nPrice Statistics:');
        console.log(`Count: ${stats.count} listings`);
        console.log(`Average Price: $${stats.average.toFixed(2)}`);
        console.log(`Median Price: $${stats.median.toFixed(2)}`);
        console.log(`Price Range: $${stats.min.toFixed(2)} - $${stats.max.toFixed(2)}`);
        console.log(`25th-75th Percentile: $${stats.p25.toFixed(2)} - $${stats.p75.toFixed(2)}`);
        console.log(`Standard Deviation: $${stats.stdDev.toFixed(2)}`);
      }
    } catch (error) {
      console.error(`Error testing query "${query}":`, error.message);
    }
  }
}

// Run the tests
console.log('Starting eBay scraper tests...\n');
testEbayScraper().then(() => {
  console.log('\nTests completed');
}).catch(error => {
  console.error('Test error:', error);
});
