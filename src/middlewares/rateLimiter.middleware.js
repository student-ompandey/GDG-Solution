const rateLimit = require('express-rate-limit');
const { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS } = require('../config/env');

/**
 * Rate limiter middleware.
 * Limits each IP to a configurable number of requests per window.
 * Returns a standardised JSON error when the limit is exceeded.
 */
const rateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,          // Default: 15 minutes
  max: RATE_LIMIT_MAX_REQUESTS,            // Default: 100 requests per window
  standardHeaders: true,                    // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,                     // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests. Please try again later.',
  },
});

module.exports = rateLimiter;
