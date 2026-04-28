const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const dashboardController = require('../controllers/dashboard.controller');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: User analytics and statistics
 */

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Get dashboard statistics for the authenticated user
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data fetched successfully
 */
router.get('/', protect, dashboardController.getDashboardData);

module.exports = router;
