/**
 * Notification controller
 */
const Notification = require('../../models/Notification');
const logger = require('../../utils/logger');

/**
 * @desc    Create a new notification
 * @route   POST /api/v1/notifications
 * @access  Private
 */
exports.createNotification = async (req, res, next) => {
  try {
    const { title, message, type, global, userId } = req.body;

    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Please provide title and message'
      });
    }

    // Create notification object
    const notificationData = {
      title,
      message,
      type: type || 'info',
      global: global || false,
      isRead: false
    };

    // If it's not a global notification, a user ID is required
    if (!global && userId) {
      notificationData.user = userId;
    } else if (!global && !userId) {
      // If not global and no userId provided, use the authenticated user
      notificationData.user = req.user._id;
    }

    // Create notification
    const notification = await Notification.create(notificationData);

    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    logger.error(`Create notification error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get all notifications for the authenticated user or global notifications
 * @route   GET /api/v1/notifications
 * @access  Private
 */
exports.getNotifications = async (req, res, next) => {
  try {
    // Find notifications that are either global or belong to the authenticated user
    const notifications = await Notification.find({
      $or: [
        { global: true },
        { user: req.user._id }
      ]
    }).sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    logger.error(`Get notifications error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Mark a notification as read
 * @route   PUT /api/v1/notifications/:id/read
 * @access  Private
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const notificationId = req.params.id;

    // Find the notification
    let notification = await Notification.findById(notificationId);

    // Check if notification exists
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    // Check if the notification belongs to the authenticated user or is global
    if (!notification.global && notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this notification'
      });
    }

    // Update the notification
    notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    logger.error(`Mark notification as read error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Mark all notifications as read for the authenticated user
 * @route   PUT /api/v1/notifications/read-all
 * @access  Private
 */
exports.markAllAsRead = async (req, res, next) => {
  try {
    // Update all notifications that are either global or belong to the authenticated user
    await Notification.updateMany(
      {
        $or: [
          { global: true },
          { user: req.user._id }
        ],
        isRead: false
      },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    logger.error(`Mark all notifications as read error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get a notification by ID
 * @route   GET /api/v1/notifications/:id
 * @access  Private
 */
exports.getNotificationById = async (req, res, next) => {
  try {
    const notificationId = req.params.id;

    // Find the notification
    const notification = await Notification.findById(notificationId);

    // Check if notification exists
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    // Check if the notification belongs to the authenticated user or is global
    if (!notification.global && notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this notification'
      });
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    logger.error(`Get notification by ID error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Delete a notification
 * @route   DELETE /api/v1/notifications/:id
 * @access  Private
 */
exports.deleteNotification = async (req, res, next) => {
  try {
    const notificationId = req.params.id;

    // Find the notification
    const notification = await Notification.findById(notificationId);

    // Check if notification exists
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    // Check if the notification belongs to the authenticated user or is global
    if (!notification.global && notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this notification'
      });
    }

    // Delete the notification
    await notification.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    logger.error(`Delete notification error: ${error.message}`);
    next(error);
  }
};
