/**
 * Notification model
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['success', 'error', 'warning', 'info'],
    default: 'info',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Not required if it's a global notification
  },
  global: {
    type: Boolean,
    default: false
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'notifications' // Explicitly set collection name
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
