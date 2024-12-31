const express = require('express');
const router = express.Router();
const CrossPostController = require('../../../controllers/CrossPostController');
const auth = require('../../../middleware/auth');
const { body, param } = require('express-validator');

// Start cross-posting process
router.post('/',
  auth,
  [
    body('productId').isMongoId().withMessage('Invalid product ID'),
    body('platforms').isArray().withMessage('Platforms must be an array'),
    body('platforms.*').isString().withMessage('Platform names must be strings')
  ],
  async (req, res) => {
    try {
      const result = await CrossPostController.startCrossPosting(
        req.user.id,
        req.body.productId,
        req.body.platforms
      );
      res.json(result);
    } catch (error) {
      console.error('Cross-posting error:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// Get status of cross-posting
router.get('/status/:statusId',
  auth,
  [
    param('statusId').isMongoId().withMessage('Invalid status ID')
  ],
  async (req, res) => {
    try {
      const status = await CrossPostController.getStatus(
        req.params.statusId,
        req.user.id
      );
      res.json(status);
    } catch (error) {
      console.error('Status retrieval error:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// Get cross-posting history
router.get('/history',
  auth,
  async (req, res) => {
    try {
      const history = await CrossPostController.getHistory(
        req.user.id,
        req.query.productId
      );
      res.json(history);
    } catch (error) {
      console.error('History retrieval error:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

// Retry failed platforms
router.post('/retry/:statusId',
  auth,
  [
    param('statusId').isMongoId().withMessage('Invalid status ID')
  ],
  async (req, res) => {
    try {
      const result = await CrossPostController.retryFailedPlatforms(
        req.params.statusId,
        req.user.id
      );
      res.json(result);
    } catch (error) {
      console.error('Retry error:', error);
      res.status(400).json({ error: error.message });
    }
  }
);

module.exports = router;
