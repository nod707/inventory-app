const express = require('express');
const router = express.Router();
const { scrapePoshmark, scrapeMercari, scrapeEbay } = require('../services/marketplaces/scrapers');

router.post('/search', async (req, res) => {
  try {
    const { query, platforms = ['poshmark', 'mercari', 'ebay'] } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchPromises = [];
    
    if (platforms.includes('poshmark')) {
      searchPromises.push(scrapePoshmark(query));
    }
    if (platforms.includes('mercari')) {
      searchPromises.push(scrapeMercari(query));
    }
    if (platforms.includes('ebay')) {
      searchPromises.push(scrapeEbay(query));
    }

    const results = await Promise.allSettled(searchPromises);
    const combinedResults = results
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => result.value)
      .sort((a, b) => parseFloat(b.price.replace(/[^0-9.]/g, '')) - parseFloat(a.price.replace(/[^0-9.]/g, '')));

    res.json(combinedResults);
  } catch (error) {
    console.error('Marketplace search error:', error);
    res.status(500).json({ error: 'Failed to search marketplaces' });
  }
});

module.exports = router;
