import { STOCK_TYPES } from '../types/stock';
import { logger } from '../../../utils/logger';
import { SecurityType } from '../../../types/securities';

export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class SecurityValidators {
    static validateSymbol(symbol) {
        if (!symbol || typeof symbol !== 'string') {
            throw new ValidationError('Symbol is required');
        }

        const cleaned = symbol.toUpperCase().trim();
        const symbolRegex = /^[A-Z]{1,5}(\.[A-Z]{1,2})?$/;
        
        if (!symbolRegex.test(cleaned)) {
            throw new ValidationError('Invalid symbol format');
        }

        return cleaned;
    }

    static validateDateRange(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new ValidationError('Invalid date format');
        }
        
        if (end < start) {
            throw new ValidationError('End date must be after start date');
        }

        return { start, end };
    }

    static validateCommandInput(command, symbol, options = {}) {
        try {
            return {
                symbol: this.validateSymbol(symbol),
                ...options
            };
        } catch (error) {
            logger.error('Command validation failed:', error);
            throw error;
        }
    }

    static validateStockType(type) {
        logger.debug('Validating stock type:', type);
        if (!type || !Object.values(STOCK_TYPES).includes(type)) {
            logger.error('Invalid stock type:', type, 'Valid types:', STOCK_TYPES);
            throw new ValidationError(`Invalid stock type: ${type}`);
        }
        return type;
    }

    static validateCommandForType(command, securityType) {
        // This should be moved to the commands module
        return true; // Temporary fix
    }

    static validateFetcherInput(symbol, type) {
        if (!symbol) {
            throw new ValidationError('Symbol is required');
        }
        
        if (typeof symbol !== 'string') {
            throw new ValidationError('Symbol must be a string');
        }

        if (type && !Object.values(SecurityType).includes(type)) {
            throw new ValidationError(`Invalid security type: ${type}`);
        }

        return {
            symbol: symbol.toUpperCase(),
            type: type || SecurityType.COMMON
        };
    }

    static validatePeerData(data) {
        if (!data || !Array.isArray(data.peers) || data.peers.length === 0) {
            return false;
        }

        const requiredFields = ['symbol', 'marketCap', 'peRatio'];
        return data.peers.every(peer => 
            requiredFields.every(field => peer[field] !== undefined)
        );
    }
}

export const validateFetcherInput = SecurityValidators.validateFetcherInput; 