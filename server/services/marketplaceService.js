const axios = require('axios');
const MarketplaceAccount = require('../models/MarketplaceAccount');

class MarketplaceService {
  constructor() {
    this.poshmarkApi = axios.create({
      baseURL: 'https://poshmark.com/api',
      timeout: 10000
    });

    this.mercariApi = axios.create({
      baseURL: 'https://api.mercari.com',
      timeout: 10000
    });
  }

  async loginToPoshmark(username, password) {
    try {
      const response = await this.poshmarkApi.post('/login', {
        username,
        password
      });

      return {
        sessionToken: response.data.token,
        sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };
    } catch (error) {
      throw new Error('Invalid Poshmark credentials');
    }
  }

  async loginToMercari(username, password) {
    try {
      const response = await this.mercariApi.post('/login', {
        username,
        password
      });

      return {
        sessionToken: response.data.token,
        sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      };
    } catch (error) {
      throw new Error('Invalid Mercari credentials');
    }
  }

  async ensureValidSession(account) {
    if (account.needsRefresh()) {
      const loginFunction = account.platform === 'poshmark' 
        ? this.loginToPoshmark 
        : this.loginToMercari;

      const { sessionToken, sessionExpiry } = await loginFunction(
        account.username,
        account.password
      );
      
      account.sessionToken = sessionToken;
      account.sessionExpiry = sessionExpiry;
      await account.save();
    }
    return account.sessionToken;
  }

  async listOnPoshmark(account, product) {
    const sessionToken = await this.ensureValidSession(account);
    
    try {
      const response = await this.poshmarkApi.post('/create_listing', {
        title: product.name,
        description: `${product.name}\n\nDimensions: ${product.dimensions.join(' x ')} inches`,
        price: product.sellingPrice,
        original_price: product.purchasePrice,
        size: 'OS', // One Size
        photos: [product.imageUrl],
        category: 'Other',
        subcategory: 'Other',
        color: [],
        condition: 'NWT', // New With Tags
        shipping_option: 'poshmark'
      }, {
        headers: { 
          'X-Session-Token': sessionToken
        }
      });

      return {
        success: true,
        listingId: response.data.listing_id,
        url: response.data.listing_url
      };
    } catch (error) {
      throw new Error(`Failed to list on Poshmark: ${error.message}`);
    }
  }

  async listOnMercari(account, product) {
    const sessionToken = await this.ensureValidSession(account);
    
    try {
      const response = await this.mercariApi.post('/listings', {
        title: product.name,
        description: `${product.name}\n\nDimensions: ${product.dimensions.join(' x ')} inches`,
        price: product.sellingPrice,
        photos: [product.imageUrl],
        condition: 'New',
        shipping: {
          method: 'usps',
          paid_by: 'buyer',
          weight: '1_pound'
        },
        category: 'Other',
        subcategory: 'Other'
      }, {
        headers: { 
          'Authorization': `Bearer ${sessionToken}`
        }
      });

      return {
        success: true,
        listingId: response.data.listing_id,
        url: response.data.listing_url
      };
    } catch (error) {
      throw new Error(`Failed to list on Mercari: ${error.message}`);
    }
  }

  async listProduct(userId, product) {
    const accounts = await MarketplaceAccount.find({ 
      userId, 
      isActive: true 
    }).select('+password +sessionToken');

    const results = {
      poshmark: null,
      mercari: null
    };

    for (const account of accounts) {
      try {
        if (account.platform === 'poshmark') {
          results.poshmark = await this.listOnPoshmark(account, product);
        } else if (account.platform === 'mercari') {
          results.mercari = await this.listOnMercari(account, product);
        }
      } catch (error) {
        results[account.platform] = {
          success: false,
          error: error.message
        };
      }
    }

    return results;
  }
}

module.exports = new MarketplaceService();
