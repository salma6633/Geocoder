/**
 * Error handling middleware
 */
const logger = require('../../utils/logger');
const config = require('../../config');

/**
 * Handle 404 errors
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Handle all other errors
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Error:', err.message);
  if (config.environment === 'development') {
    logger.error(err.stack);
  }

  // Set status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Send error response
  res.status(statusCode).json({
    error: err.message,
    stack: config.environment === 'production' ? '🥞' : err.stack,
    path: req.originalUrl
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
