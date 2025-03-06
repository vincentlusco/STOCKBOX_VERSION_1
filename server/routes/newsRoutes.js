const express = require('express');
const router = express.Router();
const newsAPI = require('../services/api/newsAPI');
const { handleError } = require('../utils/errorHandler');

// Get news for a specific symbol
router.get('/symbol/:symbol', async (req, res) => {
    try {
        const data = await newsAPI.getCompanyNews(req.params.symbol);
        res.json(data);
    } catch (error) {
        handleError(res, error);
    }
});

// Get market news
router.get('/market', async (req, res) => {
    try {
        const data = await newsAPI.getMarketNews();
        res.json(data);
    } catch (error) {
        handleError(res, error);
    }
});

// Get sector news
router.get('/sector/:sector', async (req, res) => {
    try {
        const data = await newsAPI.getSectorNews(req.params.sector);
        res.json(data);
    } catch (error) {
        handleError(res, error);
    }
});

module.exports = router; 