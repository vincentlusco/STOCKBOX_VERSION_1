import { logger } from '../utils/logger';

export const handleCommandError = (error) => {
    logger.error('Command error:', error);

    if (error.response) {
        // Server responded with error
        const message = error.response.data?.error || error.message;
        return `Error: ${message}`;
    }

    if (error.request) {
        // Request made but no response
        return 'Error: Server not responding. Please try again later.';
    }

    // Something else went wrong
    return `Error: ${error.message}`;
}; 