const { logger } = require('../../utils/logger');

class TechnicalAnalysis {
    calculateSupportResistance(prices, periods = 20) {
        try {
            const levels = [];
            for (let i = periods; i < prices.length; i++) {
                const windowPrices = prices.slice(i - periods, i);
                const max = Math.max(...windowPrices);
                const min = Math.min(...windowPrices);
                
                if (!levels.includes(max)) levels.push(max);
                if (!levels.includes(min)) levels.push(min);
            }
            
            return {
                support: levels.sort((a, b) => a - b).slice(0, 3),
                resistance: levels.sort((a, b) => b - a).slice(0, 3)
            };
        } catch (error) {
            logger.error('Error calculating support/resistance:', error);
            return { support: [], resistance: [] };
        }
    }

    calculateFibonacciLevels(high, low) {
        const diff = high - low;
        return {
            level_0: low,
            level_236: low + (diff * 0.236),
            level_382: low + (diff * 0.382),
            level_500: low + (diff * 0.500),
            level_618: low + (diff * 0.618),
            level_100: high
        };
    }

    calculateOBV(prices, volumes) {
        let obv = 0;
        const obvValues = [0];
        
        for (let i = 1; i < prices.length; i++) {
            if (prices[i] > prices[i-1]) {
                obv += volumes[i];
            } else if (prices[i] < prices[i-1]) {
                obv -= volumes[i];
            }
            obvValues.push(obv);
        }
        
        return obvValues;
    }

    calculateMFI(high, low, close, volume, period = 14) {
        const typicalPrices = close.map((c, i) => (high[i] + low[i] + c) / 3);
        const moneyFlow = typicalPrices.map((tp, i) => tp * volume[i]);
        
        let posFlow = 0;
        let negFlow = 0;
        
        for (let i = 1; i < period; i++) {
            if (typicalPrices[i] > typicalPrices[i-1]) {
                posFlow += moneyFlow[i];
            } else {
                negFlow += moneyFlow[i];
            }
        }
        
        return 100 - (100 / (1 + (posFlow / negFlow)));
    }

    calculateADX(high, low, close, period = 14) {
        try {
            const tr = this.calculateTrueRange(high, low, close);
            const posDM = this.calculateDirectionalMovement(high, true);
            const negDM = this.calculateDirectionalMovement(low, false);
            
            const smoothedTR = this.wilder(tr, period);
            const smoothedPosDM = this.wilder(posDM, period);
            const smoothedNegDM = this.wilder(negDM, period);
            
            const posDI = (smoothedPosDM / smoothedTR) * 100;
            const negDI = (smoothedNegDM / smoothedTR) * 100;
            
            const dx = Math.abs((posDI - negDI) / (posDI + negDI)) * 100;
            const adx = this.wilder([...Array(period-1).fill(0), dx], period);
            
            return {
                adx,
                plusDI: posDI,
                minusDI: negDI
            };
        } catch (error) {
            logger.error('Error calculating ADX:', error);
            return { adx: 0, plusDI: 0, minusDI: 0 };
        }
    }

    calculateIchimoku(high, low, close) {
        try {
            // Conversion Line (Tenkan-sen) - 9 period
            const conversionLine = this.calculateIchimokuLine(high, low, 9);
            
            // Base Line (Kijun-sen) - 26 period
            const baseLine = this.calculateIchimokuLine(high, low, 26);
            
            // Leading Span A (Senkou Span A)
            const leadingSpanA = (conversionLine + baseLine) / 2;
            
            // Leading Span B (Senkou Span B) - 52 period
            const leadingSpanB = this.calculateIchimokuLine(high, low, 52);
            
            // Lagging Span (Chikou Span)
            const laggingSpan = close.slice(-26);

            return {
                conversionLine,
                baseLine,
                leadingSpanA,
                leadingSpanB,
                laggingSpan
            };
        } catch (error) {
            logger.error('Error calculating Ichimoku:', error);
            return {
                conversionLine: 0,
                baseLine: 0,
                leadingSpanA: 0,
                leadingSpanB: 0,
                laggingSpan: []
            };
        }
    }

