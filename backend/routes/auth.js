const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { validateAuth } = require('../middleware/validators');

// Import specific rate limiters
const { authLimiter, strictLimiter } = require('../middleware/security');

// Apply strict rate limiting to authentication endpoints
router.post('/authenticate', 
  authLimiter,        // Rate limit authentication attempts
  validateAuth,       // Validate input
  authController.authenticate
);

router.post('/refresh-token', 
  strictLimiter,      // Very strict rate limiting for token refresh
  authController.refreshToken
);

router.post('/logout', 
  authController.logout
);

module.exports = router;