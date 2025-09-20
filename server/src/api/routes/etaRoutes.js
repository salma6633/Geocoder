/**
 * ETA Routes
 */
const express = require('express');
const { predictETA } = require('../controllers/etaController');

const router = express.Router();

/**
 * @route   POST /api/v1/eta
 * @desc    Predict ETA
 * @access  Public
 */
router.post('/', predictETA);

module.exports = router;
