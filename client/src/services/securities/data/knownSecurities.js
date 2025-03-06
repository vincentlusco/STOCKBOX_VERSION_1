import { SECURITY_TYPES } from '../types';
import { STOCK_TYPES } from '../types/stock';

// Major US Stock Indices
const KNOWN_INDICES = {
    '^GSPC': 'S&P 500',
    '^DJI': 'Dow Jones Industrial Average',
    '^IXIC': 'NASDAQ Composite',
    '^RUT': 'Russell 2000',
    '^VIX': 'CBOE Volatility Index',
    '^NYA': 'NYSE Composite',
    '^FTSE': 'FTSE 100',
    '^N225': 'Nikkei 225'
};

// Major ETFs by category
const KNOWN_ETFS = {
    // Broad Market
    'SPY': 'SPDR S&P 500 ETF',
    'VOO': 'Vanguard S&P 500 ETF',
    'QQQ': 'Invesco QQQ (NASDAQ 100)',
    'IWM': 'iShares Russell 2000 ETF',
    'VTI': 'Vanguard Total Stock Market',
    
    // Sectors
    'XLF': 'Financial Select Sector SPDR',
    'XLK': 'Technology Select Sector SPDR',
    'XLE': 'Energy Select Sector SPDR',
    'XLV': 'Healthcare Select Sector SPDR',
    'XLP': 'Consumer Staples Select SPDR',
    
    // International
    'EFA': 'iShares MSCI EAFE ETF',
    'EEM': 'iShares MSCI Emerging Markets',
    'VEU': 'Vanguard FTSE All-World ex-US',
    
    // Bonds
    'AGG': 'iShares Core U.S. Aggregate Bond',
    'BND': 'Vanguard Total Bond Market',
    'TLT': 'iShares 20+ Year Treasury Bond'
};

// Major Forex Pairs
const KNOWN_FOREX = {
    'EUR/USD': 'Euro/US Dollar',
    'GBP/USD': 'British Pound/US Dollar',
    'USD/JPY': 'US Dollar/Japanese Yen',
    'USD/CHF': 'US Dollar/Swiss Franc',
    'AUD/USD': 'Australian Dollar/US Dollar',
    'USD/CAD': 'US Dollar/Canadian Dollar',
    'NZD/USD': 'New Zealand Dollar/US Dollar'
};

// Major Cryptocurrencies
const KNOWN_CRYPTO = {
    'BTC-USD': 'Bitcoin/US Dollar',
    'ETH-USD': 'Ethereum/US Dollar',
    'XRP-USD': 'Ripple/US Dollar',
    'DOGE-USD': 'Dogecoin/US Dollar',
    'ADA-USD': 'Cardano/US Dollar',
    'SOL-USD': 'Solana/US Dollar',
    'DOT-USD': 'Polkadot/US Dollar'
};

// Major Commodities
const KNOWN_COMMODITIES = {
    'GC=F': 'Gold Futures',
    'SI=F': 'Silver Futures',
    'CL=F': 'Crude Oil Futures',
    'NG=F': 'Natural Gas Futures',
    'ZC=F': 'Corn Futures',
    'ZW=F': 'Wheat Futures',
    'KC=F': 'Coffee Futures'
};

// Common Stocks
const KNOWN_COMMON_STOCKS = {
    // Technology
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corporation',
    'GOOGL': 'Alphabet Inc.',
    'META': 'Meta Platforms Inc.',
    'NVDA': 'NVIDIA Corporation',
    
    // Finance
    'JPM': 'JPMorgan Chase & Co.',
    'BAC': 'Bank of America Corp.',
    'GS': 'Goldman Sachs Group Inc.',
    
    // Healthcare
    'JNJ': 'Johnson & Johnson',
    'PFE': 'Pfizer Inc.',
    'UNH': 'UnitedHealth Group Inc.',
    
    // Consumer
    'AMZN': 'Amazon.com Inc.',
    'WMT': 'Walmart Inc.',
    'KO': 'The Coca-Cola Company',
    
    // Industrial
    'BA': 'Boeing Company',
    'CAT': 'Caterpillar Inc.',
    'GE': 'General Electric Company'
};

