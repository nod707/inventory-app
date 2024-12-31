const SimpleScraper = require('../services/priceAnalysis/scrapers/SimpleScraper');

const testQueries = [
    "Nike Air Jordan 1 High Chicago",
    "Louis Vuitton Neverfull MM",
    "Levi's 501 Original Jeans"
];

async function runTests() {
    const scraper = new SimpleScraper();
    
    for (const query of testQueries) {
        console.log(`\nTesting query: "${query}"`);
        
        console.log('\nPoshmark Results:');
        const poshResults = await scraper.searchPoshmark(query);
        console.log(`Found ${poshResults.length} listings`);
        if (poshResults.length > 0) {
            console.log('Sample result:', poshResults[0]);
        }
        
        console.log('\neBay Results:');
        const ebayResults = await scraper.searchEbay(query);
        console.log(`Found ${ebayResults.length} listings`);
        if (ebayResults.length > 0) {
            console.log('Sample result:', ebayResults[0]);
        }
        
        console.log('\nMercari Results:');
        const mercariResults = await scraper.searchMercari(query);
        console.log(`Found ${mercariResults.length} listings`);
        if (mercariResults.length > 0) {
            console.log('Sample result:', mercariResults[0]);
        }
        
        console.log('\nTheRealReal Results:');
        const trrResults = await scraper.searchTheRealReal(query);
        console.log(`Found ${trrResults.length} listings`);
        if (trrResults.length > 0) {
            console.log('Sample result:', trrResults[0]);
        }
    }
}

console.log('Starting scraper tests...');
runTests()
    .then(() => console.log('\nTests completed'))
    .catch(error => console.error('Test error:', error));
