const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplaceController');
const { authenticateToken } = require('../middleware/auth');

// Connect marketplace accounts
router.post('/poshmark/connect', authenticateToken, marketplaceController.connectPoshmark);
router.post('/mercari/connect', authenticateToken, marketplaceController.connectMercari);

// Get connected accounts
router.get('/accounts', authenticateToken, marketplaceController.getConnectedAccounts);

// Disconnect accounts
router.post('/:platform/disconnect', authenticateToken, marketplaceController.disconnectAccount);

// List product on marketplaces
router.post('/list/:productId', authenticateToken, marketplaceController.listProduct);

module.exports = router;
