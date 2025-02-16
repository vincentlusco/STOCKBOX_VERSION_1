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
import { rateLimit as rateLimitUtils } from '../../utils/rateLimiter';

const BASE_URL = 'https://api.stlouisfed.org/fred';

// Rate limit to 120 calls per minute as per FRED API limits
const rateLimitedAxios = rateLimitUtils(axios, { maxRequests: 120, perMilliseconds: 60000 });

/**
 * Validation schemas specific to FRED API
 */
const fredAPISchemas = {
  seriesParams: {
    seriesId: {
      required: true,
      type: 'string',
      validate: (value) => value && value.length > 0,
      message: 'Series ID is required'
    },
    frequency: {
      required: false,
      type: 'string',
      validate: (value) => !value || ['d', 'w', 'bw', 'm', 'q', 'sa', 'a'].includes(value),
      message: 'Invalid frequency value'
    },
    units: {
      required: false,
      type: 'string',
      validate: (value) => !value || ['lin', 'chg', 'ch1', 'pch', 'pc1', 'pca', 'cch', 'cca', 'log'].includes(value),
      message: 'Invalid units value'
    }
  },

  categoryParams: {
    categoryId: {
      required: true,
      type: 'number',
      validate: (value) => value > 0,
      message: 'Invalid category ID'
    }
  },

  searchParams: {
    searchText: {
      required: true,
      type: 'string',
      validate: (value) => value && value.length >= 2,
      message: 'Search text must be at least 2 characters'
    },
    searchType: {
      required: false,
      type: 'string',
      validate: (value) => !value || ['full_text', 'series_id'].includes(value),
      message: 'Invalid search type'
    }
  }
};

/**
 * FRED API service for economic data
 * @module fredAPI
 */