    calculateParabolicSAR(high, low, close, af = 0.02, maxAf = 0.2) {
        try {
            const sar = [low[0]];
            let isUpTrend = true;
            let ep = high[0];
            let currentAf = af;

            for (let i = 1; i < close.length; i++) {
                let currentSar = sar[i-1] + currentAf * (ep - sar[i-1]);
                
                if (isUpTrend) {
                    if (low[i] < currentSar) {
                        isUpTrend = false;
                        currentSar = Math.max(...high.slice(Math.max(0, i-5), i));
                        ep = low[i];
                        currentAf = af;
                    } else {
                        if (high[i] > ep) {
                            ep = high[i];
                            currentAf = Math.min(currentAf + af, maxAf);
                        }
                    }
                } else {
                    if (high[i] > currentSar) {
                        isUpTrend = true;
                        currentSar = Math.min(...low.slice(Math.max(0, i-5), i));
                        ep = high[i];
                        currentAf = af;
                    } else {
                        if (low[i] < ep) {
                            ep = low[i];
                            currentAf = Math.min(currentAf + af, maxAf);
                        }
                    }
                }
                
                sar.push(currentSar);
            }
            
            return sar;
        } catch (error) {
            logger.error('Error calculating Parabolic SAR:', error);
            return [];
        }
    }

    // Helper methods
    wilder(data, period) {
        let sum = 0;
        for (let i = 0; i < period; i++) {
            sum += data[i];
        }
        let smooth = sum / period;
        
        for (let i = period; i < data.length; i++) {
            smooth = (smooth * (period - 1) + data[i]) / period;
        }
        
        return smooth;
    }

    calculateTrueRange(high, low, close) {
        const tr = [];
        tr.push(high[0] - low[0]);
        
        for (let i = 1; i < close.length; i++) {
            tr.push(Math.max(
                high[i] - low[i],
                Math.abs(high[i] - close[i-1]),
                Math.abs(low[i] - close[i-1])
            ));
        }
        
        return tr;
    }

    calculateDirectionalMovement(data, isPositive) {
        const dm = [0];
        
        for (let i = 1; i < data.length; i++) {
            const diff = data[i] - data[i-1];
            if (isPositive) {
                dm.push(diff > 0 ? Math.max(diff, 0) : 0);
            } else {
                dm.push(diff < 0 ? Math.max(-diff, 0) : 0);
            }
        }
        
        return dm;
    }

    calculateIchimokuLine(high, low, period) {
        return (Math.max(...high.slice(-period)) + Math.min(...low.slice(-period))) / 2;
    }

    // Moving Averages
    calculateSMA(data, period) {
        try {
            const sma = [];
            for (let i = period - 1; i < data.length; i++) {
                const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
                sma.push(sum / period);
            }
            return sma;
        } catch (error) {
            logger.error('Error calculating SMA:', error);
            return [];
        }
    }

    calculateEMA(data, period) {
        try {
            const k = 2 / (period + 1);
            let ema = [data[0]];
            for (let i = 1; i < data.length; i++) {
                ema.push(data[i] * k + ema[i - 1] * (1 - k));
            }
            return ema;
        } catch (error) {
            logger.error('Error calculating EMA:', error);
            return [];
        }
    }

    calculateVWAP(prices, volumes) {
        try {
            let cumVolume = 0;
            let cumPV = 0;
            return prices.map((price, i) => {
                cumVolume += volumes[i];
                cumPV += price * volumes[i];
                return cumPV / cumVolume;
            });
        } catch (error) {
            logger.error('Error calculating VWAP:', error);
            return [];
        }
    }

