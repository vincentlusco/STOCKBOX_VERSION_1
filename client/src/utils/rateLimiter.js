/**
 * Rate limiter for API calls
 */
export const rateLimit = (axios, { maxRequests, perMilliseconds }) => {
  const queue = [];
  let lastReset = Date.now();
  let requestCount = 0;

  const processQueue = () => {
    if (queue.length === 0) return;
    
    const now = Date.now();
    if (now - lastReset >= perMilliseconds) {
      requestCount = 0;
      lastReset = now;
    }

    while (queue.length > 0 && requestCount < maxRequests) {
      const { resolve, config } = queue.shift();
      requestCount++;
      resolve(axios(config));
    }
  };

  return {
    request: (config) => {
      return new Promise((resolve) => {
        queue.push({ resolve, config });
        processQueue();
      });
    }
  };
};

/**
 * Simple rate limiter class for non-axios requests
 */
export class RateLimiter {
    constructor(maxRequests, timeWindow) {
        this.maxRequests = maxRequests;
        this.timeWindow = timeWindow;
        this.requests = [];
    }

    async acquire() {
        const now = Date.now();
        
        // Remove expired timestamps
        this.requests = this.requests.filter(
            timestamp => now - timestamp < this.timeWindow
        );

        if (this.requests.length >= this.maxRequests) {
            // Wait until the oldest request expires
            const oldestRequest = this.requests[0];
            const waitTime = this.timeWindow - (now - oldestRequest);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        this.requests.push(now);
    }
} 