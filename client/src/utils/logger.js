const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
};

const currentLevel = LOG_LEVELS.DEBUG; // Set to DEBUG during development

export const logger = {
    debug: (...args) => {
        if (currentLevel <= LOG_LEVELS.DEBUG) {
            console.log('[DEBUG]', ...args);
        }
    },
    info: (...args) => {
        if (currentLevel <= LOG_LEVELS.INFO) {
            console.log('[INFO]', ...args);
        }
    },
    warn: (...args) => {
        if (currentLevel <= LOG_LEVELS.WARN) {
            console.warn('[WARN]', ...args);
        }
    },
    error: (...args) => {
        if (currentLevel <= LOG_LEVELS.ERROR) {
            console.error('[ERROR]', ...args);
        }
    }
}; 