const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const { validateAuth } = require("../middleware/validators");

// Import specific rate limiters
const { authLimiter, strictLimiter } = require("../middleware/security");

// Enhanced request logging middleware
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  console.log('\n=== AUTH REQUEST START ===');
  console.log(`Request ID: ${requestId}`);
  console.log(`Timestamp: ${timestamp}`);
  console.log(`Method: ${req.method}`);
  console.log(`Path: ${req.originalUrl}`);
  console.log(`IP: ${req.ip}`);
  console.log(`User-Agent: ${req.get('User-Agent')}`);
  
  // Log headers (excluding sensitive ones)
  const logHeaders = { ...req.headers };
  delete logHeaders.authorization;
  delete logHeaders.cookie;
  console.log('Headers:', JSON.stringify(logHeaders, null, 2));
  
  // Log body (with sensitive data masked)
  if (req.body && Object.keys(req.body).length > 0) {
    const logBody = { ...req.body };
    
    // Mask sensitive data
    if (logBody.signature) {
      logBody.signature = logBody.signature.substring(0, 10) + '...' + logBody.signature.substring(-10);
    }
    if (logBody.refreshToken) {
      logBody.refreshToken = logBody.refreshToken.substring(0, 10) + '...';
    }
    
    console.log('Body:', JSON.stringify(logBody, null, 2));
  }
  
  // Add request ID to request object for tracking
  req.requestId = requestId;
  req.startTime = Date.now();
  
  // Log response when it's sent
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - req.startTime;
    
    console.log('\n=== AUTH RESPONSE ===');
    console.log(`Request ID: ${requestId}`);
    console.log(`Status: ${res.statusCode}`);
    console.log(`Duration: ${duration}ms`);
    
    // Log response body (with sensitive data masked)
    try {
      const responseData = JSON.parse(data);
      const logResponse = { ...responseData };
      
      // Mask sensitive response data
      if (logResponse.accessToken) {
        logResponse.accessToken = logResponse.accessToken.substring(0, 20) + '...';
      }
      if (logResponse.refreshToken) {
        logResponse.refreshToken = logResponse.refreshToken.substring(0, 20) + '...';
      }
      
      console.log('Response:', JSON.stringify(logResponse, null, 2));
    } catch (e) {
      console.log('Response (raw):', data);
    }
    
    console.log('=== AUTH REQUEST END ===\n');
    
    return originalSend.call(this, data);
  };
  
  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  console.error('\n=== AUTH ERROR ===');
  console.error(`Request ID: ${req.requestId || 'unknown'}`);
  console.error(`Error: ${err.message}`);
  console.error(`Stack: ${err.stack}`);
  console.error('=== AUTH ERROR END ===\n');
  next(err);
};

// Debug middleware for development
const debugMiddleware = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('\n🐛 DEBUG INFO:');
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Auth endpoint: ${req.path}`);
    console.log(`Content-Type: ${req.get('Content-Type')}`);
    console.log(`Content-Length: ${req.get('Content-Length')}`);
    
    // Log query parameters if any
    if (Object.keys(req.query).length > 0) {
      console.log('Query params:', req.query);
    }
    
    console.log('🐛 DEBUG END\n');
  }
  next();
};

// Success logging middleware
const successLogger = (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      console.log(`✅ SUCCESS: ${req.method} ${req.path} - ${res.statusCode} (${req.requestId})`);
    } else if (res.statusCode >= 400) {
      console.log(`❌ ERROR: ${req.method} ${req.path} - ${res.statusCode} (${req.requestId})`);
    }
  });
  next();
};

// Apply logging middleware to all auth routes
router.use(requestLogger);
router.use(debugMiddleware);
router.use(successLogger);

// Authentication endpoint with comprehensive logging
router.post(
  "/authenticate",
  authLimiter, // Rate limit authentication attempts
  (req, res, next) => {
    console.log('🔐 Starting authentication process...');
    next();
  },
  validateAuth, // Validate input
  (req, res, next) => {
    console.log('✅ Input validation passed');
    next();
  },
  authController.authenticate
);

// Refresh token endpoint
router.post(
  "/refresh-token",
  strictLimiter, // Very strict rate limiting for token refresh
  (req, res, next) => {
    console.log('🔄 Starting token refresh process...');
    next();
  },
  authController.refreshToken
);

// Logout endpoint
router.post(
  "/logout", 
  (req, res, next) => {
    console.log('👋 Starting logout process...');
    next();
  },
  authController.logout
);

// Health check endpoint for auth service
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'auth',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Apply error logging middleware
router.use(errorLogger);

module.exports = router;
