const axios = require('axios');

class EbayService {
  constructor() {
    this.baseUrl = process.env.EBAY_API_URL;
    this.clientId = process.env.EBAY_CLIENT_ID;
    this.clientSecret = process.env.EBAY_CLIENT_SECRET;
  }

  async authenticate(credentials) {
    try {
      // eBay uses OAuth 2.0
      const response = await axios.post(`${this.baseUrl}/identity/v1/oauth2/token`, {
        grant_type: 'authorization_code',
        code: credentials.code,
        redirect_uri: process.env.EBAY_REDIRECT_URI,
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
        },
      });

      return {
        success: true,
        token: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
      };
    } catch (error) {
      console.error('eBay authentication failed:', error);
      throw new Error('Failed to authenticate with eBay');
    }
  }

  async createListing(product, authToken) {
    try {
      const listing = this.formatProductForEbay(product);
      const response = await axios.post(`${this.baseUrl}/sell/inventory/v1/inventory_item`, listing, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Language': 'en-US',
        },
      });

      // Create offer after inventory item is created
      const offer = await this.createOffer(response.data.sku, product, authToken);

      return {
        success: true,
        listingId: offer.offerId,
        url: offer.listingUrl,
      };
    } catch (error) {
      console.error('Failed to create eBay listing:', error);
      throw new Error('Failed to create listing on eBay');
    }
  }

  async createOffer(sku, product, authToken) {
    const offer = {
      sku,
      marketplaceId: 'EBAY_US',
      format: 'FIXED_PRICE',
      availableQuantity: 1,
      categoryId: product.category,
      listingPolicies: {
        fulfillmentPolicyId: process.env.EBAY_FULFILLMENT_POLICY_ID,
        paymentPolicyId: process.env.EBAY_PAYMENT_POLICY_ID,
        returnPolicyId: process.env.EBAY_RETURN_POLICY_ID,
      },
      pricingSummary: {
        price: {
          value: product.price,
          currency: 'USD',
        },
      },
    };

    const response = await axios.post(
      `${this.baseUrl}/sell/inventory/v1/offer`,
      offer,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Language': 'en-US',
        },
      }
    );

    return response.data;
  }

  formatProductForEbay(product) {
    return {
      product: {
        title: product.title,
        description: product.description,
        aspects: this.formatAspects(product),
        imageUrls: product.images,
      },
      condition: this.mapCondition(product.condition),
      availability: {
        shipToLocationAvailability: {
          quantity: 1,
        },
      },
    };
  }

  formatAspects(product) {
    const aspects = {};
    if (product.brand) aspects.Brand = [product.brand];
    if (product.size) aspects.Size = [product.size];
    if (product.color) aspects.Color = [product.color];
    return aspects;
  }

  mapCondition(condition) {
    const conditionMap = {
      new: 1000,
      likeNew: 2000,
      good: 3000,
      fair: 4000,
      poor: 5000,
    };
    return conditionMap[condition] || 3000;
  }
}

module.exports = new EbayService();
