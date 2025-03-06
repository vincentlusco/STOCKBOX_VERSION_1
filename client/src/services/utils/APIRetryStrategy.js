import { logger } from '../../utils/logger';

export class APIRetryStrategy {
    constructor(maxRetries = 3, backoffMs = 1000) {
        this.maxRetries = maxRetries;
        this.backoffMs = backoffMs;
    }

    async execute(operation) {
        let lastError;
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                if (this.shouldRetry(error)) {
                    logger.warn(`Retry attempt ${attempt} of ${this.maxRetries}`);
                    await this.wait(attempt);
                    continue;
                }
                break;
            }
        }
        logger.error('Max retries reached:', lastError);
        throw lastError;
    }

    shouldRetry(error) {
        return error.message.includes('rate limit') || 
               error.message.includes('timeout') ||
               error.status === 429;
    }

    wait(attempt) {
        const delay = this.backoffMs * Math.pow(2, attempt - 1);
        return new Promise(resolve => setTimeout(resolve, delay));
    }
} 