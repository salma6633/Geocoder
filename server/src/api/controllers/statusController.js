/**
 * Status Controller
 */
const os = require('os');
const { version } = require('../../../package.json');
const logger = require('../../utils/logger');

/**
 * @desc    Get server status
 * @route   GET /api/v1/status
 * @access  Public
 */
const getStatus = (req, res) => {
  logger.info('Status request received');
  
  const status = {
    status: 'online',
    timestamp: new Date().toISOString(),
    serverInfo: {
      name: 'Express API Server',
      version,
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development'
    },
    system: {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      memory: {
        total: `${Math.round(os.totalmem() / 1024 / 1024)} MB`,
        free: `${Math.round(os.freemem() / 1024 / 1024)} MB`,
        usage: `${Math.round((os.totalmem() - os.freemem()) / os.totalmem() * 100)}%`
      },
      cpu: os.cpus()[0].model,
      cores: os.cpus().length
    }
  };
  
  res.json(status);
};

module.exports = {
  getStatus
};
