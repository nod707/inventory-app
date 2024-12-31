const express = require('express');
const router = express.Router();

// Store listings in memory (could be moved to Redis or database for persistence)
let marketListings = {
  mercari: [],
  poshmark: [],
  ebay: []
};

// Receive listings from browser extension
router.post('/listings', (req, res) => {
  try {
    const { marketplace, listings } = req.body;
    const platform = marketplace.split('.')[0]; // Extract platform name from domain

    // Update listings for the platform
    marketListings[platform] = listings.map(listing => ({
      ...listing,
      timestamp: new Date()
    }));

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving listings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all current listings
router.get('/listings', (req, res) => {
  try {
    // Remove listings older than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    Object.keys(marketListings).forEach(platform => {
      marketListings[platform] = marketListings[platform].filter(
        listing => listing.timestamp > oneHourAgo
      );
    });

    res.json(marketListings);
  } catch (error) {
    console.error('Error getting listings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Trigger new search across platforms
router.post('/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    // Clear existing listings
    marketListings = {
      mercari: [],
      poshmark: [],
      ebay: []
    };

    // Send search request to extension
    // This would typically be handled by the extension's background script
    // which would open the search pages and collect results
    
    res.json({ success: true, message: 'Search initiated' });
  } catch (error) {
    console.error('Error initiating search:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
