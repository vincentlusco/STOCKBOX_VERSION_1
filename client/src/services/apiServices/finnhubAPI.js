import axios from 'axios';
import apiKeys from '../../config/apiKeys';
import { 
  handleAPIError, 
  validateAPIResponse, 
  retryAPICall, 
  validateParams, 
  validationSchemas 
} from './methodList';
import { rateLimit } from '../../utils/rateLimiter';

// Initialize constants first
const BASE_URL = 'https://finnhub.io/api/v1';
const rateLimitedAxios = rateLimit(axios, { maxRequests: 30, perMilliseconds: 1000 });

// Define all validation schemas first
const finnhubSchemas = {
  quoteParams: {
    symbol: validationSchemas.symbol
  },
  candleParams: {
    symbol: validationSchemas.symbol,
    resolution: {
      required: true,
      type: 'string',
      validate: (value) => ['1', '5', '15', '30', '60', 'D', 'W', 'M'].includes(value),
      message: 'Invalid resolution value'
    },
    from: {
      required: true,
      type: 'number',
      validate: (value) => value > 0,
      message: 'From timestamp must be positive'
    },
    to: {
      required: true,
      type: 'number',
      validate: (value) => value > 0,
      message: 'To timestamp must be positive'
    }
  }
  // ... rest of your schemas
};

// Then define the API methods
const finnhubAPI = {
  getQuote: async (symbol) => {
    try {
      validateParams({ symbol }, finnhubSchemas.quoteParams);

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: `${BASE_URL}/quote`,
          method: 'GET',
          params: {
            symbol,
            token: apiKeys.finnhub
          }
        })
      );

      return validateAPIResponse(response, 'Finnhub').data;
    } catch (error) {
      handleAPIError(error, 'Finnhub', 'fetch quote');
    }
  },
  // ... keep all your other methods, just update them to use rateLimitedAxios.request
  getCandles: async (symbol, resolution, from, to) => {
    try {
      validateParams(
        { symbol, resolution, from, to },
        finnhubSchemas.candleParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: `${BASE_URL}/stock/candle`,
          method: 'GET',
          params: {
            symbol,
            resolution,
            from,
            to,
            token: apiKeys.finnhub
          }
        })
      );

      return validateAPIResponse(response, 'Finnhub').data;
    } catch (error) {
      handleAPIError(error, 'Finnhub', 'fetch candles');
    }
  }
  // ... keep all other methods
};

export default finnhubAPI; 