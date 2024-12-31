class MarketplaceError extends Error {
  constructor(platform, type, message, originalError = null) {
    super(message);
    this.name = 'MarketplaceError';
    this.platform = platform;
    this.type = type;
    this.originalError = originalError;
  }
}

class MarketplaceErrorHandler {
  constructor() {
    this.errorTypes = {
      AUTH_ERROR: 'auth_error',
      RATE_LIMIT: 'rate_limit',
      VALIDATION: 'validation',
      API_ERROR: 'api_error',
      NETWORK: 'network',
      UNKNOWN: 'unknown'
    };

    // Platform-specific error codes
    this.errorMappings = {
      ebay: {
        11001: this.errorTypes.AUTH_ERROR,
        11002: this.errorTypes.RATE_LIMIT,
        11003: this.errorTypes.VALIDATION,
      },
      poshmark: {
        'AUTH_001': this.errorTypes.AUTH_ERROR,
        'RATE_001': this.errorTypes.RATE_LIMIT,
        'VAL_001': this.errorTypes.VALIDATION,
      },
      mercari: {
        401: this.errorTypes.AUTH_ERROR,
        429: this.errorTypes.RATE_LIMIT,
        400: this.errorTypes.VALIDATION,
      }
    };
  }

  handleError(platform, error) {
    const errorType = this.determineErrorType(platform, error);
    const message = this.formatErrorMessage(platform, error, errorType);
    
    return new MarketplaceError(platform, errorType, message, error);
  }

  determineErrorType(platform, error) {
    // Handle axios errors
    if (error.isAxiosError) {
      if (!error.response) {
        return this.errorTypes.NETWORK;
      }

      const status = error.response.status;
      const errorCode = this.getErrorCode(platform, error);

      // Check platform-specific error mappings
      if (this.errorMappings[platform]?.[errorCode]) {
        return this.errorMappings[platform][errorCode];
      }

      // Generic status code mapping
      if (status === 401 || status === 403) {
        return this.errorTypes.AUTH_ERROR;
      }
      if (status === 429) {
        return this.errorTypes.RATE_LIMIT;
      }
      if (status === 400) {
        return this.errorTypes.VALIDATION;
      }
      if (status >= 500) {
        return this.errorTypes.API_ERROR;
      }
    }

    return this.errorTypes.UNKNOWN;
  }

  getErrorCode(platform, error) {
    switch (platform) {
      case 'ebay':
        return error.response?.data?.errorId;
      case 'poshmark':
        return error.response?.data?.error?.code;
      case 'mercari':
        return error.response?.status;
      default:
        return null;
    }
  }

  formatErrorMessage(platform, error, errorType) {
    let baseMessage = `${platform.toUpperCase()} Error: `;

    switch (errorType) {
      case this.errorTypes.AUTH_ERROR:
        return `${baseMessage}Authentication failed. Please reconnect your account.`;
      
      case this.errorTypes.RATE_LIMIT:
        return `${baseMessage}Rate limit exceeded. Please try again later.`;
      
      case this.errorTypes.VALIDATION:
        const details = this.getValidationDetails(platform, error);
        return `${baseMessage}Invalid request: ${details}`;
      
      case this.errorTypes.API_ERROR:
        return `${baseMessage}Service temporarily unavailable. Please try again later.`;
      
      case this.errorTypes.NETWORK:
        return `${baseMessage}Network error. Please check your internet connection.`;
      
      default:
        return `${baseMessage}An unexpected error occurred.`;
    }
  }

  getValidationDetails(platform, error) {
    switch (platform) {
      case 'ebay':
        return error.response?.data?.errors?.[0]?.message || 'Invalid request parameters';
      
      case 'poshmark':
        return error.response?.data?.error?.message || 'Invalid request parameters';
      
      case 'mercari':
        return error.response?.data?.message || 'Invalid request parameters';
      
      default:
        return 'Invalid request parameters';
    }
  }

  isRetryable(error) {
    return [
      this.errorTypes.NETWORK,
      this.errorTypes.API_ERROR,
      this.errorTypes.RATE_LIMIT
    ].includes(error.type);
  }

  getRetryDelay(error) {
    if (error.type === this.errorTypes.RATE_LIMIT) {
      return 60000; // 1 minute for rate limit errors
    }
    if (error.type === this.errorTypes.NETWORK) {
      return 5000; // 5 seconds for network errors
    }
    return 15000; // 15 seconds for other retryable errors
  }
}

module.exports = {
  MarketplaceError,
  MarketplaceErrorHandler: new MarketplaceErrorHandler()
};
