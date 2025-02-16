const os = require('os');

// Memory monitoring
const monitorMemory = () => {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memoryUsage = (usedMem / totalMem) * 100;

  // Alert if memory usage is too high
  if (memoryUsage > 85) {
    console.warn(`High memory usage: ${memoryUsage.toFixed(2)}%`);
    // Implement cleanup strategies
    cleanupOldCache();
    gc(); // Force garbage collection if --expose-gc flag is used
  }
};

// Cache cleanup
const cleanupOldCache = () => {
  // Implement cache cleanup logic
};

// Memory optimization settings
const memoryOptimization = {
  maxCacheSize: os.totalmem() * 0.2, // 20% of total RAM for cache
  dataChunkSize: 1000, // Process data in chunks
  gcInterval: 300000 // Run garbage collection every 5 minutes
};

module.exports = {
  monitorMemory,
  memoryOptimization
}; 