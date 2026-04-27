const express = require('express');
const router = express.Router();
const { protect, optionalAuth, authorize } = require('../middlewares/auth.middleware');
const historyController = require('../controllers/history.controller');

/**
 * @swagger
 * tags:
 *   name: History
 *   description: Scan history & statistics
 */

/**
 * @swagger
 * /history:
 *   get:
 *     summary: Get scan history for the authenticated user
 *     tags: [History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [url, message, qr, image]
 *     responses:
 *       200:
 *         description: Paginated scan history
 */
router.get('/', optionalAuth, historyController.getHistory);

/**
 * @swagger
 * /history/stats:
 *   get:
 *     summary: Get aggregate scan statistics (admin only)
 *     tags: [History]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Scan statistics
 *       403:
 *         description: Admin access required
 */
router.get('/stats', protect, authorize('admin'), historyController.getStats);

/**
 * @swagger
 * /history/{id}:
 *   get:
 *     summary: Get a single scan history entry
 *     tags: [History]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Scan history entry
 *       404:
 *         description: Entry not found
 */
router.get('/:id', protect, historyController.getHistoryById);

module.exports = router;
