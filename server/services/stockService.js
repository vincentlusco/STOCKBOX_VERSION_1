const yahooFinance = require('./api/yahooFinance');
const newsAPI = require('./api/newsAPI');
const cacheService = require('./cacheService');
const { logger } = require('../utils/logger');

class StockService {
  constructor() {
    this.activeSubscriptions = new Set();
    this.updateInterval = null;
  }

  init() {
    logger.info('Stock service initialized');
  }

  // Get real-time stock data
  async getPrice(symbol) {
    try {
      if (!symbol) {
        throw new Error('Symbol is required');
      }

      logger.info(`Getting price for symbol: ${symbol}`);
      const data = await yahooFinance.getQuote(symbol.toUpperCase());
      
      return {
        success: true,
        data: data
      };
    } catch (error) {
      logger.error(`Failed to get price for ${symbol}:`, error);
      throw error;
    }
  }

  async getTechnicals(symbol) {
    try {
      const cached = cacheService.get('TECHNICAL', symbol);
      if (cached) return cached;

      const data = await yahooFinance.getTechnicalData(symbol);
      cacheService.set('TECHNICAL', symbol, data);
      return data;
    } catch (error) {
      logger.error(`Failed to fetch technicals for ${symbol}:`, error);
      throw error;
    }
  }

  async getFundamentals(symbol) {
    try {
      logger.info(`[StockService] Getting fundamentals for ${symbol}`);
      const cached = cacheService.get('FUNDAMENTAL', symbol);
      
      if (cached) {
        logger.info(`[StockService] Returning cached fundamentals for ${symbol}`);
        return cached;
      }

      logger.info(`[StockService] Fetching fresh fundamentals for ${symbol}`);
      const data = await yahooFinance.getFundamentals(symbol);
      logger.debug(`[StockService] Received fundamentals data:`, data);

      if (!data || !data.data) {
        logger.error(`[StockService] Invalid fundamentals data for ${symbol}`);
        throw new Error('Invalid fundamentals data received');
      }

      logger.info(`[StockService] Caching fundamentals for ${symbol}`);
      cacheService.set('FUNDAMENTAL', symbol, data);
      return data;
    } catch (error) {
      logger.error(`[StockService] Failed to fetch fundamentals for ${symbol}:`, {
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  async getNews(symbol) {
    try {
      const cached = cacheService.get('NEWS', symbol);
      if (cached) return cached;

      const data = await newsAPI.getCompanyNews(symbol);
      
      // Cache for 15 minutes
      cacheService.set('NEWS', symbol, data);
      return data;
    } catch (error) {
      logger.error(`Failed to fetch news for ${symbol}:`, error);
      throw error;
    }
  }

  async getEarnings(symbol) {
    try {
      const cached = cacheService.get('EARNINGS', symbol);
      if (cached) return cached;

      const data = await yahooFinance.getEarningsData(symbol);
      cacheService.set('EARNINGS', symbol, data);
      return data;
    } catch (error) {
      logger.error(`Failed to fetch earnings for ${symbol}:`, error);
      throw error;
    }
  }

  // Subscribe to real-time updates
  subscribeToStock(symbol) {
    if (!this.activeSubscriptions.has(symbol)) {
      this.activeSubscriptions.add(symbol);
      
      // Start updates if this is the first subscription
      if (this.activeSubscriptions.size === 1) {
        this.startUpdates();
      }
    }
  }

  // Unsubscribe from updates
  unsubscribeFromStock(symbol) {
    this.activeSubscriptions.delete(symbol);
    
    // Stop updates if no more subscriptions
    if (this.activeSubscriptions.size === 0) {
      this.stopUpdates();
    }
  }

  // Start periodic updates
  startUpdates() {
    this.updateInterval = setInterval(async () => {
      for (const symbol of this.activeSubscriptions) {
        await cacheService.refreshData(`stock_${symbol}`, async () => {
          return await this.fetchFromExternalAPI(symbol);
        });
      }
    }, 60000); // Update every minute
  }

  // Stop updates
  stopUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  // Cleanup resources
  cleanup() {
    this.stopUpdates();
    this.activeSubscriptions.clear();
    cacheService.clearAll();
  }

  // Add missing methods from your outline
  async getDividends(symbol) {
    try {
      const cached = cacheService.get('DIVIDENDS', symbol);
      if (cached) return cached;

      const data = await yahooFinance.getDividends(symbol);
      cacheService.set('DIVIDENDS', symbol, data);
      return data;
    } catch (error) {
      logger.error(`Failed to fetch dividends for ${symbol}:`, error);
      throw error;
    }
  }

  async getInstitutionalHoldings(symbol) {
    try {
      const cached = cacheService.get('INSTITUTIONAL', symbol);
      if (cached) return cached;

      const data = await yahooFinance.getInstitutionalHoldings(symbol);
      cacheService.set('INSTITUTIONAL', symbol, data);
      return data;
    } catch (error) {
      logger.error(`Failed to fetch institutional holdings for ${symbol}:`, error);
      throw error;
    }
  }

  async getInsiderTransactions(symbol) {
    try {
      const cached = cacheService.get('INSIDER', symbol);
      if (cached) return cached;

      const data = await yahooFinance.getInsiderTransactions(symbol);
      cacheService.set('INSIDER', symbol, data);
      return data;
    } catch (error) {
      logger.error(`Failed to fetch insider transactions for ${symbol}:`, error);
      throw error;
    }
  }

  async getPeerComparison(symbol) {
    try {
      const cached = cacheService.get('PEERS', symbol);
      if (cached) return cached;

      const data = await yahooFinance.getPeerComparison(symbol);
      cacheService.set('PEERS', symbol, data);
      return data;
    } catch (error) {
      logger.error(`Failed to fetch peer comparison for ${symbol}:`, error);
      throw error;
    }
  }
}

module.exports = new StockService(); 