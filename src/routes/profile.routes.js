const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const profileController = require('../controllers/profile.controller');

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile and stats management
 */

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get current user profile (redirects to auth/profile for consistency)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 */
const { getProfile } = require('../controllers/auth.controller');
router.get('/', protect, getProfile);

/**
 * @swagger
 * /profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 */
router.put('/', protect, upload.single('avatar'), profileController.updateProfile);

/**
 * @swagger
 * /profile/stats:
 *   get:
 *     summary: Get user profile stats
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', protect, profileController.getProfileStats);

module.exports = router;
