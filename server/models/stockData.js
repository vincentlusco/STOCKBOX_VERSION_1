const mongoose = require('mongoose');

// Temporary stock data schema with TTL (Time To Live)
const stockDataSchema = new mongoose.Schema({
  symbol: String,
  date: { type: Date, default: Date.now },
  price: Number,
  volume: Number,
  createdAt: { type: Date, expires: '24h', default: Date.now } // Data expires after 24 hours
});

// Index for quick lookups and automatic deletion
stockDataSchema.index({ symbol: 1, createdAt: 1 });
stockDataSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 }); // 24 hours

const StockData = mongoose.model('StockData', stockDataSchema);

module.exports = StockData; 