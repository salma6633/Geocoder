/**
 * Application configuration
 */
const config = {
  port: process.env.PORT || 3000,
  environment: process.env.NODE_ENV || 'development',
  pythonPath: process.env.PYTHON_PATH || 'python',
  modelPath: process.env.MODEL_PATH || './src/models/eta_model.txt',
  logLevel: process.env.LOG_LEVEL || 'info',
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  },
  apiVersion: process.env.API_VERSION || 'v1',
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '15000', 10),
  
  // MongoDB configuration
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/armada-directions',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'armada-directions-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  }
};

module.exports = config;
