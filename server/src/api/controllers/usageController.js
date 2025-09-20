/**
 * Usage Controller
 * Provides usage statistics and limits for the authenticated user
 */
const User = require('../../models/User');
const RequestLog = require('../../models/RequestLog');
const logger = require('../../utils/logger');

/**
 * @desc    Get user's usage statistics and limits
 * @route   GET /api/v1/usage
 * @access  Private
 */
exports.getUserUsage = async (req, res, next) => {
  try {
    // Get the authenticated user with API settings
    const user = await User.findById(req.user._id).populate('activeApiSettings');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    if (!user.activeApiSettings) {
      return res.status(404).json({
        success: false,
        error: 'API settings not found for this user'
      });
    }
    
    const apiSettings = user.activeApiSettings;
    
    // Calculate date ranges
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get refresh date (end of month)
    const refreshDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    
    // Get total requests count
    const totalRequests = await RequestLog.countDocuments({
      userId: user._id,
      requestDate: { $gte: thirtyDaysAgo, $lte: now }
    });
    
    // Get successful requests count
    const successfulRequests = await RequestLog.countDocuments({
      userId: user._id,
      requestDate: { $gte: thirtyDaysAgo, $lte: now },
      isSuccess: true
    });
    
    // Get failed requests count
    const failedRequests = await RequestLog.countDocuments({
      userId: user._id,
      requestDate: { $gte: thirtyDaysAgo, $lte: now },
      isSuccess: false
    });
    
    // Calculate success rate
    const successRate = totalRequests > 0 ? ((successfulRequests / totalRequests) * 100).toFixed(2) : 0;
    
    // Get daily credit usage for the last 7 days
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyCreditUsage = await RequestLog.aggregate([
      {
        $match: {
          userId: user._id,
          requestDate: { $gte: sevenDaysAgo, $lte: now }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$requestDate" },
            month: { $month: "$requestDate" },
            day: { $dayOfMonth: "$requestDate" }
          },
          creditsUsed: { $sum: "$creditsUsed" },
          date: { $first: "$requestDate" }
        }
      },
      {
        $sort: { date: 1 }
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: { format: "%b %d", date: "$date" }
          },
          value: "$creditsUsed"
        }
      }
    ]);
    
    // Get daily request history for the last 7 days
    const dailyRequestHistory = await RequestLog.aggregate([
      {
        $match: {
          userId: user._id,
          requestDate: { $gte: sevenDaysAgo, $lte: now }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$requestDate" },
            month: { $month: "$requestDate" },
            day: { $dayOfMonth: "$requestDate" },
            isSuccess: "$isSuccess"
          },
          count: { $sum: 1 },
          date: { $first: "$requestDate" }
        }
      },
      {
        $sort: { date: 1 }
      },
      {
        $group: {
          _id: {
            year: "$_id.year",
            month: "$_id.month",
            day: "$_id.day"
          },
          success: {
            $sum: {
              $cond: [{ $eq: ["$_id.isSuccess", true] }, "$count", 0]
            }
          },
          failed: {
            $sum: {
              $cond: [{ $eq: ["$_id.isSuccess", false] }, "$count", 0]
            }
          },
          date: { $first: "$date" }
        }
      },
      {
        $sort: { date: 1 }
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: { format: "%b %d", date: "$date" }
          },
          success: "$success",
          failed: "$failed"
        }
      }
    ]);
    
    // Get model usage statistics
    const modelUsage = await RequestLog.aggregate([
      {
        $match: {
          userId: user._id,
          requestDate: { $gte: thirtyDaysAgo, $lte: now }
        }
      },
      {
        $group: {
          _id: "$endpointRoute",
          requests: { $sum: 1 },
          credits: { $sum: "$creditsUsed" },
          responseTime: { $avg: "$responseTime" },
          successCount: {
            $sum: {
              $cond: [{ $eq: ["$isSuccess", true] }, 1, 0]
            }
          },
          failureCount: {
            $sum: {
              $cond: [{ $eq: ["$isSuccess", false] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          name: {
            $cond: [
              { $eq: ["$_id", "/api/v1/public/eta"] },
              "Time Estimation",
              {
                $cond: [
                  { $eq: ["$_id", "/api/v1/public/distance"] },
                  "Distance Estimation",
                  "Combined Model"
                ]
              }
            ]
          },
          requests: "$requests",
          credits: "$credits",
          avgResponseTime: { $round: ["$responseTime", 0] },
          successRate: {
            $round: [
              {
                $multiply: [
                  {
                    $cond: [
                      { $eq: [{ $add: ["$successCount", "$failureCount"] }, 0] },
                      0,
                      {
                        $divide: [
                          "$successCount",
                          { $add: ["$successCount", "$failureCount"] }
                        ]
                      }
                    ]
                  },
                  100
                ]
              },
              1
            ]
          }
        }
      }
    ]);
    
    // Calculate credits usage
    const totalCredits = apiSettings.totalCredits;
    const usedCredits = apiSettings.usedCredits;
    const remainingCredits = totalCredits - usedCredits;
    const percentUsed = totalCredits > 0 ? ((usedCredits / totalCredits) * 100).toFixed(1) : 0;
    
    // Format the refresh date
    const formattedRefreshDate = refreshDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Prepare the response
    const usageData = {
      credits: {
        total: totalCredits,
        used: usedCredits,
        remaining: remainingCredits,
        percentUsed: parseFloat(percentUsed),
        refreshDate: formattedRefreshDate,
        history: dailyCreditUsage
      },
      requests: {
        total: totalRequests,
        successful: successfulRequests,
        failed: failedRequests,
        successRate: parseFloat(successRate),
        history: dailyRequestHistory
      },
      models: modelUsage,
      limits: {
        requestsPerMinute: apiSettings.requestsPerMinute,
        requestsPerHour: apiSettings.requestsPerHour,
        requestsPerDay: apiSettings.requestsPerDay,
        concurrentRequests: apiSettings.concurrentRequests
      }
    };
    
    res.status(200).json({
      success: true,
      data: usageData
    });
  } catch (error) {
    logger.error(`Error getting usage data: ${error.message}`);
    next(error);
  }
};
