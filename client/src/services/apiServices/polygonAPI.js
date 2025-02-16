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

const BASE_URL = 'https://api.polygon.io';

// 5 requests per minute on free tier
const rateLimitedAxios = rateLimit(axios, { maxRequests: 5, perMilliseconds: 60000 });

/**
 * Validation schemas specific to Polygon API
 */
const polygonSchemas = {
  timeSeriesParams: {
    symbol: validationSchemas.symbol,
    timespan: {
      required: true,
      type: 'string',
      validate: (value) => ['minute', 'hour', 'day', 'week', 'month', 'quarter', 'year'].includes(value),
      message: 'Invalid timespan value'
    },
    multiplier: {
      required: false,
      type: 'number',
      validate: (value) => !value || (value > 0 && value <= 100),
      message: 'Multiplier must be between 1 and 100'
    },
    from: {
      required: true,
      type: 'string',
      validate: (value) => !isNaN(Date.parse(value)),
      message: 'Invalid from date'
    },
    to: {
      required: true,
      type: 'string',
      validate: (value) => !isNaN(Date.parse(value)),
      message: 'Invalid to date'
    }
  },

  tickerDetailsParams: {
    symbol: validationSchemas.symbol,
    date: {
      required: false,
      type: 'string',
      validate: (value) => !value || !isNaN(Date.parse(value)),
      message: 'Invalid date format'
    }
  },

  aggregatesParams: {
    symbol: validationSchemas.symbol,
    multiplier: {
      required: true,
      type: 'number',
      validate: (value) => value > 0 && value <= 365,
      message: 'Multiplier must be between 1 and 365'
    },
    timespan: {
      required: true,
      type: 'string',
      validate: (value) => ['minute', 'hour', 'day', 'week', 'month', 'quarter', 'year'].includes(value),
      message: 'Invalid timespan value'
    },
    from: {
      required: true,
      type: 'string',
      validate: (value) => /^\d{4}-\d{2}-\d{2}$/.test(value),
      message: 'From date must be in YYYY-MM-DD format'
    },
    to: {
      required: true,
      type: 'string',
      validate: (value) => /^\d{4}-\d{2}-\d{2}$/.test(value),
      message: 'To date must be in YYYY-MM-DD format'
    }
  },

  technicalParams: {
    symbol: validationSchemas.symbol,
    timespan: {
      required: false,
      type: 'string',
      validate: (value) => !value || ['minute', 'hour', 'day', 'week', 'month'].includes(value),
      message: 'Invalid timespan value'
    },
    window: {
      required: false,
      type: 'number',
      validate: (value) => !value || (value > 0 && value <= 500),
      message: 'Window must be between 1 and 500'
    }
  },

  tradesParams: {
    symbol: validationSchemas.symbol,
    limit: {
      required: false,
      type: 'number',
      validate: (value) => !value || (value > 0 && value <= 50000),
      message: 'Limit must be between 1 and 50000'
    }
  },

  optionsParams: {
    symbol: validationSchemas.symbol,
    expirationDate: {
      required: false,
      type: 'string',
      validate: (value) => !value || !isNaN(Date.parse(value)),
      message: 'Invalid expiration date'
    }
  },

  forexParams: {
    from: {
      required: true,
      type: 'string',
      validate: (value) => /^[A-Z]{3}$/.test(value),
      message: 'Invalid from currency format'
    },
    to: {
      required: true,
      type: 'string',
      validate: (value) => /^[A-Z]{3}$/.test(value),
      message: 'Invalid to currency format'
    }
  },

  cryptoParams: {
    symbol: validationSchemas.symbol,
    exchange: {
      required: false,
      type: 'string',
      message: 'Invalid exchange'
    }
  }
};

/**
 * Polygon API service for financial market data
 * @module polygonAPI
 */
