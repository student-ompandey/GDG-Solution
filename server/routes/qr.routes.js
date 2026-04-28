const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');
const { optionalAuth } = require('../middlewares/auth.middleware');
const qrController = require('../controllers/qr.controller');

/**
 * @swagger
 * tags:
 *   name: QR Scan
 *   description: QR code decoding & URL validation
 */

/**
 * @swagger
 * /scan/qr:
 *   post:
 *     summary: Scan and decode a QR code image, analyse extracted URL
 *     tags: [QR Scan]
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
 *                 description: Image file containing a QR code
 *     responses:
 *       200:
 *         description: QR code analysis result with risk score
 *       400:
 *         description: No file uploaded or invalid file type
 */
router.post('/', optionalAuth, upload.single('file'), qrController.analyze);

module.exports = router;
