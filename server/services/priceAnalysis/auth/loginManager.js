const puppeteer = require('puppeteer');
const { saveSession } = require('./sessionManager');

class LoginManager {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--window-size=1280,800',
        '--start-maximized'
      ]
    });
    
    this.page = await this.browser.newPage();
    
    // Set a proper viewport
    await this.page.setViewport({ width: 1280, height: 800 });
    
    // Set user agent
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Set extra headers
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive'
    });

    // Enable console logging
    this.page.on('console', msg => console.log('Browser console:', msg.text()));
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

  async loginToPoshmark(username, password) {
    try {
      await this.initialize();
      
      // Navigate to login page
      await this.page.goto('https://poshmark.com/login', { waitUntil: 'networkidle0' });
      
      // Wait for the page to be fully loaded
      await this.delay(3000);
      
      console.log('Looking for login form...');
      
      // Try different selectors for email input
      const emailSelectors = ['input[name="login_form[username_email]"]', 'input[type="email"]', '#email', 'input[name="email"]'];
      let emailInput = null;
      
      for (const selector of emailSelectors) {
        try {
          emailInput = await this.page.waitForSelector(selector, { visible: true, timeout: 5000 });
          if (emailInput) {
            console.log('Found email input with selector:', selector);
            break;
          }
        } catch (e) {
          console.log('Selector not found:', selector);
        }
      }
      
      if (!emailInput) {
        throw new Error('Could not find email input field');
      }
      
      // Enter email
      console.log('Entering email...');
      await emailInput.type(username, { delay: 100 });
      await this.delay(1000);
      
      // Try different selectors for password input
      const passwordSelectors = ['input[name="login_form[password]"]', 'input[type="password"]', '#password', 'input[name="password"]'];
      let passwordInput = null;
      
      for (const selector of passwordSelectors) {
        try {
          passwordInput = await this.page.waitForSelector(selector, { visible: true, timeout: 5000 });
          if (passwordInput) {
            console.log('Found password input with selector:', selector);
            break;
          }
        } catch (e) {
          console.log('Selector not found:', selector);
        }
      }
      
      if (!passwordInput) {
        throw new Error('Could not find password input field');
      }
      
      // Enter password
      console.log('Entering password...');
      await passwordInput.type(password, { delay: 100 });
      await this.delay(1000);
      
      // Try different selectors for submit button
      const submitSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        'button:contains("Log in")',
        'button:contains("Sign in")'
      ];
      
      let submitButton = null;
      
      for (const selector of submitSelectors) {
        try {
          submitButton = await this.page.waitForSelector(selector, { visible: true, timeout: 5000 });
          if (submitButton) {
            console.log('Found submit button with selector:', selector);
            break;
          }
        } catch (e) {
          console.log('Selector not found:', selector);
        }
      }
      
      if (!submitButton) {
        throw new Error('Could not find submit button');
      }
      
      // Take a screenshot before clicking submit
      await this.page.screenshot({
        path: 'poshmark-before-submit.png',
        fullPage: true
      });
      
      // Click submit button
      console.log('Clicking submit button...');
      await submitButton.click();
      
      // Wait for navigation with longer timeout
      console.log('Waiting for login to complete...');
      try {
        await Promise.race([
          this.page.waitForNavigation({ 
            waitUntil: 'networkidle0',
            timeout: 60000 
          }),
          this.page.waitForSelector('.user-menu-button', { 
            visible: true,
            timeout: 60000 
          })
        ]);
      } catch (error) {
        console.log('Navigation timeout, checking if login was successful...');
        
        // Take a screenshot after login attempt
        await this.page.screenshot({
          path: 'poshmark-after-login.png',
          fullPage: true
        });
        
        // Log the current URL
        console.log('Current URL after login attempt:', await this.page.url());
        
        // Check if we're logged in despite the timeout
        const isLoggedIn = await this.page.evaluate(() => {
          // Try multiple ways to detect if we're logged in
          const userMenu = document.querySelector('.user-menu-button');
          const profileLink = document.querySelector('a[href*="/profile"]');
          const sellButton = document.querySelector('button[data-testid="SellButton"]');
          
          return userMenu !== null || profileLink !== null || sellButton !== null;
        });
        
        if (!isLoggedIn) {
          throw new Error('Login failed - could not detect successful login');
        }
      }
      
      // Additional delay to ensure everything is loaded
      await this.delay(3000);
      
      // Get cookies
      const cookies = await this.page.cookies();
      
      // Save session
      await saveSession('poshmark', username, {
        cookies,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });

      console.log('Login successful!');
      return true;
    } catch (error) {
      console.error('Poshmark login error:', error);
      
      // Take a screenshot if there's an error
      try {
        await this.page.screenshot({
          path: 'poshmark-login-error.png',
          fullPage: true
        });
        console.log('Error screenshot saved as poshmark-login-error.png');
      } catch (screenshotError) {
        console.error('Failed to save error screenshot:', screenshotError);
      }
      
      throw error;
    } finally {
      await this.close();
    }
  }

  async loginToMercari(username, password) {
    try {
      await this.initialize();
      
      console.log('Navigating to Mercari login page...');
      await this.page.goto('https://www.mercari.com/login/', {
        waitUntil: 'networkidle0',
        timeout: 60000
      });
      
      // Wait for the page to be fully loaded
      await this.delay(3000);
      
      // Log the current URL
      console.log('Current URL:', await this.page.url());
      
      // Take a screenshot to see what we're dealing with
      await this.page.screenshot({
        path: 'mercari-initial-page.png',
        fullPage: true
      });
      
      console.log('Looking for login form...');
      
      // Try different selectors for email input
      const emailSelectors = ['input[type="email"]', '#email', 'input[name="email"]', 'input[data-testid="EmailInput"]'];
      let emailInput = null;
      
      for (const selector of emailSelectors) {
        try {
          emailInput = await this.page.waitForSelector(selector, { visible: true, timeout: 5000 });
          if (emailInput) {
            console.log('Found email input with selector:', selector);
            break;
          }
        } catch (e) {
          console.log('Selector not found:', selector);
        }
      }
      
      if (!emailInput) {
        throw new Error('Could not find email input field');
      }
      
      // Enter email
      console.log('Entering email...');
      await emailInput.type(username, { delay: 100 });
      await this.delay(1000);
      
      // Try different selectors for password input
      const passwordSelectors = ['input[type="password"]', '#password', 'input[name="password"]', 'input[data-testid="PasswordInput"]'];
      let passwordInput = null;
      
      for (const selector of passwordSelectors) {
        try {
          passwordInput = await this.page.waitForSelector(selector, { visible: true, timeout: 5000 });
          if (passwordInput) {
            console.log('Found password input with selector:', selector);
            break;
          }
        } catch (e) {
          console.log('Selector not found:', selector);
        }
      }
      
      if (!passwordInput) {
        throw new Error('Could not find password input field');
      }
      
      // Enter password
      console.log('Entering password...');
      await passwordInput.type(password, { delay: 100 });
      await this.delay(1000);
      
      // Try different selectors for submit button
      const submitSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        'button[data-testid="SignInButton"]',
        'button:contains("Sign in")',
        'button:contains("Log in")'
      ];
      
      let submitButton = null;
      
      for (const selector of submitSelectors) {
        try {
          submitButton = await this.page.waitForSelector(selector, { visible: true, timeout: 5000 });
          if (submitButton) {
            console.log('Found submit button with selector:', selector);
            break;
          }
        } catch (e) {
          console.log('Selector not found:', selector);
        }
      }
      
      if (!submitButton) {
        throw new Error('Could not find submit button');
      }
      
      // Take a screenshot before clicking submit
      await this.page.screenshot({
        path: 'mercari-before-submit.png',
        fullPage: true
      });
      
      // Click submit button
      console.log('Clicking submit button...');
      await submitButton.click();
      
      // Wait for navigation with longer timeout
      console.log('Waiting for login to complete...');
      try {
        await Promise.race([
          this.page.waitForNavigation({ 
            waitUntil: 'networkidle0',
            timeout: 60000 
          }),
          this.page.waitForSelector('button[data-testid="UserMenu"]', { 
            visible: true,
            timeout: 60000 
          })
        ]);
      } catch (error) {
        console.log('Navigation timeout, checking if login was successful...');
        
        // Take a screenshot after login attempt
        await this.page.screenshot({
          path: 'mercari-after-login.png',
          fullPage: true
        });
        
        // Log the current URL
        console.log('Current URL after login attempt:', await this.page.url());
        
        // Check if we're logged in despite the timeout
        const isLoggedIn = await this.page.evaluate(() => {
          // Try multiple ways to detect if we're logged in
          const userMenu = document.querySelector('button[data-testid="UserMenu"]');
          const profileLink = document.querySelector('a[href*="/user/profile"]');
          const sellButton = document.querySelector('button[data-testid="SellButton"]');
          
          return userMenu !== null || profileLink !== null || sellButton !== null;
        });
        
        if (!isLoggedIn) {
          throw new Error('Login failed - could not detect successful login');
        }
      }
      
      // Additional delay to ensure everything is loaded
      await this.delay(3000);
      
      // Get cookies
      const cookies = await this.page.cookies();
      
      // Save session
      await saveSession('mercari', username, {
        cookies,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });

      console.log('Login successful!');
      return true;
    } catch (error) {
      console.error('Mercari login error:', error);
      
      // Take a screenshot if there's an error
      try {
        await this.page.screenshot({
          path: 'mercari-login-error.png',
          fullPage: true
        });
        console.log('Error screenshot saved as mercari-login-error.png');
      } catch (screenshotError) {
        console.error('Failed to save error screenshot:', screenshotError);
      }
      
      throw error;
    } finally {
      await this.close();
    }
  }

  async loginToTheRealReal(username, password) {
    try {
      await this.initialize();
      
      // Navigate to login page
      await this.page.goto('https://www.therealreal.com/login', { waitUntil: 'networkidle0' });
      
      // Wait for the page to be fully loaded
      await this.delay(3000);
      
      console.log('Looking for login form...');
      
      // Try different selectors for email input
      const emailSelectors = ['input[type="email"]', '#email', 'input[name="email"]'];
      let emailInput = null;
      
      for (const selector of emailSelectors) {
        try {
          emailInput = await this.page.waitForSelector(selector, { visible: true, timeout: 5000 });
          if (emailInput) {
            console.log('Found email input with selector:', selector);
            break;
          }
        } catch (e) {
          console.log('Selector not found:', selector);
        }
      }
      
      if (!emailInput) {
        throw new Error('Could not find email input field');
      }
      
      // Enter email
      console.log('Entering email...');
      await emailInput.type(username, { delay: 100 });
      await this.delay(1000);
      
      // Try different selectors for password input
      const passwordSelectors = ['input[type="password"]', '#password', 'input[name="password"]'];
      let passwordInput = null;
      
      for (const selector of passwordSelectors) {
        try {
          passwordInput = await this.page.waitForSelector(selector, { visible: true, timeout: 5000 });
          if (passwordInput) {
            console.log('Found password input with selector:', selector);
            break;
          }
        } catch (e) {
          console.log('Selector not found:', selector);
        }
      }
      
      if (!passwordInput) {
        throw new Error('Could not find password input field');
      }
      
      // Enter password
      console.log('Entering password...');
      await passwordInput.type(password, { delay: 100 });
      await this.delay(1000);
      
      // Try different selectors for submit button
      const submitSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        'button:contains("Log in")',
        'button:contains("Sign in")'
      ];
      
      let submitButton = null;
      
      for (const selector of submitSelectors) {
        try {
          submitButton = await this.page.waitForSelector(selector, { visible: true, timeout: 5000 });
          if (submitButton) {
            console.log('Found submit button with selector:', selector);
            break;
          }
        } catch (e) {
          console.log('Selector not found:', selector);
        }
      }
      
      if (!submitButton) {
        throw new Error('Could not find submit button');
      }
      
      // Take a screenshot before clicking submit
      await this.page.screenshot({
        path: 'therealreal-before-submit.png',
        fullPage: true
      });
      
      // Click submit button
      console.log('Clicking submit button...');
      await submitButton.click();
      
      // Wait for navigation with longer timeout
      console.log('Waiting for login to complete...');
      try {
        await Promise.race([
          this.page.waitForNavigation({ 
            waitUntil: 'networkidle0',
            timeout: 60000 
          }),
          this.page.waitForSelector('.user-menu-button', { 
            visible: true,
            timeout: 60000 
          })
        ]);
      } catch (error) {
        console.log('Navigation timeout, checking if login was successful...');
        
        // Take a screenshot after login attempt
        await this.page.screenshot({
          path: 'therealreal-after-login.png',
          fullPage: true
        });
        
        // Log the current URL
        console.log('Current URL after login attempt:', await this.page.url());
        
        // Check if we're logged in despite the timeout
        const isLoggedIn = await this.page.evaluate(() => {
          // Try multiple ways to detect if we're logged in
          const userMenu = document.querySelector('.user-menu-button');
          const profileLink = document.querySelector('a[href*="/profile"]');
          const sellButton = document.querySelector('button[data-testid="SellButton"]');
          
          return userMenu !== null || profileLink !== null || sellButton !== null;
        });
        
        if (!isLoggedIn) {
          throw new Error('Login failed - could not detect successful login');
        }
      }
      
      // Additional delay to ensure everything is loaded
      await this.delay(3000);
      
      // Get cookies
      const cookies = await this.page.cookies();
      
      // Save session
      await saveSession('therealreal', username, {
        cookies,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });

      console.log('Login successful!');
      return true;
    } catch (error) {
      console.error('TheRealReal login error:', error);
      
      // Take a screenshot if there's an error
      try {
        await this.page.screenshot({
          path: 'therealreal-login-error.png',
          fullPage: true
        });
        console.log('Error screenshot saved as therealreal-login-error.png');
      } catch (screenshotError) {
        console.error('Failed to save error screenshot:', screenshotError);
      }
      
      throw error;
    } finally {
      await this.close();
    }
  }
}

module.exports = new LoginManager();
