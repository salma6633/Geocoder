/**
 * Authentication controller
 */
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const UserApiSettings = require('../../models/UserApiSettings');
const Notification = require('../../models/Notification');
const config = require('../../config');
const logger = require('../../utils/logger');

/**
 * Generate JWT token
 * @param {Object} user - User object
 * @returns {String} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/signup
 * @access  Public
 */
exports.signup = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, company, agreeMarketing } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already in use'
      });
    }
    
    // First create API settings with preset values
    const apiSettings = await UserApiSettings.create({
      totalCredits: 1000,
      usedCredits: 0,
      totalRequests: 0,
      successfulRequestsCount: 0,
      failedRequestsCount: 0,
      requestsPerMinute: 500,
      requestsPerHour: 30000,
      requestsPerDay: 72000,
      concurrentRequests: 100
    });
    
    // Create new user with reference to API settings
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      company,
      agreeMarketing,
      activeApiSettings: apiSettings._id
    });
    
    // Generate token
    const token = generateToken(user);
    
    // Remove password from response
    user.password = undefined;
    
    // Create welcome notification for the new user
    await Notification.create({
      title: 'Welcome to Armada Etijahat!',
      message: `Welcome ${firstName}! We're excited to have you on board. Start exploring our services and let us know if you need any help.`,
      type: 'success',
      user: user._id,
      global: false,
      isRead: false
    });
    
    res.status(201).json({
      success: true,
      token,
      data: user
    });
  } catch (error) {
    logger.error(`Signup error: ${error.message}`);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }
    
    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Generate token
    const token = generateToken(user);
    
    // Remove password from response
    user.password = undefined;
    
    res.status(200).json({
      success: true,
      token,
      data: user
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('activeApiSettings');
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
