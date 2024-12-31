const axios = require('axios');
const crypto = require('crypto');

class OAuthManager {
  constructor() {
    this.stateMap = new Map(); // Store state parameters for OAuth flow
    this.tokenCache = new Map(); // Cache for access tokens
  }

  generateState() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generate OAuth URL for platform
  getAuthorizationUrl(platform, redirectUri) {
    const state = this.generateState();
    
    switch (platform) {
      case 'ebay':
        const ebayScopes = [
          'https://api.ebay.com/oauth/api_scope',
          'https://api.ebay.com/oauth/api_scope/sell.inventory',
          'https://api.ebay.com/oauth/api_scope/sell.marketing',
          'https://api.ebay.com/oauth/api_scope/sell.account'
        ];
        
        const ebayUrl = new URL('https://auth.ebay.com/oauth2/authorize');
        ebayUrl.searchParams.append('client_id', process.env.EBAY_CLIENT_ID);
        ebayUrl.searchParams.append('response_type', 'code');
        ebayUrl.searchParams.append('redirect_uri', redirectUri);
        ebayUrl.searchParams.append('scope', ebayScopes.join(' '));
        ebayUrl.searchParams.append('state', state);
        
        this.stateMap.set(state, { platform: 'ebay', timestamp: Date.now() });
        return ebayUrl.toString();

      case 'poshmark':
        const poshmarkUrl = new URL('https://poshmark.com/oauth/authorize');
        poshmarkUrl.searchParams.append('client_id', process.env.POSHMARK_CLIENT_ID);
        poshmarkUrl.searchParams.append('response_type', 'code');
        poshmarkUrl.searchParams.append('redirect_uri', redirectUri);
        poshmarkUrl.searchParams.append('state', state);
        
        this.stateMap.set(state, { platform: 'poshmark', timestamp: Date.now() });
        return poshmarkUrl.toString();

      default:
        throw new Error(`Unsupported platform for OAuth: ${platform}`);
    }
  }

  // Handle OAuth callback
  async handleCallback(platform, code, state) {
    const storedState = this.stateMap.get(state);
    if (!storedState || storedState.platform !== platform) {
      throw new Error('Invalid state parameter');
    }

    // Clear stored state
    this.stateMap.delete(state);

    switch (platform) {
      case 'ebay':
        return this.handleEbayCallback(code);
      case 'poshmark':
        return this.handlePoshmarkCallback(code);
      default:
        throw new Error(`Unsupported platform for OAuth callback: ${platform}`);
    }
  }

  async handleEbayCallback(code) {
    try {
      const response = await axios.post('https://api.ebay.com/identity/v1/oauth2/token', 
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: process.env.EBAY_REDIRECT_URI
        }), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(
              `${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`
            ).toString('base64')}`
          }
        }
      );

      const tokenData = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresAt: Date.now() + (response.data.expires_in * 1000)
      };

      this.tokenCache.set('ebay', tokenData);
      return tokenData;
    } catch (error) {
      console.error('eBay OAuth callback error:', error);
      throw new Error('Failed to complete eBay authentication');
    }
  }

  async handlePoshmarkCallback(code) {
    try {
      const response = await axios.post('https://api.poshmark.com/oauth/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: process.env.POSHMARK_REDIRECT_URI,
          client_id: process.env.POSHMARK_CLIENT_ID,
          client_secret: process.env.POSHMARK_CLIENT_SECRET
        }), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const tokenData = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresAt: Date.now() + (response.data.expires_in * 1000)
      };

      this.tokenCache.set('poshmark', tokenData);
      return tokenData;
    } catch (error) {
      console.error('Poshmark OAuth callback error:', error);
      throw new Error('Failed to complete Poshmark authentication');
    }
  }

  async refreshToken(platform) {
    const tokenData = this.tokenCache.get(platform);
    if (!tokenData || !tokenData.refreshToken) {
      throw new Error(`No refresh token available for ${platform}`);
    }

    try {
      switch (platform) {
        case 'ebay':
          return this.refreshEbayToken(tokenData.refreshToken);
        case 'poshmark':
          return this.refreshPoshmarkToken(tokenData.refreshToken);
        default:
          throw new Error(`Unsupported platform for token refresh: ${platform}`);
      }
    } catch (error) {
      console.error(`Failed to refresh token for ${platform}:`, error);
      throw error;
    }
  }

  async refreshEbayToken(refreshToken) {
    const response = await axios.post('https://api.ebay.com/identity/v1/oauth2/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(
            `${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`
          ).toString('base64')}`
        }
      }
    );

    const tokenData = {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresAt: Date.now() + (response.data.expires_in * 1000)
    };

    this.tokenCache.set('ebay', tokenData);
    return tokenData;
  }

  async refreshPoshmarkToken(refreshToken) {
    const response = await axios.post('https://api.poshmark.com/oauth/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: process.env.POSHMARK_CLIENT_ID,
        client_secret: process.env.POSHMARK_CLIENT_SECRET
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const tokenData = {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      expiresAt: Date.now() + (response.data.expires_in * 1000)
    };

    this.tokenCache.set('poshmark', tokenData);
    return tokenData;
  }

  // Get valid access token (refresh if needed)
  async getAccessToken(platform) {
    const tokenData = this.tokenCache.get(platform);
    
    if (!tokenData) {
      throw new Error(`No token data available for ${platform}`);
    }

    // Check if token is expired or about to expire (within 5 minutes)
    if (Date.now() + 300000 > tokenData.expiresAt) {
      return (await this.refreshToken(platform)).accessToken;
    }

    return tokenData.accessToken;
  }
}

module.exports = new OAuthManager();
