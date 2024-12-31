const loginManager = require('../services/priceAnalysis/auth/loginManager');
const { 
  PoshmarkScraper,
  MercariScraper,
  TheRealRealScraper
} = require('../services/priceAnalysis/scrapers/AuthenticatedScraper');

async function testLoginAndScrape() {
  const credentials = {
    poshmark: {
      username: process.env.POSHMARK_USERNAME,
      password: process.env.POSHMARK_PASSWORD
    },
    mercari: {
      username: process.env.MERCARI_USERNAME,
      password: process.env.MERCARI_PASSWORD
    },
    therealreal: {
      username: process.env.THEREALREAL_USERNAME,
      password: process.env.THEREALREAL_PASSWORD
    }
  };

  // Test queries
  const queries = [
    "Nike Air Jordan 1 High Chicago",
    "Louis Vuitton Neverfull MM",
    "Levi's 501 Original Jeans"
  ];

  // Test each platform
  console.log('Testing Poshmark...');
  try {
    await loginManager.loginToPoshmark(credentials.poshmark.username, credentials.poshmark.password);
    console.log('Poshmark login successful');
    
    const poshmarkScraper = new PoshmarkScraper();
    for (const query of queries) {
      console.log(`\nSearching Poshmark for: ${query}`);
      const results = await poshmarkScraper.searchListings(query);
      console.log(`Found ${results.length} listings`);
      if (results.length > 0) {
        console.log('Sample result:', results[0]);
      }
    }
  } catch (error) {
    console.error('Poshmark test failed:', error.message);
  }

  console.log('\nTesting Mercari...');
  try {
    await loginManager.loginToMercari(credentials.mercari.username, credentials.mercari.password);
    console.log('Mercari login successful');
    
    const mercariScraper = new MercariScraper();
    for (const query of queries) {
      console.log(`\nSearching Mercari for: ${query}`);
      const results = await mercariScraper.searchListings(query);
      console.log(`Found ${results.length} listings`);
      if (results.length > 0) {
        console.log('Sample result:', results[0]);
      }
    }
  } catch (error) {
    console.error('Mercari test failed:', error.message);
  }

  console.log('\nTesting TheRealReal...');
  try {
    await loginManager.loginToTheRealReal(credentials.therealreal.username, credentials.therealreal.password);
    console.log('TheRealReal login successful');
    
    const theRealRealScraper = new TheRealRealScraper();
    for (const query of queries) {
      console.log(`\nSearching TheRealReal for: ${query}`);
      const results = await theRealRealScraper.searchListings(query);
      console.log(`Found ${results.length} listings`);
      if (results.length > 0) {
        console.log('Sample result:', results[0]);
      }
    }
  } catch (error) {
    console.error('TheRealReal test failed:', error.message);
  }
}

// Run the test
console.log('Starting login and scrape tests...\n');
testLoginAndScrape().then(() => {
  console.log('\nTests completed');
}).catch(error => {
  console.error('Test error:', error);
});
