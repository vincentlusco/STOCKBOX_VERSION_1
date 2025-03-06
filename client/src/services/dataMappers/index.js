// Data Mapping System
const dataMappers = {
  STOCK: {
    yahoo: {
      price: (data) => ({
        current: data.price.regularMarketPrice,
        open: data.price.regularMarketOpen,
        high: data.price.regularMarketHigh,
        low: data.price.regularMarketLow,
        volume: data.price.regularMarketVolume,
        marketCap: data.price.marketCap,
        peRatio: data.price.forwardPE,
        dividend: data.price.dividendYield
      }),
      profile: (data) => ({
        name: data.price.longName,
        sector: data.summaryProfile.sector,
        industry: data.summaryProfile.industry,
        employees: data.summaryProfile.fullTimeEmployees,
        description: data.summaryProfile.longBusinessSummary
      }),
      financials: (data) => ({
        income: data.incomeStatementHistory.incomeStatementHistory,
        balance: data.balanceSheetHistory.balanceSheetStatements,
        cashflow: data.cashflowStatementHistory.cashflowStatements
      })
    },
    finnhub: {
      // Finnhub specific mappings
    },
    polygon: {
      // Polygon specific mappings
    }
  },
  ETF: {
    yahoo: {
      // ETF specific mappings
    }
  },
  // ... mappings for other security types
}; 