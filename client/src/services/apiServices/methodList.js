/**
 * API utilities and shared methods
 * @module apiUtils
 */

// API Response Status Codes
export const API_STATUS = {
  SUCCESS: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  RATE_LIMIT: 429,
  SERVER_ERROR: 500
};

/**
 * Common validation schemas
 */
export const validationSchemas = {
  symbol: {
    required: true,
    type: 'string',
    validate: (value) => /^[A-Z]{1,5}$/.test(value),
    message: 'Symbol must be 1-5 uppercase letters'
  }
};

/**
 * Parameter validation
 * @param {Object} params - Parameters to validate
 * @param {Object} schema - Validation schema
 * @throws {Error} If validation fails
 */
export const validateParams = (params, schema) => {
  const errors = [];
  Object.entries(schema).forEach(([key, rules]) => {
    if (rules.required && !params[key]) {
      errors.push(`${key} is required`);
    }
    if (params[key] && rules.validate && !rules.validate(params[key])) {
      errors.push(rules.message || `Invalid ${key}`);
    }
  });
  if (errors.length) {
    throw new Error(errors.join(', '));
  }
};

/**
 * Response validation
 * @param {Object} response - API response object
 * @param {string} service - Name of the API service
 * @throws {Error} If response is invalid
 */
export const validateAPIResponse = (response, service) => {
  if (!response || !response.data) {
    throw new Error(`Invalid response from ${service}`);
  }
  return response;
};

/**
 * Enhanced error handler for API calls
 * @param {Error} error - The caught error
 * @param {string} service - Name of the API service
 * @param {string} operation - Name of the operation being performed
 * @throws {Error} Standardized error with detailed message
 */
export const handleAPIError = (error, service, operation) => {
  console.error(`${service} API Error (${operation}):`, error);
  if (error.response) {
    switch (error.response.status) {
      case 401:
        throw new Error(`${service} API: Unauthorized - check your API key`);
      case 403:
        throw new Error(`${service} API: Access forbidden`);
      case 429:
        throw new Error(`${service} API: Rate limit exceeded`);
      case 404:
        throw new Error(`${service} API: Resource not found`);
      case 500:
        throw new Error(`${service} API: Internal server error`);
      default:
        throw new Error(`${service} API: ${error.message}`);
    }
  }
  throw error;
};

/**
 * Retry mechanism for failed API calls
 * @param {Function} apiCall - The API call to retry
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} delay - Delay between retries in milliseconds
 * @returns {Promise} Result of the API call
 */
export const retryAPICall = async (apiCall, maxRetries = 3, delay = 1000) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      if (error.response?.status === 429) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};

/**
 * Rate limiting utility
 * @param {Function} fn - Function to rate limit
 * @param {number} limit - Number of calls allowed
 * @param {number} interval - Time interval in ms
 */
export const rateLimit = (axios, { maxRequests, perMilliseconds }) => {
  // ... implementation from rateLimiter.js
};

// Example usage in APIs:
try {
  // API call
} catch (error) {
  handleAPIError(error, 'Service Name', 'operation name');
} 