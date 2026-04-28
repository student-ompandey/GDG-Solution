const express = require('express');
const router = express.Router();
const validate = require('../middlewares/validate.middleware');
const { messageAnalysisSchema } = require('../utils/validators');
const { optionalAuth } = require('../middlewares/auth.middleware');
const messageController = require('../controllers/message.controller');

/**
 * @swagger
 * tags:
 *   name: Message Scan
 *   description: SMS / WhatsApp scam message detection
 */

/**
 * @swagger
 * /scan/message:
 *   post:
 *     summary: Analyse a text message for scam indicators
 *     tags: [Message Scan]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *                 example: "URGENT! You have won a lottery prize of $1,000,000. Click here to claim now!"
 *     responses:
 *       200:
 *         description: Message analysis result with risk score
 */
router.post('/', optionalAuth, validate(messageAnalysisSchema), messageController.analyze);

module.exports = router;
