import yfinance as yf
import sys
import json
import numpy as np
import pandas as pd
from calculations import (
    calculateSMA,
    calculateEMA,
    calculateRSI,
    calculateBollingerBands,
    calculateMACD,
    calculateStochastic,
    calculateATR,
    calculateParabolicSAR,
    calculateADX
)

def fetch_stock_price(symbol):
    stock = yf.Ticker(symbol)
    data = stock.history(period="1d")
    if data.empty:
        return {}
    latest = data.iloc[-1]
    return {
        "symbol": symbol,
        "price": latest["Close"],
        "change": latest["Close"] - latest["Open"],
        "changePercent": ((latest["Close"] - latest["Open"]) / latest["Open"]) * 100,
        "open": latest["Open"],
        "high": latest["High"],
        "low": latest["Low"],
        "volume": latest["Volume"],
        "fiftyTwoWeekHigh": stock.info["fiftyTwoWeekHigh"],
        "fiftyTwoWeekLow": stock.info["fiftyTwoWeekLow"]
    }

def fetch_stock_fundamentals(symbol):
    stock = yf.Ticker(symbol)
    info = stock.info
    return {
        "symbol": symbol,
        "data": {
            "marketCap": info.get("marketCap", "N/A"),
            "peRatio": info.get("trailingPE", "N/A"),
            "eps": info.get("trailingEps", "N/A"),
            "profitMargin": info.get("profitMargins", "N/A"),
            "recommendation": info.get("recommendationMean", "N/A"),
            "currentPrice": info.get("currentPrice", "N/A"),
            "targetHigh": info.get("targetHighPrice", "N/A"),
            "targetLow": info.get("targetLowPrice", "N/A"),
            "targetMean": info.get("targetMeanPrice", "N/A")
        }
    }

def fetch_technical_data(symbol):
    stock = yf.Ticker(symbol)
    data = stock.history(period="1y")
    if data.empty:
        print(f"No data available for {symbol}", file=sys.stderr)
        return {}

    print(f"Fetched data for {symbol}: {data.head()}", file=sys.stderr)

    # Calculate technical indicators
    try:
        sma = calculateSMA(data['Close'], 20)
        ema = calculateEMA(data['Close'], 20)
        rsi = calculateRSI(data['Close'], 14)
        bollinger_bands = calculateBollingerBands(data['Close'], 20)
        macd = calculateMACD(data['Close'])
        stochastic = calculateStochastic(data)
        atr = calculateATR(data)
        parabolic_sar = calculateParabolicSAR(data)
        adx = calculateADX(data)

        # Replace NaN values with None
        sma = [None if np.isnan(x) else x for x in sma]
        ema = [None if np.isnan(x) else x for x in ema]
        rsi = [None if np.isnan(x) else x for x in rsi]
        bollinger_bands['upper'] = [None if np.isnan(x) else x for x in bollinger_bands['upper']]
        bollinger_bands['lower'] = [None if np.isnan(x) else x for x in bollinger_bands['lower']]
        macd = [None if np.isnan(x) else x for x in macd]
        stochastic = [None if np.isnan(x) else x for x in stochastic]
        atr = [None if np.isnan(x) else x for x in atr]
        parabolic_sar = [None if np.isnan(x) else x for x in parabolic_sar]
        adx = [None if np.isnan(x) else x for x in adx]

        print(f"Calculated technical indicators for {symbol}", file=sys.stderr)
        print(f"SMA: {sma[:5]}", file=sys.stderr)
        print(f"EMA: {ema[:5]}", file=sys.stderr)
        print(f"RSI: {rsi[:5]}", file=sys.stderr)
        print(f"Bollinger Bands Upper: {bollinger_bands['upper'][:5]}", file=sys.stderr)
        print(f"Bollinger Bands Lower: {bollinger_bands['lower'][:5]}", file=sys.stderr)
        print(f"MACD: {macd[:5]}", file=sys.stderr)
        print(f"Stochastic: {stochastic[:5]}", file=sys.stderr)
        print(f"ATR: {atr[:5]}", file=sys.stderr)
        print(f"Parabolic SAR: {parabolic_sar[:5]}", file=sys.stderr)
        print(f"ADX: {adx[:5]}", file=sys.stderr)

    except Exception as e:
        print(f"Error calculating technical indicators for {symbol}: {e}", file=sys.stderr)
        return {}

    result = {
        "symbol": symbol,
        "sma": sma,
        "ema": ema,
        "rsi": rsi,
        "volume": data['Volume'].tolist(),
        "bollingerBands": {
            "upper": bollinger_bands['upper'],
            "lower": bollinger_bands['lower']
        },
        "macd": macd,
        "stochastic": stochastic,
        "atr": atr,
        "parabolicSAR": parabolic_sar,
        "adx": adx
    }

    print(f"Technical data result for {symbol}: {json.dumps(result)}", file=sys.stderr)
    return result

def fetch_dividends_data(symbol):
    stock = yf.Ticker(symbol)
    dividends = stock.dividends
    if dividends.empty:
        print(f"No dividends data available for {symbol}", file=sys.stderr)
        return {
            "symbol": symbol,
            "message": f"{symbol} has no dividend data"
        }
    print(f"Fetched dividends data for {symbol}: {dividends}", file=sys.stderr)
    return {
        "symbol": symbol,
        "dividends": [{"date": date.strftime("%Y-%m-%d"), "amount": amount} for date, amount in dividends.items()]
    }

def fetch_news_data(symbol):
    stock = yf.Ticker(symbol)
    news = stock.news[:5]  # Limit to 5 articles
    return {
        "symbol": symbol,
        "news": news
    }

def fetch_earnings_data(symbol):
    stock = yf.Ticker(symbol)
    income_stmt = stock.income_stmt
    if income_stmt.empty:
        return {}
    
    # Log available columns
    print(f"Available columns in income_stmt for {symbol}: {income_stmt.columns.tolist()}", file=sys.stderr)
    
    # Adjust the columns based on available data
    earnings = []
    for column in income_stmt.columns:
        try:
            date = pd.to_datetime(column)
            actual_eps = income_stmt.at['Earnings', column] if 'Earnings' in income_stmt.index else None
            estimated_eps = income_stmt.at['Net Income', column] if 'Net Income' in income_stmt.index else None
            earnings.append({
                "date": date.strftime("%Y-%m-%d"),
                "actualEPS": None if pd.isna(actual_eps) else actual_eps,
                "estimatedEPS": None if pd.isna(estimated_eps) else estimated_eps
            })
        except Exception as e:
            print(f"Error processing column {column}: {e}", file=sys.stderr)
    
    return {
        "symbol": symbol,
        "earnings": earnings
    }

if __name__ == "__main__":
    command = sys.argv[1]
    symbol = sys.argv[2]
    if command == "price":
        result = fetch_stock_price(symbol)
    elif command == "fundamentals":
        result = fetch_stock_fundamentals(symbol)
    elif command == "tech":
        result = fetch_technical_data(symbol)
    elif command == "news":
        result = fetch_news_data(symbol)
    elif command == "dividends":
        result = fetch_dividends_data(symbol)
    elif command == "earnings":
        result = fetch_earnings_data(symbol)
    else:
        result = {}
    print(json.dumps(result))