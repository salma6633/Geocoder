/**
 * Authentication routes
 */
const express = require('express');
const { signup, login, getMe } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;
