const validateYahooFinance = async (key) => {
  try {
    // Add Yahoo Finance validation logic
    return true;
  } catch (error) {
    return false;
  }
};

const validateFinnHub = async (key) => {
  try {
    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=AAPL&token=${key}`);
    const data = await response.json();
    return !data.error;
  } catch (error) {
    return false;
  }
};

// Add similar validation functions for other APIs...

const getApiStatus = async (req, res) => {
  try {
    const status = {
      yahooFinance: await validateYahooFinance(process.env.YAHOO_FINANCE_API_KEY),
      finnHub: await validateFinnHub(process.env.FINNHUB_API_KEY),
      alphaVantage: await validateAlphaVantage(process.env.ALPHA_VANTAGE_API_KEY),
      polygon: await validatePolygon(process.env.POLYGON_API_KEY),
      fmp: await validateFMP(process.env.FMP_API_KEY),
      fred: await validateFRED(process.env.FRED_API_KEY),
      newsAPI: await validateNewsAPI(process.env.NEWS_API_KEY)
    };
    
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to check API status' });
  }
};

module.exports = {
  getApiStatus
}; 