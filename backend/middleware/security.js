// === NEW: backend/middleware/security.js - Additional security middleware ===
const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");
const helmet = require("helmet");

// Enhanced rate limiting for different endpoints
const createRateLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      console.warn(
        `Rate limit exceeded for IP: ${req.ip}, endpoint: ${req.path}`
      );
      res.status(429).json({
        error: message,
        code: "RATE_LIMIT_EXCEEDED",
        retryAfter: Math.ceil(windowMs / 1000),
      });
    },
    trustProxy: process.env.NODE_ENV === "production",
  });

// Progressive delay for repeated requests - FIXED for v2
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 2, // Allow 2 requests per windowMs without delay

  // Fixed delayMs for express-slow-down v2
  delayMs: (used, req) => {
    const delayAfter = req.slowDown.limit;
    return (used - delayAfter) * 500; // 500ms delay per request after delayAfter
  },

  maxDelayMs: 5000, // Maximum delay of 5 seconds

  onLimitReached: (req, res, options) => {
    console.warn(`Speed limit reached for IP: ${req.ip}`);
  },

  // Disable the warning message
  validate: {
    delayMs: false,
  },
});

// Security headers with MetaMask-friendly settings
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"], // Allow WebSocket for MetaMask
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  crossOriginEmbedderPolicy: false, // Disable for MetaMask compatibility
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

// CORS configuration for MetaMask
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:3001",
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = {
  // Different rate limiters for different use cases
  authLimiter: createRateLimiter(
    15 * 60 * 1000,
    5,
    "Too many authentication attempts"
  ),
  generalLimiter: createRateLimiter(15 * 60 * 1000, 100, "Too many requests"),
  strictLimiter: createRateLimiter(
    5 * 60 * 1000,
    3,
    "Too many sensitive requests"
  ),
  speedLimiter,
  securityHeaders,
  corsOptions,
};
