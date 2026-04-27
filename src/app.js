const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const rateLimiter = require('./middlewares/rateLimiter.middleware');
const errorHandler = require('./middlewares/error.middleware');
const routes = require('./routes');
const logger = require('./utils/logger');

const app = express();

// ──────────────────────────────────────────────
// Security Middleware
// ──────────────────────────────────────────────
app.use(helmet());                       // Set security HTTP headers
app.use(cors({ origin: '*' }));          // Enable CORS (configure for production)
app.use(rateLimiter);                    // Rate limiting

// ──────────────────────────────────────────────
// Body Parsing
// ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ──────────────────────────────────────────────
// Logging
// ──────────────────────────────────────────────
app.use(
  morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
  })
);

// ──────────────────────────────────────────────
// API Documentation — Swagger UI
// ──────────────────────────────────────────────
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Scam Detection API Docs',
  })
);

// ──────────────────────────────────────────────
// API Routes (versioned)
// ──────────────────────────────────────────────
app.use('/api/v1', routes);

// ──────────────────────────────────────────────
// 404 handler for unknown routes
// ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ──────────────────────────────────────────────
// Global Error Handler (must be last)
// ──────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
