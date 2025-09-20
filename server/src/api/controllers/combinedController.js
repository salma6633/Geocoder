/**
 * Combined Model Controller
 * Handles requests for combined distance and ETA predictions
 */
const combinedService = require('../../services/combinedService');
const logger = require('../../utils/logger');

/**
 * @desc    Predict combined distance and ETA
 * @route   POST /api/v1/public/combined
 * @access  Public (with API key)
 */
const predictCombined = async (req, res, next) => {
  try {
    logger.info('Combined prediction request received');
    logger.debug('Request body:', req.body);
    
    const result = await combinedService.predictCombined(req.body);
    
    logger.info('Combined prediction successful');
    logger.debug('Prediction result:', result);
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('Combined prediction controller error:', error.message);
    next(error);
  }
};

module.exports = {
  predictCombined
};
