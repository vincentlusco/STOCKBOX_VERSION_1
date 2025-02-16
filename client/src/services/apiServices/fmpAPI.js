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

// 300 requests per minute
const rateLimitedAxios = rateLimit(axios, { maxRequests: 300, perMilliseconds: 60000 });
const BASE_URL = 'https://financialmodelingprep.com/api/v3';

/**
 * Financial Modeling Prep API service
 * @module fmpAPI
 */

// FMP-specific validation schemas
const fmpSchemas = {
  financialParams: {
    symbol: validationSchemas.symbol,
    period: {
      required: true,
      type: 'string',
      validate: (value) => ['annual', 'quarter'].includes(value),
      message: 'Period must be either annual or quarter'
    }
  },
  ratioParams: {
    symbol: validationSchemas.symbol,
    limit: {
      required: false,
      type: 'number',
      validate: (value) => value > 0 && value <= 100,
      message: 'Limit must be between 1 and 100'
    }
  },
  screeningParams: {
    marketCapMoreThan: {
      required: false,
      type: 'number',
      validate: (value) => !value || value > 0,
      message: 'Market cap must be positive'
    },
    volumeMoreThan: {
      required: false,
      type: 'number',
      validate: (value) => !value || value > 0,
      message: 'Volume must be positive'
    }
  }
};

