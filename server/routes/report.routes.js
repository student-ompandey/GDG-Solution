const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const validate = require('../middlewares/validate.middleware');
const { reportSchema } = require('../utils/validators');
const { optionalAuth } = require('../middlewares/auth.middleware');
const reportController = require('../controllers/report.controller');

/**
 * Stricter rate limiter for report submission to prevent spam.
 * 10 reports per IP per 15-minute window.
 */
const reportRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many reports submitted. Please try again later.',
  },
});

/**
 * @swagger
 * tags:
 *   name: Community Reports
 *   description: Community scam reporting & trending
 */

/**
 * @swagger
 * /report:
 *   post:
 *     summary: Submit a new scam report
 *     tags: [Community Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, content, riskScore, riskLevel]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [url, message, qr, image, audio]
 *               content:
 *                 type: string
 *               riskScore:
 *                 type: number
 *               riskLevel:
 *                 type: string
 *                 enum: [safe, low, medium, high, critical]
 *               signals:
 *                 type: array
 *                 items:
 *                   type: string
 *               explanation:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Scam reported successfully
 *       200:
 *         description: Duplicate report — count incremented
 */
router.post(
  '/',
  reportRateLimiter,
  optionalAuth,
  validate(reportSchema),
  reportController.createReport
);

/**
 * @swagger
 * /reports:
 *   get:
 *     summary: Fetch all community scam reports
 *     tags: [Community Reports]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Results per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by type
 *     responses:
 *       200:
 *         description: Reports fetched successfully
 */
router.get('/', reportController.getReports);

/**
 * @swagger
 * /reports/trending:
 *   get:
 *     summary: Fetch top trending scam reports
 *     tags: [Community Reports]
 *     parameters:
 *       - in: query
 *         name: count
 *         schema:
 *           type: integer
 *         description: Number of trending reports (default 10)
 *     responses:
 *       200:
 *         description: Trending reports fetched successfully
 */
router.get('/trending', reportController.getTrendingReports);

module.exports = router;