// ADRs (American Depositary Receipts)
const KNOWN_ADRS = {
    'BABA': 'Alibaba Group Holding Ltd.',
    'TSM': 'Taiwan Semiconductor Manufacturing',
    'NVO': 'Novo Nordisk A/S',
    'TM': 'Toyota Motor Corporation',
    'BP': 'BP p.l.c.',
    'RIO': 'Rio Tinto Group',
    'PTR': 'PetroChina Company Limited',
    'SAN': 'Banco Santander, S.A.',
    'SONY': 'Sony Group Corporation',
    'SAP': 'SAP SE'
};

// REITs (Real Estate Investment Trusts)
const KNOWN_REITS = {
    'O': 'Realty Income Corporation',
    'SPG': 'Simon Property Group',
    'PLD': 'Prologis',
    'WELL': 'Welltower Inc.',
    'AMT': 'American Tower Corporation',
    'CCI': 'Crown Castle Inc.',
    'PSA': 'Public Storage',
    'DLR': 'Digital Realty Trust',
    'AVB': 'AvalonBay Communities',
    'EQR': 'Equity Residential'
};

// Preferred Stocks
const KNOWN_PREFERRED_STOCKS = {
    'BAC.PB': 'Bank of America Corp. Series B',
    'JPM.PD': 'JPMorgan Chase Series D',
    'WFC.PR': 'Wells Fargo Series R',
    'GS.PJ': 'Goldman Sachs Group Series J',
    'MS.PA': 'Morgan Stanley Series A',
    'PSA.PG': 'Public Storage Series G',
    'DLR.PJ': 'Digital Realty Series J',
    'SPG.PJ': 'Simon Property Group Series J',
    'KEY.PK': 'KeyCorp Series K',
    'USB.PH': 'U.S. Bancorp Series H'
};

// Combine all known securities with their types
export const KNOWN_SECURITIES = {
    ...Object.keys(KNOWN_INDICES).reduce((acc, key) => ({ ...acc, [key]: SECURITY_TYPES.INDEX }), {}),
    ...Object.keys(KNOWN_ETFS).reduce((acc, key) => ({ ...acc, [key]: SECURITY_TYPES.ETF }), {}),
    ...Object.keys(KNOWN_FOREX).reduce((acc, key) => ({ ...acc, [key]: SECURITY_TYPES.FOREX }), {}),
    ...Object.keys(KNOWN_CRYPTO).reduce((acc, key) => ({ ...acc, [key]: SECURITY_TYPES.CRYPTO }), {}),
    ...Object.keys(KNOWN_COMMODITIES).reduce((acc, key) => ({ ...acc, [key]: SECURITY_TYPES.COMMODITY }), {}),
    ...Object.keys(KNOWN_COMMON_STOCKS).reduce((acc, key) => ({ 
        ...acc, 
        [key]: STOCK_TYPES.COMMON 
    }), {}),
    ...Object.keys(KNOWN_ADRS).reduce((acc, key) => ({ 
        ...acc, 
        [key]: STOCK_TYPES.ADR 
    }), {}),
    ...Object.keys(KNOWN_REITS).reduce((acc, key) => ({ 
        ...acc, 
        [key]: STOCK_TYPES.REIT 
    }), {}),
    ...Object.keys(KNOWN_PREFERRED_STOCKS).reduce((acc, key) => ({ 
        ...acc, 
        [key]: STOCK_TYPES.PREFERRED 
    }), {})
};

// Export individual collections for reference
export {
    KNOWN_INDICES,
    KNOWN_ETFS,
    KNOWN_FOREX,
    KNOWN_CRYPTO,
    KNOWN_COMMODITIES,
    KNOWN_COMMON_STOCKS,
    KNOWN_ADRS,
    KNOWN_REITS,
    KNOWN_PREFERRED_STOCKS
};

// Export lookup functions
export function getStockName(symbol) {
    return KNOWN_COMMON_STOCKS[symbol] || 
           KNOWN_ADRS[symbol] || 
           KNOWN_REITS[symbol] || 
           KNOWN_PREFERRED_STOCKS[symbol];
}

export function getStockType(symbol) {
    return KNOWN_SECURITIES[symbol] || STOCK_TYPES.COMMON;
} 