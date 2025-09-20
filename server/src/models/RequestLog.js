/**
 * Request Log model
 * Logs API requests for tracking and analytics
 */
const mongoose = require('mongoose');

const requestLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  apiKeyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApiKey'
  },
  apiKey: {
    type: String,
    description: 'The actual API key value for easier identification'
  },
  apiKeyName: {
    type: String,
    description: 'The name of the API key'
  },
  requestStatus: {
    type: Number, // HTTP status code
    required: true
  },
  responseMessage: {
    type: String
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  creditsUsed: {
    type: Number,
    default: 1
  },
  endpointRoute: {
    type: String,
    required: true
  },
  endpointName: {
    type: String,
    description: 'Human-readable name of the endpoint'
  },
  endpointCategory: {
    type: String,
    description: 'Category of the endpoint (e.g., "estimation", "prediction")'
  },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    required: true
  },
  requestBody: {
    type: mongoose.Schema.Types.Mixed
  },
  responseTime: {
    type: Number, // in milliseconds
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  errorDetails: {
    type: String
  },
  isSuccess: {
    type: Boolean,
    required: true
  }
}, {
  timestamps: true,
  collection: 'request-logs' // Specify the collection name
});

// Index for faster queries
requestLogSchema.index({ userId: 1, requestDate: -1 });
requestLogSchema.index({ endpointRoute: 1 });
requestLogSchema.index({ endpointCategory: 1 });
requestLogSchema.index({ requestStatus: 1 });
requestLogSchema.index({ isSuccess: 1 });
requestLogSchema.index({ apiKey: 1 });
requestLogSchema.index({ apiKeyName: 1 });

const RequestLog = mongoose.model('RequestLog', requestLogSchema);

module.exports = RequestLog;
