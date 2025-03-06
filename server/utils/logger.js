const winston = require('winston');
const path = require('path');

// Custom format to control log detail level
const customFormat = winston.format.printf(({ level, message, timestamp }) => {
    // Only show detailed logs for errors
    if (level === 'error') {
        return `${timestamp} ${level}: ${message}`;
    }
    // For other levels, keep it minimal
    return `${level}: ${message}`;
});

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        customFormat
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
            // Filter out debug logs in production
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
        }),
        // Only log errors to file
        new winston.transports.File({ 
            filename: path.join(__dirname, '../logs/error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

// Add rate limit to logging
const logCache = new Map();
const LOG_RATE_LIMIT = 1000; // 1 second

const rateLimitedLogger = {
    info: (message, ...args) => {
        const key = `info:${message}`;
        const now = Date.now();
        if (!logCache.has(key) || now - logCache.get(key) > LOG_RATE_LIMIT) {
            logger.info(message, ...args);
            logCache.set(key, now);
        }
    },
    error: logger.error.bind(logger),
    warn: logger.warn.bind(logger),
    debug: logger.debug.bind(logger)
};

module.exports = {
    logger: rateLimitedLogger
}; 