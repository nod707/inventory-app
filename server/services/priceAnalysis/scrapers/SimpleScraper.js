const axios = require('axios');
const cheerio = require('cheerio');

class SimpleScraper {
  constructor() {
    this.axios = axios.create({
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0'
      },
      timeout: 10000
    });
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async searchPoshmark(query) {
    try {
      await this.delay(Math.random() * 2000 + 1000); // Random delay 1-3 seconds
      const response = await this.axios.get(`https://poshmark.com/search?q=${encodeURIComponent(query)}&type=listings&src=dir`, {
        headers: {
          'Cookie': '_posh_id=random_id' // Add a fake cookie to appear more like a real browser
        }
      });
      const $ = cheerio.load(response.data);
      
      const listings = [];
      $('.item__Card-sc').each((i, element) => {
        const title = $(element).find('.item__Title-sc').text().trim();
        const price = $(element).find('.item__Price-sc').text().trim();
        const imageUrl = $(element).find('img').attr('src');
        const listingUrl = 'https://poshmark.com' + $(element).find('a').attr('href');

        if (title && price) {
          listings.push({ 
            title, 
            price: price.replace(/[^\d.]/g, ''),
            imageUrl,
            listingUrl,
            platform: 'poshmark'
          });
        }
      });

      return listings;
    } catch (error) {
      console.error('Poshmark search error:', error.message);
      return [];
    }
  }

  async searchEbay(query) {
    try {
      await this.delay(Math.random() * 2000 + 1000);
      const response = await this.axios.get(`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&LH_Sold=1&LH_Complete=1`);
      const $ = cheerio.load(response.data);
      
      const listings = [];
      $('.s-item__wrapper').each((i, element) => {
        const title = $(element).find('.s-item__title').text().trim();
        const priceText = $(element).find('.s-item__price').text().trim();
        const imageUrl = $(element).find('.s-item__image-img').attr('src');
        const listingUrl = $(element).find('.s-item__link').attr('href');

        // Skip "Shop on eBay" items
        if (title && title !== 'Shop on eBay' && priceText) {
          const price = priceText.replace(/[^\d.]/g, '');
          listings.push({ 
            title, 
            price,
            imageUrl,
            listingUrl,
            platform: 'ebay'
          });
        }
      });

      return listings;
    } catch (error) {
      console.error('eBay search error:', error.message);
      return [];
    }
  }

  async searchMercari(query) {
    try {
      await this.delay(Math.random() * 2000 + 1000);
      const response = await this.axios.get(`https://www.mercari.com/search/?keyword=${encodeURIComponent(query)}`, {
        headers: {
          'Cookie': 'mercari_session=random_session' // Add a fake session cookie
        }
      });
      const $ = cheerio.load(response.data);
      
      const listings = [];
      $('[data-testid="ItemContainer"]').each((i, element) => {
        const title = $(element).find('[data-testid="ItemName"]').text().trim();
        const priceText = $(element).find('[data-testid="ItemPrice"]').text().trim();
        const imageUrl = $(element).find('img').attr('src');
        const listingUrl = 'https://www.mercari.com' + $(element).find('a').attr('href');

        if (title && priceText) {
          const price = priceText.replace(/[^\d.]/g, '');
          listings.push({ 
            title, 
            price,
            imageUrl,
            listingUrl,
            platform: 'mercari'
          });
        }
      });

      return listings;
    } catch (error) {
      console.error('Mercari search error:', error.message);
      return [];
    }
  }

  async searchTheRealReal(query) {
    try {
      await this.delay(Math.random() * 2000 + 1000);
      const response = await this.axios.get(`https://www.therealreal.com/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Cookie': 'visitor_id=random_visitor' // Add a fake visitor cookie
        }
      });
      const $ = cheerio.load(response.data);
      
      const listings = [];
      $('.product-card').each((i, element) => {
        const title = $(element).find('.product-card__title').text().trim();
        const priceText = $(element).find('.product-card__price').text().trim();
        const imageUrl = $(element).find('.product-card__image img').attr('src');
        const listingUrl = 'https://www.therealreal.com' + $(element).find('a').attr('href');

        if (title && priceText) {
          const price = priceText.replace(/[^\d.]/g, '');
          listings.push({ 
            title, 
            price,
            imageUrl,
            listingUrl,
            platform: 'therealreal'
          });
        }
      });

      return listings;
    } catch (error) {
      console.error('TheRealReal search error:', error.message);
      return [];
    }
  }
}

module.exports = SimpleScraper;
