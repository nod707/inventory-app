const axios = require('axios');
const BasePlatform = require('./BasePlatform');
const sharp = require('sharp');

class PoshmarkPlatform extends BasePlatform {
  constructor() {
    super('poshmark');
    this.baseUrl = process.env.POSHMARK_API_URL;
    this.requiredFields = [
      'title',
      'description',
      'price',
      'size',
      'brand',
      'category',
      'color',
      'condition'
    ];
  }

  async authenticate(credentials) {
    return this.executeWithRetry(async () => {
      const response = await axios.post(`${this.baseUrl}/oauth/token`, {
        grant_type: 'password',
        username: credentials.username,
        password: credentials.password,
        client_id: process.env.POSHMARK_CLIENT_ID,
        client_secret: process.env.POSHMARK_CLIENT_SECRET
      });

      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in
      };
    });
  }

  async createListing(product) {
    this.validateProduct(product);
    
    return this.executeWithRetry(async (token) => {
      // Format images according to Poshmark requirements
      const formattedImages = await this.formatImages(product.images);
      
      // Create the listing
      const listing = {
        title: product.title,
        description: this.formatDescription(product),
        price: this.formatPrice(product.price),
        size: product.size,
        brand: product.brand,
        category: this.mapCategory(product.category),
        color: product.color,
        condition: this.mapCondition(product.condition),
        photos: formattedImages,
        department: this.getDepartment(product.category),
        source_type: 'API'
      };

      const response = await axios.post(
        `${this.baseUrl}/listings`,
        listing,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        id: response.data.listing_id,
        url: response.data.listing_url,
        status: response.data.status
      };
    });
  }

  async updateListing(listingId, updates) {
    return this.executeWithRetry(async (token) => {
      if (updates.images) {
        updates.photos = await this.formatImages(updates.images);
        delete updates.images;
      }

      const response = await axios.put(
        `${this.baseUrl}/listings/${listingId}`,
        updates,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        id: response.data.listing_id,
        url: response.data.listing_url,
        status: response.data.status
      };
    });
  }

  async deleteListing(listingId) {
    return this.executeWithRetry(async (token) => {
      await axios.delete(
        `${this.baseUrl}/listings/${listingId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return true;
    });
  }

  validateProduct(product) {
    const missingFields = this.requiredFields.filter(field => !product[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields for Poshmark: ${missingFields.join(', ')}`);
    }

    if (product.price < 3 || product.price > 5000) {
      throw new Error('Poshmark price must be between $3 and $5000');
    }

    if (!product.images || product.images.length === 0) {
      throw new Error('At least one image is required for Poshmark listings');
    }

    if (product.images.length > 8) {
      throw new Error('Poshmark allows maximum 8 images per listing');
    }
  }

  async formatImages(images) {
    const formattedImages = [];
    
    for (const imageUrl of images) {
      try {
        // Download image
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data);

        // Process image according to Poshmark requirements
        const processed = await sharp(buffer)
          .resize(1200, 1200, { // Poshmark recommended size
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ quality: 85 }) // Poshmark accepts JPEG format
          .toBuffer();

        // Convert to base64 for API submission
        formattedImages.push(processed.toString('base64'));
      } catch (error) {
        console.error(`Failed to process image ${imageUrl}:`, error);
        throw new Error(`Image processing failed: ${error.message}`);
      }
    }

    return formattedImages;
  }

  formatDescription(product) {
    let description = product.description;

    // Add measurements if available
    if (product.measurements) {
      description += '\n\nMeasurements:\n';
      for (const [key, value] of Object.entries(product.measurements)) {
        description += `${key}: ${value}\n`;
      }
    }

    // Add material if available
    if (product.material) {
      description += `\nMaterial: ${product.material}`;
    }

    // Add care instructions if available
    if (product.careInstructions) {
      description += `\n\nCare Instructions: ${product.careInstructions}`;
    }

    return description;
  }

  formatPrice(price) {
    // Poshmark takes prices in cents
    return Math.round(price * 100);
  }

  mapCategory(category) {
    // Map your internal category to Poshmark's category structure
    const categoryMap = {
      'womens_clothing': 'Women/Clothing',
      'mens_clothing': 'Men/Clothing',
      'accessories': 'Accessories',
      // Add more mappings as needed
    };
    return categoryMap[category] || category;
  }

  mapCondition(condition) {
    const conditionMap = {
      'new': 'NWT',
      'like_new': 'NWOT',
      'good': 'Good',
      'fair': 'Fair',
      'poor': 'Poor'
    };
    return conditionMap[condition] || condition;
  }

  getDepartment(category) {
    if (category.startsWith('womens_')) return 'Women';
    if (category.startsWith('mens_')) return 'Men';
    if (category.startsWith('kids_')) return 'Kids';
    return 'Women'; // Default department
  }
}

module.exports = new PoshmarkPlatform();
