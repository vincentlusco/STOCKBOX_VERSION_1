const axios = require('axios');
const { logger } = require('../../utils/logger');

class NewsAPIService {
    constructor() {
        this.apiKey = '236488869d544c86a55475b084aa9023'; // From your keys.backup
        this.baseURL = 'https://newsapi.org/v2';
    }

    async getCompanyNews(symbol) {
        try {
            const response = await axios.get(`${this.baseURL}/everything`, {
                params: {
                    q: symbol,
                    language: 'en',
                    sortBy: 'publishedAt',
                    pageSize: 10,
                    apiKey: this.apiKey
                }
            });

            if (!response.data?.articles) {
                throw new Error('No news data available');
            }

            return response.data.articles.map(article => ({
                headline: article.title,
                source: article.source.name,
                date: article.publishedAt,
                summary: article.description,
                url: article.url
            }));
        } catch (error) {
            logger.error(`Failed to fetch news for ${symbol}:`, error);
            throw new Error('Failed to fetch news data');
        }
    }
}

module.exports = new NewsAPIService(); 