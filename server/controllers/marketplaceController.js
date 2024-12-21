const MarketplaceAccount = require('../models/MarketplaceAccount');
const marketplaceService = require('../services/marketplaceService');
const Product = require('../models/Product');

exports.connectPoshmark = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Verify credentials by attempting to login
    const { sessionToken, sessionExpiry } = await marketplaceService.loginToPoshmark(username, password);

    // Save account
    const account = new MarketplaceAccount({
      userId: req.user._id,
      platform: 'poshmark',
      username,
      password,
      sessionToken,
      sessionExpiry
    });

    await account.save();

    res.status(201).json({
      success: true,
      message: 'Poshmark account connected successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to connect Poshmark account',
      error: error.message
    });
  }
};

exports.connectMercari = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Verify credentials by attempting to login
    const { sessionToken, sessionExpiry } = await marketplaceService.loginToMercari(username, password);

    // Save account
    const account = new MarketplaceAccount({
      userId: req.user._id,
      platform: 'mercari',
      username,
      password,
      sessionToken,
      sessionExpiry
    });

    await account.save();

    res.status(201).json({
      success: true,
      message: 'Mercari account connected successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to connect Mercari account',
      error: error.message
    });
  }
};

exports.getConnectedAccounts = async (req, res) => {
  try {
    const accounts = await MarketplaceAccount.find({ 
      userId: req.user._id,
      isActive: true
    }).select('platform username lastSync');

    res.json(accounts);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to fetch connected accounts',
      error: error.message
    });
  }
};

exports.disconnectAccount = async (req, res) => {
  try {
    const { platform } = req.params;
    await MarketplaceAccount.findOneAndUpdate(
      { userId: req.user._id, platform },
      { isActive: false }
    );

    res.json({
      success: true,
      message: `${platform} account disconnected successfully`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to disconnect account',
      error: error.message
    });
  }
};

exports.listProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const results = await marketplaceService.listProduct(req.user._id, product);

    res.json({
      success: true,
      results
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to list product',
      error: error.message
    });
  }
};
