const axios = require('axios');
const axiosRetry = require('axios-retry');
const http = require('http');
const https = require('https');

const createApiClient = (baseURL, options = {}) => {
  const client = axios.create({
    baseURL,
    timeout: options.timeout || 3000,
    httpAgent: new http.Agent({ 
      keepAlive: true, 
      maxSockets: 3,        // Limit concurrent connections
      maxFreeSockets: 1
    }),
    httpsAgent: new https.Agent({ 
      keepAlive: true, 
      maxSockets: 3,
      maxFreeSockets: 1
    })
  });

  axiosRetry(client, {
    retries: options.retries || 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
      return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
             error.response?.status === 429;
    },
    onRetry: (retryCount, error, requestConfig) => {
      console.warn(`Retry attempt ${retryCount} for ${requestConfig.url}`);
    }
  });

  return client;
};

module.exports = createApiClient; 