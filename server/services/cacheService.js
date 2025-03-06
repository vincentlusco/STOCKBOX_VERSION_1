const NodeCache = require('node-cache');

// Cache TTL values in seconds
const TTL = {
    PRICE: 30,          // 30 seconds for price data
    TECHNICAL: 300,     // 5 minutes for technical data
    FUNDAMENTAL: 3600,  // 1 hour for fundamental data
    NEWS: 900,         // 15 minutes for news
    DIVIDENDS: 3600,   // 1 hour for dividends
    EARNINGS: 3600     // 1 hour for earnings
};

class CacheService {
    constructor() {
        this.cache = new NodeCache({
            stdTTL: 600,  // Default 10 minutes
            checkperiod: 120  // Check for expired keys every 2 minutes
        });
    }

    init() {
        console.log('Cache service initialized');
    }

    getCacheKey(type, symbol) {
        return `${type}_${symbol.toUpperCase()}`;
    }

    get(type, symbol) {
        const key = this.getCacheKey(type, symbol);
        return this.cache.get(key);
    }

    set(type, symbol, data) {
        const key = this.getCacheKey(type, symbol);
        return this.cache.set(key, data, TTL[type] || 600);
    }

    invalidate(type, symbol) {
        const key = this.getCacheKey(type, symbol);
        this.cache.del(key);
    }
}

module.exports = new CacheService(); 