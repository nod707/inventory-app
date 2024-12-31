const { 
  PoshmarkScraper,
  MercariScraper,
  TheRealRealScraper
} = require('../services/priceAnalysis/scrapers/AuthenticatedScraper');
const { saveSession } = require('../services/priceAnalysis/auth/sessionManager');

async function setupTestSessions() {
  // These would normally come from your OAuth flow or user login
  const testSessions = {
    poshmark: {
      cookies: [
        { name: '_posh_id', value: 'test_id', domain: '.poshmark.com' }
      ],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    },
    mercari: {
      cookies: [
        { name: 'mercari_session', value: 'test_session', domain: '.mercari.com' }
      ],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    therealreal: {
      cookies: [
        { name: 'visitor_id', value: 'test_visitor', domain: '.therealreal.com' }
      ],
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  };

  // Save test sessions
  for (const [platform, session] of Object.entries(testSessions)) {
    await saveSession(platform, 'test_user', session);
  }
}

async function testScrapers() {
  // Set up test sessions first
  await setupTestSessions();

  const scrapers = {
    Poshmark: new PoshmarkScraper(),
    Mercari: new MercariScraper(),
    TheRealReal: new TheRealRealScraper()
  };

  const testQueries = [
    "Nike Air Jordan 1 High Chicago",
    "Louis Vuitton Neverfull MM",
    "Levi's 501 Original Jeans"
  ];

  for (const [platform, scraper] of Object.entries(scrapers)) {
    console.log(`\nTesting ${platform} Scraper:`);
    
    for (const query of testQueries) {
      console.log(`\nSearching for: "${query}"`);
      
      try {
        const listings = await scraper.searchListings(query);
        console.log(`Found ${listings.length} listings`);
        
        if (listings.length > 0) {
          console.log('\nSample listing:');
          console.log(JSON.stringify(listings[0], null, 2));
        }
      } catch (error) {
        console.error(`Error searching ${platform} for "${query}":`, error.message);
      }
    }
  }
}

// Run the tests
console.log('Starting authenticated scraper tests...');
testScrapers().then(() => {
  console.log('\nTests completed');
}).catch(error => {
  console.error('Test error:', error);
});
