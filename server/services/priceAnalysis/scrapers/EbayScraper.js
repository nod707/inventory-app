const axios = require('axios');
const cheerio = require('cheerio');

class EbayScraper {
  constructor() {
    this.axios = axios.create({
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache'
      },
      timeout: 10000
    });
  }

  parsePriceString(priceStr) {
    // Remove currency symbols and commas, then convert to float
    const numStr = priceStr.replace(/[^0-9.]/g, '');
    return parseFloat(numStr);
  }

  async searchListings(query) {
    try {
      // Search for completed/sold listings to get actual market prices
      const response = await this.axios.get(
        `https://www.ebay.com/sch/i.html`, {
          params: {
            _nkw: query,
            LH_Complete: '1',  // Completed listings
            LH_Sold: '1',      // Sold listings
            _sop: '12',        // Sort by end date: recent first
            _ipg: '100'        // Items per page
          }
        }
      );

      const $ = cheerio.load(response.data);
      const listings = [];

      $('.s-item__wrapper').each((i, element) => {
        const $element = $(element);
        const title = $element.find('.s-item__title').text().trim();
        
        // Skip "Shop on eBay" placeholder items
        if (!title || title === 'Shop on eBay') {
          return;
        }

        const priceStr = $element.find('.s-item__price').text().trim();
        const price = this.parsePriceString(priceStr);
        
        const imageUrl = $element.find('.s-item__image-img').attr('src');
        const listingUrl = $element.find('.s-item__link').attr('href');
        
        // Get additional details
        const dateStr = $element.find('.s-item__title--tagblock .POSITIVE').text().trim();
        const soldDate = dateStr ? new Date(dateStr) : null;
        
        const shippingStr = $element.find('.s-item__shipping').text().trim();
        const freeShipping = shippingStr.toLowerCase().includes('free');
        const shippingCost = freeShipping ? 0 : this.parsePriceString(shippingStr) || 0;

        // Only add items with valid prices
        if (price && !isNaN(price)) {
          listings.push({
            title,
            price,
            totalPrice: price + shippingCost,
            shippingCost,
            freeShipping,
            imageUrl,
            listingUrl,
            soldDate,
            condition: $element.find('.SECONDARY_INFO').text().trim(),
            platform: 'ebay'
          });
        }
      });

      // Sort by most recent first
      listings.sort((a, b) => {
        if (a.soldDate && b.soldDate) {
          return b.soldDate - a.soldDate;
        }
        return 0;
      });

      return listings;
    } catch (error) {
      console.error('eBay search error:', error.message);
      return [];
    }
  }

  calculatePriceStats(listings) {
    if (listings.length === 0) return null;

    const prices = listings.map(l => l.totalPrice);
    const sum = prices.reduce((a, b) => a + b, 0);
    const avg = sum / prices.length;
    
    // Sort prices for median and percentiles
    prices.sort((a, b) => a - b);
    
    const median = prices.length % 2 === 0
      ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
      : prices[Math.floor(prices.length / 2)];

    const getPercentile = (p) => {
      const index = Math.ceil((p / 100) * prices.length) - 1;
      return prices[index];
    };

    return {
      count: listings.length,
      average: avg,
      median: median,
      min: Math.min(...prices),
      max: Math.max(...prices),
      p25: getPercentile(25),  // 25th percentile
      p75: getPercentile(75),  // 75th percentile
      stdDev: Math.sqrt(
        prices.reduce((sum, price) => sum + Math.pow(price - avg, 2), 0) / prices.length
      )
    };
  }
}

module.exports = EbayScraper;
