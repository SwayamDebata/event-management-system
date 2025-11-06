const { Profile } = require('../models');
const { body, validationResult } = require('express-validator');

const validateProfile = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('timezone')
    .optional()
    .isString()
    .withMessage('Timezone must be a string')
];

// Get all profiles
const getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: profiles,
      count: profiles.length
    });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profiles',
      error: error.message
    });
  }
};

// Create a new profile
const createProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, timezone = 'UTC' } = req.body;

    const existingProfile = await Profile.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Profile with this name already exists'
      });
    }

    const profile = new Profile({
      name,
      timezone
    });

    await profile.save();

    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      data: profile
    });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating profile',
      error: error.message
    });
  }
};

// Get profile by ID
const getProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const profile = await Profile.findById(id);
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// Update profile timezone
const updateProfileTimezone = async (req, res) => {
  try {
    const { id } = req.params;
    const { timezone } = req.body;

    if (!timezone) {
      return res.status(400).json({
        success: false,
        message: 'Timezone is required'
      });
    }

    const profile = await Profile.findByIdAndUpdate(
      id,
      { timezone },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile timezone updated successfully',
      data: profile
    });
  } catch (error) {
    console.error('Error updating profile timezone:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile timezone',
      error: error.message
    });
  }
};

module.exports = {
  getAllProfiles,
  createProfile,
  getProfileById,
  updateProfileTimezone,
  validateProfile
};