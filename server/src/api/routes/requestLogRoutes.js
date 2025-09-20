/**
 * Request Log Routes
 * Routes for viewing user's request logs
 */
const express = require('express');
const { getUserLogs, getUserLogById, getUserLogStats } = require('../controllers/requestLogController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get user's log statistics
router.get('/stats', getUserLogStats);

// Get user's logs with pagination and filtering
router.get('/', getUserLogs);

// Get user's log by ID
router.get('/:id', getUserLogById);

module.exports = router;
