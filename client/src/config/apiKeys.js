// Validate environment variables
const validateEnvVariables = () => {
  const requiredKeys = {
    'REACT_APP_FINNHUB_API_KEY': 'Finnhub',
    'REACT_APP_ALPHA_VANTAGE_API_KEY': 'Alpha Vantage',
    'REACT_APP_POLYGON_API_KEY': 'Polygon',
    'REACT_APP_FMP_API_KEY': 'Financial Modeling Prep',
    'REACT_APP_NEWS_API_KEY': 'News API',
    'REACT_APP_FRED_API_KEY': 'FRED'
  };

  const missingKeys = Object.entries(requiredKeys)
    .filter(([key]) => !process.env[key])
    .map(([, name]) => name);

  if (missingKeys.length > 0) {
    console.warn(
      `Missing API keys for: ${missingKeys.join(', ')}. ` +
      'Please check your .env.local file.'
    );
  }
};

// Run validation
validateEnvVariables();

const apiKeys = {
  finnhub: process.env.REACT_APP_FINNHUB_API_KEY,
  alphaVantage: process.env.REACT_APP_ALPHA_VANTAGE_API_KEY,
  polygon: process.env.REACT_APP_POLYGON_API_KEY,
  newsAPI: process.env.REACT_APP_NEWS_API_KEY,
  fred: process.env.REACT_APP_FRED_API_KEY,
  fmp: process.env.REACT_APP_FMP_API_KEY,
  yahooFinance: process.env.REACT_APP_YAHOO_FINANCE_API_KEY
};

// Validate key formats
const validateKeyFormats = () => {
  const validations = {
    finnhub: (key) => /^[a-z0-9]{40}$/i.test(key),
    alphaVantage: (key) => /^[A-Za-z0-9]{32}$/i.test(key),
    polygon: (key) => /^[A-Za-z0-9]{32}$/i.test(key),
    newsAPI: (key) => /^[0-9a-f]{32}$/i.test(key),
    fred: (key) => /^[0-9a-f]{24}$/i.test(key),
    fmp: (key) => /^[A-Za-z0-9]{32}$/i.test(key)
  };

  const invalidKeys = Object.entries(validations)
    .filter(([service, validator]) => apiKeys[service] && !validator(apiKeys[service]))
    .map(([service]) => service);

  if (invalidKeys.length > 0) {
    console.warn(
      `Warning: Potentially invalid API key format for: ${invalidKeys.join(', ')}. ` +
      'Please verify your API keys.'
    );
  }
};

// Run format validation
validateKeyFormats();

export default apiKeys; 