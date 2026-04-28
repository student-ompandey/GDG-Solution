const swaggerJsdoc = require('swagger-jsdoc');
const { PORT, NODE_ENV } = require('./env');

/**
 * Swagger / OpenAPI 3.0 configuration.
 * JSDoc comments on route files are picked up automatically.
 */
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Scam Detection Platform API',
      version: '1.0.0',
      description:
        'Production-ready API for detecting phishing URLs, scam messages, malicious QR codes, and fraudulent images. Each analysis returns a risk score (0–100) with a human-readable explanation.',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api/v1`,
        description: NODE_ENV === 'production' ? 'Production' : 'Development',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // Path to JSDoc-annotated route files
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;
