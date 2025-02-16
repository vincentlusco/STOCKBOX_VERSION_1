const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

const redis = new Redis({
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false
});

const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    store: new RedisStore({
      client: redis,
      prefix: 'rl:',
      points: max,
      duration: windowMs / 1000
    }),
    windowMs,
    max,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests, please try again later.'
      });
    }
  });
};

module.exports = {
  apiLimiter: createRateLimiter(),
  stockDataLimiter: createRateLimiter(60 * 1000, 30) // 30 requests per minute
}; 