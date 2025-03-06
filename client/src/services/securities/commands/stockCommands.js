import { fetchStockPrice, fetchStockFundamentals, fetchStockTechnical, fetchStockNews, fetchStockDividends, fetchStockEarnings } from '../fetchers/stockFetcher';
import { formatPrice, formatFundamentals, formatTechnical, formatNews, formatDividends, formatEarnings, formatHelpMessage } from '../formatters/stockFormatter';

let watchlist = [];

export const STOCK_COMMANDS = {
    PRICE: {
        description: 'Get current stock price',
        example: 'PRICE AAPL',
        handler: async (symbol) => {
            if (!symbol) return 'ERROR: SYMBOL IS REQUIRED';
            try {
                const data = await fetchStockPrice(symbol);
                return formatPrice(data);
            } catch (error) {
                return `ERROR: ${error.message}`;
            }
        }
    },
    FUND: {
        description: 'Get stock fundamentals',
        example: 'FUND AAPL',
        handler: async (symbol) => {
            if (!symbol) return 'ERROR: SYMBOL IS REQUIRED';
            try {
                const data = await fetchStockFundamentals(symbol);
                return formatFundamentals(data);
            } catch (error) {
                return `ERROR: ${error.message}`;
            }
        }
    },
    TECH: {
        description: 'Get stock technical analysis',
        example: 'TECH AAPL',
        handler: async (symbol) => {
            if (!symbol) return 'ERROR: SYMBOL IS REQUIRED';
            try {
                console.log(`Fetching technical data for ${symbol}`);
                const data = await fetchStockTechnical(symbol);
                console.log(`Technical data for ${symbol}:`, data);
                return formatTechnical(data);
            } catch (error) {
                console.error(`Error handling TECH command for ${symbol}:`, error);
                return `ERROR: ${error.message}`;
            }
        }
    },
    NEWS: {
        description: 'Get latest stock news',
        example: 'NEWS AAPL',
        handler: async (symbol) => {
            if (!symbol) return 'ERROR: SYMBOL IS REQUIRED';
            try {
                const data = await fetchStockNews(symbol);
                return formatNews(data);
            } catch (error) {
                return `ERROR: ${error.message}`;
            }
        }
    },
    DIV: {
        description: 'Get stock dividends',
        example: 'DIV AAPL',
        handler: async (symbol) => {
            if (!symbol) return 'ERROR: SYMBOL IS REQUIRED';
            try {
                console.log(`Fetching dividends data for ${symbol}`);
                const data = await fetchStockDividends(symbol);
                console.log(`Dividends data for ${symbol}:`, data);
                if (data.message) {
                    return data.message;
                }
                return formatDividends(data);
            } catch (error) {
                console.error(`Error handling DIV command for ${symbol}:`, error);
                return `ERROR: ${error.message}`;
            }
        }
    },
    EARN: {
        description: 'Get stock earnings',
        example: 'EARN AAPL',
        handler: async (symbol) => {
            if (!symbol) return 'ERROR: SYMBOL IS REQUIRED';
            try {
                const data = await fetchStockEarnings(symbol);
                return formatEarnings(data);
            } catch (error) {
                return `ERROR: ${error.message}`;
            }
        }
    },
    ADD: {
        description: 'Add a stock to the watchlist',
        example: 'ADD TSLA',
        handler: (symbol) => {
            if (!symbol) return 'ERROR: SYMBOL IS REQUIRED';
            symbol = symbol.toUpperCase();
            if (!watchlist.includes(symbol)) {
                watchlist.push(symbol);
                return `${symbol} added to watchlist.`;
            } else {
                return `${symbol} is already in the watchlist.`;
            }
        }
    },
    UNADD: {
        description: 'Remove a stock from the watchlist',
        example: 'UNADD TSLA',
        handler: (symbol) => {
            if (!symbol) return 'ERROR: SYMBOL IS REQUIRED';
            symbol = symbol.toUpperCase();
            watchlist = watchlist.filter(item => item !== symbol);
            return `${symbol} removed from watchlist.`;
        }
    },
    HELP: {
        description: 'Display help message',
        example: 'HELP',
        handler: () => {
            const message = `
Available Commands:
===================
HELP - Display this help message
ADD <SYMBOL> - Add a stock to the watchlist (e.g., ADD TSLA)
UNADD <SYMBOL> - Remove a stock from the watchlist (e.g., UNADD TSLA)
PRICE <SYMBOL> - Get the current price of a stock (e.g., PRICE AAPL)
NEWS <SYMBOL> - Get the latest news for a stock (e.g., NEWS AAPL)
EARN <SYMBOL> - Get the earnings data for a stock (e.g., EARN AAPL)
DIV <SYMBOL> - Get the dividends data for a stock (e.g., DIV AAPL)
FUND <SYMBOL> - Get the fundamentals of a stock (e.g., FUND AAPL)
TECH <SYMBOL> - Get the technical analysis of a stock (e.g., TECH AAPL)
            `.trim();
            return formatHelpMessage(message);
        }
    }
};

export default STOCK_COMMANDS;