import pandas as pd
import numpy as np

def calculateSMA(series, window):
    return series.rolling(window=window).mean()

def calculateEMA(series, window):
    return series.ewm(span=window, adjust=False).mean()

def calculateRSI(series, window):
    delta = series.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=window).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=window).mean()
    rs = gain / loss
    return 100 - (100 / (1 + rs))

def calculateBollingerBands(series, window):
    sma = calculateSMA(series, window)
    std = series.rolling(window=window).std()
    upper_band = sma + (std * 2)
    lower_band = sma - (std * 2)
    return {'upper': upper_band, 'lower': lower_band}

def calculateMACD(series, fast=12, slow=26, signal=9):
    fast_ema = calculateEMA(series, fast)
    slow_ema = calculateEMA(series, slow)
    macd = fast_ema - slow_ema
    signal_line = calculateEMA(macd, signal)
    return macd - signal_line

def calculateStochastic(data, k_window=14, d_window=3):
    low_min = data['Low'].rolling(window=k_window).min()
    high_max = data['High'].rolling(window=k_window).max()
    k = 100 * ((data['Close'] - low_min) / (high_max - low_min))
    d = k.rolling(window=d_window).mean()
    return d

def calculateATR(data, window=14):
    high_low = data['High'] - data['Low']
    high_close = np.abs(data['High'] - data['Close'].shift())
    low_close = np.abs(data['Low'] - data['Close'].shift())
    tr = high_low.combine(high_close, max).combine(low_close, max)
    return tr.rolling(window=window).mean()

def calculateParabolicSAR(data, af=0.02, max_af=0.2):
    high = data['High']
    low = data['Low']
    close = data['Close']
    sar = close.copy()
    trend = 1
    ep = high[0]
    af = af
    for i in range(1, len(close)):
        sar[i] = sar[i - 1] + af * (ep - sar[i - 1])
        if trend == 1:
            if high[i] > ep:
                ep = high[i]
                af = min(af + 0.02, max_af)
            if low[i] < sar[i]:
                trend = -1
                ep = low[i]
                af = 0.02
                sar[i] = ep
        else:
            if low[i] < ep:
                ep = low[i]
                af = min(af + 0.02, max_af)
            if high[i] > sar[i]:
                trend = 1
                ep = high[i]
                af = 0.02
                sar[i] = ep
    return sar

def calculateADX(data, window=14):
    high = data['High']
    low = data['Low']
    close = data['Close']
    plus_dm = high.diff()
    minus_dm = low.diff()
    plus_dm[plus_dm < 0] = 0
    minus_dm[minus_dm > 0] = 0
    tr = calculateATR(data, window)
    plus_di = 100 * (plus_dm.rolling(window=window).mean() / tr)
    minus_di = 100 * (minus_dm.rolling(window=window).mean() / tr)
    dx = 100 * (np.abs(plus_di - minus_di) / (plus_di + minus_di))
    adx = dx.rolling(window=window).mean()
    return adx