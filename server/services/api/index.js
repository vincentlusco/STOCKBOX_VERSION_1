// Consolidate all API services into a single export
const yahooFinance = require('./yahooFinance');
const finnHub = require('./finnHub');
const alphaVantage = require('./alphaVantage');
const polygon = require('./polygon');
const fmp = require('./fmp');
const fred = require('./fred');
const newsAPI = require('./newsAPI');

module.exports = {
  yahooFinance,
  finnHub,
  alphaVantage,
  polygon,
  fmp,
  fred,
  newsAPI
}; 