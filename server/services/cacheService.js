const NodeCache = require('node-cache');
const config = require('../config/lowMemoryConfig');

// Initialize cache with 15 minutes standard TTL
const cache = new NodeCache({ 
  stdTTL: 900,              // Reduced to 15 minutes
  checkperiod: 120,         // Check every 2 minutes
  maxKeys: 50,              // Reduced to 50 items
  useClones: false,
  deleteOnExpire: true,
  maxSize: 1024 * 1024 * 10 // 10MB max cache size
});

// Add size-based cleanup
const calculateSize = (obj) => {
  return Buffer.byteLength(JSON.stringify(obj));
};

cache.on('set', (key, value) => {
  const totalSize = Object.values(cache.keys()).reduce((size, k) => {
    return size + calculateSize(cache.get(k));
  }, 0);

  if (totalSize > cache.maxSize) {
    const oldestKey = cache.keys().sort((a, b) => {
      return cache.getTtl(a) - cache.getTtl(b);
    })[0];
    cache.del(oldestKey);
  }
});

const cacheService = {
  // Get data with optional fresh fetch
  async getData(key, fetchFunction) {
    let data = cache.get(key);
    
    if (data === undefined) {
      data = await fetchFunction();
      cache.set(key, data);
    }
    
    return data;
  },

  // Force refresh data
  async refreshData(key, fetchFunction) {
    const data = await fetchFunction();
    cache.set(key, data);
    return data;
  },

  // Remove specific data
  invalidate(key) {
    cache.del(key);
  },

  // Clear all cache
  clearAll() {
    cache.flushAll();
  }
};

module.exports = cacheService; 