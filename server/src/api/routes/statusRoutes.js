/**
 * Status Routes
 */
const express = require('express');
const { getStatus } = require('../controllers/statusController');

const router = express.Router();

/**
 * @route   GET /api/v1/status
 * @desc    Get server status
 * @access  Public
 */
router.get('/', getStatus);

module.exports = router;
