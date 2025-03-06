const { Transform } = require('stream');
const WebSocket = require('ws');
const { logger } = require('../utils/logger');
const cacheService = require('./cacheService');

// Stream transformer for financial data
const dataTransformer = new Transform({
  objectMode: true,
  highWaterMark: 64, // Lower buffer size for memory efficiency
  transform(chunk, encoding, callback) {
    // Process data in smaller chunks
    try {
      const transformedData = processDataChunk(chunk);
      callback(null, transformedData);
    } catch (error) {
      callback(error);
    }
  }
});

// Memory-efficient data processing
const processDataChunk = (chunk) => {
  // Process data in memory-efficient way
  return chunk;
};

class DataStreamService {
    constructor() {
        this.connections = new Map();
        this.subscriptions = new Map();
        this.finnhubWs = null;
        this.finnhubKey = 'cuh9a81r01qva71t93r0cuh9a81r01qva71t93rg'; // From keys.backup
    }

    init() {
        this.connectToFinnhub();
    }

    connectToFinnhub() {
        this.finnhubWs = new WebSocket(`wss://ws.finnhub.io?token=${this.finnhubKey}`);

        this.finnhubWs.on('open', () => {
            logger.info('Connected to Finnhub WebSocket');
            // Resubscribe to all active symbols
            this.subscriptions.forEach((_, symbol) => {
                this.finnhubWs.send(JSON.stringify({ type: 'subscribe', symbol }));
            });
        });

        this.finnhubWs.on('message', (data) => {
            const parsed = JSON.parse(data);
            if (parsed.type === 'trade') {
                this.handleTradeData(parsed.data);
            }
        });

        this.finnhubWs.on('error', (error) => {
            logger.error('Finnhub WebSocket error:', error);
            this.reconnect();
        });

        this.finnhubWs.on('close', () => {
            logger.warn('Finnhub WebSocket closed');
            this.reconnect();
        });
    }

    handleTradeData(data) {
        data.forEach(trade => {
            const symbol = trade.s;
            const price = trade.p;
            const timestamp = trade.t;
            const volume = trade.v;

            // Update cache
            cacheService.set('PRICE', symbol, {
                price,
                timestamp,
                volume
            });

            // Notify subscribers
            if (this.subscriptions.has(symbol)) {
                this.subscriptions.get(symbol).forEach(ws => {
                    if (ws.readyState === WebSocket.OPEN) {
                        ws.send(JSON.stringify({
                            type: 'price_update',
                            symbol,
                            data: { price, timestamp, volume }
                        }));
                    }
                });
            }
        });
    }

    subscribe(symbol, ws) {
        if (!this.subscriptions.has(symbol)) {
            this.subscriptions.set(symbol, new Set());
            if (this.finnhubWs?.readyState === WebSocket.OPEN) {
                this.finnhubWs.send(JSON.stringify({ type: 'subscribe', symbol }));
            }
        }
        this.subscriptions.get(symbol).add(ws);
    }

    unsubscribe(symbol, ws) {
        if (this.subscriptions.has(symbol)) {
            this.subscriptions.get(symbol).delete(ws);
            if (this.subscriptions.get(symbol).size === 0) {
                this.subscriptions.delete(symbol);
                if (this.finnhubWs?.readyState === WebSocket.OPEN) {
                    this.finnhubWs.send(JSON.stringify({ type: 'unsubscribe', symbol }));
                }
            }
        }
    }

    reconnect() {
        setTimeout(() => {
            logger.info('Attempting to reconnect to Finnhub');
            this.connectToFinnhub();
        }, 5000);
    }

    cleanup() {
        if (this.finnhubWs) {
            this.finnhubWs.close();
        }
        this.subscriptions.clear();
    }
}

module.exports = new DataStreamService(); 