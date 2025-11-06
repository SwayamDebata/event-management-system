const mongoose = require('mongoose');

const updateLogSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  changes: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  previousValues: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  newValues: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  timezone: {
    type: String,
    required: true
  },
  changeType: {
    type: String,
    enum: ['profiles', 'timezone', 'startDate', 'endDate', 'title', 'description', 'multiple'],
    required: true
  }
}, {
  timestamps: true
});

// Add indexes for efficient querying
updateLogSchema.index({ eventId: 1, timestamp: -1 });
updateLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('UpdateLog', updateLogSchema);