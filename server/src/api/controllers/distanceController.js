/**
 * Distance Controller
 */
const distanceService = require('../../services/distanceService');
const logger = require('../../utils/logger');

/**
 * @desc    Predict Distance
 * @route   POST /api/v1/distance
 * @access  Public
 */
const predictDistance = async (req, res, next) => {
  try {
    logger.info('Distance prediction request received');
    logger.debug('Request body:', req.body);
    
    const result = await distanceService.predictDistance(req.body);
    
    logger.info('Distance prediction successful');
    logger.debug('Prediction result:', result);
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('Distance prediction controller error:', error.message);
    next(error);
  }
};

module.exports = {
  predictDistance
};
