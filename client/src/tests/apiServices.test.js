import * as APIs from '../services/apiServices';
import API_METHODS from '../services/apiServices/methodList';

describe('API Services Tests', () => {
  // Test timeouts and retries
  jest.setTimeout(30000);
  const retries = 3;

  // Helper function to retry failed API calls
  const retryApiCall = async (apiCall, maxRetries = retries) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await apiCall();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  };

  // Stock API Tests
  describe('Stock APIs', () => {
    const testSymbol = 'AAPL';

    test('Yahoo Finance Stock Data', async () => {
      const data = await retryApiCall(() => 
        APIs.yahooFinanceAPI.getStockData(testSymbol)
      );
      expect(data).toBeDefined();
      expect(data.price).toBeDefined();
      expect(data.profile).toBeDefined();
    });

    test('FMP Fundamentals Data', async () => {
      const data = await retryApiCall(() => 
        APIs.fmpAPI.getStockFundamentals(testSymbol)
      );
      expect(data).toBeDefined();
      expect(data.ratios).toBeDefined();
    });
  });

  // ETF API Tests
  describe('ETF APIs', () => {
    const testSymbol = 'SPY';

    test('Yahoo Finance ETF Data', async () => {
      const data = await retryApiCall(() => 
        APIs.yahooFinanceAPI.getETFData(testSymbol)
      );
      expect(data).toBeDefined();
      expect(data.holdings).toBeDefined();
    });
  });

  // Index API Tests
  describe('Index APIs', () => {
    const testSymbol = 'SPX';

    test('Polygon Index Data', async () => {
      const data = await retryApiCall(() => 
        APIs.polygonAPI.getIndexData(testSymbol)
      );
      expect(data).toBeDefined();
      expect(data.snapshot).toBeDefined();
    });
  });

  // Futures API Tests
  describe('Futures APIs', () => {
    const testSymbol = 'ES'; // E-mini S&P 500 futures

    test('Polygon Futures Data', async () => {
      const data = await retryApiCall(() => 
        APIs.polygonAPI.getFuturesData(testSymbol)
      );
      expect(data).toBeDefined();
      expect(data.snapshot).toBeDefined();
      expect(data.quotes).toBeDefined();
    });

    test('Futures Chain Data', async () => {
      const data = await retryApiCall(() => 
        APIs.polygonAPI.getFuturesChain(testSymbol)
      );
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBeTruthy();
    });
  });

  // Commodities API Tests
  describe('Commodities APIs', () => {
    const testSymbols = {
      gold: 'GC=F',
      oil: 'CL=F',
      corn: 'ZC=F'
    };

    test('Yahoo Finance Commodity Data', async () => {
      const data = await retryApiCall(() => 
        APIs.yahooFinanceAPI.getCommodityData(testSymbols.gold)
      );
      expect(data).toBeDefined();
      expect(data.price).toBeDefined();
      expect(data.details).toBeDefined();
    });

    test('Commodity Group Data', async () => {
      const data = await retryApiCall(() => 
        APIs.yahooFinanceAPI.getCommodityGroupData('metals')
      );
      expect(data).toBeDefined();
      expect(data.commodities).toBeDefined();
      expect(Array.isArray(data.commodities)).toBeTruthy();
    });
  });

  // Forex API Tests
  describe('Forex APIs', () => {
    const testPair = 'EUR/USD';

    test('Yahoo Finance Forex Data', async () => {
      const data = await retryApiCall(() => 
        APIs.yahooFinanceAPI.getForexData(testPair)
      );
      expect(data).toBeDefined();
      expect(data.price).toBeDefined();
      expect(data.details).toBeDefined();
    });

    test('Alpha Vantage Forex Data', async () => {
      const data = await retryApiCall(() => 
        APIs.alphaVantageAPI.getForexData(testPair)
      );
      expect(data).toBeDefined();
      expect(data.rate).toBeDefined();
    });
  });

  // Market Data Tests
  describe('Market Data APIs', () => {
    test('Market Status', async () => {
      const data = await retryApiCall(() => 
        APIs.polygonAPI.getMarketStatus()
      );
      expect(data).toBeDefined();
      expect(data.current).toBeDefined();
      expect(data.upcoming).toBeDefined();
    });

    test('Market Movers', async () => {
      const data = await retryApiCall(() => 
        APIs.yahooFinanceAPI.getMarketMovers()
      );
      expect(data).toBeDefined();
      expect(data.gainers).toBeDefined();
      expect(data.losers).toBeDefined();
    });

    test('Sector Performance', async () => {
      const data = await retryApiCall(() => 
        APIs.fmpAPI.getMarketAnalysis()
      );
      expect(data).toBeDefined();
      expect(data.sectors).toBeDefined();
    });
  });

  // Economic Data Tests
  describe('Economic Data APIs', () => {
    test('FRED Economic Indicators', async () => {
      const data = await retryApiCall(() => 
        APIs.fredAPI.getEconomicIndicators()
      );
      expect(data).toBeDefined();
      expect(data.GDP).toBeDefined();
      expect(data.UNRATE).toBeDefined();
    });

    test('Economic Calendar', async () => {
      const data = await retryApiCall(() => 
        APIs.finnhubAPI.getEconomicCalendar()
      );
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBeTruthy();
    });
  });

  // News & Sentiment Tests
  describe('News & Sentiment APIs', () => {
    const testSymbol = 'AAPL';

    test('Company News', async () => {
      const data = await retryApiCall(() => 
        APIs.finnhubAPI.getCompanyNews(testSymbol)
      );
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBeTruthy();
    });

    test('Market Sentiment', async () => {
      const data = await retryApiCall(() => 
        APIs.finnhubAPI.getMarketSentiment(testSymbol)
      );
      expect(data).toBeDefined();
      expect(data.newsSentiment).toBeDefined();
      expect(data.socialSentiment).toBeDefined();
    });
  });

  // Data Validation Tests
  describe('Data Validation', () => {
    test('Stock Data Format', async () => {
      const data = await retryApiCall(() => 
        APIs.yahooFinanceAPI.getStockData('AAPL')
      );
      expect(data).toMatchObject({
        price: expect.any(Object),
        profile: expect.any(Object),
        financials: expect.any(Object)
      });
    });

    test('API Error Handling', async () => {
      await expect(
        retryApiCall(() => APIs.yahooFinanceAPI.getStockData('INVALID'))
      ).rejects.toThrow();
    });
  });

  // Rate Limiting Tests
  describe('Rate Limiting', () => {
    test('Concurrent API Calls', async () => {
      const symbols = ['AAPL', 'GOOGL', 'MSFT'];
      const promises = symbols.map(symbol => 
        retryApiCall(() => APIs.yahooFinanceAPI.getStockData(symbol))
      );
      const results = await Promise.all(promises);
      expect(results.length).toBe(symbols.length);
      results.forEach(data => expect(data).toBeDefined());
    });
  });

  // Bond API Tests
  describe('Bond APIs', () => {
    test('FRED Government Bond Data', async () => {
      const data = await retryApiCall(() => 
        APIs.fredAPI.getGovernmentBonds()
      );
      expect(data).toBeDefined();
      expect(data.treasury10Y).toBeDefined();
      expect(data.tips10Y).toBeDefined();
    });

    test('Treasury Yield Curve', async () => {
      const data = await retryApiCall(() => 
        APIs.fredAPI.getTreasuryRates()
      );
      expect(data).toBeDefined();
      expect(data.DGS10).toBeDefined(); // 10-year rate
    });
  });

  // Crypto API Tests
  describe('Crypto APIs', () => {
    const testSymbol = 'BTC';

    test('Yahoo Finance Crypto Data', async () => {
      const data = await retryApiCall(() => 
        APIs.yahooFinanceAPI.getCryptoData(testSymbol)
      );
      expect(data).toBeDefined();
      expect(data.price).toBeDefined();
      expect(data.details).toBeDefined();
    });

    test('Finnhub Crypto Data', async () => {
      const data = await retryApiCall(() => 
        APIs.finnhubAPI.getCryptoData(testSymbol)
      );
      expect(data).toBeDefined();
      expect(data.price).toBeDefined();
      expect(data.profile).toBeDefined();
    });

    test('DeFi Protocol Data', async () => {
      const data = await retryApiCall(() => 
        APIs.finnhubAPI.getDefiData()
      );
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBeTruthy();
    });
  });
}); 