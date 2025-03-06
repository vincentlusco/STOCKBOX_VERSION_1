export function getErrorMessage(error) {
    // API-specific errors
    if (error.message.includes('Rate limit')) {
        return 'Service temporarily busy. Please try again in a moment.';
    }
    if (error.message.includes('API key')) {
        return 'Service authentication error. Please try again later.';
    }
    if (error.message.includes('not found')) {
        return 'Symbol not found. Please verify and try again.';
    }

    // Data-specific errors
    if (error.message.includes('not available')) {
        return error.message;
    }
    if (error.message.includes('Invalid')) {
        return 'Invalid input. Please check your command and try again.';
    }

    // Type-specific errors
    if (error.message.includes('security type')) {
        return 'This command is not available for this type of security.';
    }

    // Generic error
    return 'Command failed. Please try again later.';
}

// Need to create centralized error handling
export class CommandError extends Error {
    constructor(message, command, symbol) {
        super(message);
        this.command = command;
        this.symbol = symbol;
    }
} 