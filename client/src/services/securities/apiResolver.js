import { SECURITY_TYPES } from './types';
import { providerFactory } from '../apiServices/providerFactory';
import { getBestProvider, getValidProviders } from './config/providerStrategy';
import { logger } from '../../utils/logger';

/**
 * Returns appropriate APIs for a given security type
 * @param {string} securityType - One of SECURITY_TYPES
 * @returns {Object} Object containing relevant APIs
 */
export function getAPIsForSecurity(securityType) {
    switch (securityType) {
        case SECURITY_TYPES.STOCK:
            return {
                price: [alphaVantageAPI, fmpAPI],
                fundamentals: [fmpAPI],
                technicals: [alphaVantageAPI],
                news: [alphaVantageAPI, fmpAPI]
            };

        case SECURITY_TYPES.CRYPTO:
            return {
                price: [alphaVantageAPI, finnhubAPI],
                market: [finnhubAPI],
                news: [finnhubAPI]
            };

        case SECURITY_TYPES.FOREX:
            return {
                price: [alphaVantageAPI],
                market: [finnhubAPI]
            };

        case SECURITY_TYPES.ETF:
            return {
                price: [alphaVantageAPI, fmpAPI],
                holdings: [fmpAPI],
                performance: [fmpAPI]
            };

        case SECURITY_TYPES.OPTION:
            return {
                price: [polygonAPI],
                chain: [polygonAPI],
                greeks: [polygonAPI]
            };

        case SECURITY_TYPES.FUTURES:
            return {
                price: [finnhubAPI],
                market: [finnhubAPI]
            };

        case SECURITY_TYPES.BOND:
            return {
                price: [fmpAPI],
                yield: [fmpAPI],
                ratings: [fmpAPI]
            };

        case SECURITY_TYPES.INDEX:
            return {
                price: [alphaVantageAPI, yahooFinanceAPI],
                components: [fmpAPI]
            };

        default:
            return {
                price: [alphaVantageAPI],
                general: [fmpAPI]
            };
    }
}

export function getPrimaryAPI(securityType, dataType = 'price') {
    const apis = getAPIsForSecurity(securityType);
    return apis[dataType]?.[0] || apis.general?.[0];
}

export class APIResolver {
    async getData(securityType, dataType, symbol, options = {}) {
        const provider = options.provider || getBestProvider(securityType, dataType);
        
        if (!provider) {
            throw new Error(`No provider available for ${securityType} ${dataType}`);
        }

        try {
            const api = providerFactory.getProvider(provider);
            return await api.getData(dataType, symbol, options);
        } catch (error) {
            logger.error(`Primary provider ${provider} failed:`, error);
            
            // Try fallback providers
            const fallbacks = getValidProviders(securityType, dataType)
                .filter(p => p !== provider);

            for (const fallback of fallbacks) {
                try {
                    const fallbackApi = providerFactory.getProvider(fallback);
                    return await fallbackApi.getData(dataType, symbol, options);
                } catch (fallbackError) {
                    logger.warn(`Fallback provider ${fallback} failed:`, fallbackError);
                }
            }

            throw new Error(`All providers failed for ${securityType} ${dataType}`);
        }
    }
} 