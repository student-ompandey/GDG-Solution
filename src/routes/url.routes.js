const express = require('express');
const router = express.Router();
const validate = require('../middlewares/validate.middleware');
const { urlAnalysisSchema } = require('../utils/validators');
const { optionalAuth } = require('../middlewares/auth.middleware');
const urlController = require('../controllers/url.controller');

/**
 * @swagger
 * tags:
 *   name: URL Scan
 *   description: URL phishing & scam detection
 */

/**
 * @swagger
 * /scan/url:
 *   post:
 *     summary: Analyse a URL for phishing indicators
 *     tags: [URL Scan]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [url]
 *             properties:
 *               url:
 *                 type: string
 *                 example: https://suspicious-site.tk/login
 *     responses:
 *       200:
 *         description: URL analysis result with risk score
 */
router.post('/', optionalAuth, validate(urlAnalysisSchema), urlController.analyze);

module.exports = router;
