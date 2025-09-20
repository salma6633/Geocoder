/**
 * Notification routes
 */
const express = require('express');
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Protect all routes
router.use(authMiddleware.protect);

// Routes
router.route('/')
  .get(notificationController.getNotifications)
  .post(notificationController.createNotification);

router.route('/read-all')
  .put(notificationController.markAllAsRead);

router.route('/:id/read')
  .put(notificationController.markAsRead);

router.route('/:id')
  .get(notificationController.getNotificationById)
  .delete(notificationController.deleteNotification);

module.exports = router;
