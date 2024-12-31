const AuthenticatedScraper = require('../services/priceAnalysis/scrapers/AuthenticatedScraper');
const dotenv = require('dotenv');

dotenv.config();

async function testMercariScraping() {
  console.log('Starting Mercari scraping test...');
  
  try {
    const scraper = new AuthenticatedScraper();
    
    // Test searching for a product
    console.log('\nTesting product search...');
    const searchQuery = 'nike dunk low';
    const searchResults = await scraper.searchMercari(searchQuery);
    
    console.log(`Found ${searchResults.length} results for "${searchQuery}"`);
    
    // Display first few results
    if (searchResults.length > 0) {
      console.log('\nFirst 3 results:');
      searchResults.slice(0, 3).forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.title}`);
        console.log(`   Price: ${item.price}`);
        console.log(`   Condition: ${item.condition}`);
        console.log(`   URL: ${item.url}`);
      });
      
      // Test getting detailed info for the first item
      if (searchResults[0]) {
        console.log('\nGetting detailed info for first item...');
        const itemDetails = await scraper.getMercariItemDetails(searchResults[0].url);
        
        console.log('\nItem Details:');
        console.log('Title:', itemDetails.title);
        console.log('Price:', itemDetails.price);
        console.log('Condition:', itemDetails.condition);
        console.log('Description:', itemDetails.description);
        console.log('Seller:', itemDetails.seller);
        console.log('Images:', itemDetails.images.length, 'images found');
      }
    }
    
    console.log('\nScraping test completed successfully!');
  } catch (error) {
    console.error('Error during scraping test:', error);
    throw error;
  }
}

// Run the test
testMercariScraping().catch(console.error);
