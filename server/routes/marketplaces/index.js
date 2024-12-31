const express = require('express');
const router = express.Router();
const mercariService = require('../../services/marketplaces/mercariService');
const poshmarkService = require('../../services/marketplaces/poshmarkService');
const ebayService = require('../../services/marketplaces/ebayService');
const crossPostingService = require('../../services/marketplaces/crossPostingService');
const auth = require('../../middleware/auth');

// Authentication routes
router.post('/auth/:platform', auth, async (req, res) => {
  try {
    const { platform } = req.params;
    const credentials = req.body;
    let authResult;

    switch (platform.toLowerCase()) {
      case 'mercari':
        authResult = await mercariService.authenticate(credentials);
        break;
      case 'poshmark':
        authResult = await poshmarkService.authenticate(credentials);
        break;
      case 'ebay':
        authResult = await ebayService.authenticate(credentials);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported platform' });
    }

    // Store auth token in session
    req.session[`${platform.toLowerCase()}Token`] = authResult.token;
    
    res.json({ success: true });
  } catch (error) {
    console.error(`Authentication error for ${req.params.platform}:`, error);
    res.status(401).json({ error: error.message });
  }
});

// Logout route
router.post('/auth/:platform/logout', (req, res) => {
  const { platform } = req.params;
  // Clear platform token from session
  delete req.session[`${platform.toLowerCase()}Token`];
  res.json({ success: true });
});

// Cross-posting routes
router.post('/cross-post', auth, async (req, res) => {
  try {
    const { productId, platforms } = req.body;
    
    // Validate platforms
    if (!Array.isArray(platforms) || platforms.length === 0) {
      return res.status(400).json({ error: 'No platforms specified' });
    }

    // Validate authentication for each platform
    const unauthenticatedPlatforms = platforms.filter(
      platform => !req.session[`${platform.toLowerCase()}Token`]
    );

    if (unauthenticatedPlatforms.length > 0) {
      return res.status(401).json({
        error: 'Not authenticated with all platforms',
        platforms: unauthenticatedPlatforms
      });
    }

    // Start cross-posting process
    const result = await crossPostingService.crossPostProduct(
      productId,
      platforms,
      req.user.id
    );

    res.json(result);
  } catch (error) {
    console.error('Cross-posting error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get posting status
router.get('/status/:statusId', auth, async (req, res) => {
  try {
    const status = await crossPostingService.getPostingStatus(req.params.statusId);
    if (!status) {
      return res.status(404).json({ error: 'Status not found' });
    }
    
    // Verify user owns this status
    if (status.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    res.json(status);
  } catch (error) {
    console.error('Status retrieval error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all posting history for a product
router.get('/history/:productId', auth, async (req, res) => {
  try {
    const history = await PostingStatus.find({
      product: req.params.productId,
      user: req.user.id
    })
    .sort({ createdAt: -1 })
    .populate('product', 'title images');
    
    res.json(history);
  } catch (error) {
    console.error('History retrieval error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Platform connection status
router.get('/platforms/status', auth, async (req, res) => {
  const platforms = ['mercari', 'poshmark', 'ebay'];
  const status = {};
  
  for (const platform of platforms) {
    status[platform] = {
      connected: !!req.session[`${platform}Token`],
      lastAuthenticated: req.session[`${platform}LastAuth`] || null
    };
  }
  
  res.json(status);
});

// Cross-posting route
router.post('/:platform/post', async (req, res) => {
  try {
    const { platform } = req.params;
    const { product } = req.body;
    const authToken = req.session[`${platform.toLowerCase()}Token`];

    if (!authToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    let result;
    switch (platform.toLowerCase()) {
      case 'mercari':
        result = await mercariService.createListing(product, authToken);
        break;
      case 'poshmark':
        result = await poshmarkService.createListing(product, authToken);
        break;
      case 'ebay':
        result = await ebayService.createListing(product, authToken);
        break;
      default:
        return res.status(400).json({ error: 'Unsupported platform' });
    }

    res.json(result);
  } catch (error) {
    console.error(`Posting error for ${req.params.platform}:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Get platform status
router.get('/:platform/status', (req, res) => {
  const { platform } = req.params;
  const isAuthenticated = !!req.session[`${platform.toLowerCase()}Token`];
  res.json({ authenticated: isAuthenticated });
});

module.exports = router;
