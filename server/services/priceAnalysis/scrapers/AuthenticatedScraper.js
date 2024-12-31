const puppeteer = require('puppeteer');
const { getSession } = require('../auth/sessionManager');

class AuthenticatedScraper {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async initialize(platform = 'poshmark') {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: false,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process'
        ]
      });
      
      this.page = await this.browser.newPage();
      
      // Set viewport and user agent
      await this.page.setViewport({ width: 1280, height: 800 });
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Load session cookies if available
      const session = await getSession(platform);
      if (session && session.cookies) {
        await this.page.setCookie(...session.cookies);
      }
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }

  async delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  async searchMercari(query) {
    try {
      await this.initialize('mercari');
      
      // Navigate to Mercari search page with query
      const searchUrl = `https://www.mercari.com/search/?keyword=${encodeURIComponent(query)}`;
      await this.page.goto(searchUrl, { waitUntil: 'networkidle0' });
      
      // Add a delay to let dynamic content load
      await this.delay(3000);
      
      // Wait for any loading indicators to disappear
      try {
        await this.page.waitForSelector('.loading-indicator', { 
          hidden: true, 
          timeout: 5000 
        });
      } catch (error) {
        // Ignore timeout error if loading indicator is not found
      }
      
      // Try multiple possible selectors for search results
      const selectors = [
        '[data-testid="SearchResults"]',
        '[data-testid="ItemContainer"]',
        '[data-testid="SearchResults"] > div',
        '.search-result-items',
        'div[class*="SearchResults"]',
        'div[class*="ItemGrid"]',
        'div[class*="ProductGrid"]'
      ];
      
      let foundSelector = null;
      for (const selector of selectors) {
        try {
          const elementExists = await this.page.evaluate((sel) => {
            const elements = document.querySelectorAll(sel);
            return elements.length > 0;
          }, selector);
          
          if (elementExists) {
            foundSelector = selector;
            break;
          }
        } catch (error) {
          continue;
        }
      }
      
      if (!foundSelector) {
        // Take a screenshot for debugging
        await this.page.screenshot({ 
          path: 'mercari-search-debug.png',
          fullPage: true 
        });
        throw new Error('Could not find search results on page');
      }
      
      // Extract search results
      const results = await this.page.evaluate((selector) => {
        const items = document.querySelectorAll(`${selector} a[href*="/item/"], ${selector} a[href*="/product/"]`);
        return Array.from(items).map(item => {
          const titleElement = item.querySelector('[data-testid="ItemThumbnail-title"], .item-name, .item-title, [class*="ItemName"], [class*="ProductName"]');
          const priceElement = item.querySelector('[data-testid="ItemThumbnail-price"], .item-price, [class*="ItemPrice"], [class*="ProductPrice"]');
          const conditionElement = item.querySelector('[data-testid="ItemThumbnail-condition"], .item-condition, [class*="ItemCondition"]');
          
          return {
            title: titleElement ? titleElement.textContent.trim() : '',
            price: priceElement ? priceElement.textContent.trim() : '',
            condition: conditionElement ? conditionElement.textContent.trim() : '',
            url: item.href
          };
        }).filter(item => item.title && item.url); // Filter out any empty items
      }, foundSelector);
      
      return results;
    } catch (error) {
      console.error('Error searching Mercari:', error);
      throw error;
    }
  }

  async getMercariItemDetails(url) {
    try {
      await this.initialize('mercari');
      
      // Navigate to item page
      await this.page.goto(url, { waitUntil: 'networkidle0' });
      
      // Wait for main item details to load
      await this.page.waitForSelector('[data-testid="ItemInfo"]', { timeout: 10000 });
      
      // Extract item details
      const details = await this.page.evaluate(() => {
        const getTextContent = selector => {
          const element = document.querySelector(selector);
          return element ? element.textContent.trim() : '';
        };
        
        // Get all image URLs
        const imageElements = document.querySelectorAll('[data-testid="ItemThumbnail-image"]');
        const images = Array.from(imageElements).map(img => img.src).filter(Boolean);
        
        return {
          title: getTextContent('[data-testid="ItemInfo-title"]'),
          price: getTextContent('[data-testid="ItemInfo-price"]'),
          condition: getTextContent('[data-testid="ItemInfo-condition"]'),
          description: getTextContent('[data-testid="ItemInfo-description"]'),
          seller: getTextContent('[data-testid="ItemInfo-seller"]'),
          images: images
        };
      });
      
      return details;
    } catch (error) {
      console.error('Error getting Mercari item details:', error);
      throw error;
    } finally {
      await this.close();
    }
  }

  async searchPoshmark(query) {
    try {
      await this.initialize('poshmark');
      
      // Navigate to Poshmark search page with query
      const searchUrl = `https://poshmark.com/search?q=${encodeURIComponent(query)}`;
      await this.page.goto(searchUrl, { waitUntil: 'networkidle0' });
      
      // Wait for search results to load
      await this.page.waitForSelector('.card', { timeout: 10000 });
      
      // Extract search results
      const results = await this.page.evaluate(() => {
        const items = document.querySelectorAll('.card');
        return Array.from(items).map(item => {
          const titleElement = item.querySelector('.title');
          const priceElement = item.querySelector('.price');
          const brandElement = item.querySelector('.brand');
          const linkElement = item.querySelector('a.tile__coverLink');
          const imageElement = item.querySelector('img.tile__img');
          
          return {
            title: titleElement ? titleElement.textContent.trim() : '',
            price: priceElement ? priceElement.textContent.trim() : '',
            brand: brandElement ? brandElement.textContent.trim() : '',
            url: linkElement ? 'https://poshmark.com' + linkElement.getAttribute('href') : '',
            imageUrl: imageElement ? imageElement.getAttribute('src') : ''
          };
        }).filter(item => item.title && item.url); // Filter out any empty items
      });
      
      return results;
    } catch (error) {
      console.error('Error searching Poshmark:', error);
      throw error;
    }
  }

  async getPoshmarkItemDetails(url) {
    try {
      await this.initialize('poshmark');
      
      // Navigate to item page
      await this.page.goto(url, { waitUntil: 'networkidle0' });
      
      // Wait for main item details to load
      await this.page.waitForSelector('.details', { timeout: 10000 });
      
      // Extract item details
      const details = await this.page.evaluate(() => {
        const getTextContent = selector => {
          const element = document.querySelector(selector);
          return element ? element.textContent.trim() : '';
        };
        
        // Get all image URLs
        const imageElements = document.querySelectorAll('.carousel-item img');
        const images = Array.from(imageElements).map(img => img.src).filter(Boolean);
        
        return {
          title: getTextContent('.title'),
          price: getTextContent('.price'),
          brand: getTextContent('.brand'),
          size: getTextContent('.size'),
          description: getTextContent('.description'),
          seller: getTextContent('.seller'),
          images: images
        };
      });
      
      return details;
    } catch (error) {
      console.error('Error getting Poshmark item details:', error);
      throw error;
    } finally {
      await this.close();
    }
  }
}

module.exports = AuthenticatedScraper;