const fmpAPI = {
  /**
   * Fetches company profile data
   * @async
   * @param {string} symbol - Company symbol
   * @returns {Promise<Object>} Company profile data
   * @throws {Error} If validation fails or API call fails
   */
  getCompanyProfile: async (symbol) => {
    try {
      validateParams({ symbol }, { symbol: validationSchemas.symbol });

      const response = await retryAPICall(() => 
        axios.get(`${BASE_URL}/profile/${symbol}`, {
          params: {
            apikey: apiKeys.fmp
          }
        })
      );

      return validateAPIResponse(response, 'FMP').data[0];
    } catch (error) {
      handleAPIError(error, 'FMP', 'fetch company profile');
    }
  },

  /**
   * Fetches financial statements
   * @async
   * @param {string} symbol - Company symbol
   * @param {string} statement - Statement type (income, balance, cash)
   * @param {string} period - Period (annual, quarter)
   * @returns {Promise<Object>} Financial statement data
   * @throws {Error} If validation fails or API call fails
   */
  getFinancialStatements: async (symbol, statement, period = 'annual') => {
    try {
      validateParams(
        { symbol, period }, 
        fmpSchemas.financialParams
      );

      const endpoint = `${statement}-statement/${symbol}`;
      const response = await retryAPICall(() => 
        axios.get(`${BASE_URL}/${endpoint}`, {
          params: {
            period,
            apikey: apiKeys.fmp
          }
        })
      );

      return validateAPIResponse(response, 'FMP').data;
    } catch (error) {
      handleAPIError(error, 'FMP', `fetch ${statement} statement`);
    }
  },

  /**
   * Fetches financial ratios
   * @async
   * @param {string} symbol - Company symbol
   * @param {number} limit - Number of periods to return
   * @returns {Promise<Object>} Financial ratios data
   * @throws {Error} If validation fails or API call fails
   */
  getFinancialRatios: async (symbol, limit = 40) => {
    try {
      validateParams(
        { symbol, limit }, 
        fmpSchemas.ratioParams
      );

      const response = await retryAPICall(() => 
        axios.get(`${BASE_URL}/ratios/${symbol}`, {
          params: {
            limit,
            apikey: apiKeys.fmp
          }
        })
      );

      return validateAPIResponse(response, 'FMP').data;
    } catch (error) {
      handleAPIError(error, 'FMP', 'fetch financial ratios');
    }
  },

  // COMPANY PROFILE & QUOTES
  getQuote: async (symbol) => {
    try {
      validateParams({ symbol }, { symbol: validationSchemas.symbol });

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: `${BASE_URL}/quote/${symbol}`,
          method: 'GET',
          params: {
            apikey: apiKeys.fmp
          }
        })
      );

      return validateAPIResponse(response, 'FMP').data;
    } catch (error) {
      handleAPIError(error, 'FMP', 'fetch quote');
    }
  },

  // FINANCIAL STATEMENTS
  getIncomeStatement: async (symbol, period = 'annual', limit = 5, dataType = 'raw', growth = false) => {
    try {
      const response = await axios.get(`${BASE_URL}/income-statement/${symbol}`, {
        params: {
          period,
          limit,
          dataType,
          growth,
          apikey: apiKeys.fmp
        }
      });
      if (!response.data || response.data.length === 0) {
        throw new Error('No income statement data found');
      }
      return response.data;
    } catch (error) {
      console.error('FMP Income Statement Error:', error);
      throw new Error(`Failed to fetch income statement: ${error.message}`);
    }
  },

  getBalanceSheet: async (symbol, period = 'annual', limit = 5) => {
    try {
      const response = await axios.get(`${BASE_URL}/balance-sheet-statement/${symbol}`, {
        params: {
          period,
          limit,
          apikey: apiKeys.fmp
        }
      });
      if (!response.data || response.data.length === 0) {
        throw new Error('No balance sheet data found');
      }
      return response.data;
    } catch (error) {
      console.error('FMP Balance Sheet Error:', error);
      throw new Error(`Failed to fetch balance sheet: ${error.message}`);
    }
  },

  getCashFlow: async (symbol, period = 'annual', limit = 5) => {
    try {
      const response = await axios.get(`${BASE_URL}/cash-flow-statement/${symbol}`, {
        params: {
          period,
          limit,
          apikey: apiKeys.fmp
        }
      });
      if (!response.data || response.data.length === 0) {
        throw new Error('No cash flow data found');
      }
      return response.data;
    } catch (error) {
      console.error('FMP Cash Flow Error:', error);
      throw new Error(`Failed to fetch cash flow: ${error.message}`);
    }
  },

  // FINANCIAL RATIOS & METRICS
  getKeyMetrics: async (symbol, period = 'annual', limit = 5) => {
    try {
      const response = await axios.get(`${BASE_URL}/key-metrics/${symbol}`, {
        params: {
          period,
          limit,
          apikey: apiKeys.fmp
        }
      });
      if (!response.data || response.data.length === 0) {
        throw new Error('No key metrics found');
      }
      return response.data;
    } catch (error) {
      console.error('FMP Key Metrics Error:', error);
      throw new Error(`Failed to fetch key metrics: ${error.message}`);
    }
  },

  // HISTORICAL DATA
  getHistoricalPrice: async (symbol, from, to, timeseries = 'daily', type = 'line', interval = '1min') => {
    try {
      const response = await axios.get(`${BASE_URL}/historical-price-full/${symbol}`, {
        params: {
          from,
          to,
          timeseries,
          type,
          interval,
          apikey: apiKeys.fmp
        }
      });
      if (!response.data || !response.data.historical) {
        throw new Error('No historical price data found');
      }
      if (response.data.historical.length === 0) {
        throw new Error('Empty historical data for the specified period');
      }
      return response.data;
    } catch (error) {
      console.error('FMP Historical Price Error:', error);
      throw new Error(`Failed to fetch historical prices: ${error.message}`);
    }
  },

  // INDEX METHODS
  getIndexData: async (symbol) => {
    try {
      const [quote, historical, constituents] = await Promise.all([
        axios.get(`${BASE_URL}/quote/${symbol}`, {
          params: {
            apikey: apiKeys.fmp
          }
        }),
        axios.get(`${BASE_URL}/historical-price-full/${symbol}`, {
          params: {
            apikey: apiKeys.fmp
          }
        }),
        axios.get(`${BASE_URL}/sp500_constituent`, {
          params: {
            apikey: apiKeys.fmp
          }
        })
      ]);

      return {
        quote: quote.data[0],
        historical: historical.data,
        constituents: constituents.data
      };
    } catch (error) {
      console.error('FMP Index Error:', error);
      throw error;
    }
  },

  // COMMODITIES
  getCommodityData: async (symbol) => {
    try {
      const response = await axios.get(`${BASE_URL}/historical-price-full/commodity/${symbol}`, {
        params: {
          apikey: apiKeys.fmp
        }
      });

      return response.data;
    } catch (error) {
      console.error('FMP Commodity Error:', error);
      throw error;
    }
  },

  // ECONOMIC INDICATORS
  getEconomicIndicators: async () => {
    try {
      const [gdp, inflation, unemployment] = await Promise.all([
        axios.get(`${BASE_URL}/economic/gdp`, {
          params: {
            apikey: apiKeys.fmp
          }
        }),
        axios.get(`${BASE_URL}/economic/inflation`, {
          params: {
            apikey: apiKeys.fmp
          }
        }),
        axios.get(`${BASE_URL}/economic/unemployment`, {
          params: {
            apikey: apiKeys.fmp
          }
        })
      ]);

      return {
        gdp: gdp.data,
        inflation: inflation.data,
        unemployment: unemployment.data
      };
    } catch (error) {
      console.error('FMP Economic Indicators Error:', error);
      throw error;
    }
  },

  // MARKET ANALYSIS
  getMarketAnalysis: async () => {
    try {
      const [sectors, gainers, losers] = await Promise.all([
        axios.get(`${BASE_URL}/sector-performance`, {
          params: {
            apikey: apiKeys.fmp
          }
        }),
        axios.get(`${BASE_URL}/gainers`, {
          params: {
            apikey: apiKeys.fmp
          }
        }),
        axios.get(`${BASE_URL}/losers`, {
          params: {
            apikey: apiKeys.fmp
          }
        })
      ].map(call => retryAPICall(() => call)));

      return validateAPIResponse({
        data: {
          sectors: sectors.data,
          gainers: gainers.data,
          losers: losers.data
        }
      }, 'FMP').data;
    } catch (error) {
      handleAPIError(error, 'FMP', 'fetch market analysis');
    }
  },

  getSectorPerformance: async (timeRange = '1day', compareTo = 'spy', includeSubsectors = false) => {
    try {
      validateParams(
        { timeRange },
        {
          timeRange: {
            required: true,
            type: 'string',
            validate: (value) => ['1day', '5day', '1month', '3month', '1year'].includes(value),
            message: 'Invalid time range'
          }
        }
      );

      const response = await retryAPICall(() => 
        axios.get(`${BASE_URL}/sector-performance`, {
          params: {
            timeRange,
            compareTo,
            includeSubsectors,
            apikey: apiKeys.fmp
          }
        })
      );

      const data = validateAPIResponse(response, 'FMP').data;
      if (!data) {
        throw new Error('No sector performance data found');
      }
      return data;
    } catch (error) {
      handleAPIError(error, 'FMP', 'fetch sector performance');
    }
  },

  getMarketMovers: async (type = 'gainers') => {
    try {
      validateParams(
        { type },
        {
          type: {
            required: true,
            type: 'string',
            validate: (value) => ['gainers', 'losers', 'active'].includes(value),
            message: 'Type must be gainers, losers, or active'
          }
        }
      );

      const response = await retryAPICall(() => 
        axios.get(`${BASE_URL}/${type}`, {
          params: {
            apikey: apiKeys.fmp
          }
        })
      );

      const data = validateAPIResponse(response, 'FMP').data;
      if (!data) {
        throw new Error(`No ${type} data found`);
      }
      return data;
    } catch (error) {
      handleAPIError(error, 'FMP', `fetch market ${type}`);
    }
  },

  getMarketHours: async () => {
    try {
      const response = await retryAPICall(() => 
        axios.get(`${BASE_URL}/market-hours`, {
          params: {
            apikey: apiKeys.fmp
          }
        })
      );

      const data = validateAPIResponse(response, 'FMP').data;
      if (!data) {
        throw new Error('No market hours data found');
      }
      return data;
    } catch (error) {
      handleAPIError(error, 'FMP', 'fetch market hours');
    }
  },

  // STOCK ANALYSIS METHODS
  getDCF: async (symbol) => {
    try {
      const response = await axios.get(`${BASE_URL}/discounted-cash-flow/${symbol}`, {
        params: {
          apikey: apiKeys.fmp
        }
      });
      if (!response.data) {
        throw new Error('No DCF data found');
      }
      return response.data;
    } catch (error) {
      console.error('FMP DCF Error:', error);
      throw new Error(`Failed to fetch DCF: ${error.message}`);
    }
  },

  getGrowthRates: async (symbol) => {
    try {
      const response = await axios.get(`${BASE_URL}/financial-growth/${symbol}`, {
        params: {
          apikey: apiKeys.fmp
        }
      });
      if (!response.data || response.data.length === 0) {
        throw new Error('No growth rates found');
      }
      return response.data;
    } catch (error) {
      console.error('FMP Growth Rates Error:', error);
      throw new Error(`Failed to fetch growth rates: ${error.message}`);
    }
  },

  getEarningsEstimates: async (symbol) => {
    try {
      const response = await axios.get(`${BASE_URL}/analyst-estimates/${symbol}`, {
        params: {
          apikey: apiKeys.fmp
        }
      });
      if (!response.data || response.data.length === 0) {
        throw new Error('No earnings estimates found');
      }
      return response.data;
    } catch (error) {
      console.error('FMP Earnings Estimates Error:', error);
      throw new Error(`Failed to fetch earnings estimates: ${error.message}`);
    }
  },

  // ETF AND MUTUAL FUND METHODS
  getETFHoldings: async (symbol, date = null, weightGreaterThan = null, complete = true) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const response = await retryAPICall(() => 
        axios.get(`${BASE_URL}/etf-holder/${symbol}`, {
          params: {
            date,
            weightGreaterThan,
            complete,
            apikey: apiKeys.fmp
          }
        })
      );

      const data = validateAPIResponse(response, 'FMP').data;
      if (!data || data.length === 0) {
        throw new Error('No ETF holdings found');
      }
      return data;
    } catch (error) {
      handleAPIError(error, 'FMP', 'fetch ETF holdings');
    }
  },

  getETFSectorWeights: async (symbol) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const response = await retryAPICall(() => 
        axios.get(`${BASE_URL}/etf-sector-weightings/${symbol}`, {
          params: {
            apikey: apiKeys.fmp
          }
        })
      );

      const data = validateAPIResponse(response, 'FMP').data;
      if (!data || data.length === 0) {
        throw new Error('No ETF sector weights found');
      }
      return data;
    } catch (error) {
      handleAPIError(error, 'FMP', 'fetch ETF sector weights');
    }
  },

  getETFCountryWeights: async (symbol) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const response = await retryAPICall(() => 
        axios.get(`${BASE_URL}/etf-country-weightings/${symbol}`, {
          params: {
            apikey: apiKeys.fmp
          }
        })
      );

      const data = validateAPIResponse(response, 'FMP').data;
      if (!data || data.length === 0) {
        throw new Error('No ETF country weights found');
      }
      return data;
    } catch (error) {
      handleAPIError(error, 'FMP', 'fetch ETF country weights');
    }
  },

  // INSTITUTIONAL HOLDINGS & INSIDER TRADING
  getInstitutionalHolders: async (symbol) => {
    try {
      const response = await axios.get(`${BASE_URL}/institutional-holder/${symbol}`, {
        params: {
          apikey: apiKeys.fmp
        }
      });
      if (!response.data || response.data.length === 0) {
        throw new Error('No institutional holders found');
      }
      return response.data;
    } catch (error) {
      console.error('FMP Institutional Holders Error:', error);
      throw new Error(`Failed to fetch institutional holders: ${error.message}`);
    }
  },

  getInsiderTrading: async (symbol) => {
    try {
      const response = await axios.get(`${BASE_URL}/insider-trading/${symbol}`, {
        params: {
          apikey: apiKeys.fmp
        }
      });
      if (!response.data || response.data.length === 0) {
        throw new Error('No insider trading data found');
      }
      return response.data;
    } catch (error) {
      console.error('FMP Insider Trading Error:', error);
      throw new Error(`Failed to fetch insider trading: ${error.message}`);
    }
  },

  getStockScreener: async (criteria) => {
    try {
      validateParams(
        criteria,
        fmpSchemas.screeningParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.get(`${BASE_URL}/stock-screener`, {
          params: {
            ...criteria,
            apikey: apiKeys.fmp
          }
        })
      );

      return validateAPIResponse(response, 'FMP').data;
    } catch (error) {
      handleAPIError(error, 'FMP', 'fetch stock screener results');
    }
  },

  getStockGrade: async (symbol) => {
    try {
      const response = await axios.get(`${BASE_URL}/grade/${symbol}`, {
        params: {
          apikey: apiKeys.fmp
        }
      });
      return response.data;
    } catch (error) {
      console.error('FMP Stock Grade Error:', error);
      throw new Error(`Failed to fetch stock grade: ${error.message}`);
    }
  },

  getStockPeers: async (symbol) => {
    try {
      const response = await axios.get(`${BASE_URL}/stock_peers`, {
        params: {
          symbol,
          apikey: apiKeys.fmp
        }
      });
      return response.data;
    } catch (error) {
      console.error('FMP Stock Peers Error:', error);
      throw new Error(`Failed to fetch stock peers: ${error.message}`);
    }
  },

  // ADDITIONAL ECONOMIC INDICATORS
  getEconomicCalendar: async (from = null, to = null, country = null, importance = null) => {
    try {
      const response = await axios.get(`${BASE_URL}/economic-calendar`, {
        params: {
          from,
          to,
          country,
          importance,
          apikey: apiKeys.fmp
        }
      });
      if (!response.data) {
        throw new Error('No economic calendar data found');
      }
      return response.data;
    } catch (error) {
      console.error('FMP Economic Calendar Error:', error);
      throw new Error(`Failed to fetch economic calendar: ${error.message}`);
    }
  },

  getTreasuryRates: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/treasury`, {
        params: {
          apikey: apiKeys.fmp
        }
      });
      if (!response.data) {
        throw new Error('No treasury rates found');
      }
      return response.data;
    } catch (error) {
      console.error('FMP Treasury Rates Error:', error);
      throw new Error(`Failed to fetch treasury rates: ${error.message}`);
    }
  },

  // ADVANCED STOCK ANALYSIS
  getEnterpriseValue: async (symbol, period = 'annual', limit = 5) => {
    try {
      const response = await axios.get(`${BASE_URL}/enterprise-values/${symbol}`, {
        params: {
          period,
          limit,
          apikey: apiKeys.fmp
        }
      });
      if (!response.data || response.data.length === 0) {
        throw new Error('No enterprise value data found');
      }
      return response.data;
    } catch (error) {
      console.error('FMP Enterprise Value Error:', error);
      throw new Error(`Failed to fetch enterprise value: ${error.message}`);
    }
  },

  getCompanyValuation: async (symbol, method = 'dcf', period = '5years', riskFreeRate = null) => {
    try {
      const response = await axios.get(`${BASE_URL}/company-valuation/${symbol}`, {
        params: {
          method,
          period,
          riskFreeRate,
          apikey: apiKeys.fmp
        }
      });
      if (!response.data) {
        throw new Error('No company valuation data found');
      }
      return response.data;
    } catch (error) {
      console.error('FMP Company Valuation Error:', error);
      throw new Error(`Failed to fetch company valuation: ${error.message}`);
    }
  },

  // ENHANCED ETF/MUTUAL FUND METHODS
  getMutualFundProfile: async (symbol) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const response = await retryAPICall(() => 
        axios.get(`${BASE_URL}/mutual-fund-profile/${symbol}`, {
          params: {
            apikey: apiKeys.fmp
          }
        })
      );

      const data = validateAPIResponse(response, 'FMP').data;
      if (!data) {
        throw new Error('No mutual fund profile found');
      }
      return data;
    } catch (error) {
      handleAPIError(error, 'FMP', 'fetch mutual fund profile');
    }
  },

  getETFStockExposure: async (symbol) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const response = await retryAPICall(() => 
        axios.get(`${BASE_URL}/etf-stock-exposure/${symbol}`, {
          params: {
            apikey: apiKeys.fmp
          }
        })
      );

      const data = validateAPIResponse(response, 'FMP').data;
      if (!data || data.length === 0) {
        throw new Error('No ETF stock exposure data found');
      }
      return data;
    } catch (error) {
      handleAPIError(error, 'FMP', 'fetch ETF stock exposure');
    }
  },

  // ENHANCED FINANCIAL METRICS
  getCompanyFinancialGrowth: async (symbol, period = 'annual') => {
    try {
      const response = await axios.get(`${BASE_URL}/financial-growth/${symbol}`, {
        params: {
          period,
          apikey: apiKeys.fmp
        }
      });
      if (!response.data || response.data.length === 0) {
        throw new Error('No financial growth data found');
      }
      return response.data;
    } catch (error) {
      console.error('FMP Financial Growth Error:', error);
      throw new Error(`Failed to fetch financial growth: ${error.message}`);
    }
  },

  getFinancialScores: async (symbol) => {
    try {
      const response = await axios.get(`${BASE_URL}/score/${symbol}`, {
        params: {
          apikey: apiKeys.fmp
        }
      });
      if (!response.data) {
        throw new Error('No financial scores found');
      }
      return response.data;
    } catch (error) {
      console.error('FMP Financial Scores Error:', error);
      throw new Error(`Failed to fetch financial scores: ${error.message}`);
    }
  },

  // ENHANCED MARKET ANALYSIS
  getSectorEstimates: async (sector) => {
    try {
      const response = await axios.get(`${BASE_URL}/sector-estimates`, {
        params: {
          sector,
          apikey: apiKeys.fmp
        }
      });
      if (!response.data) {
        throw new Error('No sector estimates found');
      }
      return response.data;
    } catch (error) {
      console.error('FMP Sector Estimates Error:', error);
      throw new Error(`Failed to fetch sector estimates: ${error.message}`);
    }
  },

  getMarketRiskPremium: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/market-risk-premium`, {
        params: {
          apikey: apiKeys.fmp
        }
      });
      if (!response.data) {
        throw new Error('No market risk premium data found');
      }
      return response.data;
    } catch (error) {
      console.error('FMP Market Risk Premium Error:', error);
      throw new Error(`Failed to fetch market risk premium: ${error.message}`);
    }
  },

  // ENHANCED STOCK SCREENER
  getAdvancedScreener: async (criteria) => {
    const defaultCriteria = {
      marketCapMoreThan: null,
      marketCapLowerThan: null,
      priceMoreThan: null,
      priceLowerThan: null,
      betaMoreThan: null,
      betaLowerThan: null,
      volumeMoreThan: null,
      volumeLowerThan: null,
      dividendMoreThan: null,
      dividendLowerThan: null,
      sector: null,
      industry: null,
      country: null,
      exchange: null,
      limit: 50,
      ...criteria
    };

    try {
      const response = await axios.get(`${BASE_URL}/stock-screener`, {
        params: {
          ...defaultCriteria,
          apikey: apiKeys.fmp
        }
      });
      if (!response.data || response.data.length === 0) {
        throw new Error('No screener results found');
      }
      return response.data;
    } catch (error) {
      console.error('FMP Advanced Screener Error:', error);
      throw new Error(`Failed to fetch screener results: ${error.message}`);
    }
  },

  getETFData: async (symbol) => {
    try {
      const [
        profile,
        holdings,
        sectorWeights,
        countryWeights,
        performance,
        stats,
        dividends
      ] = await Promise.all([
        fmpAPI.getETFProfile(symbol),
        fmpAPI.getETFHoldings(symbol),
        fmpAPI.getETFSectorWeights(symbol),
        fmpAPI.getETFCountryWeights(symbol),
        fmpAPI.getETFPerformance(symbol),
        fmpAPI.getETFStats(symbol),
        fmpAPI.getETFDividends(symbol)
      ]);

      return {
        profile,
        holdings,
        sectorWeights,
        countryWeights,
        performance,
        stats,
        dividends
      };
    } catch (error) {
      console.error('FMP ETF Data Error:', error);
      throw new Error(`Failed to fetch ETF data: ${error.message}`);
    }
  },

  getETFProfile: async (symbol) => {
    try {
      const response = await axios.get(`${BASE_URL}/etf-info/${symbol}`, {
        params: {
          apikey: apiKeys.fmp
        }
      });
      return response.data;
    } catch (error) {
      console.error('FMP ETF Profile Error:', error);
      throw new Error(`Failed to fetch ETF profile: ${error.message}`);
    }
  },

  getETFPerformance: async (symbol) => {
    try {
      const response = await axios.get(`${BASE_URL}/etf-performance/${symbol}`, {
        params: {
          apikey: apiKeys.fmp
        }
      });
      return response.data;
    } catch (error) {
      console.error('FMP ETF Performance Error:', error);
      throw new Error(`Failed to fetch ETF performance: ${error.message}`);
    }
  },

  getETFStats: async (symbol) => {
    try {
      const response = await axios.get(`${BASE_URL}/etf-statistics/${symbol}`, {
        params: {
          apikey: apiKeys.fmp
        }
      });
      return response.data;
    } catch (error) {
      console.error('FMP ETF Stats Error:', error);
      throw new Error(`Failed to fetch ETF statistics: ${error.message}`);
    }
  },

  getETFDividends: async (symbol) => {
    try {
      const response = await axios.get(`${BASE_URL}/historical-etf-dividend/${symbol}`, {
        params: {
          apikey: apiKeys.fmp
        }
      });
      return response.data;
    } catch (error) {
      console.error('FMP ETF Dividends Error:', error);
      throw new Error(`Failed to fetch ETF dividends: ${error.message}`);
    }
  },

  // Add ESG Data methods
  getESGScores: async (symbol) => {
    try {
      const response = await axios.get(`${BASE_URL}/esg-score/${symbol}`, {
        params: {
          apikey: apiKeys.fmp
        }
      });
      return response.data;
    } catch (error) {
      console.error('FMP ESG Scores Error:', error);
      throw new Error(`Failed to fetch ESG scores: ${error.message}`);
    }
  },

  getESGRatings: async (symbol) => {
    try {
      const response = await axios.get(`${BASE_URL}/esg-rating/${symbol}`, {
        params: {
          apikey: apiKeys.fmp
        }
      });
      return response.data;
    } catch (error) {
      console.error('FMP ESG Ratings Error:', error);
      throw new Error(`Failed to fetch ESG ratings: ${error.message}`);
    }
  },

  // Add Social Sentiment methods
  getSocialSentiment: async (symbol) => {
    try {
      const response = await axios.get(`${BASE_URL}/social-sentiment/${symbol}`, {
        params: {
          apikey: apiKeys.fmp
        }
      });
      return response.data;
    } catch (error) {
      console.error('FMP Social Sentiment Error:', error);
      throw new Error(`Failed to fetch social sentiment: ${error.message}`);
    }
  },

  // Add Price Target methods
  getPriceTarget: async (symbol) => {
    try {
      const response = await axios.get(`${BASE_URL}/price-target/${symbol}`, {
        params: {
          apikey: apiKeys.fmp
        }
      });
      return response.data;
    } catch (error) {
      console.error('FMP Price Target Error:', error);
      throw new Error(`Failed to fetch price target: ${error.message}`);
    }
  },

  // Add Upgrades/Downgrades methods
  getUpgradesDowngrades: async (symbol) => {
    try {
      const response = await axios.get(`${BASE_URL}/upgrades-downgrades/${symbol}`, {
        params: {
          apikey: apiKeys.fmp
        }
      });
      return response.data;
    } catch (error) {
      console.error('FMP Upgrades/Downgrades Error:', error);
      throw new Error(`Failed to fetch upgrades/downgrades: ${error.message}`);
    }
  },

  // Add SEC Filings methods
  getSECFilings: async (symbol) => {
    try {
      const response = await axios.get(`${BASE_URL}/sec-filings/${symbol}`, {
        params: {
          apikey: apiKeys.fmp
        }
      });
      return response.data;
    } catch (error) {
      console.error('FMP SEC Filings Error:', error);
      throw new Error(`Failed to fetch SEC filings: ${error.message}`);
    }
  },

  // Add these comprehensive methods

  // STOCK OWNERSHIP & INSIDER ACTIVITY
  getSharesFloat: async (symbol) => {
    try {
      const response = await axios.get(`${BASE_URL}/shares-float/${symbol}`, {
        params: {
          apikey: apiKeys.fmp
        }
      });
      return response.data;
    } catch (error) {
      console.error('FMP Shares Float Error:', error);
      throw new Error(`Failed to fetch shares float: ${error.message}`);
    }
  },

  getInsiderSummary: async (symbol) => {
    try {
      const response = await axios.get(`${BASE_URL}/insider-summary/${symbol}`, {
        params: {
          apikey: apiKeys.fmp
        }
      });
      return response.data;
    } catch (error) {
      console.error('FMP Insider Summary Error:', error);
      throw new Error(`Failed to fetch insider summary: ${error.message}`);
    }
  },

  // DETAILED FINANCIAL ANALYSIS
  getCashFlowAnalysis: async (symbol, period = 'annual', limit = 5) => {
    try {
      const response = await axios.get(`${BASE_URL}/cash-flow-analysis/${symbol}`, {
        params: {
          period,
          limit,
          apikey: apiKeys.fmp
        }
      });
      return response.data;
    } catch (error) {
      console.error('FMP Cash Flow Analysis Error:', error);
      throw new Error(`Failed to fetch cash flow analysis: ${error.message}`);
    }
  },

  getOperatingPerformance: async (symbol) => {
    try {
      const response = await axios.get(`${BASE_URL}/operating-performance/${symbol}`, {
        params: {
          apikey: apiKeys.fmp
        }
      });
      return response.data;
    } catch (error) {
      console.error('FMP Operating Performance Error:', error);
      throw new Error(`Failed to fetch operating performance: ${error.message}`);
    }
  },

  // INDUSTRY & SECTOR ANALYSIS
  getIndustryAnalysis: async (industry) => {
    try {
      const response = await axios.get(`${BASE_URL}/industry-analysis`, {
        params: {
          industry,
          apikey: apiKeys.fmp
        }
      });
      return response.data;
    } catch (error) {
      console.error('FMP Industry Analysis Error:', error);
      throw new Error(`Failed to fetch industry analysis: ${error.message}`);
    }
  },

  getSectorMetrics: async (sector) => {
    try {
      const response = await axios.get(`${BASE_URL}/sector-metrics`, {
        params: {
          sector,
          apikey: apiKeys.fmp
        }
      });
      return response.data;
    } catch (error) {
      console.error('FMP Sector Metrics Error:', error);
      throw new Error(`Failed to fetch sector metrics: ${error.message}`);
    }
  },

  // ADVANCED VALUATION METRICS
  getAdvancedValuation: async (symbol) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const [evToEBITDA, priceToBook, dcf] = await Promise.all([
        retryAPICall(() => 
          axios.get(`${BASE_URL}/ev-to-ebitda/${symbol}`, {
            params: {
              apikey: apiKeys.fmp
            }
          })
        ),
        retryAPICall(() => 
          axios.get(`${BASE_URL}/price-to-book/${symbol}`, {
            params: {
              apikey: apiKeys.fmp
            }
          })
        ),
        retryAPICall(() => 
          axios.get(`${BASE_URL}/dcf/${symbol}`, {
            params: {
              apikey: apiKeys.fmp
            }
          })
        )
      ].map(call => retryAPICall(() => call)));

      return validateAPIResponse({
        data: {
          evToEBITDA: evToEBITDA.data,
          priceToBook: priceToBook.data,
          dcf: dcf.data
        }
      }, 'FMP').data;
    } catch (error) {
      handleAPIError(error, 'FMP', 'fetch advanced valuation metrics');
    }
  },

  // MARKET DEPTH & ORDER BOOK
  getMarketDepth: async (symbol) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const response = await retryAPICall(() => 
        axios.get(`${BASE_URL}/market-depth/${symbol}`, {
          params: {
            apikey: apiKeys.fmp
          }
        })
      );

      return validateAPIResponse(response, 'FMP').data;
    } catch (error) {
      handleAPIError(error, 'FMP', 'fetch market depth');
    }
  },

  // VOLATILITY & OPTIONS ANALYSIS
  getVolatilityAnalysis: async (symbol) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const [historicalVol, impliedVol, optionsChain] = await Promise.all([
        retryAPICall(() => 
          axios.get(`${BASE_URL}/historical-volatility/${symbol}`, {
            params: {
              apikey: apiKeys.fmp
            }
          })
        ),
        retryAPICall(() => 
          axios.get(`${BASE_URL}/implied-volatility/${symbol}`, {
            params: {
              apikey: apiKeys.fmp
            }
          })
        ),
        retryAPICall(() => 
          axios.get(`${BASE_URL}/options-chain/${symbol}`, {
            params: {
              apikey: apiKeys.fmp
            }
          })
        )
      ].map(call => retryAPICall(() => call)));

      return validateAPIResponse({
        data: {
          historicalVolatility: historicalVol.data,
          impliedVolatility: impliedVol.data,
          optionsChain: optionsChain.data
        }
      }, 'FMP').data;
    } catch (error) {
      handleAPIError(error, 'FMP', 'fetch volatility analysis');
    }
  },

  // SUPPLY CHAIN ANALYSIS
  getSupplyChainAnalysis: async (symbol) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const response = await retryAPICall(() => 
        axios.get(`${BASE_URL}/supply-chain/${symbol}`, {
          params: {
            apikey: apiKeys.fmp
          }
        })
      );

      return validateAPIResponse(response, 'FMP').data;
    } catch (error) {
      handleAPIError(error, 'FMP', 'fetch supply chain analysis');
    }
  },

  // EXECUTIVE COMPENSATION
  getExecutiveCompensation: async (symbol) => {
    try {
      validateParams(
        { symbol },
        { symbol: validationSchemas.symbol }
      );

      const response = await retryAPICall(() => 
        axios.get(`${BASE_URL}/executive-compensation/${symbol}`, {
          params: {
            apikey: apiKeys.fmp
          }
        })
      );

      return validateAPIResponse(response, 'FMP').data;
    } catch (error) {
      handleAPIError(error, 'FMP', 'fetch executive compensation');
    }
  },

  // PATENT ANALYSIS
  getPatentData: async (symbol) => {
    try {
      const response = await axios.get(`${BASE_URL}/patents/${symbol}`, {
        params: {
          apikey: apiKeys.fmp
        }
      });
      return response.data;
    } catch (error) {
      console.error('FMP Patent Data Error:', error);
      throw new Error(`Failed to fetch patent data: ${error.message}`);
    }
  },

  // REGULATORY COMPLIANCE
  getRegulatoryFilings: async (symbol) => {
    try {
      const response = await axios.get(`${BASE_URL}/regulatory-filings/${symbol}`, {
        params: {
          apikey: apiKeys.fmp
        }
      });
      return response.data;
    } catch (error) {
      console.error('FMP Regulatory Filings Error:', error);
      throw new Error(`Failed to fetch regulatory filings: ${error.message}`);
    }
  }
};

export default fmpAPI; 