const fredAPI = {
  // CORE ECONOMIC INDICATORS
  getEconomicIndicators: async () => {
    try {
      const [gdp, inflation, unemployment, fedFunds] = await Promise.all([
        fredAPI.getGDP(),
        fredAPI.getInflationRate(),
        fredAPI.getUnemploymentRate(),
        fredAPI.getFedFundsRate()
      ].map(call => retryAPICall(() => call)));

      return validateAPIResponse({
        data: {
          gdp,
          inflation,
          unemployment,
          fedFunds
        }
      }, 'FRED').data;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch economic indicators');
    }
  },

  // 1. Series Data Methods
  getSeriesData: async (seriesId, params = {}) => {
    try {
      validateParams(
        { seriesId, ...params },
        fredAPISchemas.seriesParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: seriesId,
            ...params,
            api_key: apiKeys.fred,
            file_type: 'json'
          }
        })
      );

      return validateAPIResponse(response, 'FRED').data;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch series data');
    }
  },

  // 2. Categories Methods
  getCategory: async (categoryId) => {
    try {
      validateParams(
        { categoryId },
        fredAPISchemas.categoryParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: `${BASE_URL}/category`,
          params: {
            category_id: categoryId,
            api_key: apiKeys.fred,
            file_type: 'json'
          }
        })
      );

      return validateAPIResponse(response, 'FRED').data;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch category');
    }
  },

  getCategoryChildren: async (categoryId) => {
    try {
      validateParams(
        { categoryId },
        fredAPISchemas.categoryParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: `${BASE_URL}/category/children`,
          params: {
            category_id: categoryId,
            api_key: apiKeys.fred,
            file_type: 'json'
          }
        })
      );

      return validateAPIResponse(response, 'FRED').data.categories;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch category children');
    }
  },

  // 3. Releases Methods
  getReleases: async () => {
    try {
      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: `${BASE_URL}/releases`,
          params: {
            api_key: apiKeys.fred,
            file_type: 'json'
          }
        })
      );

      return validateAPIResponse(response, 'FRED').data.releases;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch releases');
    }
  },

  getReleaseData: async (releaseId) => {
    try {
      validateParams(
        { releaseId },
        {
          releaseId: {
            required: true,
            type: 'number',
            validate: (value) => value > 0,
            message: 'Invalid release ID'
          }
        }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: `${BASE_URL}/release/series`,
          params: {
            release_id: releaseId,
            api_key: apiKeys.fred,
            file_type: 'json'
          }
        })
      );

      return validateAPIResponse(response, 'FRED').data.series;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch release data');
    }
  },

  // 4. Search Methods
  searchSeries: async (searchText, searchType = 'full_text') => {
    try {
      validateParams(
        { searchText, searchType },
        fredAPISchemas.searchParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/search`,
          params: {
            search_text: searchText,
            search_type: searchType,
            api_key: apiKeys.fred,
            file_type: 'json'
          }
        })
      );

      return validateAPIResponse(response, 'FRED').data.seriess;
    } catch (error) {
      handleAPIError(error, 'FRED', 'search series');
    }
  },

  // 5. Economic Indicators Methods
  getGDP: async () => {
    try {
      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'GDP',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 100
          }
        })
      );

      return validateAPIResponse(response, 'FRED').data.observations;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch GDP data');
    }
  },

  getRealGDPGrowth: async () => {
    try {
      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'A191RL1Q225SBEA',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 40
          }
        })
      );

      return validateAPIResponse(response, 'FRED').data.observations;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch real GDP growth');
    }
  },

  // INFLATION METHODS
  getInflationRate: async () => {
    try {
      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'CPIAUCSL',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 60
          }
        })
      );

      return validateAPIResponse(response, 'FRED').data.observations;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch inflation rate');
    }
  },

  getCoreInflation: async () => {
    try {
      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'CPILFESL',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 60
          }
        })
      );

      return validateAPIResponse(response, 'FRED').data.observations;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch core inflation');
    }
  },

  // EMPLOYMENT METHODS
  getUnemploymentRate: async () => {
    try {
      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'UNRATE',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 60
          }
        })
      );

      return validateAPIResponse(response, 'FRED').data.observations;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch unemployment rate');
    }
  },

  getNonfarmPayrolls: async () => {
    try {
      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'PAYEMS',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 60
          }
        })
      );

      return validateAPIResponse(response, 'FRED').data.observations;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch nonfarm payrolls');
    }
  },

  // INTEREST RATES
  getFedFundsRate: async () => {
    try {
      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'DFF',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 252
          }
        })
      );

      return validateAPIResponse(response, 'FRED').data.observations;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch fed funds rate');
    }
  },

  getTreasuryYields: async () => {
    try {
      const [y2, y5, y10, y30] = await Promise.all([
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'DGS2',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 252
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'DGS5',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 252
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'DGS10',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 252
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'DGS30',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 252
          }
        })
      ].map(call => retryAPICall(() => call)));

      return validateAPIResponse({
        data: {
          '2year': y2.data.observations,
          '5year': y5.data.observations,
          '10year': y10.data.observations,
          '30year': y30.data.observations
        }
      }, 'FRED').data;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch treasury yields');
    }
  },

  // Get specific indicator data
  getIndicatorData: async (seriesId, limit = 100) => {
    try {
      validateParams(
        { seriesId },
        fredAPISchemas.seriesParams
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: seriesId,
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit
          }
        })
      );

      return validateAPIResponse(response, 'FRED').data.observations;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch indicator data');
    }
  },

  getGovernmentBonds: async () => {
    try {
      const [treasury, tips, longTerm] = await Promise.all([
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'DGS10',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 1
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'DFII10',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 1
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'DGS30',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 1
          }
        })
      ].map(call => retryAPICall(() => call)));

      return validateAPIResponse({
        data: {
          treasury10Y: treasury.data.observations[0],
          tips10Y: tips.data.observations[0],
          treasury30Y: longTerm.data.observations[0]
        }
      }, 'FRED').data;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch government bonds');
    }
  },

  getTreasuryRates: async () => {
    try {
      const maturities = ['DGS1MO', 'DGS3MO', 'DGS6MO', 'DGS1', 'DGS2', 'DGS5', 'DGS10', 'DGS30'];
      const requests = maturities.map(id => 
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: id,
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 1
          }
        })
      );

      const responses = await Promise.all(requests.map(req => retryAPICall(() => req)));
      
      return validateAPIResponse({
        data: maturities.reduce((acc, id, index) => {
          acc[id] = responses[index].data.observations[0];
          return acc;
        }, {})
      }, 'FRED').data;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch treasury rates');
    }
  },

  // ADDITIONAL ECONOMIC INDICATORS
  getEmploymentData: async () => {
    try {
      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'PAYEMS',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc'
          }
        })
      );

      return validateAPIResponse(response, 'FRED').data;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch employment data');
    }
  },

  getHousingData: async () => {
    try {
      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'HOUST',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc'
          }
        })
      );

      return validateAPIResponse(response, 'FRED').data;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch housing data');
    }
  },

  getIndustrialProduction: async () => {
    try {
      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'INDPRO',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc'
          }
        })
      );

      return validateAPIResponse(response, 'FRED').data;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch industrial production data');
    }
  },

  // MONETARY POLICY & MONEY SUPPLY
  getMoneySupply: async () => {
    try {
      const [m1, m2] = await Promise.all([
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'M1SL',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'M2SL',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 60
          }
        })
      ].map(call => retryAPICall(() => call)));

      return validateAPIResponse({
        data: {
          m1: m1.data.observations,
          m2: m2.data.observations
        }
      }, 'FRED').data;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch money supply data');
    }
  },

  // BALANCE OF TRADE
  getTradeBalance: async () => {
    try {
      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'BOPGSTB',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 40
          }
        })
      );

      return validateAPIResponse(response, 'FRED').data.observations;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch trade balance data');
    }
  },

  // CONSUMER METRICS
  getConsumerMetrics: async () => {
    try {
      const [confidence, spending, credit] = await Promise.all([
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'UMCSENT',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'PCE',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'TOTALSL',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 60
          }
        })
      ].map(call => retryAPICall(() => call)));

      return validateAPIResponse({
        data: {
          consumerConfidence: confidence.data.observations,
          consumerSpending: spending.data.observations,
          consumerCredit: credit.data.observations
        }
      }, 'FRED').data;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch consumer metrics');
    }
  },

  // BUSINESS CYCLE INDICATORS
  getBusinessCycleIndicators: async () => {
    try {
      const [leading, coincident] = await Promise.all([
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'USSLIND',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'USPHCI',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 60
          }
        })
      ].map(call => retryAPICall(() => call)));

      return validateAPIResponse({
        data: {
          leadingIndicators: leading.data.observations,
          coincidentIndicators: coincident.data.observations
        }
      }, 'FRED').data;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch business cycle indicators');
    }
  },

  // BANKING & FINANCIAL
  getBankingMetrics: async () => {
    try {
      const [reserves, loans, assets] = await Promise.all([
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'TOTRESNS',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'TOTLL',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'TLAACBW027SBOG',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 60
          }
        })
      ].map(call => retryAPICall(() => call)));

      return validateAPIResponse({
        data: {
          bankReserves: reserves.data.observations,
          bankLoans: loans.data.observations,
          bankAssets: assets.data.observations
        }
      }, 'FRED').data;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch banking metrics');
    }
  },

  // INTERNATIONAL COMPARISONS
  getInternationalComparisons: async (countries = ['USA', 'CHN', 'JPN', 'GBR', 'DEU']) => {
    try {
      validateParams(
        { countries },
        {
          countries: {
            required: true,
            type: 'array',
            validate: (value) => Array.isArray(value) && value.length > 0,
            message: 'Countries must be a non-empty array'
          }
        }
      );

      const requests = countries.map(country => 
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: `${country}NGDP`,
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 20
          }
        })
      );

      const responses = await Promise.all(requests.map(req => retryAPICall(() => req)));
      
      return validateAPIResponse({
        data: countries.reduce((acc, country, index) => {
          acc[country] = responses[index].data.observations;
          return acc;
        }, {})
      }, 'FRED').data;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch international comparisons');
    }
  },

  // REGIONAL DATA
  getRegionalData: async (region) => {
    try {
      validateParams(
        { region },
        {
          region: {
            required: true,
            type: 'string',
            validate: (value) => value && value.length === 2,
            message: 'Region must be a valid 2-letter state code'
          }
        }
      );

      const [gdp, employment, housing] = await Promise.all([
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: `${region}RGSP`,
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 20
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: `${region}UR`,
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: `${region}HPIS`,
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 60
          }
        })
      ].map(call => retryAPICall(() => call)));

      return validateAPIResponse({
        data: {
          gdp: gdp.data.observations,
          employment: employment.data.observations,
          housing: housing.data.observations
        }
      }, 'FRED').data;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch regional data');
    }
  },

  // DEBT & DEFICIT
  getNationalDebt: async () => {
    try {
      const [totalDebt, debtToGDP, deficit] = await Promise.all([
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'GFDEBTN',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 40
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'GFDEGDQ188S',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 40
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'FYFSD',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 40
          }
        })
      ].map(call => retryAPICall(() => call)));

      return validateAPIResponse({
        data: {
          totalDebt: totalDebt.data.observations,
          debtToGDP: debtToGDP.data.observations,
          deficit: deficit.data.observations
        }
      }, 'FRED').data;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch national debt data');
    }
  },

  // PRODUCTIVITY & CAPACITY
  getProductivityMetrics: async () => {
    try {
      const [productivity, capacity, unitLabor] = await Promise.all([
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'OPHNFB',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 40
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'TCU',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'ULCNFB',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 40
          }
        })
      ].map(call => retryAPICall(() => call)));

      return validateAPIResponse({
        data: {
          productivity: productivity.data.observations,
          capacityUtilization: capacity.data.observations,
          unitLaborCosts: unitLabor.data.observations
        }
      }, 'FRED').data;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch productivity metrics');
    }
  },

  // RETAIL & INVENTORIES
  getRetailAndInventories: async () => {
    try {
      const [retail, inventories, sales] = await Promise.all([
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'RSXFS',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'TOTBUSI',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'CMRMTSPL',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 60
          }
        })
      ].map(call => retryAPICall(() => call)));

      return validateAPIResponse({
        data: {
          retailSales: retail.data.observations,
          businessInventories: inventories.data.observations,
          manufacturingSales: sales.data.observations
        }
      }, 'FRED').data;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch retail and inventories data');
    }
  },

  // HOUSING MARKET INDICATORS
  getHousingMarketIndicators: async () => {
    try {
      const [starts, permits, prices, sales] = await Promise.all([
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'HOUST',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'PERMIT',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'CSUSHPISA',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'HSN1F',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 60
          }
        })
      ].map(call => retryAPICall(() => call)));

      return validateAPIResponse({
        data: {
          housingStarts: starts.data.observations,
          buildingPermits: permits.data.observations,
          homePrices: prices.data.observations,
          newHomeSales: sales.data.observations
        }
      }, 'FRED').data;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch housing market indicators');
    }
  },

  // MANUFACTURING & INDUSTRIAL
  getManufacturingData: async () => {
    try {
      const [pmi, production, orders, shipments] = await Promise.all([
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'NAPM',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'INDPRO',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'DGORDER',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'MVMTD',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 60
          }
        })
      ].map(call => retryAPICall(() => call)));

      return validateAPIResponse({
        data: {
          pmi: pmi.data.observations,
          industrialProduction: production.data.observations,
          durableGoods: orders.data.observations,
          manufacturingShipments: shipments.data.observations
        }
      }, 'FRED').data;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch manufacturing data');
    }
  },

  // LABOR MARKET DETAILS
  getDetailedLaborMarket: async () => {
    try {
      const [participation, earnings, hours, claims] = await Promise.all([
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'CIVPART',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'CES0500000003',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'AWHNONAG',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'ICSA',
            api_key: apiKeys.fred,
            file_type: 'json',
            sort_order: 'desc',
            limit: 60
          }
        })
      ]);

      return {
        laborForceParticipation: participation.data.observations,
        averageHourlyEarnings: earnings.data.observations,
        averageWeeklyHours: hours.data.observations,
        initialJoblessClaims: claims.data.observations
      };
    } catch (error) {
      console.error('FRED Detailed Labor Market Error:', error);
      throw new Error(`Failed to fetch detailed labor market data: ${error.message}`);
    }
  },

  // Add these regional economic methods
  getStateEconomicData: async (state) => {
    try {
      const [gdp, employment, housing, income, exports] = await Promise.all([
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: `${state}NGSP`,  // State GDP
            api_key: apiKeys.fred,
            file_type: 'json',
            limit: 40
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: `${state}NA`,    // State Employment
            api_key: apiKeys.fred,
            file_type: 'json',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: `${state}HPIS`,  // State Housing Price Index
            api_key: apiKeys.fred,
            file_type: 'json',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: `${state}PCPI`,  // State Per Capita Income
            api_key: apiKeys.fred,
            file_type: 'json',
            limit: 40
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: `${state}TEXP`,  // State Exports
            api_key: apiKeys.fred,
            file_type: 'json',
            limit: 40
          }
        })
      ]);

      return {
        gdp: gdp.data.observations,
        employment: employment.data.observations,
        housing: housing.data.observations,
        income: income.data.observations,
        exports: exports.data.observations
      };
    } catch (error) {
      console.error('FRED State Economic Data Error:', error);
      throw new Error(`Failed to fetch state economic data: ${error.message}`);
    }
  },

  getMetropolitanData: async (metro) => {
    try {
      validateParams(
        { metro },
        {
          metro: {
            required: true,
            type: 'string',
            validate: (value) => value && value.length > 0,
            message: 'Metropolitan area code is required'
          }
        }
      );

      const [employment, housing, wages] = await Promise.all([
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: `${metro}URN`,
            api_key: apiKeys.fred,
            file_type: 'json',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: `${metro}HPIS`,
            api_key: apiKeys.fred,
            file_type: 'json',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: `${metro}WAGE`,
            api_key: apiKeys.fred,
            file_type: 'json',
            limit: 40
          }
        })
      ].map(call => retryAPICall(() => call)));

      return validateAPIResponse({
        data: {
          employment: employment.data.observations,
          housing: housing.data.observations,
          wages: wages.data.observations
        }
      }, 'FRED').data;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch metropolitan data');
    }
  },

  // Add these additional comprehensive methods

  // INTERNATIONAL ECONOMIC METRICS
  getInternationalEconomicMetrics: async (country) => {
    try {
      validateParams(
        { country },
        {
          country: {
            required: true,
            type: 'string',
            validate: (value) => value && value.length === 3,
            message: 'Country must be a valid 3-letter ISO code'
          }
        }
      );

      const [gdp, inflation, trade, employment, rates] = await Promise.all([
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: `${country}NGDP`,
            api_key: apiKeys.fred,
            file_type: 'json',
            limit: 40
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: `${country}CPI`,
            api_key: apiKeys.fred,
            file_type: 'json',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: `${country}BPGS`,
            api_key: apiKeys.fred,
            file_type: 'json',
            limit: 40
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: `${country}UR`,
            api_key: apiKeys.fred,
            file_type: 'json',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: `${country}IR`,
            api_key: apiKeys.fred,
            file_type: 'json',
            limit: 60
          }
        })
      ].map(call => retryAPICall(() => call)));

      return validateAPIResponse({
        data: {
          gdp: gdp.data.observations,
          inflation: inflation.data.observations,
          tradeBalance: trade.data.observations,
          unemployment: employment.data.observations,
          interestRates: rates.data.observations
        }
      }, 'FRED').data;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch international economic metrics');
    }
  },

  // DETAILED FINANCIAL SECTOR METRICS
  getFinancialSectorMetrics: async () => {
    try {
      const [bankingIndex, financialConditions, creditSpread, volatility, bankStress] = await Promise.all([
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'DSPIC',
            api_key: apiKeys.fred,
            file_type: 'json',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'NFCI',
            api_key: apiKeys.fred,
            file_type: 'json',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'BAA10Y',
            api_key: apiKeys.fred,
            file_type: 'json',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'VIXCLS',
            api_key: apiKeys.fred,
            file_type: 'json',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'STLFSI2',
            api_key: apiKeys.fred,
            file_type: 'json',
            limit: 60
          }
        })
      ].map(call => retryAPICall(() => call)));

      return validateAPIResponse({
        data: {
          bankingIndex: bankingIndex.data.observations,
          financialConditions: financialConditions.data.observations,
          creditSpread: creditSpread.data.observations,
          marketVolatility: volatility.data.observations,
          financialStress: bankStress.data.observations
        }
      }, 'FRED').data;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch financial sector metrics');
    }
  },

  // COMPREHENSIVE PRICE INDICES
  getPriceIndices: async () => {
    try {
      const [consumer, producer, importPrices, exportPrices, commodity] = await Promise.all([
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'CPIAUCSL',
            api_key: apiKeys.fred,
            file_type: 'json',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'PPIACO',
            api_key: apiKeys.fred,
            file_type: 'json',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'IR',
            api_key: apiKeys.fred,
            file_type: 'json',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'IQ',
            api_key: apiKeys.fred,
            file_type: 'json',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'PPICEM',
            api_key: apiKeys.fred,
            file_type: 'json',
            limit: 60
          }
        })
      ].map(call => retryAPICall(() => call)));

      return validateAPIResponse({
        data: {
          consumerPrices: consumer.data.observations,
          producerPrices: producer.data.observations,
          importPrices: importPrices.data.observations,
          exportPrices: exportPrices.data.observations,
          commodityPrices: commodity.data.observations
        }
      }, 'FRED').data;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch price indices');
    }
  },

  // Add these final methods to complete FRED API

  // CREDIT MARKET CONDITIONS
  getCreditMarketConditions: async () => {
    try {
      const [consumerCredit, mortgageRates, bankLending, creditCardRates] = await Promise.all([
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'TOTALSL',
            api_key: apiKeys.fred,
            file_type: 'json',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'MORTGAGE30US',
            api_key: apiKeys.fred,
            file_type: 'json',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'BUSLOANS',
            api_key: apiKeys.fred,
            file_type: 'json',
            limit: 60
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'TERMCBCCALLNS',
            api_key: apiKeys.fred,
            file_type: 'json',
            limit: 60
          }
        })
      ].map(call => retryAPICall(() => call)));

      return validateAPIResponse({
        data: {
          consumerCredit: consumerCredit.data.observations,
          mortgageRates: mortgageRates.data.observations,
          commercialLoans: bankLending.data.observations,
          creditCardRates: creditCardRates.data.observations
        }
      }, 'FRED').data;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch credit market conditions');
    }
  },

  // VELOCITY OF MONEY
  getMoneyVelocity: async () => {
    try {
      const [m1Velocity, m2Velocity] = await Promise.all([
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'M1V',
            api_key: apiKeys.fred,
            file_type: 'json',
            limit: 40
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'M2V',
            api_key: apiKeys.fred,
            file_type: 'json',
            limit: 40
          }
        })
      ].map(call => retryAPICall(() => call)));

      return validateAPIResponse({
        data: {
          m1Velocity: m1Velocity.data.observations,
          m2Velocity: m2Velocity.data.observations
        }
      }, 'FRED').data;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch money velocity data');
    }
  },

  // GOVERNMENT SPENDING
  getGovernmentSpending: async () => {
    try {
      const [federal, state, defense, education] = await Promise.all([
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'FGEXPND',
            api_key: apiKeys.fred,
            file_type: 'json',
            limit: 40
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'SLEXPND',
            api_key: apiKeys.fred,
            file_type: 'json',
            limit: 40
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'DEFSPEND',
            api_key: apiKeys.fred,
            file_type: 'json',
            limit: 40
          }
        }),
        rateLimitedAxios.request({
          url: `${BASE_URL}/series/observations`,
          params: {
            series_id: 'EDUSPEND',
            api_key: apiKeys.fred,
            file_type: 'json',
            limit: 40
          }
        })
      ].map(call => retryAPICall(() => call)));

      return validateAPIResponse({
        data: {
          federalSpending: federal.data.observations,
          stateSpending: state.data.observations,
          defenseSpending: defense.data.observations,
          educationSpending: education.data.observations
        }
      }, 'FRED').data;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch government spending data');
    }
  },

  // Series Information
  getSeriesInfo: async (seriesId) => {
    try {
      validateParams(
        { seriesId },
        { seriesId: fredAPISchemas.seriesParams.seriesId }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: `${BASE_URL}/series`,
          params: {
            series_id: seriesId,
            api_key: apiKeys.fred,
            file_type: 'json'
          }
        })
      );

      return validateAPIResponse(response, 'FRED').data;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch series info');
    }
  },

  // Category Methods
  getCategoryData: async (categoryId) => {
    try {
      validateParams(
        { categoryId },
        {
          categoryId: {
            required: true,
            type: 'number',
            validate: (value) => value > 0,
            message: 'Category ID must be positive'
          }
        }
      );

      const response = await retryAPICall(() => 
        rateLimitedAxios.request({
          url: `${BASE_URL}/category/series`,
          params: {
            category_id: categoryId,
            api_key: apiKeys.fred,
            file_type: 'json'
          }
        })
      );

      return validateAPIResponse(response, 'FRED').data;
    } catch (error) {
      handleAPIError(error, 'FRED', 'fetch category data');
    }
  }
};

export default fredAPI; 