    // Momentum Indicators
    calculateRSI(prices, period = 14) {
        try {
            const gains = [];
            const losses = [];
            
            for (let i = 1; i < prices.length; i++) {
                const change = prices[i] - prices[i - 1];
                gains.push(change > 0 ? change : 0);
                losses.push(change < 0 ? -change : 0);
            }
            
            const avgGain = this.wilder(gains, period);
            const avgLoss = this.wilder(losses, period);
            
            return 100 - (100 / (1 + avgGain / avgLoss));
        } catch (error) {
            logger.error('Error calculating RSI:', error);
            return 0;
        }
    }

    calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
        try {
            const fastEMA = this.calculateEMA(prices, fastPeriod);
            const slowEMA = this.calculateEMA(prices, slowPeriod);
            const macdLine = fastEMA.map((fast, i) => fast - slowEMA[i]);
            const signalLine = this.calculateEMA(macdLine, signalPeriod);
            const histogram = macdLine.map((macd, i) => macd - signalLine[i]);

            return {
                macdLine: macdLine[macdLine.length - 1],
                signalLine: signalLine[signalLine.length - 1],
                histogram: histogram[histogram.length - 1]
            };
        } catch (error) {
            logger.error('Error calculating MACD:', error);
            return { macdLine: 0, signalLine: 0, histogram: 0 };
        }
    }

    calculateStochastic(high, low, close, period = 14, smoothK = 3, smoothD = 3) {
        try {
            const K = [];
            for (let i = period - 1; i < close.length; i++) {
                const highestHigh = Math.max(...high.slice(i - period + 1, i + 1));
                const lowestLow = Math.min(...low.slice(i - period + 1, i + 1));
                K.push(100 * (close[i] - lowestLow) / (highestHigh - lowestLow));
            }
            
            const smoothedK = this.calculateSMA(K, smoothK);
            const D = this.calculateSMA(smoothedK, smoothD);
            
            return {
                K: smoothedK[smoothedK.length - 1],
                D: D[D.length - 1]
            };
        } catch (error) {
            logger.error('Error calculating Stochastic:', error);
            return { K: 0, D: 0 };
        }
    }

    // Volatility Indicators
    calculateBollingerBands(prices, period = 20, stdDev = 2) {
        try {
            const sma = this.calculateSMA(prices, period);
            const bands = sma.map((middle, i) => {
                const slice = prices.slice(i - period + 1, i + 1);
                const std = this.calculateStandardDeviation(slice);
                return {
                    upper: middle + (stdDev * std),
                    middle,
                    lower: middle - (stdDev * std)
                };
            });
            return bands[bands.length - 1];
        } catch (error) {
            logger.error('Error calculating Bollinger Bands:', error);
            return { upper: 0, middle: 0, lower: 0 };
        }
    }

    calculateATR(high, low, close, period = 14) {
        try {
            const tr = this.calculateTrueRange(high, low, close);
            return this.wilder(tr, period);
        } catch (error) {
            logger.error('Error calculating ATR:', error);
            return 0;
        }
    }

    calculateBeta(stockReturns, marketReturns) {
        try {
            const covariance = this.calculateCovariance(stockReturns, marketReturns);
            const marketVariance = this.calculateVariance(marketReturns);
            return covariance / marketVariance;
        } catch (error) {
            logger.error('Error calculating Beta:', error);
            return 0;
        }
    }

    // Additional helper methods
    calculateStandardDeviation(data) {
        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        const squareDiffs = data.map(value => Math.pow(value - mean, 2));
        return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / data.length);
    }

    calculateCovariance(x, y) {
        const xMean = x.reduce((a, b) => a + b, 0) / x.length;
        const yMean = y.reduce((a, b) => a + b, 0) / y.length;
        const products = x.map((xi, i) => (xi - xMean) * (y[i] - yMean));
        return products.reduce((a, b) => a + b, 0) / x.length;
    }

    calculateVariance(data) {
        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        const squareDiffs = data.map(value => Math.pow(value - mean, 2));
        return squareDiffs.reduce((a, b) => a + b, 0) / data.length;
    }
}

module.exports = new TechnicalAnalysis(); 