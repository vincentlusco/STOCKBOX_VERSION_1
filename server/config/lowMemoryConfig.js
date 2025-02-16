const config = {
  cache: {
    maxItems: 100,          // Reduced from 1000
    checkPeriod: 300,       // 5 minutes
    stdTTL: 1800           // 30 minutes
  },
  mongodb: {
    // Even more aggressive memory settings
    poolSize: 3,            // Further reduced from 5
    maxPoolSize: 3,
    wtimeoutMS: 2500,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    // Add these memory-saving options
    autoIndex: false,       // Don't build indexes automatically
    minPoolSize: 1,         // Minimum pool size
    maxIdleTimeMS: 30000,   // Close idle connections after 30 seconds
  },
  websocket: {
    maxClients: 20,        // Limit concurrent connections
    heartbeatInterval: 30000
  }
};

module.exports = config; 