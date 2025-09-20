/**
 * API Key routes
 */
const express = require('express');
const {
  createApiKey,
  getApiKeys,
  getApiKey,
  updateApiKey,
  deleteApiKey,
  revokeApiKey
} = require('../controllers/apiKeyController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Routes
router.route('/')
  .post(createApiKey)
  .get(getApiKeys);

router.route('/:id')
  .get(getApiKey)
  .put(updateApiKey)
  .delete(deleteApiKey);

router.route('/:id/revoke')
  .put(revokeApiKey);

module.exports = router;
