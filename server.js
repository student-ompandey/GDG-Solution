/**
 * ╔══════════════════════════════════════════════╗
 * ║       SCAM DETECTION PLATFORM — SERVER       ║
 * ╚══════════════════════════════════════════════╝
 *
 * Entry point. Loads environment, connects to MongoDB,
 * and starts the HTTP server with graceful shutdown.
 */

const app = require('./src/app');
const connectDB = require('./src/config/db');
const logger = require('./src/utils/logger');
const { PORT, NODE_ENV } = require('./src/config/env');

// ── Start Server ─────────────────────────────
const startServer = async () => {
  // 1. Connect to MongoDB
  await connectDB();

  // 2. Start HTTP server
  const server = app.listen(PORT, () => {
    logger.info(`
╔══════════════════════════════════════════════╗
║   Scam Detection Platform API               ║
║   Environment : ${NODE_ENV.padEnd(28)}║
║   Port        : ${String(PORT).padEnd(28)}║
║   API Docs    : http://localhost:${PORT}/api/docs     ║
║   Health      : http://localhost:${PORT}/api/v1/health ║
╚══════════════════════════════════════════════╝
    `);
  });

  // ── Graceful Shutdown ────────────────────────
  const shutdown = (signal) => {
    logger.info(`${signal} received. Shutting down gracefully…`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });

    // Force exit after 10s if server hasn't closed
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    shutdown('UNHANDLED_REJECTION');
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    shutdown('UNCAUGHT_EXCEPTION');
  });
};

startServer();
