/**
 * Request Log Controller
 * Handles operations related to request logs
 */
const RequestLog = require('../../models/RequestLog');
const logger = require('../../utils/logger');

/**
 * @desc    Get user's request logs with pagination and filtering
 * @route   GET /api/v1/logs
 * @access  Private
 */
exports.getUserLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    
    // Build filter object based on query parameters
    const filter = {
      userId: req.user._id // Only show logs for the current user
    };
    
    // Filter by status code if provided
    if (req.query.status) {
      filter.requestStatus = parseInt(req.query.status, 10);
    }
    
    // Filter by success/failure if provided
    if (req.query.success === 'true') {
      filter.isSuccess = true;
    } else if (req.query.success === 'false') {
      filter.isSuccess = false;
    }
    
    // Filter by endpoint route if provided
    if (req.query.endpoint) {
      filter.endpointRoute = { $regex: req.query.endpoint, $options: 'i' };
    }
    
    // Filter by endpoint name if provided
    if (req.query.endpointName) {
      filter.endpointName = { $regex: req.query.endpointName, $options: 'i' };
    }
    
    // Filter by endpoint category if provided
    if (req.query.category) {
      filter.endpointCategory = { $regex: req.query.category, $options: 'i' };
    }
    
    // Filter by API key name if provided
    if (req.query.apiKeyName) {
      filter.apiKeyName = { $regex: req.query.apiKeyName, $options: 'i' };
    }
    
    // Filter by API key ID if provided
    if (req.query.apiKeyId) {
      filter.apiKeyId = req.query.apiKeyId;
    }
    
    // Filter by date range if provided
    if (req.query.startDate || req.query.endDate) {
      filter.requestDate = {};
      
      if (req.query.startDate) {
        filter.requestDate.$gte = new Date(req.query.startDate);
      }
      
      if (req.query.endDate) {
        filter.requestDate.$lte = new Date(req.query.endDate);
      }
    }
    
    // Get total count for pagination
    const total = await RequestLog.countDocuments(filter);
    
    // Get logs with pagination - only populate apiKeyId with name, not the key
    const logs = await RequestLog.find(filter)
      .sort({ requestDate: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate('apiKeyId', 'name'); // Only include name, not key
    
    // Pagination result
    const pagination = {
      total,
      pages: Math.ceil(total / limit),
      page,
      limit
    };
    
    res.status(200).json({
      success: true,
      pagination,
      data: logs
    });
  } catch (error) {
    logger.error(`Error getting user request logs: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get user's request log by ID
 * @route   GET /api/v1/logs/:id
 * @access  Private
 */
exports.getUserLogById = async (req, res, next) => {
  try {
    const log = await RequestLog.findOne({
      _id: req.params.id,
      userId: req.user._id // Ensure the log belongs to the current user
    }).populate('apiKeyId', 'name'); // Only include name, not key
    
    if (!log) {
      return res.status(404).json({
        success: false,
        error: 'Request log not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: log
    });
  } catch (error) {
    logger.error(`Error getting user request log by ID: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get user's request logs statistics
 * @route   GET /api/v1/logs/stats
 * @access  Private
 */
exports.getUserLogStats = async (req, res, next) => {
  try {
    // Get date range for filtering
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    
    // Get total requests count for the user
    const totalRequests = await RequestLog.countDocuments({
      userId: req.user._id,
      requestDate: { $gte: startDate, $lte: endDate }
    });
    
    // Get successful requests count for the user
    const successfulRequests = await RequestLog.countDocuments({
      userId: req.user._id,
      requestDate: { $gte: startDate, $lte: endDate },
      isSuccess: true
    });
    
    // Get failed requests count for the user
    const failedRequests = await RequestLog.countDocuments({
      userId: req.user._id,
      requestDate: { $gte: startDate, $lte: endDate },
      isSuccess: false
    });
    
    // Get average response time for the user
    const avgResponseTimeResult = await RequestLog.aggregate([
      {
        $match: {
          userId: req.user._id,
          requestDate: { $gte: startDate, $lte: endDate },
          responseTime: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTime' }
        }
      }
    ]);
    
    const avgResponseTime = avgResponseTimeResult.length > 0 ? avgResponseTimeResult[0].avgResponseTime : 0;
    
    // Get requests by endpoint for the user
    const requestsByEndpoint = await RequestLog.aggregate([
      {
        $match: {
          userId: req.user._id,
          requestDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            route: '$endpointRoute',
            name: '$endpointName',
            category: '$endpointCategory'
          },
          count: { $sum: 1 },
          successCount: {
            $sum: {
              $cond: [{ $eq: ['$isSuccess', true] }, 1, 0]
            }
          },
          failureCount: {
            $sum: {
              $cond: [{ $eq: ['$isSuccess', false] }, 1, 0]
            }
          },
          avgResponseTime: { $avg: '$responseTime' }
        }
      },
      {
        $project: {
          _id: 0,
          route: '$_id.route',
          name: '$_id.name',
          category: '$_id.category',
          count: 1,
          successCount: 1,
          failureCount: 1,
          successRate: {
            $cond: [
              { $eq: ['$count', 0] },
              0,
              { $multiply: [{ $divide: ['$successCount', '$count'] }, 100] }
            ]
          },
          avgResponseTime: 1
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    // Get requests by API key for the user - only include name, not the actual key
    const requestsByApiKey = await RequestLog.aggregate([
      {
        $match: {
          userId: req.user._id,
          requestDate: { $gte: startDate, $lte: endDate },
          apiKeyName: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: {
            id: '$apiKeyId',
            name: '$apiKeyName'
          },
          count: { $sum: 1 },
          successCount: {
            $sum: {
              $cond: [{ $eq: ['$isSuccess', true] }, 1, 0]
            }
          },
          failureCount: {
            $sum: {
              $cond: [{ $eq: ['$isSuccess', false] }, 1, 0]
            }
          },
          avgResponseTime: { $avg: '$responseTime' }
        }
      },
      {
        $project: {
          _id: 0,
          apiKeyId: '$_id.id',
          apiKeyName: '$_id.name',
          count: 1,
          successCount: 1,
          failureCount: 1,
          successRate: {
            $cond: [
              { $eq: ['$count', 0] },
              0,
              { $multiply: [{ $divide: ['$successCount', '$count'] }, 100] }
            ]
          },
          avgResponseTime: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get total credits used
    const totalCreditsUsed = await RequestLog.aggregate([
      {
        $match: {
          userId: req.user._id,
          requestDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalCredits: { $sum: '$creditsUsed' }
        }
      }
    ]);
    
    const creditsUsed = totalCreditsUsed.length > 0 ? totalCreditsUsed[0].totalCredits : 0;
    
    res.status(200).json({
      success: true,
      data: {
        totalRequests,
        successfulRequests,
        failedRequests,
        successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
        avgResponseTime,
        creditsUsed,
        requestsByEndpoint,
        requestsByApiKey,
        dateRange: {
          startDate,
          endDate
        }
      }
    });
  } catch (error) {
    logger.error(`Error getting user request log statistics: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get user's request logs by endpoint category
 * @route   GET /api/v1/logs/categories
 * @access  Private
 */
exports.getLogsByCategory = async (req, res, next) => {
  try {
    // Get date range for filtering
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    
    // Get requests by category
    const requestsByCategory = await RequestLog.aggregate([
      {
        $match: {
          userId: req.user._id,
          requestDate: { $gte: startDate, $lte: endDate },
          endpointCategory: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$endpointCategory',
          count: { $sum: 1 },
          successCount: {
            $sum: {
              $cond: [{ $eq: ['$isSuccess', true] }, 1, 0]
            }
          },
          failureCount: {
            $sum: {
              $cond: [{ $eq: ['$isSuccess', false] }, 1, 0]
            }
          },
          creditsUsed: { $sum: '$creditsUsed' },
          avgResponseTime: { $avg: '$responseTime' }
        }
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          count: 1,
          successCount: 1,
          failureCount: 1,
          creditsUsed: 1,
          successRate: {
            $cond: [
              { $eq: ['$count', 0] },
              0,
              { $multiply: [{ $divide: ['$successCount', '$count'] }, 100] }
            ]
          },
          avgResponseTime: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: requestsByCategory
    });
  } catch (error) {
    logger.error(`Error getting logs by category: ${error.message}`);
    next(error);
  }
};
