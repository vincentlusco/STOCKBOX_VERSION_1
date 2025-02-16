const os = require('os');
const EventEmitter = require('events');

class MemoryMonitor extends EventEmitter {
  constructor(options = {}) {
    super();
    this.warningThreshold = options.warningThreshold || 80; // 80% of max memory
    this.criticalThreshold = options.criticalThreshold || 90; // 90% of max memory
    this.maxMemoryMB = options.maxMemoryMB || 256; // 256MB default max
    this.checkInterval = options.checkInterval || 60000; // Check every minute
    this.metrics = [];
    this.maxMetrics = 60; // Store last hour of metrics
  }

  start() {
    this.interval = setInterval(() => this.check(), this.checkInterval);
    console.log('Memory monitoring started');
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  check() {
    const metrics = this.getMetrics();
    this.metrics.push(metrics);
    
    // Keep only last hour of metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Check thresholds
    const usagePercent = (metrics.heapUsed / (this.maxMemoryMB * 1024 * 1024)) * 100;

    if (usagePercent >= this.criticalThreshold) {
      this.emit('critical', metrics);
    } else if (usagePercent >= this.warningThreshold) {
      this.emit('warning', metrics);
    }

    return metrics;
  }

  getMetrics() {
    const used = process.memoryUsage();
    const systemMemory = {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem()
    };

    return {
      timestamp: new Date(),
      heap: {
        used: used.heapUsed,
        total: used.heapTotal,
        external: used.external
      },
      rss: used.rss,
      system: systemMemory,
      processUptime: process.uptime(),
      systemUptime: os.uptime()
    };
  }

  getHistory() {
    return this.metrics;
  }

  formatBytes(bytes) {
    return `${Math.round(bytes / 1024 / 1024)}MB`;
  }
}

module.exports = MemoryMonitor; 