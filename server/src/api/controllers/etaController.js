/**
 * ETA Controller
 */
const etaService = require('../../services/etaService');
const logger = require('../../utils/logger');

/**
 * @desc    Predict ETA
 * @route   POST /api/v1/eta
 * @access  Public
 */
const predictETA = async (req, res, next) => {
  try {
    logger.info('ETA prediction request received');
    logger.debug('Request body:', req.body);
    
    const result = await etaService.predictETA(req.body);
    
    logger.info('ETA prediction successful');
    logger.debug('Prediction result:', result);
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('ETA prediction controller error:', error.message);
    next(error);
  }
};

module.exports = {
  predictETA
};
