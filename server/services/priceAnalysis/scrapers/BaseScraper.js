const puppeteer = require('puppeteer');

class BaseScraper {
  constructor(platform) {
    this.platform = platform;
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu'
      ]
    });
    this.page = await this.browser.newPage();
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await this.page.setViewport({ width: 1920, height: 1080 });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async randomDelay() {
    const time = Math.floor(Math.random() * 2000) + 1000; // 1-3 seconds
    await new Promise(resolve => setTimeout(resolve, time));
  }

  extractPrice(priceText) {
    const match = priceText.match(/[\d,.]+/);
    return match ? parseFloat(match[0].replace(/,/g, '')) : null;
  }

  async scrollToBottom() {
    await this.page.evaluate(async () => {
      await new Promise(resolve => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
  }

  async autoScroll() {
    await this.page.evaluate(async () => {
      await new Promise((resolve) => {
        var totalHeight = 0;
        var distance = 100;
        var timer = setInterval(() => {
          var scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if(totalHeight >= scrollHeight - window.innerHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
  }

  // To be implemented by platform-specific scrapers
  async searchListings(query, imageUrl) {
    throw new Error('searchListings must be implemented');
  }
}

module.exports = BaseScraper;
