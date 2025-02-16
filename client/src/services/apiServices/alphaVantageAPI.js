import axios from 'axios';
import apiKeys from '../../config/apiKeys';
import { 
  handleAPIError, 
  validateAPIResponse, 
  retryAPICall, 
  validateParams, 
  validationSchemas,
  rateLimit
} from './methodList';
import { rateLimit as rateLimitUtil } from '../../utils/rateLimiter';

const BASE_URL = 'https://www.alphavantage.co/query';

/**
 * Alpha Vantage API service for financial market data
 * @module alphaVantageAPI
 */

// Rate limit to 5 calls per minute as per Alpha Vantage free tier
const rateLimitedAxios = rateLimitUtil(axios, { maxRequests: 5, perMilliseconds: 60000 });

/**
 * Validation schemas specific to Alpha Vantage API
 */
const alphaVantageSchemas = {
  timeSeriesParams: {
    symbol: validationSchemas.symbol,
    interval: {
      required: true,
      type: 'string',
      validate: (value) => ['1min', '5min', '15min', '30min', '60min', 'daily', 'weekly', 'monthly'].includes(value),
      message: 'Invalid interval value'
    }
  },
  
  fundamentalsParams: {
    symbol: validationSchemas.symbol,
    function: {
      required: true,
      type: 'string',
      validate: (value) => [
        'OVERVIEW',
        'INCOME_STATEMENT',
        'BALANCE_SHEET',
        'CASH_FLOW',
        'EARNINGS'
      ].includes(value),
      message: 'Invalid function type'
    }
  },
  
  technicalParams: {
    symbol: validationSchemas.symbol,
    interval: {
      required: true,
      type: 'string',
      validate: (value) => ['1min', '5min', '15min', '30min', '60min', 'daily', 'weekly', 'monthly'].includes(value),
      message: 'Invalid interval value'
    },
    series_type: {
      required: true,
      type: 'string',
      validate: (value) => ['close', 'open', 'high', 'low'].includes(value),
      message: 'Invalid series type'
    },
    timePeriod: {
      required: false,
      type: 'number',
      validate: (value) => !value || (value > 0 && value <= 200),
      message: 'Time period must be between 1 and 200'
    }
  },
  
  optionsParams: {
    symbol: validationSchemas.symbol,
    expiration: {
      required: false,
      type: 'string',
      validate: (value) => !value || !isNaN(Date.parse(value)),
      message: 'Invalid expiration date'
    },
    strike: {
      required: false,
      type: 'number',
      validate: (value) => !value || value > 0,
      message: 'Strike price must be positive'
    }
  },
  
  futuresParams: {
    symbol: validationSchemas.symbol,
    market: {
      required: false,
      type: 'string',
      validate: (value) => !value || ['CME', 'NYMEX', 'CBOT', 'ICE'].includes(value),
      message: 'Invalid futures market'
    }
  },
  
  commodityParams: {
    symbol: validationSchemas.symbol,
    market: {
      required: false,
      type: 'string',
      validate: (value) => !value || ['METALS', 'ENERGY', 'AGRICULTURE'].includes(value),
      message: 'Invalid commodity market'
    }
  },
  
  momentumParams: {
    symbol: validationSchemas.symbol,
    interval: {
      required: true,
      type: 'string',
      validate: (value) => ['1min', '5min', '15min', '30min', '60min', 'daily', 'weekly', 'monthly'].includes(value),
      message: 'Invalid interval value'
    },
    timePeriod: {
      required: false,
      type: 'number',
      validate: (value) => !value || (value > 0 && value <= 200),
      message: 'Time period must be between 1 and 200'
    }
  },
  
  volumeParams: {
    symbol: validationSchemas.symbol,
    interval: {
      required: true,
      type: 'string',
      validate: (value) => ['1min', '5min', '15min', '30min', '60min', 'daily'].includes(value),
      message: 'Invalid interval value'
    }
  },
  
  volatilityParams: {
    symbol: validationSchemas.symbol,
    interval: {
      required: true,
      type: 'string',
      validate: (value) => ['1min', '5min', '15min', '30min', '60min', 'daily'].includes(value),
      message: 'Invalid interval value'
    },
    timePeriod: {
      required: false,
      type: 'number',
      validate: (value) => !value || (value > 0 && value <= 200),
      message: 'Time period must be between 1 and 200'
    }
  },
  
  forexRateParams: {
    fromCurrency: {
      required: true,
      type: 'string',
      validate: (value) => /^[A-Z]{3}$/.test(value),
      message: 'Invalid from currency code format'
    },
    toCurrency: {
      required: true,
      type: 'string',
      validate: (value) => /^[A-Z]{3}$/.test(value),
      message: 'Invalid to currency code format'
    }
  },
  
  cryptoParams: {
    symbol: validationSchemas.symbol,
    market: {
      required: true,
      type: 'string',
      validate: (value) => value.length > 0,
      message: 'Market is required'
    }
  },
  
  cycleParams: {
    symbol: validationSchemas.symbol,
    interval: {
      required: true,
      type: 'string',
      validate: (value) => ['1min', '5min', '15min', '30min', '60min', 'daily'].includes(value),
      message: 'Invalid interval value'
    },
    series_type: {
      required: true,
      type: 'string',
      validate: (value) => ['close', 'open', 'high', 'low'].includes(value),
      message: 'Invalid series type'
    }
  },
  
  patternParams: {
    symbol: validationSchemas.symbol,
    interval: {
      required: true,
      type: 'string',
      validate: (value) => ['1min', '5min', '15min', '30min', '60min', 'daily'].includes(value),
      message: 'Invalid interval value'
    }
  },
  
  statisticalParams: {
    symbol: validationSchemas.symbol,
    interval: {
      required: true,
      type: 'string',
      validate: (value) => ['1min', '5min', '15min', '30min', '60min', 'daily'].includes(value),
      message: 'Invalid interval value'
    },
    timePeriod: {
      required: false,
      type: 'number',
      validate: (value) => !value || (value > 0 && value <= 200),
      message: 'Time period must be between 1 and 200'
    },
    seriesType: {
      required: true,
      type: 'string',
      validate: (value) => ['close', 'open', 'high', 'low'].includes(value),
      message: 'Invalid series type'
    }
  },

  indexParams: {
    symbol: validationSchemas.symbol,
    type: {
      required: false,
      type: 'string',
      validate: (value) => !value || ['market', 'sector', 'custom'].includes(value),
      message: 'Invalid index type'
    }
  },

  fixedIncomeParams: {
    maturity: {
      required: false,
      type: 'string',
      validate: (value) => !value || ['3month', '2year', '5year', '10year', '30year'].includes(value),
      message: 'Invalid maturity period'
    }
  },

  reitParams: {
    symbol: validationSchemas.symbol,
    sector: {
      required: false,
      type: 'string',
      validate: (value) => !value || ['residential', 'commercial', 'industrial', 'healthcare', 'office', 'retail'].includes(value),
      message: 'Invalid REIT sector'
    }
  },

  adrParams: {
    symbol: validationSchemas.symbol,
    region: {
      required: false,
      type: 'string',
      validate: (value) => !value || ['asia', 'europe', 'latinAmerica'].includes(value),
      message: 'Invalid ADR region'
    }
  },

  preferredStockParams: {
    symbol: validationSchemas.symbol,
    type: {
      required: false,
      type: 'string',
      validate: (value) => !value || ['cumulative', 'non-cumulative', 'convertible'].includes(value),
      message: 'Invalid preferred stock type'
    }
  }
};

