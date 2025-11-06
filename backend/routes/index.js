const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Event Management API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API info endpoint
router.get('/info', (req, res) => {
  res.status(200).json({
    success: true,
    api: {
      name: 'Event Management API',
      version: '1.0.0',
      description: 'API for managing events across multiple users and timezones'
    },
    endpoints: {
      profiles: '/api/profiles',
      events: '/api/events',
      health: '/api/health'
    }
  });
});

module.exports = router;