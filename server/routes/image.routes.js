const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');
const { optionalAuth } = require('../middlewares/auth.middleware');
const imageController = require('../controllers/image.controller');

/**
 * @swagger
 * tags:
 *   name: Image Scan
 *   description: Image-based scam content detection
 */

/**
 * @swagger
 * /scan/image:
 *   post:
 *     summary: Analyse an uploaded image for scam content
 *     tags: [Image Scan]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image file to analyse for scam content
 *     responses:
 *       200:
 *         description: Image analysis result with risk score
 *       400:
 *         description: No file uploaded or invalid file type
 */
router.post('/', optionalAuth, upload.single('file'), imageController.analyze);

module.exports = router;