const polygonAPI = {
  // STOCK METHODS
  getStockData: async (symbol) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const [
        snapshot,
        details,
        financials,
        news,
        indicators
      ] = await Promise.all([
        rateLimitedAxios.get(`${BASE_URL}/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}`, {
          params: { apiKey: apiKeys.polygon }
        }),
        rateLimitedAxios.get(`${BASE_URL}/v3/reference/tickers/${symbol}`, {
          params: { apiKey: apiKeys.polygon }
        }),
        rateLimitedAxios.get(`${BASE_URL}/v2/reference/financials/${symbol}`, {
          params: { apiKey: apiKeys.polygon }
        }),
        rateLimitedAxios.get(`${BASE_URL}/v2/reference/news/${symbol}`, {
          params: { apiKey: apiKeys.polygon }
        }),
        Promise.all([
          polygonAPI.getSMA(symbol),
          polygonAPI.getRSI(symbol),
          polygonAPI.getMACD(symbol)
        ])
      ].map(call => retryAPICall(() => call)));

      return validateAPIResponse({
        data: {
          price: {
            last: snapshot.data.ticker.lastTrade.p,
            open: snapshot.data.ticker.day.o,
            high: snapshot.data.ticker.day.h,
            low: snapshot.data.ticker.day.l,
            volume: snapshot.data.ticker.day.v,
            prevClose: snapshot.data.ticker.prevDay.c,
            change: snapshot.data.ticker.todaysChange,
            changePercent: snapshot.data.ticker.todaysChangePerc
          },
          details: {
            name: details.data.name,
            market: details.data.market,
            locale: details.data.locale,
            currency: details.data.currency_name,
            type: details.data.type,
            description: details.data.description,
            sic_code: details.data.sic_code,
            sic_description: details.data.sic_description,
            exchange: details.data.exchange,
            outstanding_shares: details.data.share_class_shares_outstanding,
            market_cap: details.data.market_cap
          },
          financials: {
            balance_sheet: financials.data.balance_sheet,
            cash_flow: financials.data.cash_flow,
            income: financials.data.income
          },
          news: news.data.results,
          technicals: {
            sma: indicators[0],
            rsi: indicators[1],
            macd: indicators[2]
          }
        }
      }, 'Polygon').data;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch stock data');
    }
  },

  getStockAggregates: async (symbol, multiplier = 1, timespan = 'day', from, to) => {
    try {
      validateParams(
        { symbol, multiplier, timespan, from, to },
        { ...polygonSchemas.timeSeriesParams, ...polygonSchemas.aggregatesParams }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${from}/${to}`, {
          params: {
            apiKey: apiKeys.polygon,
            adjusted: true
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.results;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch stock aggregates');
    }
  },

  getStockTrades: async (symbol) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v3/trades/${symbol}`, {
          params: {
            apiKey: apiKeys.polygon,
            limit: 100
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.results;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch stock trades');
    }
  },

  getStockQuotes: async (symbol) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v3/quotes/${symbol}`, {
          params: {
            apiKey: apiKeys.polygon,
            limit: 100
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.results;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch stock quotes');
    }
  },

  getStockLastTrade: async (symbol) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v2/last/trade/${symbol}`, {
          params: {
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.results;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch last trade');
    }
  },

  getStockLastQuote: async (symbol) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v2/last/nbbo/${symbol}`, {
          params: {
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.results;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch last quote');
    }
  },

  getStockDailyOpenClose: async (symbol, date) => {
    try {
      validateParams(
        { symbol, date },
        { 
          symbol: validationSchemas.symbol,
          date: polygonSchemas.tickerDetailsParams.date
        }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v1/open-close/${symbol}/${date}`, {
          params: {
            apiKey: apiKeys.polygon,
            adjusted: true
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch daily open/close');
    }
  },

  getStockPreviousClose: async (symbol) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v2/aggs/ticker/${symbol}/prev`, {
          params: {
            apiKey: apiKeys.polygon,
            adjusted: true
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.results[0];
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch previous close');
    }
  },

  getStockSnapshots: async (symbol) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}`, {
          params: {
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.ticker;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch stock snapshots');
    }
  },

  // TECHNICAL ANALYSIS
  getTechnicalIndicators: async (symbol, indicator, params) => {
    try {
      validateParams(
        { symbol, ...params },
        { 
          symbol: validationSchemas.symbol,
          ...polygonSchemas.technicalParams
        }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v1/indicators/${indicator}/${symbol}`, {
          params: {
            ...params,
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.results;
    } catch (error) {
      handleAPIError(error, 'Polygon', `fetch ${indicator}`);
    }
  },

  getSMA: async (symbol, timespan = 'day', window = 20) => {
    try {
      validateParams(
        { symbol, timespan, window },
        polygonSchemas.technicalParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v1/indicators/sma/${symbol}`, {
          params: {
            timespan,
            window,
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.results;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch SMA');
    }
  },

  getEMA: async (symbol, timespan = 'day', window = 20) => {
    try {
      validateParams(
        { symbol, timespan, window },
        polygonSchemas.technicalParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v1/indicators/ema/${symbol}`, {
          params: {
            timespan,
            window,
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.results;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch EMA');
    }
  },

  getRSI: async (symbol, timespan = 'day', window = 14) => {
    try {
      validateParams(
        { symbol, timespan, window },
        polygonSchemas.technicalParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v1/indicators/rsi/${symbol}`, {
          params: {
            timespan,
            window,
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.results;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch RSI');
    }
  },

  getMACD: async (symbol, timespan = 'day') => {
    try {
      validateParams(
        { symbol, timespan },
        polygonSchemas.technicalParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v1/indicators/macd/${symbol}`, {
          params: {
            timespan,
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.results;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch MACD');
    }
  },

  getBollingerBands: async (symbol, timespan = 'day') => {
    try {
      validateParams(
        { symbol, timespan },
        polygonSchemas.technicalParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v1/indicators/bbands/${symbol}`, {
          params: {
            timespan,
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.results;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch Bollinger Bands');
    }
  },

  // OPTIONS
  getOptionsData: async (symbol) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const [chain, greeks, lastTrade] = await Promise.all([
        polygonAPI.getOptionsChain(symbol),
        rateLimitedAxios.get(`${BASE_URL}/v3/reference/options/contracts/${symbol}`, {
          params: { apiKey: apiKeys.polygon }
        }),
        polygonAPI.getOptionsLastTrade(symbol)
      ].map(call => retryAPICall(() => call)));

      return validateAPIResponse({
        data: {
          chain: chain,
          greeks: greeks.data.results,
          lastTrade: lastTrade
        }
      }, 'Polygon').data;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch options data');
    }
  },

  getOptionsChain: async (symbol, expirationDate) => {
    try {
      validateParams(
        { symbol, expirationDate },
        polygonSchemas.optionsParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v3/snapshot/options/${symbol}`, {
          params: {
            expiration_date: expirationDate,
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.results;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch options chain');
    }
  },

  getOptionsLastTrade: async (symbol) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v2/last/trade/options/${symbol}`, {
          params: {
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.results;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch options last trade');
    }
  },

  getOptionsQuotes: async (symbol) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v3/quotes/options/${symbol}`, {
          params: {
            apiKey: apiKeys.polygon,
            limit: 100
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.results;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch options quotes');
    }
  },

  getOptionsSnapshots: async (symbol) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v2/snapshot/options/${symbol}`, {
          params: {
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.results;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch options snapshots');
    }
  },

  getOptionsAggregates: async (symbol, multiplier = 1, timespan = 'day') => {
    try {
      validateParams(
        { symbol, multiplier, timespan },
        { ...polygonSchemas.timeSeriesParams, ...polygonSchemas.aggregatesParams }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}`, {
          params: {
            apiKey: apiKeys.polygon,
            adjusted: true
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.results;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch options aggregates');
    }
  },

  // FOREX
  getForexRates: async (from, to) => {
    try {
      validateParams(
        { from, to },
        polygonSchemas.forexParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v2/aggs/forex/${from}/${to}/prev`, {
          params: {
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.results[0];
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch forex rates');
    }
  },

  getForexLastQuote: async (from, to) => {
    try {
      validateParams(
        { from, to },
        polygonSchemas.forexParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v2/last/currency/${from}/${to}`, {
          params: {
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.last;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch forex last quote');
    }
  },

  getForexSnapshots: async () => {
    try {
      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v2/snapshot/locale/global/markets/forex/tickers`, {
          params: {
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.tickers;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch forex snapshots');
    }
  },

  getForexAggregates: async (from, to, multiplier = 1, timespan = 'day') => {
    try {
      validateParams(
        { from, to, multiplier, timespan },
        { ...polygonSchemas.forexParams, ...polygonSchemas.aggregatesParams }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v2/aggs/forex/${from}/${to}/range/${multiplier}/${timespan}`, {
          params: {
            apiKey: apiKeys.polygon,
            adjusted: true
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.results;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch forex aggregates');
    }
  },

  // CRYPTO
  getCryptoLastTrade: async (symbol) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v2/last/crypto/${symbol}`, {
          params: {
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.last;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch crypto last trade');
    }
  },

  getCryptoLastQuote: async (symbol) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v2/last/quote/crypto/${symbol}`, {
          params: {
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.last;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch crypto last quote');
    }
  },

  getCryptoSnapshots: async () => {
    try {
      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v2/snapshot/locale/global/markets/crypto/tickers`, {
          params: {
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.tickers;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch crypto snapshots');
    }
  },

  getCryptoAggregates: async (symbol, multiplier = 1, timespan = 'day') => {
    try {
      validateParams(
        { symbol, multiplier, timespan },
        { ...polygonSchemas.timeSeriesParams, ...polygonSchemas.aggregatesParams }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v2/aggs/ticker/X:${symbol}/range/${multiplier}/${timespan}`, {
          params: {
            apiKey: apiKeys.polygon,
            adjusted: true
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.results;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch crypto aggregates');
    }
  },

  getCryptoExchanges: async () => {
    try {
      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v1/meta/crypto-exchanges`, {
          params: {
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch crypto exchanges');
    }
  },

  // MARKET DATA
  getMarketStatus: async () => {
    try {
      const [status, holidays] = await Promise.all([
        rateLimitedAxios.get(`${BASE_URL}/v1/marketstatus/now`, {
          params: {
            apiKey: apiKeys.polygon
          }
        }),
        rateLimitedAxios.get(`${BASE_URL}/v1/marketstatus/upcoming`, {
          params: {
            apiKey: apiKeys.polygon
          }
        })
      ].map(call => retryAPICall(() => call)));

      return validateAPIResponse({
        data: {
          current: status.data,
          upcoming: holidays.data
        }
      }, 'Polygon').data;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch market status');
    }
  },

  getMarketHolidays: async () => {
    try {
      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v1/marketstatus/upcoming`, {
          params: {
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch market holidays');
    }
  },

  getMarketTypes: async () => {
    try {
      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v3/reference/markets`, {
          params: {
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.results;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch market types');
    }
  },

  getMarketLocales: async () => {
    try {
      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v3/reference/locales`, {
          params: {
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.results;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch market locales');
    }
  },

  getMarketConditions: async () => {
    try {
      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v1/marketstatus/now`, {
          params: {
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch market conditions');
    }
  },

  // REFERENCE DATA
  getTickerTypes: async () => {
    try {
      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v3/reference/tickers/types`, {
          params: {
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.results;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch ticker types');
    }
  },

  getTickerDetails: async (symbol) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v3/reference/tickers/${symbol}`, {
          params: {
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.results;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch ticker details');
    }
  },

  getStockSplits: async (symbol) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v3/reference/splits`, {
          params: {
            ticker: symbol,
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.results;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch stock splits');
    }
  },

  getStockDividends: async (symbol) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v3/reference/dividends`, {
          params: {
            ticker: symbol,
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.results;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch stock dividends');
    }
  },

  getStockFinancials: async (symbol) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v2/reference/financials/${symbol}`, {
          params: {
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.results;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch stock financials');
    }
  },

  getMarketNews: async () => {
    try {
      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v2/reference/news`, {
          params: {
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.results;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch market news');
    }
  },

  // INDICES
  getIndexData: async (symbol) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const [snapshot, details, constituents] = await Promise.all([
        rateLimitedAxios.get(`${BASE_URL}/v2/snapshot/locale/us/markets/indices/${symbol}`, {
          params: { apiKey: apiKeys.polygon }
        }),
        rateLimitedAxios.get(`${BASE_URL}/v3/reference/indices/${symbol}`, {
          params: { apiKey: apiKeys.polygon }
        }),
        polygonAPI.getIndexMembers(symbol)
      ].map(call => retryAPICall(() => call)));

      return validateAPIResponse({
        data: {
          price: {
            value: snapshot.data.ticker.value,
            change: snapshot.data.ticker.todaysChange,
            changePercent: snapshot.data.ticker.todaysChangePerc
          },
          details: details.data,
          constituents: constituents
        }
      }, 'Polygon').data;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch index data');
    }
  },

  getIndexMembers: async (symbol) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v3/reference/indices/${symbol}/constituents`, {
          params: {
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.results;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch index members');
    }
  },

  getIndexWeights: async (symbol) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v3/reference/indices/${symbol}/weights`, {
          params: {
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.results;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch index weights');
    }
  },

  getIndexPriceData: async (symbol) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v2/aggs/ticker/I:${symbol}/prev`, {
          params: {
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.results[0];
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch index price data');
    }
  },

  // FUTURES
  getFuturesData: async (symbol) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const [chain, lastQuote, aggregates] = await Promise.all([
        polygonAPI.getFuturesChain(symbol),
        polygonAPI.getFuturesLastQuote(symbol),
        polygonAPI.getFuturesAggregates(symbol)
      ].map(call => retryAPICall(() => call)));

      return validateAPIResponse({
        data: {
          chain,
          lastQuote,
          aggregates
        }
      }, 'Polygon').data;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch futures data');
    }
  },

  getFuturesChain: async (underlying) => {
    try {
      validateParams(
        { underlying },
        { underlying: validationSchemas.symbol }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v3/reference/futures/chain`, {
          params: {
            underlying,
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.results;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch futures chain');
    }
  },

  getFuturesExpirations: async (symbol) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v3/reference/futures/expirations`, {
          params: {
            underlying: symbol,
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.results;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch futures expirations');
    }
  },

  getFuturesLastQuote: async (symbol) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v2/last/quote/futures/${symbol}`, {
          params: {
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.last;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch futures last quote');
    }
  },

  getFuturesAggregates: async (symbol, multiplier = 1, timespan = 'day') => {
    try {
      validateParams(
        { symbol, multiplier, timespan },
        { ...polygonSchemas.timeSeriesParams, ...polygonSchemas.aggregatesParams }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v2/aggs/ticker/F:${symbol}/range/${multiplier}/${timespan}`, {
          params: {
            apiKey: apiKeys.polygon,
            adjusted: true
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data.results;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch futures aggregates');
    }
  },

  // Market Data Methods
  getAggregates: async (symbol, multiplier, timespan, from, to) => {
    try {
      validateParams(
        { symbol, multiplier, timespan, from, to },
        polygonSchemas.aggregatesParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: `${BASE_URL}/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${from}/${to}`,
          method: 'GET',
          params: {
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch aggregates');
    }
  },

  // Previous Close
  getPreviousClose: async (symbol) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v2/aggs/ticker/${symbol}/prev`, {
          params: {
            apiKey: apiKeys.polygon
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch previous close');
    }
  },

  // Daily Open/Close
  getDailyOpenClose: async (symbol, date) => {
    try {
      validateParams(
        { symbol, date },
        {
          symbol: validationSchemas.symbol,
          date: polygonSchemas.tickerDetailsParams.date
        }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/v1/open-close/${symbol}/${date}`, {
          params: {
            apiKey: apiKeys.polygon,
            adjusted: true
          }
        })
      );

      return validateAPIResponse(response, 'Polygon').data;
    } catch (error) {
      handleAPIError(error, 'Polygon', 'fetch daily open/close');
    }
  }
};

export default polygonAPI; 