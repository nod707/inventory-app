const puppeteer = require('puppeteer');
const { saveSession, getSession } = require('./sessionManager');

class AuthenticationManager {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: false,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
          '--disable-blink-features=AutomationControlled',
          '--disable-infobars',
          '--window-size=1920,1080',
          '--start-maximized'
        ]
      });
      
      this.page = await this.browser.newPage();
      
      // Modify navigator properties
      await this.page.evaluateOnNewDocument(() => {
        // Overwrite the 'webdriver' property
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined
        });

        // Overwrite the 'languages' property
        Object.defineProperty(navigator, 'languages', {
          get: () => ['en-US', 'en']
        });

        // Add a fake notification API
        window.Notification = {
          permission: 'default',
          requestPermission: async () => 'default'
        };

        // Add Chrome specific properties
        window.chrome = {
          runtime: {}
        };

        // Override permissions API
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters) => (
          parameters.name === 'notifications' ?
            Promise.resolve({ state: Notification.permission }) :
            originalQuery(parameters)
        );
      });

      // Set a more realistic viewport
      await this.page.setViewport({ 
        width: 1920, 
        height: 1080,
        deviceScaleFactor: 1,
        hasTouch: false,
        isLandscape: true,
        isMobile: false
      });

      // Set a more realistic user agent
      await this.page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        {
          architecture: 'Win64',
          mobile: false,
          model: '',
          platform: 'Windows',
          platformVersion: '10.0'
        }
      );

      // Add common browser headers
      await this.page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
      });
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }

  async loginToMercari(email = process.env.MERCARI_USERNAME, password = process.env.MERCARI_PASSWORD) {
    try {
      await this.initialize();
      
      // Check if we already have a valid session
      const existingSession = await getSession('mercari');
      if (existingSession && existingSession.cookies) {
        // Test if session is still valid
        await this.page.setCookie(...existingSession.cookies);
        await this.page.goto('https://www.mercari.com/mypage/', { 
          waitUntil: 'networkidle0',
          timeout: 30000 
        });
        
        const isLoggedIn = await this.page.evaluate(() => {
          return !document.querySelector('[data-testid="LoginButton"]');
        });
        
        if (isLoggedIn) {
          console.log('Using existing Mercari session');
          return existingSession;
        }
      }

      // Navigate to login page with random delay
      await this.page.goto('https://www.mercari.com/login/', { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      // Random delay between actions (1-3 seconds)
      const randomDelay = () => new Promise(resolve => 
        setTimeout(resolve, 1000 + Math.random() * 2000)
      );

      // Wait for and click email input with human-like delay
      await this.page.waitForSelector('input[type="email"]');
      await randomDelay();
      const emailInput = await this.page.$('input[type="email"]');
      await emailInput.click();
      
      // Type email with random delays between characters
      for (const char of email) {
        await emailInput.type(char, { delay: 50 + Math.random() * 100 });
      }
      
      await randomDelay();
      
      // Click password input and type with delays
      const passwordInput = await this.page.$('input[type="password"]');
      await passwordInput.click();
      for (const char of password) {
        await passwordInput.type(char, { delay: 50 + Math.random() * 100 });
      }
      
      await randomDelay();
      
      // Find and click login button
      const loginButton = await this.page.$('button[type="submit"]');
      await loginButton.hover(); // Hover before clicking
      await randomDelay();
      await loginButton.click();
      
      // Wait for navigation with longer timeout
      await this.page.waitForNavigation({ 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      // Check if login was successful
      const isLoggedIn = await this.page.evaluate(() => {
        return !document.querySelector('[data-testid="LoginButton"]');
      });
      
      if (!isLoggedIn) {
        throw new Error('Login failed - please check credentials');
      }
      
      // Get cookies and save session
      const cookies = await this.page.cookies();
      const session = {
        platform: 'mercari',
        cookies,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      };
      
      await saveSession('mercari', email, session);
      return session;
      
    } catch (error) {
      console.error('Error logging into Mercari:', error);
      throw error;
    }
  }

  async loginToPoshmark(email, password) {
    try {
      await this.initialize();
      
      // Check if we already have a valid session
      const existingSession = await getSession('poshmark');
      if (existingSession && existingSession.cookies) {
        // Test if session is still valid
        await this.page.setCookie(...existingSession.cookies);
        await this.page.goto('https://poshmark.com/feed', { waitUntil: 'networkidle0' });
        
        const isLoggedIn = await this.page.evaluate(() => {
          return !document.querySelector('.login-button');
        });
        
        if (isLoggedIn) {
          console.log('Using existing Poshmark session');
          return existingSession;
        }
      }

      // Navigate to login page
      await this.page.goto('https://poshmark.com/login', { waitUntil: 'networkidle0' });
      
      // Fill in login form
      await this.page.waitForSelector('input[name="login_form[username_email]"]');
      await this.page.type('input[name="login_form[username_email]"]', email);
      await this.page.type('input[name="login_form[password]"]', password);
      
      // Click login button
      await this.page.click('button[type="submit"]');
      
      // Wait for navigation and check if login was successful
      await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
      
      const isLoggedIn = await this.page.evaluate(() => {
        return !document.querySelector('.login-button');
      });
      
      if (!isLoggedIn) {
        throw new Error('Login failed - please check credentials');
      }
      
      // Get cookies and save session
      const cookies = await this.page.cookies();
      const session = {
        platform: 'poshmark',
        cookies,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      };
      
      await saveSession('poshmark', email, session);
      return session;
      
    } catch (error) {
      console.error('Error logging into Poshmark:', error);
      throw error;
    }
  }

  async validateSession(platform) {
    try {
      await this.initialize();
      
      const session = await getSession(platform);
      if (!session || !session.cookies) {
        return false;
      }
      
      await this.page.setCookie(...session.cookies);
      
      if (platform === 'mercari') {
        await this.page.goto('https://www.mercari.com/mypage/', { waitUntil: 'networkidle0' });
        return await this.page.evaluate(() => {
          return !document.querySelector('[data-testid="LoginButton"]');
        });
      } else if (platform === 'poshmark') {
        await this.page.goto('https://poshmark.com/feed', { waitUntil: 'networkidle0' });
        return await this.page.evaluate(() => {
          return !document.querySelector('.login-button');
        });
      }
      
      return false;
    } catch (error) {
      console.error(`Error validating ${platform} session:`, error);
      return false;
    } finally {
      await this.close();
    }
  }
}

module.exports = AuthenticationManager;
