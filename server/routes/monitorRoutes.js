const express = require('express');
const router = express.Router();

router.get('/metrics', (req, res) => {
  if (!global.processManager) {
    return res.status(404).json({ error: 'Monitoring not enabled' });
  }

  const metrics = global.processManager.monitor.getHistory();
  res.json(metrics);
});

module.exports = router; 