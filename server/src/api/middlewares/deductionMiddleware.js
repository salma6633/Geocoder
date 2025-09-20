const User = require('../../models/User');
const UserApiSettings = require('../../models/UserApiSettings');
const logger = require('../../utils/logger');

/**
 * Middleware to handle API usage tracking, rate limiting, and credit deduction
 * This middleware should be used after apiKeyMiddleware which attaches the user to the request
 */
const deductionMiddleware = async (req, res, next) => {
  try {
    // The apiKeyMiddleware should have attached the user to the request
    if (!req.user) {
      return res.status(500).json({ 
        success: false,
        error: 'User not found in request. Make sure apiKeyMiddleware is used before this middleware.' 
      });
    }

    // Get the user from the database to ensure we have the latest data
    const user = await User.findById(req.user._id).populate('activeApiSettings');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // Get the user's API settings
    const apiSettings = user.activeApiSettings;
    if (!apiSettings) {
      return res.status(404).json({ 
        success: false,
        error: 'API settings not found for this user' 
      });
    }

    // Check if user has enough credits
    if (apiSettings.totalCredits - apiSettings.usedCredits < apiSettings.costPerRequest) {
      return res.status(403).json({ 
        success: false,
        error: 'Insufficient credits. Please add more credits to your account.' 
      });
    }

    // Check rate limits
    const now = new Date();

    // Reset counters if time periods have elapsed
    if (now - apiSettings.lastMinuteReset > 60000) { // 1 minute in milliseconds
      apiSettings.currentMinuteRequests = 0;
      apiSettings.lastMinuteReset = now;
    }

    if (now - apiSettings.lastHourReset > 3600000) { // 1 hour in milliseconds
      apiSettings.currentHourRequests = 0;
      apiSettings.lastHourReset = now;
    }

    if (now - apiSettings.lastDayReset > 86400000) { // 1 day in milliseconds
      apiSettings.currentDayRequests = 0;
      apiSettings.lastDayReset = now;
    }

    // Check if rate limits are exceeded
    if (apiSettings.currentMinuteRequests >= apiSettings.requestsPerMinute) {
      return res.status(429).json({ 
        success: false,
        error: 'Rate limit exceeded. Too many requests per minute.' 
      });
    }

    if (apiSettings.currentHourRequests >= apiSettings.requestsPerHour) {
      return res.status(429).json({ 
        success: false,
        error: 'Rate limit exceeded. Too many requests per hour.' 
      });
    }

    if (apiSettings.currentDayRequests >= apiSettings.requestsPerDay) {
      return res.status(429).json({ 
        success: false,
        error: 'Rate limit exceeded. Too many requests per day.' 
      });
    }

    if (apiSettings.currentConcurrentRequests >= apiSettings.concurrentRequests) {
      return res.status(429).json({ 
        success: false,
        error: 'Too many concurrent requests. Please try again later.' 
      });
    }

    // Increment concurrent requests counter
    apiSettings.currentConcurrentRequests += 1;
    await apiSettings.save();

    // Add a flag to track if API settings have been updated for this request
    req._apiSettingsUpdated = false;

    // Store the original response methods
    const originalSend = res.send;
    const originalJson = res.json;
    const originalEnd = res.end;

    // Function to update API settings after request completes
    const updateApiSettings = async (isSuccess) => {
      try {
        // Check if API settings have already been updated for this request
        if (req._apiSettingsUpdated) {
          return;
        }
        
        // Mark API settings as updated for this request
        req._apiSettingsUpdated = true;
        
        // Refresh API settings to get the latest state
        const updatedApiSettings = await UserApiSettings.findById(apiSettings._id);
        
        // Decrement concurrent requests counter
        updatedApiSettings.currentConcurrentRequests = Math.max(0, updatedApiSettings.currentConcurrentRequests - 1);
        
        // Increment request counters
        updatedApiSettings.totalRequests += 1;
        updatedApiSettings.currentMinuteRequests += 1;
        updatedApiSettings.currentHourRequests += 1;
        updatedApiSettings.currentDayRequests += 1;
        
        // Update success/failure counts
        if (isSuccess) {
          updatedApiSettings.successfulRequestsCount += 1;
        } else {
          updatedApiSettings.failedRequestsCount += 1;
        }
        
        // Deduct credits
        updatedApiSettings.usedCredits += updatedApiSettings.costPerRequest;
        
        await updatedApiSettings.save();
        
        logger.info(`API request processed for user ${user._id}. Success: ${isSuccess}, Remaining credits: ${updatedApiSettings.totalCredits - updatedApiSettings.usedCredits}`);
      } catch (error) {
        logger.error(`Error updating API settings: ${error.message}`);
      }
    };

    // Override response methods to track when the request completes
    res.send = function(body) {
      const isSuccess = res.statusCode >= 200 && res.statusCode < 400;
      updateApiSettings(isSuccess);
      return originalSend.apply(this, arguments);
    };

    res.json = function(body) {
      const isSuccess = res.statusCode >= 200 && res.statusCode < 400;
      updateApiSettings(isSuccess);
      return originalJson.apply(this, arguments);
    };

    res.end = function(chunk, encoding) {
      const isSuccess = res.statusCode >= 200 && res.statusCode < 400;
      updateApiSettings(isSuccess);
      return originalEnd.apply(this, arguments);
    };

    // Attach the API settings to the request for potential use in later middleware or controllers
    req.apiSettings = apiSettings;

    next();
  } catch (error) {
    logger.error(`Error in deduction middleware: ${error.message}`);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error during request processing' 
    });
  }
};

module.exports = deductionMiddleware;
