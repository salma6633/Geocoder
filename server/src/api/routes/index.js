/**
 * API Routes
 */
const express = require('express');
const etaRoutes = require('./etaRoutes');
const statusRoutes = require('./statusRoutes');
const authRoutes = require('./authRoutes');
const apiKeyRoutes = require('./apiKeyRoutes');
const publicRoutes = require('./publicRoutes');
const requestLogRoutes = require('./requestLogRoutes');
const usageRoutes = require('./usageRoutes');
const notificationRoutes = require('./notificationRoutes');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes (no authentication required)
router.use('/status', statusRoutes);
router.use('/auth', authRoutes);

// Public routes (API key required)
router.use('/public', publicRoutes);

// Protected routes (JWT authentication required)
router.use('/api-keys', authMiddleware.protect, apiKeyRoutes);
router.use('/logs', authMiddleware.protect, requestLogRoutes);
router.use('/usage', authMiddleware.protect, usageRoutes);
router.use('/notifications', notificationRoutes);

// Legacy routes - will be deprecated
router.use('/eta', etaRoutes);

module.exports = router;
