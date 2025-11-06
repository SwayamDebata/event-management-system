const express = require('express');
const router = express.Router();
const {
  getAllProfiles,
  createProfile,
  getProfileById,
  updateProfileTimezone,
  validateProfile
} = require('../controllers/profileController');

// GET /api/profiles - Get all profiles
router.get('/', getAllProfiles);

// POST /api/profiles - Create a new profile
router.post('/', validateProfile, createProfile);

// GET /api/profiles/:id - Get profile by ID
router.get('/:id', getProfileById);

// PUT /api/profiles/:id/timezone - Update profile timezone
router.put('/:id/timezone', updateProfileTimezone);

module.exports = router;