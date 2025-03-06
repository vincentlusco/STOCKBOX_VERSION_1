export class RateLimiter {
    constructor(maxRequests, timeWindow) {
        this.maxRequests = maxRequests;
        this.timeWindow = timeWindow;
        this.requests = [];
    }

    async acquire() {
        const now = Date.now();
        this.requests = this.requests.filter(time => now - time < this.timeWindow);
        
        if (this.requests.length >= this.maxRequests) {
            const oldestRequest = this.requests[0];
            const waitTime = this.timeWindow - (now - oldestRequest);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        this.requests.push(now);
    }
}

// Add API-specific rate limiters
export const rateLimiters = {
    YAHOO: new RateLimiter(30, 60000),  // 30 requests per minute
    FMP: new RateLimiter(10, 60000),    // 10 requests per minute
    ALPHA_VANTAGE: new RateLimiter(5, 60000), // 5 requests per minute
    FINNHUB: new RateLimiter(30, 60000)  // 30 requests per minute
};

// Add rate limiting middleware
export async function withRateLimit(apiName, callback) {
    const limiter = rateLimiters[apiName];
    if (!limiter) {
        throw new Error(`No rate limiter defined for ${apiName}`);
    }
    
    await limiter.acquire();
    return callback();
} 