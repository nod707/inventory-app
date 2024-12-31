const PoshmarkScraper = require('../services/priceAnalysis/scrapers/PoshmarkScraper');
const TheRealRealScraper = require('../services/priceAnalysis/scrapers/TheRealRealScraper');
const EbayScraper = require('../services/priceAnalysis/scrapers/EbayScraper');
const MercariScraper = require('../services/priceAnalysis/scrapers/MercariScraper');

const testQueries = [
    {
        name: "Popular Sneaker",
        query: "Nike Air Jordan 1 High Chicago",
        expectedFields: ['title', 'price', 'imageUrl', 'listingUrl']
    },
    {
        name: "Luxury Bag",
        query: "Louis Vuitton Neverfull MM",
        expectedFields: ['title', 'price', 'imageUrl', 'listingUrl']
    },
    {
        name: "Common Clothing",
        query: "Levi's 501 Original Jeans",
        expectedFields: ['title', 'price', 'imageUrl', 'listingUrl']
    }
];

const scrapers = {
    poshmark: PoshmarkScraper,
    therealreal: TheRealRealScraper,
    ebay: EbayScraper,
    mercari: MercariScraper
};

async function validateResults(results, expectedFields) {
    const issues = [];
    
    if (!Array.isArray(results)) {
        return [`Expected array of results, got ${typeof results}`];
    }
    
    if (results.length === 0) {
        return ['No results returned'];
    }

    results.forEach((result, index) => {
        expectedFields.forEach(field => {
            if (!result[field]) {
                issues.push(`Missing ${field} in result ${index}`);
            }
        });

        // Validate URLs
        if (result.imageUrl && !result.imageUrl.startsWith('http')) {
            issues.push(`Invalid image URL in result ${index}: ${result.imageUrl}`);
        }
        if (result.listingUrl && !result.listingUrl.startsWith('http')) {
            issues.push(`Invalid listing URL in result ${index}: ${result.listingUrl}`);
        }

        // Validate price
        if (isNaN(parseFloat(result.price))) {
            issues.push(`Invalid price in result ${index}: ${result.price}`);
        }
    });

    return issues;
}

async function testScraper(platform, scraper, query, expectedFields) {
    console.log(`\nTesting ${platform} scraper with query: "${query}"`);
    try {
        console.time(`${platform} scraping time`);
        const results = await scraper.searchListings(query);
        console.timeEnd(`${platform} scraping time`);

        const issues = await validateResults(results, expectedFields);

        if (issues.length === 0) {
            console.log(`✅ Success: Found ${results.length} results`);
            console.log('Sample result:', JSON.stringify(results[0], null, 2));
        } else {
            console.log('❌ Issues found:');
            issues.forEach(issue => console.log(`  - ${issue}`));
        }

        return {
            success: issues.length === 0,
            resultCount: results.length,
            issues
        };
    } catch (error) {
        console.log(`❌ Error testing ${platform}:`, error.message);
        return {
            success: false,
            resultCount: 0,
            issues: [error.message]
        };
    }
}

async function runTests() {
    console.log('Starting scraper tests...\n');
    const results = {};

    for (const testCase of testQueries) {
        console.log(`\n=== Testing with ${testCase.name}: ${testCase.query} ===`);
        
        for (const [platform, scraper] of Object.entries(scrapers)) {
            if (!results[platform]) {
                results[platform] = {
                    successful: 0,
                    failed: 0,
                    totalResults: 0,
                    issues: []
                };
            }

            const testResult = await testScraper(
                platform,
                scraper,
                testCase.query,
                testCase.expectedFields
            );

            if (testResult.success) {
                results[platform].successful++;
            } else {
                results[platform].failed++;
                results[platform].issues.push({
                    query: testCase.query,
                    issues: testResult.issues
                });
            }
            results[platform].totalResults += testResult.resultCount;
        }
    }

    console.log('\n=== Test Summary ===');
    Object.entries(results).forEach(([platform, stats]) => {
        console.log(`\n${platform}:`);
        console.log(`  Successful tests: ${stats.successful}`);
        console.log(`  Failed tests: ${stats.failed}`);
        console.log(`  Total results: ${stats.totalResults}`);
        if (stats.issues.length > 0) {
            console.log('  Issues:');
            stats.issues.forEach(issue => {
                console.log(`    Query "${issue.query}":`);
                issue.issues.forEach(i => console.log(`      - ${i}`));
            });
        }
    });
}

// Run the tests
runTests().catch(console.error);