const alphaVantageAPI = {
  /**
   * Fetches intraday time series data for a given symbol
   * @async
   * @param {string} symbol - Stock symbol
   * @param {string} interval - Time interval between data points
   * @returns {Promise<Object>} Time series data
   * @throws {Error} If validation fails or API call fails
   */
  getIntraday: async (symbol, interval = '5min') => {
    try {
      validateParams({ symbol, interval }, alphaVantageSchemas.timeSeriesParams);

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'TIME_SERIES_INTRADAY',
            symbol,
            interval,
            apikey: apiKeys.alphaVantage,
            outputsize: 'full'
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch intraday data');
    }
  },

  /**
   * Fetches daily time series data for a given symbol
   * @async
   * @param {string} symbol - Stock symbol
   * @param {boolean} adjusted - Whether to return adjusted data
   * @returns {Promise<Object>} Daily time series data
   * @throws {Error} If validation fails or API call fails
   */
  getDaily: async (symbol, adjusted = true) => {
    try {
      validateParams({ symbol }, { symbol: validationSchemas.symbol });

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: adjusted ? 'TIME_SERIES_DAILY_ADJUSTED' : 'TIME_SERIES_DAILY',
            symbol,
            apikey: apiKeys.alphaVantage,
            outputsize: 'full'
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch daily data');
    }
  },

  /**
   * Fetches weekly time series data for a given symbol
   * @async
   * @param {string} symbol - Stock symbol
   * @returns {Promise<Object>} Weekly time series data
   * @throws {Error} If validation fails or API call fails
   */
  getWeekly: async (symbol) => {
    try {
      validateParams({ symbol }, { symbol: validationSchemas.symbol });

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'TIME_SERIES_WEEKLY',
            symbol,
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch weekly data');
    }
  },

  /**
   * Fetches monthly time series data for a given symbol
   * @async
   * @param {string} symbol - Stock symbol
   * @returns {Promise<Object>} Monthly time series data
   * @throws {Error} If validation fails or API call fails
   */
  getMonthly: async (symbol) => {
    try {
      validateParams({ symbol }, { symbol: validationSchemas.symbol });

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'TIME_SERIES_MONTHLY',
            symbol,
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch monthly data');
    }
  },

  // TECHNICAL INDICATORS
  getSMA: async (symbol, interval = 'daily', timePeriod = 20, seriesType = 'close') => {
    try {
      validateParams(
        { symbol, interval, series_type: seriesType },
        alphaVantageSchemas.technicalParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'SMA',
            symbol,
            interval,
            time_period: timePeriod,
            series_type: seriesType,
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch SMA data');
    }
  },

  getEMA: async (symbol, interval = 'daily', timePeriod = 20, seriesType = 'close') => {
    try {
      validateParams(
        { symbol, interval, series_type: seriesType },
        alphaVantageSchemas.technicalParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'EMA',
            symbol,
            interval,
            time_period: timePeriod,
            series_type: seriesType,
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch EMA data');
    }
  },

  /**
   * Fetches Moving Average Convergence/Divergence (MACD) data
   * @async
   * @param {string} symbol - Stock symbol
   * @param {string} interval - Time interval between data points
   * @param {string} seriesType - Type of price series to use
   * @returns {Promise<Object>} MACD indicator data
   * @throws {Error} If validation fails or API call fails
   */
  getMACD: async (symbol, interval = 'daily', seriesType = 'close') => {
    try {
      validateParams(
        { symbol, interval, series_type: seriesType },
        alphaVantageSchemas.technicalParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'MACD',
            symbol,
            interval,
            series_type: seriesType,
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch MACD data');
    }
  },

  /**
   * Fetches Relative Strength Index (RSI) data
   * @async
   * @param {string} symbol - Stock symbol
   * @param {string} interval - Time interval between data points
   * @param {number} timePeriod - Number of data points to calculate RSI
   * @param {string} seriesType - Type of price series to use
   * @returns {Promise<Object>} RSI indicator data
   * @throws {Error} If validation fails or API call fails
   */
  getRSI: async (symbol, interval = 'daily', timePeriod = 14, seriesType = 'close') => {
    try {
      validateParams(
        { symbol, interval, series_type: seriesType },
        alphaVantageSchemas.technicalParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'RSI',
            symbol,
            interval,
            time_period: timePeriod,
            series_type: seriesType,
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch RSI data');
    }
  },

  /**
   * Fetches Bollinger Bands (BBands) data
   * @async
   * @param {string} symbol - Stock symbol
   * @param {string} interval - Time interval between data points
   * @param {number} timePeriod - Number of data points to calculate BBands
   * @param {string} seriesType - Type of price series to use
   * @returns {Promise<Object>} BBands indicator data
   * @throws {Error} If validation fails or API call fails
   */
  getBBands: async (symbol, interval = 'daily', timePeriod = 20, seriesType = 'close') => {
    try {
      validateParams(
        { symbol, interval, series_type: seriesType },
        alphaVantageSchemas.technicalParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'BBANDS',
            symbol,
            interval,
            time_period: timePeriod,
            series_type: seriesType,
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch BBands data');
    }
  },

  // FUNDAMENTAL DATA
  getCompanyOverview: async (symbol) => {
    try {
      validateParams(
        { symbol, function: 'OVERVIEW' }, 
        alphaVantageSchemas.fundamentalsParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'OVERVIEW',
            symbol,
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch company overview');
    }
  },

  getIncomeStatement: async (symbol) => {
    try {
      validateParams(
        { symbol, function: 'INCOME_STATEMENT' }, 
        alphaVantageSchemas.fundamentalsParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'INCOME_STATEMENT',
            symbol,
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch income statement');
    }
  },

  getBalanceSheet: async (symbol) => {
    try {
      validateParams(
        { symbol, function: 'BALANCE_SHEET' }, 
        alphaVantageSchemas.fundamentalsParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'BALANCE_SHEET',
            symbol,
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch balance sheet');
    }
  },

  getCashFlow: async (symbol) => {
    try {
      validateParams(
        { symbol, function: 'CASH_FLOW' }, 
        alphaVantageSchemas.fundamentalsParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'CASH_FLOW',
            symbol,
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch cash flow');
    }
  },

  // FOREX
  getForexRate: async (fromCurrency, toCurrency) => {
    try {
      validateParams(
        { fromCurrency, toCurrency },
        alphaVantageSchemas.forexRateParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'CURRENCY_EXCHANGE_RATE',
            from_currency: fromCurrency,
            to_currency: toCurrency,
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch forex rate');
    }
  },

  getForexIntraday: async (fromSymbol, toSymbol, interval = '5min') => {
    try {
      validateParams(
        { fromSymbol, toSymbol, interval },
        {
          ...alphaVantageSchemas.forexRateParams,
          interval: alphaVantageSchemas.timeSeriesParams.interval
        }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'FX_INTRADAY',
            from_symbol: fromSymbol,
            to_symbol: toSymbol,
            interval,
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch forex intraday data');
    }
  },

  // CRYPTO
  getCryptoData: async (symbol, interval = 'daily') => {
    try {
      validateParams(
        { symbol, interval },
        {
          symbol: validationSchemas.symbol,
          interval: {
            required: true,
            type: 'string',
            validate: (value) => ['daily', 'weekly', 'monthly'].includes(value),
            message: 'Invalid interval value'
          }
        }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          method: 'GET',
          params: {
            function: `DIGITAL_CURRENCY_${interval.toUpperCase()}`,
            symbol,
            market: 'USD',
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', `fetch crypto ${interval} data`);
    }
  },

  // ECONOMIC INDICATORS
  getGDP: async () => {
    try {
      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'REAL_GDP',
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch GDP data');
    }
  },

  getCPI: async () => {
    try {
      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'CPI',
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch CPI data');
    }
  },

  getInflation: async () => {
    try {
      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'INFLATION',
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch inflation data');
    }
  },

  getRetailSales: async () => {
    try {
      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'RETAIL_SALES',
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch retail sales data');
    }
  },

  getDurables: async () => {
    try {
      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'DURABLES',
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch durables data');
    }
  },

  getUnemployment: async () => {
    try {
      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'UNEMPLOYMENT',
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch unemployment data');
    }
  },

  // ADDITIONAL TECHNICAL INDICATORS
  getWMA: async (symbol, interval = 'daily', timePeriod = 20, seriesType = 'close') => {
    try {
      validateParams(
        { symbol, interval, series_type: seriesType },
        alphaVantageSchemas.technicalParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'WMA',
            symbol,
            interval,
            time_period: timePeriod,
            series_type: seriesType,
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch WMA data');
    }
  },

  getDEMA: async (symbol, interval = 'daily', timePeriod = 20, seriesType = 'close') => {
    try {
      validateParams(
        { symbol, interval, series_type: seriesType },
        alphaVantageSchemas.technicalParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'DEMA',
            symbol,
            interval,
            time_period: timePeriod,
            series_type: seriesType,
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch DEMA data');
    }
  },

  getTEMA: async (symbol, interval = 'daily', timePeriod = 20, seriesType = 'close') => {
    try {
      validateParams(
        { symbol, interval, series_type: seriesType },
        alphaVantageSchemas.technicalParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'TEMA',
            symbol,
            interval,
            time_period: timePeriod,
            series_type: seriesType,
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch TEMA data');
    }
  },

  getTrima: async (symbol, interval = 'daily', timePeriod = 20, seriesType = 'close') => {
    try {
      validateParams(
        { symbol, interval, series_type: seriesType },
        alphaVantageSchemas.technicalParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'TRIMA',
            symbol,
            interval,
            time_period: timePeriod,
            series_type: seriesType,
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch TRIMA data');
    }
  },

  getKama: async (symbol, interval = 'daily', timePeriod = 20, seriesType = 'close') => {
    try {
      validateParams(
        { symbol, interval, series_type: seriesType },
        alphaVantageSchemas.technicalParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'KAMA',
            symbol,
            interval,
            time_period: timePeriod,
            series_type: seriesType,
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch KAMA data');
    }
  },

  getMama: async (symbol, interval = 'daily', seriesType = 'close') => {
    try {
      validateParams(
        { symbol, interval, series_type: seriesType },
        alphaVantageSchemas.technicalParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'MAMA',
            symbol,
            interval,
            series_type: seriesType,
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch MAMA data');
    }
  },

  getVWAP: async (symbol, interval = '5min') => {
    try {
      validateParams(
        { symbol, interval },
        {
          symbol: validationSchemas.symbol,
          interval: alphaVantageSchemas.timeSeriesParams.interval
        }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'VWAP',
            symbol,
            interval,
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch VWAP data');
    }
  },

  // MOMENTUM INDICATORS
  getADX: async (symbol, interval = 'daily', timePeriod = 14) => {
    try {
      validateParams(
        { symbol, interval },
        {
          symbol: validationSchemas.symbol,
          interval: alphaVantageSchemas.timeSeriesParams.interval
        }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'ADX',
            symbol,
            interval,
            time_period: timePeriod,
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch ADX data');
    }
  },

  /**
   * Fetches Williams %R data
   * @async
   * @param {string} symbol - Stock symbol
   * @param {string} interval - Time interval between data points
   * @param {number} timePeriod - Number of data points to calculate WillR
   * @returns {Promise<Object>} Williams %R indicator data
   * @throws {Error} If validation fails or API call fails
   */
  getWillR: async (symbol, interval = 'daily', timePeriod = 14) => {
    try {
      validateParams(
        { symbol, interval, timePeriod },
        alphaVantageSchemas.momentumParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'WILLR',
            symbol,
            interval,
            time_period: timePeriod,
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch Williams %R data');
    }
  },

  /**
   * Fetches Aroon indicator data
   * @async
   * @param {string} symbol - Stock symbol
   * @param {string} interval - Time interval between data points
   * @param {number} timePeriod - Number of data points to calculate Aroon
   * @returns {Promise<Object>} Aroon indicator data
   * @throws {Error} If validation fails or API call fails
   */
  getAroon: async (symbol, interval = 'daily', timePeriod = 14) => {
    try {
      validateParams(
        { symbol, interval, timePeriod },
        alphaVantageSchemas.momentumParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'AROON',
            symbol,
            interval,
            time_period: timePeriod,
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch Aroon data');
    }
  },

  /**
   * Fetches Money Flow Index (MFI) data
   * @async
   * @param {string} symbol - Stock symbol
   * @param {string} interval - Time interval between data points
   * @param {number} timePeriod - Number of data points to calculate MFI
   * @returns {Promise<Object>} MFI indicator data
   * @throws {Error} If validation fails or API call fails
   */
  getMFI: async (symbol, interval = 'daily', timePeriod = 14) => {
    try {
      validateParams(
        { symbol, interval, timePeriod },
        alphaVantageSchemas.momentumParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'MFI',
            symbol,
            interval,
            time_period: timePeriod,
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch MFI data');
    }
  },

  // VOLUME INDICATORS
  getOBV: async (symbol, interval = 'daily') => {
    try {
      validateParams(
        { symbol, interval },
        alphaVantageSchemas.volumeParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'OBV',
            symbol,
            interval,
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch OBV data');
    }
  },

  // VOLATILITY INDICATORS
  getATR: async (symbol, interval = 'daily', timePeriod = 14) => {
    try {
      validateParams(
        { symbol, interval, timePeriod },
        alphaVantageSchemas.volatilityParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'ATR',
            symbol,
            interval,
            time_period: timePeriod,
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch ATR data');
    }
  },

  getNatr: async (symbol, interval = 'daily', timePeriod = 14) => {
    try {
      validateParams(
        { symbol, interval, timePeriod },
        alphaVantageSchemas.volatilityParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'NATR',
            symbol,
            interval,
            time_period: timePeriod,
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch NATR data');
    }
  },

  // PRICE TRANSFORM
  getCEIL: async (symbol, interval = 'daily', seriesType = 'close') => {
    try {
      validateParams(
        { symbol, interval, series_type: seriesType },
        alphaVantageSchemas.technicalParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: BASE_URL,
          params: {
            function: 'CEIL',
            symbol,
            interval,
            series_type: seriesType,
            apikey: apiKeys.alphaVantage
          }
        })
      );

      return validateAPIResponse(response, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch CEIL data');
    }
  },

  // Add these comprehensive security type methods

  // MUTUAL FUNDS
  getMutualFundData: async (symbol) => {
    try {
      validateParams({ symbol }, { symbol: validationSchemas.symbol });

      const [
        daily,
        overview,
        performance,
        holdings,
        indicators,
        riskMetrics
      ] = await Promise.all([
        alphaVantageAPI.getDaily(symbol),
        alphaVantageAPI.getCompanyOverview(symbol),
        alphaVantageAPI.getFundPerformance(symbol),
        alphaVantageAPI.getFundHoldings(symbol),
        Promise.all([
          alphaVantageAPI.getSMA(symbol),
          alphaVantageAPI.getRSI(symbol),
          alphaVantageAPI.getBBands(symbol)
        ]),
        alphaVantageAPI.getFundRiskMetrics(symbol)
      ]);

      return validateAPIResponse({
        data: {
          overview: {
            name: overview.Name,
            category: overview.Category,
            family: overview.FundFamily,
            style: overview.InvestmentStyle,
            size: overview.FundSize,
            expenseRatio: overview.ExpenseRatio,
            turnoverRatio: overview.TurnoverRatio,
            inceptionDate: overview.InceptionDate
          },
          price: {
            daily: daily['Time Series (Daily)'],
            nav: daily.NAV,
            navChange: daily.NAVChange,
            navPercentChange: daily.NAVPercentChange
          },
          performance,
          holdings,
          technicals: {
            sma: indicators[0],
            rsi: indicators[1],
            bbands: indicators[2]
          },
          risk: riskMetrics
        }
      }, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch mutual fund data');
    }
  },

  // BONDS
  getBondData: async (symbol) => {
    try {
      validateParams({ symbol }, { symbol: validationSchemas.symbol });

      const [
        daily,
        yieldData,
        fundamentals,
        riskMetrics,
        marketData
      ] = await Promise.all([
        alphaVantageAPI.getDaily(symbol),
        alphaVantageAPI.getTreasuryYield(),
        alphaVantageAPI.getBondFundamentals(symbol),
        alphaVantageAPI.getBondRiskMetrics(symbol),
        alphaVantageAPI.getBondMarketData(symbol)
      ]);

      return validateAPIResponse({
        data: {
          price: {
            daily: daily['Time Series (Daily)'],
            currentPrice: daily.price,
            priceChange: daily.priceChange,
            percentChange: daily.percentChange
          },
          yield: yieldData,
          fundamentals,
          risk: riskMetrics,
          market: marketData
        }
      }, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch bond data');
    }
  },

  // OPTIONS
  getOptionsData: async (symbol, expiration, strike) => {
    try {
      validateParams(
        { symbol, expiration, strike },
        alphaVantageSchemas.optionsParams
      );

      const [underlying, volatility] = await Promise.all([
        alphaVantageAPI.getDaily(symbol),
        alphaVantageAPI.getVolatility(symbol)
      ]);

      return validateAPIResponse({
        data: {
          underlying: underlying['Time Series (Daily)'],
          volatility
        }
      }, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch options data');
    }
  },

  // FUTURES
  getFuturesData: async (symbol, market) => {
    try {
      validateParams(
        { symbol, market },
        alphaVantageSchemas.futuresParams
      );

      const [price, volume] = await Promise.all([
        alphaVantageAPI.getDaily(symbol),
        alphaVantageAPI.getVolume(symbol)
      ]);

      return validateAPIResponse({
        data: {
          price: price['Time Series (Daily)'],
          volume
        }
      }, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch futures data');
    }
  },

  // COMMODITIES
  getCommodityData: async (symbol, market) => {
    try {
      validateParams(
        { symbol, market },
        alphaVantageSchemas.commodityParams
      );

      const [daily, monthly] = await Promise.all([
        alphaVantageAPI.getDaily(symbol),
        alphaVantageAPI.getMonthly(symbol)
      ]);

      return validateAPIResponse({
        data: {
          daily: daily['Time Series (Daily)'],
          monthly: monthly['Monthly Time Series']
        }
      }, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch commodity data');
    }
  },

  // INDICES
  getIndexData: async (symbol) => {
    try {
      validateParams({ symbol }, alphaVantageSchemas.indexParams);

      const [daily, components] = await Promise.all([
        alphaVantageAPI.getDaily(symbol),
        alphaVantageAPI.getIndexComponents(symbol)
      ]);

      return validateAPIResponse({
        data: {
          price: daily['Time Series (Daily)'],
          components
        }
      }, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch index data');
    }
  },

  // FIXED INCOME
  getFixedIncomeData: async (symbol) => {
    try {
      validateParams(
        { symbol },
        alphaVantageSchemas.fixedIncomeParams
      );

      const [rates, yield_curve] = await Promise.all([
        alphaVantageAPI.getTreasuryRates(),
        alphaVantageAPI.getYieldCurve()
      ]);

      return validateAPIResponse({
        data: {
          rates,
          yieldCurve: yield_curve
        }
      }, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch fixed income data');
    }
  },

  // REITs
  getREITData: async (symbol) => {
    try {
      validateParams(
        { symbol },
        alphaVantageSchemas.reitParams
      );

      const [daily, fundamentals] = await Promise.all([
        alphaVantageAPI.getDaily(symbol),
        alphaVantageAPI.getCompanyOverview(symbol)
      ]);

      return validateAPIResponse({
        data: {
          price: daily['Time Series (Daily)'],
          fundamentals
        }
      }, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch REIT data');
    }
  },

  // ADRs
  getADRData: async (symbol) => {
    try {
      validateParams(
        { symbol },
        alphaVantageSchemas.adrParams
      );

      const [daily, overview] = await Promise.all([
        alphaVantageAPI.getDaily(symbol),
        alphaVantageAPI.getCompanyOverview(symbol)
      ]);

      return validateAPIResponse({
        data: {
          price: daily['Time Series (Daily)'],
          overview
        }
      }, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch ADR data');
    }
  },

  // PREFERRED STOCKS
  getPreferredStockData: async (symbol) => {
    try {
      validateParams(
        { symbol },
        alphaVantageSchemas.preferredStockParams
      );

      const [daily, fundamentals] = await Promise.all([
        alphaVantageAPI.getDaily(symbol),
        alphaVantageAPI.getCompanyOverview(symbol)
      ]);

      return validateAPIResponse({
        data: {
          price: daily['Time Series (Daily)'],
          fundamentals
        }
      }, 'Alpha Vantage').data;
    } catch (error) {
      handleAPIError(error, 'Alpha Vantage', 'fetch preferred stock data');
    }
  }
};

export default alphaVantageAPI; 