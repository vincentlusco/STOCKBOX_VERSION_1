export enum SecurityType {
    COMMON = 'common',
    PREFERRED = 'preferred',
    REIT = 'reit',
    ADR = 'adr'
}

export enum DataType {
    PRICE = 'price',
    FUNDAMENTALS = 'fundamentals',
    TECHNICALS = 'technicals',
    NEWS = 'news',
    ESG = 'esg',
    DIVIDENDS = 'dividends',
    INSTITUTIONAL = 'institutional',
    INSIDER = 'insider',
    PROPERTY = 'property',
    OCCUPANCY = 'occupancy',
    FFO = 'ffo',
    FOREX = 'forex',
    HOME_MARKET = 'homeMarket',
    CALL_INFO = 'callInfo',
    RATING = 'rating',
    YIELD = 'yield'
}

export interface SecurityData {
    symbol: string;
    type: SecurityType;
    price?: {
        current: number;
        change: number;
        changePercent: number;
        volume: number;
    };
    fundamentals?: {
        marketCap: number;
        peRatio: number;
        eps: number;
    };
}

export interface StockData {
    symbol: string;
    type: SecurityType;
    price?: {
        current: number;
        change: number;
        changePercent: number;
        open: number;
        high: number;
        low: number;
        volume: number;
        timestamp: number;
    };
    fundamentals?: {
        marketCap: number;
        peRatio: number;
        eps: number;
        beta: number;
        dividendYield?: number;
    };
    info?: {
        name: string;
        sector: string;
        industry: string;
        description: string;
        country: string;
        exchange: string;
    };
    technicals?: {
        sma50: number;
        sma200: number;
        rsi: number;
        macd: {
            line: number;
            signal: number;
            histogram: number;
        };
    };
}

export interface CommandResult {
    success: boolean;
    data?: any;
    error?: string;
    message?: string;
}

export interface SecurityCommand {
    description: string;
    supportedTypes: string[] | 'ALL';
    example: string;
    handler: (symbol: string) => Promise<CommandResult>;
} 