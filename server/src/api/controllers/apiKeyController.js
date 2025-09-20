/**
 * API Key controller
 */
const ApiKey = require('../../models/ApiKey');
const logger = require('../../utils/logger');

/**
 * @desc    Create a new API key
 * @route   POST /api/v1/api-keys
 * @access  Private
 */
exports.createApiKey = async (req, res, next) => {
  try {
    const { name, permissions, expiration } = req.body;
    
    // Validate input
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'API key name is required'
      });
    }
    
    // Generate a new API key
    const keyValue = ApiKey.generateApiKey();
    
    // Calculate expiration date if provided
    let expiresAt = null;
    if (expiration && expiration !== 'never') {
      expiresAt = new Date();
      
      if (expiration === '30days') {
        expiresAt.setDate(expiresAt.getDate() + 30);
      } else if (expiration === '90days') {
        expiresAt.setDate(expiresAt.getDate() + 90);
      } else if (expiration === '1year') {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      }
    }
    
    // Create the API key
    const apiKey = await ApiKey.create({
      name,
      key: keyValue,
      userId: req.user._id,
      permissions: permissions || ['time_estimation', 'distance_estimation'],
      expires: expiresAt
    });
    
    // Remove sensitive information
    const apiKeyResponse = {
      id: apiKey._id,
      name: apiKey.name,
      key: keyValue, // Only return the key value once when created
      created: apiKey.created,
      expires: apiKey.expires,
      status: apiKey.status,
      permissions: apiKey.permissions
    };
    
    res.status(201).json({
      success: true,
      data: apiKeyResponse
    });
  } catch (error) {
    logger.error(`Create API key error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get all API keys for the current user
 * @route   GET /api/v1/api-keys
 * @access  Private
 */
exports.getApiKeys = async (req, res, next) => {
  try {
    const apiKeys = await ApiKey.find({ userId: req.user._id });
    
    // Format the response to hide the actual key values
    const formattedApiKeys = apiKeys.map(key => ({
      id: key._id,
      name: key.name,
      created: key.created,
      expires: key.expires,
      status: key.status,
      permissions: key.permissions,
      lastUsed: key.lastUsed
    }));
    
    res.status(200).json({
      success: true,
      count: formattedApiKeys.length,
      data: formattedApiKeys
    });
  } catch (error) {
    logger.error(`Get API keys error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get a single API key
 * @route   GET /api/v1/api-keys/:id
 * @access  Private
 */
exports.getApiKey = async (req, res, next) => {
  try {
    const apiKey = await ApiKey.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!apiKey) {
      return res.status(404).json({
        success: false,
        error: 'API key not found'
      });
    }
    
    // Format the response to hide the actual key value
    const formattedApiKey = {
      id: apiKey._id,
      name: apiKey.name,
      created: apiKey.created,
      expires: apiKey.expires,
      status: apiKey.status,
      permissions: apiKey.permissions,
      lastUsed: apiKey.lastUsed
    };
    
    res.status(200).json({
      success: true,
      data: formattedApiKey
    });
  } catch (error) {
    logger.error(`Get API key error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Update an API key
 * @route   PUT /api/v1/api-keys/:id
 * @access  Private
 */
exports.updateApiKey = async (req, res, next) => {
  try {
    const { name, permissions, status } = req.body;
    
    // Find the API key
    let apiKey = await ApiKey.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!apiKey) {
      return res.status(404).json({
        success: false,
        error: 'API key not found'
      });
    }
    
    // Update fields
    if (name) apiKey.name = name;
    if (permissions) apiKey.permissions = permissions;
    if (status) apiKey.status = status;
    
    // Save the updated API key
    await apiKey.save();
    
    // Format the response
    const formattedApiKey = {
      id: apiKey._id,
      name: apiKey.name,
      created: apiKey.created,
      expires: apiKey.expires,
      status: apiKey.status,
      permissions: apiKey.permissions,
      lastUsed: apiKey.lastUsed
    };
    
    res.status(200).json({
      success: true,
      data: formattedApiKey
    });
  } catch (error) {
    logger.error(`Update API key error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Delete an API key
 * @route   DELETE /api/v1/api-keys/:id
 * @access  Private
 */
exports.deleteApiKey = async (req, res, next) => {
  try {
    const apiKey = await ApiKey.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!apiKey) {
      return res.status(404).json({
        success: false,
        error: 'API key not found'
      });
    }
    
    await apiKey.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    logger.error(`Delete API key error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Revoke an API key
 * @route   PUT /api/v1/api-keys/:id/revoke
 * @access  Private
 */
exports.revokeApiKey = async (req, res, next) => {
  try {
    const apiKey = await ApiKey.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!apiKey) {
      return res.status(404).json({
        success: false,
        error: 'API key not found'
      });
    }
    
    // Update status to revoked
    apiKey.status = 'revoked';
    await apiKey.save();
    
    // Format the response
    const formattedApiKey = {
      id: apiKey._id,
      name: apiKey.name,
      created: apiKey.created,
      expires: apiKey.expires,
      status: apiKey.status,
      permissions: apiKey.permissions,
      lastUsed: apiKey.lastUsed
    };
    
    res.status(200).json({
      success: true,
      data: formattedApiKey
    });
  } catch (error) {
    logger.error(`Revoke API key error: ${error.message}`);
    next(error);
  }
};
