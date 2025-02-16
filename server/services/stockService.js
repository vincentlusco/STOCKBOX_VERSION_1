const cacheService = require('./cacheService');

class StockService {
  constructor() {
    this.activeSubscriptions = new Set();
    this.updateInterval = null;
  }

  // Get real-time stock data
  async getStockData(symbol) {
    const cacheKey = `stock_${symbol}`;
    
    return await cacheService.getData(cacheKey, async () => {
      // Fetch fresh data from external API
      return await this.fetchFromExternalAPI(symbol);
    });
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
}

module.exports = new StockService(); 