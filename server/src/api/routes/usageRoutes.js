/**
 * Usage Routes
 * Routes for viewing user's usage statistics and limits
 */
const express = require('express');
const { getUserUsage } = require('../controllers/usageController');

const router = express.Router();

// Get user's usage statistics and limits
router.get('/', getUserUsage);

module.exports = router;
