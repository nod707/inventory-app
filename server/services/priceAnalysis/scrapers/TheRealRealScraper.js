const BaseScraper = require('./BaseScraper');

class TheRealRealScraper extends BaseScraper {
  constructor() {
    super('therealreal');
    this.baseUrl = 'https://www.therealreal.com';
  }

  async searchListings(query, imageUrl = null) {
    try {
      await this.initialize();

      // Navigate to search page
      const searchUrl = `${this.baseUrl}/products?keywords=${encodeURIComponent(query)}`;
      await this.page.goto(searchUrl, { waitUntil: 'networkidle0' });
      await this.randomDelay();

      // Handle cookie consent if present
      try {
        const cookieButton = await this.page.$('[data-testid="cookie-banner-close"]');
        if (cookieButton) {
          await cookieButton.click();
          await this.randomDelay();
        }
      } catch (error) {
        console.log('No cookie banner found');
      }

      // Scroll to load more items
      await this.autoScroll();

      // Extract listing data
      const listings = await this.page.evaluate(() => {
        const items = [];
        const cards = document.querySelectorAll('[data-testid="product-card"]');
        
        cards.forEach(card => {
          try {
            // Extract basic information
            const title = card.querySelector('[data-testid="product-title"]')?.textContent?.trim();
            const brand = card.querySelector('[data-testid="product-designer"]')?.textContent?.trim();
            
            // Extract prices
            const priceElement = card.querySelector('[data-testid="product-price"]');
            const originalPrice = priceElement?.querySelector('.original-price')?.textContent?.trim();
            const currentPrice = priceElement?.querySelector('.current-price')?.textContent?.trim();
            
            // Get image and URL
            const imageUrl = card.querySelector('img')?.src;
            const listingUrl = card.querySelector('a')?.href;

            if (title && (originalPrice || currentPrice)) {
              items.push({
                platform: 'therealreal',
                title: `${brand} ${title}`.trim(),
                price: currentPrice ? this.extractPrice(currentPrice) : this.extractPrice(originalPrice),
                originalPrice: originalPrice ? this.extractPrice(originalPrice) : null,
                imageUrl,
                listingUrl,
                brand
              });
            }
          } catch (error) {
            console.error('Error parsing card:', error);
          }
        });

        return items;
      });

      // Get additional details for each listing
      const detailedListings = [];
      for (const listing of listings.slice(0, 10)) { // Limit to first 10 for performance
        try {
          await this.page.goto(listing.listingUrl, { waitUntil: 'networkidle0' });
          await this.randomDelay();

          const details = await this.page.evaluate(() => {
            // Extract detailed information
            const getTextContent = selector => {
              const element = document.querySelector(selector);
              return element ? element.textContent.trim() : null;
            };

            return {
              description: getTextContent('[data-testid="product-details-description"]'),
              condition: getTextContent('[data-testid="product-condition"]'),
              size: getTextContent('[data-testid="product-size"]'),
              materials: getTextContent('[data-testid="product-materials"]'),
              measurements: getTextContent('[data-testid="product-measurements"]'),
              authentication: getTextContent('[data-testid="authentication-badge"]'),
              retail: getTextContent('[data-testid="product-retail-price"]')?.replace('Retail Price: ', ''),
            };
          });

          // Add retail price if available
          if (details.retail) {
            details.retailPrice = this.extractPrice(details.retail);
          }

          detailedListings.push({
            ...listing,
            ...details,
            timestamp: new Date().toISOString(),
            priceHistory: await this.getPriceHistory(listing.listingUrl)
          });
        } catch (error) {
          console.error('Error getting listing details:', error);
          detailedListings.push(listing);
        }
      }

      return detailedListings;
    } catch (error) {
      console.error('TheRealReal scraping error:', error);
      throw error;
    } finally {
      await this.close();
    }
  }

  async getPriceHistory(listingUrl) {
    try {
      // Note: This is a placeholder for price history tracking
      // In a real implementation, you would:
      // 1. Store prices in a database when scraping
      // 2. Track price changes over time
      // 3. Return the historical price data
      return [];
    } catch (error) {
      console.error('Error getting price history:', error);
      return [];
    }
  }

  extractPrice(priceText) {
    // Remove any currency symbols and commas, then extract the number
    const match = priceText.replace(/,/g, '').match(/[\d.]+/);
    return match ? parseFloat(match[0]) : null;
  }
}

module.exports = new TheRealRealScraper();
