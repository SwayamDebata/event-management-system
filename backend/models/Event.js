const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  profiles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  }],
  timezone: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  title: {
    type: String,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

eventSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'));
  }
  next();
});

eventSchema.index({ profiles: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ createdAt: -1 });

// Virtual for duration calculation
eventSchema.virtual('duration').get(function() {
  return this.endDate - this.startDate;
});

module.exports = mongoose.model('Event', eventSchema);