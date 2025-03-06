const { execFile } = require('child_process');
const { logger } = require('../../utils/logger');
const path = require('path');
const pythonPath = '/Users/vincentlusco/STOCKBOX_Version_1/venv/bin/python3';

function runPythonScript(command, symbol) {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '../../scripts/fetch_stock_data.py');
        execFile(pythonPath, [scriptPath, command, symbol], (error, stdout, stderr) => {
            if (error) {
                logger.error(`Error executing Python script for ${command} ${symbol}:`, error);
                logger.error(`stderr: ${stderr}`);
                reject(error);
            } else {
                logger.debug(`stdout: ${stdout}`);
                resolve(JSON.parse(stdout));
            }
        });
    });
}

async function getQuote(symbol) {
    try {
        logger.info(`Fetching quote for ${symbol}`);
        const quote = await runPythonScript('price', symbol);
        logger.debug(`getQuote response: ${JSON.stringify(quote)}`);
        return quote;
    } catch (error) {
        logger.error(`Failed to fetch quote for ${symbol}:`, error);
        throw error;
    }
}

async function getFundamentals(symbol) {
    try {
        logger.info(`Fetching fundamentals for ${symbol}`);
        const fundamentals = await runPythonScript('fundamentals', symbol);
        logger.debug(`getFundamentals response: ${JSON.stringify(fundamentals)}`);
        return fundamentals;
    } catch (error) {
        logger.error(`Failed to fetch fundamentals for ${symbol}:`, error);
        throw error;
    }
}

async function getTechnicals(symbol) {
    try {
        logger.info(`Fetching technical data for ${symbol}`);
        const technical = await runPythonScript('tech', symbol);
        logger.debug(`getTechnicals response: ${JSON.stringify(technical)}`);
        return technical;
    } catch (error) {
        logger.error(`Failed to fetch technical data for ${symbol}:`, error);
        throw error;
    }
}

async function getNews(symbol) {
    try {
        logger.info(`Fetching news for ${symbol}`);
        const news = await runPythonScript('news', symbol);
        logger.debug(`getNews response: ${JSON.stringify(news)}`);
        return news;
    } catch (error) {
        logger.error(`Failed to fetch news for ${symbol}:`, error);
        throw error;
    }
}

async function getDividends(symbol) {
    try {
        logger.info(`Fetching dividends for ${symbol}`);
        const dividends = await runPythonScript('dividends', symbol);
        logger.debug(`getDividends response: ${JSON.stringify(dividends)}`);
        return dividends;
    } catch (error) {
        logger.error(`Failed to fetch dividends for ${symbol}:`, error);
        throw error;
    }
}

async function getEarnings(symbol) {
    try {
        logger.info(`Fetching earnings for ${symbol}`);
        const earnings = await runPythonScript('earnings', symbol);
        logger.debug(`getEarnings response: ${JSON.stringify(earnings)}`);
        return earnings;
    } catch (error) {
        logger.error(`Failed to fetch earnings for ${symbol}:`, error);
        throw error;
    }
}

async function getWatchlistData(symbols) {
    try {
        logger.info(`Fetching watchlist data for ${symbols}`);
        const data = await Promise.all(symbols.map(async (symbol) => {
            const quote = await getQuote(symbol);
            return {
                symbol,
                currentPrice: quote.price,
                openPrice: quote.open,
                dailyChange: quote.change,
                percentChange: quote.changePercent,
                dailyHigh: quote.high,
                dailyLow: quote.low,
            };
        }));
        logger.debug(`getWatchlistData response: ${JSON.stringify(data)}`);
        return data;
    } catch (error) {
        logger.error(`Failed to fetch watchlist data for ${symbols}:`, error);
        throw error;
    }
}

module.exports = {
    getQuote,
    getFundamentals,
    getTechnicals,
    getNews,
    getDividends,
    getEarnings,
    getWatchlistData
};