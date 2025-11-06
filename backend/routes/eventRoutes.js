const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getEventsByProfile,
  createEvent,
  updateEvent,
  getEventById,
  getEventLogs,
  validateEvent
} = require('../controllers/eventController');

// GET /api/events - Get all events
router.get('/', getAllEvents);

// POST /api/events - Create a new event
router.post('/', validateEvent, createEvent);

// GET /api/events/:id - Get event by ID
router.get('/:id', getEventById);

// PUT /api/events/:id - Update an event
router.put('/:id', validateEvent, updateEvent);

// GET /api/events/profile/:profileId - Get events for a specific profile
router.get('/profile/:profileId', getEventsByProfile);

// GET /api/events/:id/logs - Get event update logs
router.get('/:id/logs', getEventLogs);

module.exports = router;