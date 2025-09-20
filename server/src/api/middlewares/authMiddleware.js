/**
 * Authentication middleware
 */
const jwt = require('jsonwebtoken');
const config = require('../../config');
const User = require('../../models/User');

/**
 * Middleware to protect routes that require authentication
 * Verifies the JWT token from the Authorization header
 */
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Check if Authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Extract token from header
      token = req.headers.authorization.split(' ')[1];
    }
    
    // If no token found, return unauthorized error
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwt.secret);
      
      // Find user by id from decoded token
      const user = await User.findById(decoded.id);
      
      // If user not found, return unauthorized error
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }
      
      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to restrict access to specific roles
 * @param {...String} roles - Roles allowed to access the route
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    
    next();
  };
};
