const stockService = require('../services/stockService');

const stockController = {
  async getStockPrice(req, res) {
    try {
      const { symbol } = req.params;
      const data = await stockService.getStockData(symbol);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async subscribeToStock(req, res) {
    const { symbol } = req.body;
    stockService.subscribeToStock(symbol);
    res.json({ message: `Subscribed to ${symbol}` });
  },

  async unsubscribeFromStock(req, res) {
    const { symbol } = req.body;
    stockService.unsubscribeFromStock(symbol);
    res.json({ message: `Unsubscribed from ${symbol}` });
  }
};

module.exports = stockController; 