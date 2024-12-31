const axios = require('axios');

class MercariService {
  constructor() {
    this.baseUrl = process.env.MERCARI_API_URL;
    this.apiKey = process.env.MERCARI_API_KEY;
  }

  async authenticate(credentials) {
    try {
      const response = await axios.post(`${this.baseUrl}/auth`, {
        username: credentials.username,
        password: credentials.password,
      }, {
        headers: {
          'X-API-Key': this.apiKey,
        },
      });
      
      return {
        success: true,
        token: response.data.token,
        userId: response.data.userId,
      };
    } catch (error) {
      console.error('Mercari authentication failed:', error);
      throw new Error('Failed to authenticate with Mercari');
    }
  }

  async createListing(product, authToken) {
    try {
      const listing = this.formatProductForMercari(product);
      const response = await axios.post(`${this.baseUrl}/listings`, listing, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-API-Key': this.apiKey,
        },
      });

      return {
        success: true,
        listingId: response.data.listingId,
        url: response.data.listingUrl,
      };
    } catch (error) {
      console.error('Failed to create Mercari listing:', error);
      throw new Error('Failed to create listing on Mercari');
    }
  }

  formatProductForMercari(product) {
    return {
      title: product.title,
      description: product.description,
      price: product.price,
      condition: this.mapCondition(product.condition),
      shipping: {
        paid_by: product.shippingPaidBy || 'seller',
        method: product.shippingMethod || 'usps',
      },
      category_id: product.category,
      photos: product.images,
    };
  }

  mapCondition(condition) {
    const conditionMap = {
      new: 1,
      likeNew: 2,
      good: 3,
      fair: 4,
      poor: 5,
    };
    return conditionMap[condition] || 3;
  }
}

module.exports = new MercariService();
