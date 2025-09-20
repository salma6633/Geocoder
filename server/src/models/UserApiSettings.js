/**
 * User API Settings model
 */
const mongoose = require('mongoose');

const userApiSettingsSchema = new mongoose.Schema({
  totalCredits: {
    type: Number,
    default: 1000
  },
  usedCredits: {
    type: Number,
    default: 0
  },
  totalRequests: {
    type: Number,
    default: 0
  },
  successfulRequestsCount: {
    type: Number,
    default: 0
  },
  failedRequestsCount: {
    type: Number,
    default: 0
  },
  requestsPerMinute: {
    type: Number,
    default: 500
  },
  requestsPerHour: {
    type: Number,
    default: 30000
  },
  requestsPerDay: {
    type: Number,
    default: 72000
  },
  concurrentRequests: {
    type: Number,
    default: 100
  },
  // Rate limiting tracking fields
  currentMinuteRequests: {
    type: Number,
    default: 0
  },
  currentHourRequests: {
    type: Number,
    default: 0
  },
  currentDayRequests: {
    type: Number,
    default: 0
  },
  currentConcurrentRequests: {
    type: Number,
    default: 0
  },
  lastMinuteReset: {
    type: Date,
    default: Date.now
  },
  lastHourReset: {
    type: Date,
    default: Date.now
  },
  lastDayReset: {
    type: Date,
    default: Date.now
  },
  costPerRequest: {
    type: Number,
    default: 1 // Default cost in credits per request
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
  collection: 'user-api-settings' // Specify the collection name
});

const UserApiSettings = mongoose.model('UserApiSettings', userApiSettingsSchema);

module.exports = UserApiSettings;
