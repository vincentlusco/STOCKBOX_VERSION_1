class RateLimit {
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
            const oldestRequest = this.requests[0];
            const waitTime = this.timeWindow - (now - oldestRequest);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            return this.acquire(); // Try again after waiting
        }

        this.requests.push(now);
    }
}

module.exports = RateLimit; 