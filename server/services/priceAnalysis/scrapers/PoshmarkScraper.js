const BaseScraper = require('./BaseScraper');

class PoshmarkScraper extends BaseScraper {
  constructor() {
    super('poshmark');
    this.baseUrl = 'https://poshmark.com';
  }

  async searchListings(query, imageUrl = null) {
    try {
      await this.initialize();

      // Navigate to Poshmark search
      const searchUrl = `${this.baseUrl}/search?q=${encodeURIComponent(query)}`;
      await this.page.goto(searchUrl, { waitUntil: 'networkidle0' });
      await this.randomDelay();

      // Scroll to load more items
      await this.autoScroll();

      // Extract listing data
      const listings = await this.page.evaluate(() => {
        const items = [];
        const cards = document.querySelectorAll('[data-test="item-card"]');
        
        cards.forEach(card => {
          try {
            const title = card.querySelector('[data-test="item-title"]')?.textContent?.trim();
            const price = card.querySelector('[data-test="item-price"]')?.textContent?.trim();
            const imageUrl = card.querySelector('img')?.src;
            const listingUrl = card.querySelector('a')?.href;
            const seller = card.querySelector('[data-test="seller-name"]')?.textContent?.trim();
            
            if (title && price) {
              items.push({
                platform: 'poshmark',
                title,
                price: price.replace('$', '').trim(),
                imageUrl,
                listingUrl,
                seller
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
            return {
              description: document.querySelector('[data-test="item-description"]')?.textContent?.trim(),
              brand: document.querySelector('[data-test="item-brand"]')?.textContent?.trim(),
              size: document.querySelector('[data-test="item-size"]')?.textContent?.trim(),
              condition: document.querySelector('[data-test="item-condition"]')?.textContent?.trim(),
            };
          });

          detailedListings.push({
            ...listing,
            ...details,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error getting listing details:', error);
          detailedListings.push(listing);
        }
      }

      return detailedListings;
    } catch (error) {
      console.error('Poshmark scraping error:', error);
      throw error;
    } finally {
      await this.close();
    }
  }
}

module.exports = new PoshmarkScraper();
