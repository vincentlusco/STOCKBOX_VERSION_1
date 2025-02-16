const WebSocket = require('ws');
const stockService = require('./stockService');
const config = require('../config/lowMemoryConfig');

class WebSocketService {
  constructor(server) {
    this.wss = new WebSocket.Server({ 
      server,
      clientTracking: true,
      maxPayload: 1024 * 8,  // Reduced to 8KB max message size
      perMessageDeflate: {    // Enable compression
        zlibDeflateOptions: {
          level: 9            // Maximum compression
        }
      }
    });
    this.clients = new Map(); // Map clients to their subscribed symbols
    
    this.wss.on('connection', (ws) => {
      // Check client limit
      if (this.wss.clients.size > config.websocket.maxClients) {
        ws.close(1013, 'Maximum number of clients reached');
        return;
      }
      this.handleConnection(ws);
    });

    // Implement periodic cleanup
    setInterval(() => {
      this.wss.clients.forEach(ws => {
        if (!ws.isAlive) {
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  handleConnection(ws) {
    ws.on('message', (message) => {
      const data = JSON.parse(message);
      
      switch(data.type) {
        case 'subscribe':
          this.handleSubscribe(ws, data.symbol);
          break;
        case 'unsubscribe':
          this.handleUnsubscribe(ws, data.symbol);
          break;
      }
    });

    ws.on('close', () => this.handleDisconnect(ws));
  }

  handleSubscribe(ws, symbol) {
    if (!this.clients.has(ws)) {
      this.clients.set(ws, new Set());
    }
    this.clients.get(ws).add(symbol);
    stockService.subscribeToStock(symbol);
  }

  handleUnsubscribe(ws, symbol) {
    const symbols = this.clients.get(ws);
    if (symbols) {
      symbols.delete(symbol);
      stockService.unsubscribeFromStock(symbol);
    }
  }

  handleDisconnect(ws) {
    const symbols = this.clients.get(ws);
    if (symbols) {
      symbols.forEach(symbol => stockService.unsubscribeFromStock(symbol));
      this.clients.delete(ws);
    }
  }

  broadcast(symbol, data) {
    this.wss.clients.forEach(client => {
      if (this.clients.get(client)?.has(symbol)) {
        client.send(JSON.stringify({ symbol, data }));
      }
    });
  }
}

module.exports = WebSocketService; 