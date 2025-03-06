const axios = require('axios');
const { logger } = require('../../utils/logger');

class PolygonService {
    constructor() {
        this.apiKey = 'fJ3kzs0p9VcnaEZFWzy71yY1boZSrWmY'; // From keys.backup
        this.baseURL = 'https://api.polygon.io';
    }

    async makeRequest(endpoint, params = {}) {
        try {
            const response = await axios.get(`${this.baseURL}${endpoint}`, {
                params: {
                    ...params,
                    apiKey: this.apiKey
                },
                timeout: 10000
            });
            return response.data;
        } catch (error) {
            logger.error('Polygon API error:', error);
            throw new Error('Failed to fetch data from Polygon');
        }
    }

    async getMarketStatus() {
        try {
            const data = await this.makeRequest('/v1/marketstatus/now');
            return {
                marketStatus: data.market,
                nextOpen: data.next_open,
                nextClose: data.next_close,
                exchanges: data.exchanges
            };
        } catch (error) {
            logger.error('Failed to fetch market status:', error);
            throw error;
        }
    }

    async getAggregates(symbol, multiplier = 1, timespan = 'day', from, to) {
        try {
            const endpoint = `/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${from}/${to}`;
            const data = await this.makeRequest(endpoint);
            return data.results;
        } catch (error) {
            logger.error(`Failed to fetch aggregates for ${symbol}:`, error);
            throw error;
        }
    }

    async getDailyOpenClose(symbol, date) {
        try {
            const data = await this.makeRequest(`/v1/open-close/${symbol}/${date}`);
            return {
                open: data.open,
                high: data.high,
                low: data.low,
                close: data.close,
                volume: data.volume,
                afterHours: data.afterHours,
                preMarket: data.preMarket
            };
        } catch (error) {
            logger.error(`Failed to fetch daily open/close for ${symbol}:`, error);
            throw error;
        }
    }

    async getLastTrade(symbol) {
        try {
            const data = await this.makeRequest(`/v2/last/trade/${symbol}`);
            return {
                price: data.results.p,
                size: data.results.s,
                timestamp: data.results.t,
                exchange: data.results.x
            };
        } catch (error) {
            logger.error(`Failed to fetch last trade for ${symbol}:`, error);
            throw error;
        }
    }

    async getLastQuote(symbol) {
        try {
            const data = await this.makeRequest(`/v2/last/nbbo/${symbol}`);
            return {
                bidPrice: data.results.P,
                bidSize: data.results.s,
                askPrice: data.results.p,
                askSize: data.results.S,
                timestamp: data.results.t
            };
        } catch (error) {
            logger.error(`Failed to fetch last quote for ${symbol}:`, error);
            throw error;
        }
    }
}

module.exports = new PolygonService(); 