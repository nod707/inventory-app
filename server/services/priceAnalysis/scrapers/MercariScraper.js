const BaseScraper = require('./BaseScraper');

class MercariScraper extends BaseScraper {
  constructor() {
    super('mercari');
    this.baseUrl = 'https://www.mercari.com';
  }

  async searchListings(query, imageUrl = null) {
    try {
      await this.initialize();

      // Navigate to search page
      const searchUrl = `${this.baseUrl}/search?keyword=${encodeURIComponent(query)}`;
      await this.page.goto(searchUrl, { waitUntil: 'networkidle0' });
      await this.randomDelay();

      // Wait for items to load
      await this.page.waitForSelector('[data-testid="SearchResults"]', { timeout: 5000 });

      // Scroll to load more items
      await this.autoScroll();

      // Extract listing data
      const listings = await this.page.evaluate(() => {
        const items = [];
        const cards = document.querySelectorAll('[data-testid^="SearchResults"]');
        
        cards.forEach(card => {
          try {
            // Extract basic information
            const title = card.querySelector('[data-testid="ItemInfo-title"]')?.textContent?.trim();
            const priceText = card.querySelector('[data-testid="ItemInfo-price"]')?.textContent?.trim();
            const imageUrl = card.querySelector('img')?.src;
            const listingUrl = card.querySelector('a')?.href;
            const soldBadge = card.querySelector('[data-testid="ItemBadge-sold"]');
            const condition = card.querySelector('[data-testid="ItemInfo-condition"]')?.textContent?.trim();

            if (title && priceText) {
              items.push({
                platform: 'mercari',
                title,
                price: parseFloat(priceText.replace(/[$,]/g, '')),
                imageUrl,
                listingUrl,
                condition,
                sold: !!soldBadge
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
            const getTextContent = selector => {
              const element = document.querySelector(selector);
              return element ? element.textContent.trim() : null;
            };

            // Get seller info
            const sellerInfo = {
              name: getTextContent('[data-testid="seller-name"]'),
              rating: getTextContent('[data-testid="seller-rating"]'),
              completedSales: getTextContent('[data-testid="seller-completed-sales"]')
            };

            // Get item details
            const itemDetails = {};
            const detailsContainer = document.querySelector('[data-testid="ItemDetails"]');
            if (detailsContainer) {
              detailsContainer.querySelectorAll('[data-testid^="ItemDetails-"]').forEach(detail => {
                const label = detail.querySelector('.label')?.textContent?.trim();
                const value = detail.querySelector('.value')?.textContent?.trim();
                if (label && value) {
                  itemDetails[label] = value;
                }
              });
            }

            return {
              description: getTextContent('[data-testid="ItemDescription"]'),
              seller: sellerInfo,
              details: itemDetails,
              brand: getTextContent('[data-testid="ItemDetails-brand"]'),
              size: getTextContent('[data-testid="ItemDetails-size"]'),
              shipping: getTextContent('[data-testid="ItemShipping"]'),
              likes: getTextContent('[data-testid="ItemLikes"]')?.replace(/\D/g, ''),
              views: getTextContent('[data-testid="ItemViews"]')?.replace(/\D/g, '')
            };
          });

          // Add price history if available
          const priceHistory = await this.getPriceHistory(listing.listingUrl);

          detailedListings.push({
            ...listing,
            ...details,
            priceHistory,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error getting listing details:', error);
          detailedListings.push(listing);
        }
      }

      // Filter and sort listings
      return detailedListings
        .filter(listing => listing.sold) // Only include sold items for better price analysis
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error('Mercari scraping error:', error);
      throw error;
    } finally {
      await this.close();
    }
  }

  async getPriceHistory(listingUrl) {
    try {
      // Note: This is a placeholder for price history
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

  async handleDynamicLoading() {
    try {
      // Scroll and wait for new items
      const previousHeight = await this.page.evaluate('document.body.scrollHeight');
      await this.page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await this.page.waitForFunction(
        `document.body.scrollHeight > ${previousHeight}`,
        { timeout: 3000 }
      );
      await this.randomDelay();
    } catch (error) {
      console.error('Error handling dynamic loading:', error);
    }
  }
}

module.exports = new MercariScraper();
