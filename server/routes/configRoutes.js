const express = require('express');
const router = express.Router();
const { getApiStatus } = require('../controllers/configController');

router.get('/status', getApiStatus);

module.exports = router; 