/**
 * Main application file
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./config');
const { errorHandler, notFoundHandler } = require('./api/middlewares/errorMiddleware');
const routes = require('./api/routes');
const logger = require('./utils/logger');

// Connect to MongoDB
mongoose.connect(config.mongodb.uri, config.mongodb.options)
  .then(() => {
    logger.info('MongoDB connected successfully');
  })
  .catch((err) => {
    logger.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  });

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration - allow all origins with comprehensive settings
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // 24 hours
}));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// API routes
app.use(`/api/${config.apiVersion}`, routes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Express server API',
    version: config.apiVersion,
    documentation: '/api/docs'
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
