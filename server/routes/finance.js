const express = require('express');
const router = express.Router();
const axios = require('axios');
const yahooFinanceAPI = require('../services/securities/yahooFinanceAPI');
const fmpAPI = require('../services/securities/fmpAPI');

// API Base URLs and Keys
const YAHOO_BASE_URL = 'https://query1.finance.yahoo.com/v8/finance';
const FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3';
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

const FMP_API_KEY = process.env.FMP_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

// Yahoo Finance Routes
router.get('/quote/:symbol', async (req, res) => {
    try {
        const response = await axios.get(`${YAHOO_BASE_URL}/quote`, {
            params: { symbols: req.params.symbol }
        });
        res.json(response.data.quoteResponse.result[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch quote data' });
    }
});

router.get('/info/:symbol', async (req, res) => {
    try {
        const response = await axios.get(`${YAHOO_BASE_URL}/quoteSummary/${req.params.symbol}`, {
            params: { modules: 'assetProfile,summaryProfile' }
        });
        res.json(response.data.quoteSummary.result[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch company info' });
    }
});

router.get('/technicals/:symbol', async (req, res) => {
    try {
        const response = await yahooFinanceAPI.getTechnicalIndicators(req.params.symbol);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch technical data' });
    }
});

router.get('/fundamentals/:symbol', async (req, res) => {
    try {
        const response = await axios.get(`${YAHOO_BASE_URL}/quoteSummary/${req.params.symbol}`, {
            params: { modules: 'financialData,defaultKeyStatistics' }
        });
        res.json(response.data.quoteSummary.result[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch fundamental data' });
    }
});

// FMP Routes
router.get('/institutional/:symbol', async (req, res) => {
    try {
        const response = await axios.get(`${FMP_BASE_URL}/institutional-holder/${req.params.symbol}`, {
            params: { apikey: FMP_API_KEY }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch institutional data' });
    }
});

router.get('/insider/:symbol', async (req, res) => {
    try {
        const response = await axios.get(`${FMP_BASE_URL}/insider-trading/${req.params.symbol}`, {
            params: { apikey: FMP_API_KEY }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch insider data' });
    }
});

// News API Route
router.get('/news/:symbol', async (req, res) => {
    try {
        const response = await axios.get(`${NEWS_API_BASE_URL}/everything`, {
            params: {
                q: req.params.symbol,
                apiKey: NEWS_API_KEY,
                language: 'en',
                sortBy: 'publishedAt',
                pageSize: 10
            }
        });
        res.json(response.data.articles);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch news data' });
    }
});

// Earnings endpoint
router.get('/earnings/:symbol', async (req, res) => {
    try {
        const response = await yahooFinanceAPI.getEarnings(req.params.symbol);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch earnings data' });
    }
});

// Peer comparison endpoint
router.get('/peers/:symbol', async (req, res) => {
    try {
        const response = await fmpAPI.getPeerComparison(req.params.symbol);
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch peer comparison data' });
    }
});

module.exports = router; 