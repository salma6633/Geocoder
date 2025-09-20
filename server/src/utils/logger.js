/**
 * Logger utility
 */
const config = require('../config');

// Define log levels
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

// Get configured log level
const configuredLevel = config.logLevel.toLowerCase();
const currentLogLevel = LOG_LEVELS[configuredLevel] || LOG_LEVELS.info;

/**
 * Format log message with timestamp and level
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @returns {string} - Formatted log message
 */
const formatLogMessage = (level, message) => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
};

/**
 * Log message if level is enabled
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {any} optionalParams - Additional parameters
 */
const log = (level, message, ...optionalParams) => {
  if (LOG_LEVELS[level] <= currentLogLevel) {
    const formattedMessage = formatLogMessage(level, message);
    
    switch (level) {
      case 'error':
        console.error(formattedMessage, ...optionalParams);
        break;
      case 'warn':
        console.warn(formattedMessage, ...optionalParams);
        break;
      case 'info':
        console.info(formattedMessage, ...optionalParams);
        break;
      case 'debug':
        console.debug(formattedMessage, ...optionalParams);
        break;
      default:
        console.log(formattedMessage, ...optionalParams);
    }
  }
};

// Logger interface
const logger = {
  error: (message, ...optionalParams) => log('error', message, ...optionalParams),
  warn: (message, ...optionalParams) => log('warn', message, ...optionalParams),
  info: (message, ...optionalParams) => log('info', message, ...optionalParams),
  debug: (message, ...optionalParams) => log('debug', message, ...optionalParams)
};

module.exports = logger;
