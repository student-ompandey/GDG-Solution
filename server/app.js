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
const { CORS_ORIGIN, NODE_ENV } = require('./config/env');

const app = express();

// ── Trust proxy (for deployment behind reverse proxy) ──
if (NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// ──────────────────────────────────────────────
// Security Middleware
// ──────────────────────────────────────────────
app.use(helmet());                       // Set security HTTP headers

// CORS — supports comma-separated origins from CORS_ORIGIN env var
const corsOrigin = CORS_ORIGIN === '*'
  ? true  // Allow all origins
  : CORS_ORIGIN.split(',').map(o => o.trim());
app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(rateLimiter);                    // Rate limiting

// ──────────────────────────────────────────────
// Body Parsing & Static Files
// ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
// Production: Serve Client Build
// ──────────────────────────────────────────────
if (NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientBuildPath));

  // SPA catch-all: serve index.html for any non-API route
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  // Development: 404 handler for unknown routes
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      statusCode: 404,
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
  });
}

// ──────────────────────────────────────────────
// Global Error Handler (must be last)
// ──────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
