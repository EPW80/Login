// backend/routes/index.js (create if doesn't exist)
const express = require('express');
const router = express.Router();

// Root route
router.get('/', (req, res) => {
  res.json({
    message: 'MetaMask Login Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      users: '/api/users',
      auth: '/api/auth',
      health: '/api/health'
    }
  });
});

// Health check endpoint
router.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

module.exports = router;