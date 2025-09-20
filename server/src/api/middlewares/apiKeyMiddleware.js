/**
 * API Key middleware
 */
const ApiKey = require('../../models/ApiKey');
const User = require('../../models/User');
const logger = require('../../utils/logger');

/**
 * Middleware to authenticate requests using API key
 * Verifies the API key from the X-API-Key header
 */
exports.authenticateApiKey = async (req, res, next) => {
  try {
    // Check if API key is provided in header
    const apiKey = req.header('X-API-Key');
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'API key is required'
      });
    }
    
    // Find the API key in the database
    const key = await ApiKey.findOne({ key: apiKey });
    
    if (!key) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API key'
      });
    }
    
    // Check if the API key is active
    if (key.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: `API key is ${key.status}`
      });
    }
    
    // Check if the API key is expired
    if (key.isExpired()) {
      key.status = 'expired';
      await key.save();
      
      return res.status(401).json({
        success: false,
        error: 'API key has expired'
      });
    }
    
    // Find the user associated with the API key and populate the activeApiSettings
    const user = await User.findById(key.userId).populate('activeApiSettings');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Check if user has active API settings
    if (!user.activeApiSettings) {
      return res.status(401).json({
        success: false,
        error: 'User does not have active API settings'
      });
    }
    
    // Update last used timestamp
    key.lastUsed = new Date();
    await key.save();
    
    // Add user and API key to request object
    req.user = user;
    req.apiKey = key;
    
    next();
  } catch (error) {
    logger.error(`API key authentication error: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: 'Server error during API key authentication'
    });
  }
};

/**
 * Middleware to check if the API key has the required permission
 * @param {String} permission - The permission to check for
 */
exports.requirePermission = (permission) => {
  return (req, res, next) => {
    // Check if request was authenticated with API key
    if (!req.apiKey) {
      return res.status(403).json({
        success: false,
        error: 'API key authentication required for this endpoint'
      });
    }
    
    // Check if API key has the required permission
    if (!req.apiKey.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        error: `API key does not have the required permission: ${permission}`
      });
    }
    
    next();
  };
};
