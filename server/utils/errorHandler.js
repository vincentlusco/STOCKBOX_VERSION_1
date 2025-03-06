const { logger } = require('./logger');

class APIError extends Error {
    constructor(message, statusCode, source) {
        super(message);
        this.statusCode = statusCode;
        this.source = source;
        this.timestamp = new Date().toISOString();
    }
}

const errorHandler = {
    handleAPIError: (error, source) => {
        logger.error(`API Error from ${source}:`, error);
        if (error.response) {
            return new APIError(
                error.response.data?.message || error.message,
                error.response.status,
                source
            );
        }
        return new APIError(error.message, 500, source);
    },

    handleDatabaseError: (error) => {
        logger.error('Database Error:', error);
        return new APIError(error.message, 500, 'database');
    },

    handleValidationError: (error) => {
        logger.error('Validation Error:', error);
        return new APIError(error.message, 400, 'validation');
    }
};

module.exports = {
    APIError,
    errorHandler
}; 