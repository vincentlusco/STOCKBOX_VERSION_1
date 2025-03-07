const express = require('express');
const router = express.Router();
const yahooFinance = require('../services/api/yahooFinance');
const { logger } = require('../utils/logger');

// Price endpoint
router.get('/:symbol/price', async (req, res) => {
    const symbol = req.params.symbol;
    console.log(`Received request for stock price of ${symbol}`);
    try {
        const data = await yahooFinance.getQuote(symbol);
        console.log(`Sending stock price data for ${symbol}:`, data);
        res.json(data);
    } catch (error) {
        console.error(`Error fetching stock price for ${symbol}:`, error);
        res.status(500).json({ error: 'Failed to fetch price data', details: error.message });
    }
});

// Fundamentals endpoint
router.get('/:symbol/fundamentals', async (req, res) => {
    const symbol = req.params.symbol;
    console.log(`Received request for stock fundamentals of ${symbol}`);
    try {
        const data = await yahooFinance.getFundamentals(symbol);
        console.log(`Sending stock fundamentals data for ${symbol}:`, data);
        res.json(data);
    } catch (error) {
        console.error(`Error fetching stock fundamentals for ${symbol}:`, error);
        res.status(500).json({ error: 'Failed to fetch fundamental data', details: error.message });
    }
});

// Technical data endpoint
router.get('/:symbol/tech', async (req, res) => {
    try {
        const { symbol } = req.params;
        logger.info(`Fetching technicals for ${symbol}`);
        const data = await yahooFinance.getTechnicals(symbol);
        res.json(data); // Adjusted to return raw data
    } catch (error) {
        logger.error('Failed to fetch technical data:', error);
        res.status(500).json({ error: 'Failed to fetch technical data', details: error.message });
    }
});

// News endpoint
router.get('/:symbol/news', async (req, res) => {
    try {
        const { symbol } = req.params;
        logger.info(`Fetching news for ${symbol}`);
        const data = await yahooFinance.getNews(symbol);
        res.json(data);
    } catch (error) {
        logger.error('Failed to fetch news:', error);
        res.status(500).json({ error: 'Failed to fetch news data' });
    }
});

// Dividends endpoint
router.get('/:symbol/dividends', async (req, res) => {
    try {
        const { symbol } = req.params;
        logger.info(`Fetching dividends for ${symbol}`);
        const data = await yahooFinance.getDividends(symbol);
        res.json(data);
    } catch (error) {
        logger.error('Failed to fetch dividends:', error);
        res.status(500).json({ error: 'Failed to fetch dividends data', details: error.message });
    }
});

// Earnings endpoint
router.get('/:symbol/earnings', async (req, res) => {
    try {
        const { symbol } = req.params;
        logger.info(`Fetching earnings for ${symbol}`);
        const data = await yahooFinance.getEarnings(symbol);
        res.json(data);
    } catch (error) {
        logger.error('Failed to fetch earnings:', error);
        res.status(500).json({ error: 'Failed to fetch earnings data', details: error.message });
    }
});

// Watchlist endpoint
router.post('/watchlist', async (req, res) => {
    const symbols = req.body.symbols;
    console.log(`Received request for watchlist data of ${symbols}`);
    try {
        const data = await yahooFinance.getWatchlistData(symbols);
        console.log(`Sending watchlist data for ${symbols}:`, data);
        res.json(data);
    } catch (error) {
        console.error(`Error fetching watchlist data for ${symbols}:`, error);
        res.status(500).json({ error: 'Failed to fetch watchlist data', details: error.message });
    }
});

module.exports = router;