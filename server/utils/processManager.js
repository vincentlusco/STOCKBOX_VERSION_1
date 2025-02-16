const { spawn } = require('child_process');
const MemoryMonitor = require('./memoryMonitor');

class ProcessManager {
  constructor(options = {}) {
    this.maxRestarts = options.maxRestarts || 5;
    this.restartDelay = options.restartDelay || 5000;
    this.restartCount = 0;
    this.lastRestartTime = null;

    this.monitor = new MemoryMonitor({
      warningThreshold: 80,
      criticalThreshold: 90,
      maxMemoryMB: 256,
      checkInterval: 60000
    });

    this.setupMonitoring();
  }

  setupMonitoring() {
    this.monitor.on('warning', (metrics) => {
      console.warn(`Memory warning: ${this.monitor.formatBytes(metrics.heap.used)} used`);
      this.cleanup();
    });

    this.monitor.on('critical', (metrics) => {
      console.error(`Memory critical: ${this.monitor.formatBytes(metrics.heap.used)} used`);
      this.restartProcess();
    });

    this.monitor.start();
  }

  cleanup() {
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    // Clear caches
    if (global.cacheService) {
      global.cacheService.clearAll();
    }
  }

  async restartProcess() {
    const now = Date.now();
    
    // Reset restart count if last restart was more than 1 hour ago
    if (this.lastRestartTime && (now - this.lastRestartTime) > 3600000) {
      this.restartCount = 0;
    }

    if (this.restartCount >= this.maxRestarts) {
      console.error('Maximum restart attempts reached. Manual intervention required.');
      process.exit(1);
    }

    this.restartCount++;
    this.lastRestartTime = now;

    console.log('Restarting process...');
    
    // Graceful shutdown
    await this.shutdown();
    
    // Spawn new process
    const child = spawn(process.argv[0], process.argv.slice(1), {
      detached: true,
      stdio: 'inherit'
    });

    child.unref();
    process.exit();
  }

  async shutdown() {
    // Cleanup connections
    if (global.mongoose) {
      await global.mongoose.disconnect();
    }

    // Close server
    if (global.server) {
      await new Promise(resolve => global.server.close(resolve));
    }

    // Stop monitoring
    this.monitor.stop();
  }
}

module.exports = ProcessManager; 