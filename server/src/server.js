/**
 * Server entry point
 */
const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');

// Start the server
const server = app.listen(config.port, () => {
  logger.info(`✅ Server running in ${config.environment} mode on port ${config.port}`);
  logger.info(`API available at http://localhost:${config.port}/api/${config.apiVersion}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = server;
