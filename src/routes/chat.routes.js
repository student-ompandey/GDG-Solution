const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

/**
 * @swagger
 * /scan/chat:
 *   post:
 *     summary: Chat with the ScamShield AI Assistant
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               history:
 *                 type: array
 *                 items:
 *                   type: object
 *               context:
 *                 type: object
 *     responses:
 *       200:
 *         description: Chat response
 */
router.post('/', chatController.handleChat);

module.exports = router;
