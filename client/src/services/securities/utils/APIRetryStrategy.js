import { logger } from '../../../utils/logger';

export class APIRetryStrategy {
    constructor(maxRetries = 3, delayMs = 1000) {
        this.maxRetries = maxRetries;
        this.delayMs = delayMs;
    }

    async execute(operation) {
        let lastError;
        
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;
                
                // Don't retry on certain errors
                if (error.response?.status === 404 || 
                    error.response?.status === 401) {
                    throw error;
                }
                
                // Exponential backoff
                if (attempt < this.maxRetries) {
                    const delay = this.delayMs * Math.pow(2, attempt - 1);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        throw lastError;
    }
} 