const axios = require('axios');
const { logger } = require('../../utils/logger');

class FMPService {
    constructor() {
        this.apiKey = 'lRgVidOOiZ3LwqPGP0DDcgGU37kGoLti'; // From keys.backup
        this.baseURL = 'https://financialmodelingprep.com/api/v3';
    }

    async makeRequest(endpoint, params = {}) {
        try {
            const response = await axios.get(`${this.baseURL}${endpoint}`, {
                params: {
                    ...params,
                    apikey: this.apiKey
                },
                timeout: 10000
            });
            return response.data;
        } catch (error) {
            logger.error('FMP API error:', error);
            throw new Error('Failed to fetch data from FMP');
        }
    }

    async getInstitutionalHoldings(symbol) {
        try {
            const [holders, ownership] = await Promise.all([
                this.makeRequest(`/institutional-holder/${symbol}`),
                this.makeRequest(`/institutional-ownership/${symbol}`)
            ]);

            return {
                totalInstitutionalOwnership: ownership[0]?.institutionalOwnership || 0,
                holders: holders.map(holder => ({
                    institution: holder.institutionName,
                    shares: holder.sharesHeld,
                    value: holder.value,
                    portfolioPercent: holder.portfolioShare,
                    change: holder.change
                })).slice(0, 10) // Top 10 holders
            };
        } catch (error) {
            logger.error(`Failed to fetch institutional holdings for ${symbol}:`, error);
            throw error;
        }
    }

    async getInsiderTransactions(symbol) {
        try {
            const data = await this.makeRequest(`/insider-trading/${symbol}`);
            
            return {
                totalInsiderOwnership: data[0]?.shareholderPercentage || 0,
                recentTransactions: data.map(transaction => ({
                    name: transaction.reportingName,
                    position: transaction.typeOfOwner,
                    transactionType: transaction.transactionType,
                    shares: transaction.securitiesTransacted,
                    value: transaction.securitiesOwned,
                    date: transaction.transactionDate
                })).slice(0, 10) // Last 10 transactions
            };
        } catch (error) {
            logger.error(`Failed to fetch insider transactions for ${symbol}:`, error);
            throw error;
        }
    }

    async getPeerComparison(symbol) {
        try {
            const [peers, metrics] = await Promise.all([
                this.makeRequest(`/stock-peers/${symbol}`),
                this.makeRequest(`/key-metrics/${symbol}`)
            ]);

            const peerData = await Promise.all(
                peers.peersList.map(async (peer) => {
                    const peerMetrics = await this.makeRequest(`/key-metrics/${peer}`);
                    return {
                        symbol: peer,
                        marketCap: peerMetrics[0]?.marketCap || 0,
                        peRatio: peerMetrics[0]?.peRatio || 0,
                        revenueGrowth: peerMetrics[0]?.revenueGrowth || 0,
                        profitMargin: peerMetrics[0]?.netProfitMargin || 0,
                        performance: peerMetrics[0]?.yearlyPriceReturn || 0
                    };
                })
            );

            return {
                companies: peerData.slice(0, 5) // Top 5 peers
            };
        } catch (error) {
            logger.error(`Failed to fetch peer comparison for ${symbol}:`, error);
            throw error;
        }
    }
}

module.exports = new FMPService(); 