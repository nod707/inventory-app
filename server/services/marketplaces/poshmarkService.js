const axios = require('axios');

class PoshmarkService {
  constructor() {
    this.baseUrl = process.env.POSHMARK_API_URL;
    this.apiKey = process.env.POSHMARK_API_KEY;
  }

  async authenticate(credentials) {
    try {
      const response = await axios.post(`${this.baseUrl}/oauth/token`, {
        username: credentials.username,
        password: credentials.password,
        grant_type: 'password',
      }, {
        headers: {
          'X-API-Key': this.apiKey,
        },
      });

      return {
        success: true,
        token: response.data.access_token,
        userId: response.data.user_id,
      };
    } catch (error) {
      console.error('Poshmark authentication failed:', error);
      throw new Error('Failed to authenticate with Poshmark');
    }
  }

  async createListing(product, authToken) {
    try {
      const listing = this.formatProductForPoshmark(product);
      const response = await axios.post(`${this.baseUrl}/listings`, listing, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-API-Key': this.apiKey,
        },
      });

      return {
        success: true,
        listingId: response.data.listing_id,
        url: response.data.listing_url,
      };
    } catch (error) {
      console.error('Failed to create Poshmark listing:', error);
      throw new Error('Failed to create listing on Poshmark');
    }
  }

  formatProductForPoshmark(product) {
    return {
      title: product.title,
      description: product.description,
      price: product.price,
      size: product.size,
      brand: product.brand,
      category: product.category,
      sub_category: product.subCategory,
      color: product.color,
      photos: product.images,
      condition: this.mapCondition(product.condition),
      department: this.getDepartment(product.category),
    };
  }

  mapCondition(condition) {
    const conditionMap = {
      new: 'NWT',
      likeNew: 'NWOT',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor',
    };
    return conditionMap[condition] || 'Good';
  }

  getDepartment(category) {
    // Map category to Poshmark department
    const departmentMap = {
      womensClothing: 'Women',
      mensClothing: 'Men',
      kidsClothing: 'Kids',
      homeGoods: 'Home',
    };
    return departmentMap[category] || 'Women';
  }
}

module.exports = new PoshmarkService();
