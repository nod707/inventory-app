const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const PriceAnalysisService = require('../services/priceAnalysis/PriceAnalysisService');
const auth = require('../middleware/auth');

// Analyze pricing with image and text query
router.post('/analyze', auth, upload.single('image'), async (req, res) => {
  try {
    const { query } = req.body;
    const imageUrl = req.file ? await uploadAndGetUrl(req.file) : null;

    if (!query && !imageUrl) {
      return res.status(400).json({
        error: 'Either query text or image is required'
      });
    }

    const analysis = await PriceAnalysisService.analyzePricing(query, imageUrl);
    res.json(analysis);
  } catch (error) {
    console.error('Price analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze pricing',
      details: error.message
    });
  }
});

// Get quick price estimate
router.get('/estimate', auth, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        error: 'Query parameter is required'
      });
    }

    const analysis = await PriceAnalysisService.analyzePricing(query);
    res.json({
      suggestedPrice: analysis.recommendations.suggestedPrice,
      confidence: analysis.recommendations.confidence
    });
  } catch (error) {
    console.error('Price estimation error:', error);
    res.status(500).json({
      error: 'Failed to estimate price',
      details: error.message
    });
  }
});

// Helper function to upload image and get URL
async function uploadAndGetUrl(file) {
  // Implement your image upload logic here
  // This could upload to S3, local storage, etc.
  // Return the URL of the uploaded image
  return `http://your-domain.com/uploads/${file.filename}`;
}

module.exports = router;
