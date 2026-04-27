const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const urlRoutes = require('./url.routes');
const messageRoutes = require('./message.routes');
const qrRoutes = require('./qr.routes');
const imageRoutes = require('./image.routes');
const historyRoutes = require('./history.routes');

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is running
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Scam Detection Platform API is running',
    data: {
      status: 'healthy',
      uptime: `${Math.floor(process.uptime())}s`,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

// Mount sub-routers
router.use('/auth', authRoutes);
router.use('/scan/url', urlRoutes);
router.use('/scan/message', messageRoutes);
router.use('/scan/qr', qrRoutes);
router.use('/scan/image', imageRoutes);
router.use('/history', historyRoutes);

module.exports = router;
