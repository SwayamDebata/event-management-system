const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100
  },
  timezone: {
    type: String,
    default: 'UTC',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

profileSchema.index({ name: 1 });

// Virtual for formatting created/updated dates
profileSchema.virtual('formattedCreatedAt').get(function() {
  return this.createdAt;
});

profileSchema.virtual('formattedUpdatedAt').get(function() {
  return this.updatedAt;
});

module.exports = mongoose.model('Profile', profileSchema);