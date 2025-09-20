/**
 * Logging middleware
 * Logs API requests to the database for tracking and analytics
 */
const RequestLog = require('../../models/RequestLog');
const logger = require('../../utils/logger');

// Endpoint mapping for human-readable names and categories
const endpointMapping = {
  '/api/v1/public/eta': {
    name: 'ETA Prediction',
    category: 'estimation'
  },
  '/api/v1/public/distance': {
    name: 'Distance Calculation',
    category: 'estimation'
  },
  '/api/v1/auth/login': {
    name: 'User Login',
    category: 'authentication'
  },
  '/api/v1/auth/signup': {
    name: 'User Registration',
    category: 'authentication'
  },
  '/api/v1/auth/me': {
    name: 'Get User Profile',
    category: 'authentication'
  },
  '/api/v1/api-keys': {
    name: 'API Keys Management',
    category: 'management'
  },
  '/api/v1/usage': {
    name: 'Usage Statistics',
    category: 'analytics'
  },
  '/api/v1/logs': {
    name: 'Request Logs',
    category: 'analytics'
  },
  '/api/v1/status': {
    name: 'System Status',
    category: 'system'
  }
};

// Helper function to get endpoint info
const getEndpointInfo = (route) => {
  // Remove query parameters for matching
  const baseRoute = route.split('?')[0];
  
  // Try exact match first
  if (endpointMapping[baseRoute]) {
    return endpointMapping[baseRoute];
  }
  
  // Try to match route patterns (for routes with IDs)
  for (const [pattern, info] of Object.entries(endpointMapping)) {
    // Convert exact routes to patterns by replacing IDs with wildcards
    const patternRegex = pattern.replace(/\/:[^/]+/g, '/[^/]+');
    if (new RegExp(`^${patternRegex}$`).test(baseRoute)) {
      return info;
    }
  }
  
  // Default values if no match found
  return {
    name: 'Unknown Endpoint',
    category: 'other'
  };
};

const loggingMiddleware = async (req, res, next) => {
  // Record the start time for calculating response time
  const startTime = Date.now();
  
  // Add a flag to track if this request has been logged
  req._isLogged = false;
  
  // Store original response methods
  const originalSend = res.send;
  const originalJson = res.json;
  const originalEnd = res.end;
  
  // Get the endpoint route without the full server URL
  const endpointRoute = req.originalUrl;
  
  // Get endpoint info
  const { name: endpointName, category: endpointCategory } = getEndpointInfo(endpointRoute);
  
  // Create a function to log the request
  const logRequest = async (responseBody, statusCode) => {
    try {
      // Check if this request has already been logged
      if (req._isLogged) {
        return;
      }
      
      // Mark this request as logged
      req._isLogged = true;
      
      // Calculate response time
      const responseTime = Date.now() - startTime;
      
      // Determine if the request was successful based on status code
      const isSuccess = statusCode >= 200 && statusCode < 400;
      
      // Extract response message
      let responseMessage = 'Request processed';
      if (isSuccess) {
        responseMessage = 'Request successful';
      }
      
      if (responseBody) {
        if (typeof responseBody === 'string') {
          try {
            const parsedBody = JSON.parse(responseBody);
            if (parsedBody.error) {
              responseMessage = parsedBody.error;
            } else if (parsedBody.message) {
              responseMessage = parsedBody.message;
            } else if (parsedBody.success !== undefined) {
              responseMessage = parsedBody.success ? 'Operation successful' : 'Operation failed';
            } else if (parsedBody.data) {
              responseMessage = 'Data retrieved successfully';
            }
          } catch (e) {
            // If not JSON, use the first part of the response
            responseMessage = responseBody.substring(0, 200); // Limit string length
          }
        } else if (typeof responseBody === 'object') {
          if (responseBody.error) {
            responseMessage = responseBody.error;
          } else if (responseBody.message) {
            responseMessage = responseBody.message;
          } else if (responseBody.success !== undefined) {
            responseMessage = responseBody.success ? 'Operation successful' : 'Operation failed';
          } else if (responseBody.data) {
            responseMessage = 'Data retrieved successfully';
          }
        }
      } else {
        // If no response body, use status code to determine message
        if (statusCode === 200) responseMessage = 'OK';
        else if (statusCode === 201) responseMessage = 'Created';
        else if (statusCode === 204) responseMessage = 'No Content';
        else if (statusCode === 400) responseMessage = 'Bad Request';
        else if (statusCode === 401) responseMessage = 'Unauthorized';
        else if (statusCode === 403) responseMessage = 'Forbidden';
        else if (statusCode === 404) responseMessage = 'Not Found';
        else if (statusCode === 429) responseMessage = 'Too Many Requests';
        else if (statusCode >= 500) responseMessage = 'Server Error';
      }
      
      // Create the log entry
      const requestLog = new RequestLog({
        userId: req.user ? req.user._id : null,
        apiKeyId: req.apiKey ? req.apiKey._id : null,
        apiKey: req.apiKey ? req.apiKey.key : null, // Include the actual API key value
        apiKeyName: req.apiKey ? req.apiKey.name : null, // Include the API key name
        requestStatus: statusCode,
        responseMessage: responseMessage,
        requestDate: new Date(),
        creditsUsed: req.apiSettings ? req.apiSettings.costPerRequest : 1,
        endpointRoute: endpointRoute,
        endpointName: endpointName, // Add endpoint name
        endpointCategory: endpointCategory, // Add endpoint category
        method: req.method,
        requestBody: req.method !== 'GET' ? req.body : null,
        responseTime: responseTime,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        errorDetails: !isSuccess ? responseMessage : null,
        isSuccess: isSuccess
      });
      
      // Save the log entry
      await requestLog.save();
      
      logger.info(`Request logged: ${req.method} ${endpointRoute} (${endpointName}) - Status: ${statusCode} - User: ${req.user ? req.user._id : 'anonymous'} - API Key: ${req.apiKey ? req.apiKey.name : 'none'} - Response time: ${responseTime}ms`);
    } catch (error) {
      // Don't let logging errors affect the API response
      logger.error(`Error logging request: ${error.message}`);
    }
  };
  
  // Override response methods to capture the response
  res.send = function(body) {
    logRequest(body, res.statusCode);
    return originalSend.apply(this, arguments);
  };
  
  res.json = function(body) {
    logRequest(body, res.statusCode);
    return originalJson.apply(this, arguments);
  };
  
  res.end = function(chunk, encoding) {
    logRequest(chunk, res.statusCode);
    return originalEnd.apply(this, arguments);
  };
  
  // Continue to the next middleware
  next();
};

module.exports = loggingMiddleware;
