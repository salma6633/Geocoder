/**
 * Public API Routes
 * These routes require API key authentication
 */
const express = require('express');
const { predictETA } = require('../controllers/etaController');
const { predictCombined } = require('../controllers/combinedController');
const { predictDistance } = require('../controllers/distanceController');
const { authenticateApiKey, requirePermission } = require('../middlewares/apiKeyMiddleware');
const deductionMiddleware = require('../middlewares/deductionMiddleware');
const loggingMiddleware = require('../middlewares/loggingMiddleware');

const router = express.Router();

/**
 * Apply API key authentication to all public routes
 */
router.use(authenticateApiKey);

/**
 * Apply logging middleware to all public routes after authentication
 * This ensures we have user information for logging
 */
router.use(loggingMiddleware);

/**
 * @route   POST /api/v1/public/eta
 * @desc    Predict ETA
 * @access  Public (with API key)
 * @requires time_estimation permission
 */
router.post('/eta', 
  requirePermission('time_estimation'), 
  deductionMiddleware, 
  predictETA
);

/**
 * @route   POST /api/v1/public/distance
 * @desc    Predict distance
 * @access  Public (with API key)
 * @requires distance_estimation permission
 */
router.post('/distance', 
  requirePermission('distance_estimation'), 
  deductionMiddleware, 
  predictDistance
);

/**
 * @route   POST /api/v1/public/combined
 * @desc    Predict combined distance and ETA
 * @access  Public (with API key)
 * @requires time_estimation permission
 */
router.post('/combined', 
  requirePermission('time_estimation'), 
  deductionMiddleware, 
  predictCombined
);

module.exports = router;
