const { Event, Profile, UpdateLog } = require('../models');
const { body, validationResult } = require('express-validator');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const validateEvent = [
  body('profiles')
    .isArray({ min: 1 })
    .withMessage('At least one profile must be selected'),
  body('timezone')
    .notEmpty()
    .withMessage('Timezone is required'),
  body('startDate')
    .isISO8601()
    .withMessage('Valid start date is required'),
  body('endDate')
    .isISO8601()
    .withMessage('Valid end date is required')
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title must not exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters')
];

const logEventChanges = async (eventId, previousData, newData, timezone) => {
  const changes = {};
  const previousValues = {};
  const newValues = {};
  
  const fieldsToTrack = ['profiles', 'timezone', 'startDate', 'endDate', 'title', 'description'];
  
  fieldsToTrack.forEach(field => {
    const prev = previousData[field];
    const curr = newData[field];
    
    if (JSON.stringify(prev) !== JSON.stringify(curr)) {
      changes[field] = {
        from: prev,
        to: curr
      };
      previousValues[field] = prev;
      newValues[field] = curr;
    }
  });

  if (Object.keys(changes).length > 0) {
    const changeType = Object.keys(changes).length === 1 ? Object.keys(changes)[0] : 'multiple';
    
    await UpdateLog.create({
      eventId,
      changes,
      previousValues,
      newValues,
      timezone,
      changeType
    });
  }
};

// Get all events
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('profiles', 'name timezone')
      .sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      data: events,
      count: events.length
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
};

// Get events for a specific profile
const getEventsByProfile = async (req, res) => {
  try {
    const { profileId } = req.params;
    const { timezone: userTimezone } = req.query;

    const events = await Event.find({ profiles: profileId })
      .populate('profiles', 'name timezone')
      .sort({ startDate: 1 });

    let formattedEvents = events;
    if (userTimezone) {
      formattedEvents = events.map(event => {
        const eventObj = event.toObject();
        eventObj.startDateFormatted = dayjs(event.startDate).tz(userTimezone);
        eventObj.endDateFormatted = dayjs(event.endDate).tz(userTimezone);
        eventObj.createdAtFormatted = dayjs(event.createdAt).tz(userTimezone);
        eventObj.updatedAtFormatted = dayjs(event.updatedAt).tz(userTimezone);
        return eventObj;
      });
    }

    res.status(200).json({
      success: true,
      data: formattedEvents,
      count: formattedEvents.length
    });
  } catch (error) {
    console.error('Error fetching events for profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events for profile',
      error: error.message
    });
  }
};

// Create a new event
const createEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { profiles, timezone, startDate, endDate, title, description } = req.body;

    // Verify all profiles exist
    const profileDocs = await Profile.find({ _id: { $in: profiles } });
    if (profileDocs.length !== profiles.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more profiles not found'
      });
    }

    const startDateUTC = dayjs.tz(startDate, timezone).utc().toDate();
    const endDateUTC = dayjs.tz(endDate, timezone).utc().toDate();

    const event = new Event({
      profiles,
      timezone,
      startDate: startDateUTC,
      endDate: endDateUTC,
      title: title || '',
      description: description || ''
    });

    await event.save();

    await event.populate('profiles', 'name timezone');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: error.message
    });
  }
};

// Update an event
const updateEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { profiles, timezone, startDate, endDate, title, description } = req.body;

    const existingEvent = await Event.findById(id).populate('profiles');
    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Verify all profiles exist
    if (profiles) {
      const profileDocs = await Profile.find({ _id: { $in: profiles } });
      if (profileDocs.length !== profiles.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more profiles not found'
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (profiles) updateData.profiles = profiles;
    if (timezone) updateData.timezone = timezone;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;

    if (startDate) {
      updateData.startDate = dayjs.tz(startDate, timezone || existingEvent.timezone).utc().toDate();
    }
    if (endDate) {
      updateData.endDate = dayjs.tz(endDate, timezone || existingEvent.timezone).utc().toDate();
    }

    // Update the event
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('profiles', 'name timezone');

    await logEventChanges(
      id, 
      existingEvent.toObject(), 
      updatedEvent.toObject(), 
      timezone || existingEvent.timezone
    );

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating event',
      error: error.message
    });
  }
};

// Get event by ID
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const { timezone: userTimezone } = req.query;

    const event = await Event.findById(id).populate('profiles', 'name timezone');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    let eventResponse = event.toObject();

    if (userTimezone) {
      eventResponse.startDateFormatted = dayjs(event.startDate).tz(userTimezone);
      eventResponse.endDateFormatted = dayjs(event.endDate).tz(userTimezone);
      eventResponse.createdAtFormatted = dayjs(event.createdAt).tz(userTimezone);
      eventResponse.updatedAtFormatted = dayjs(event.updatedAt).tz(userTimezone);
    }

    res.status(200).json({
      success: true,
      data: eventResponse
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event',
      error: error.message
    });
  }
};

// Get event update logs
const getEventLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const { timezone: userTimezone } = req.query;

    const logs = await UpdateLog.find({ eventId: id }).sort({ timestamp: -1 });

    let formattedLogs = logs;
    if (userTimezone) {
      formattedLogs = logs.map(log => {
        const logObj = log.toObject();
        logObj.timestampFormatted = dayjs(log.timestamp).tz(userTimezone);
        return logObj;
      });
    }

    res.status(200).json({
      success: true,
      data: formattedLogs,
      count: formattedLogs.length
    });
  } catch (error) {
    console.error('Error fetching event logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event logs',
      error: error.message
    });
  }
};

module.exports = {
  getAllEvents,
  getEventsByProfile,
  createEvent,
  updateEvent,
  getEventById,
  getEventLogs,
  validateEvent
};