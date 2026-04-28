const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { NODE_ENV } = require('../config/env');

/**
 * Global error handling middleware.
 * Catches all errors thrown or passed via next(err) and returns
 * a consistent JSON response.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // ── Mongoose bad ObjectId ──────────────────
  if (err.name === 'CastError') {
    error = new ApiError(400, `Invalid ${err.path}: ${err.value}`);
  }

  // ── Mongoose duplicate key ─────────────────
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(', ');
    error = new ApiError(409, `Duplicate value for field: ${field}`);
  }

  // ── Mongoose validation error ──────────────
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(400, `Validation failed: ${messages.join('. ')}`);
  }

  // ── JWT errors ─────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid token');
  }
  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Token has expired');
  }

  // ── Multer file size error ─────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = new ApiError(400, 'File too large. Maximum size is 10 MB.');
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Log the error
  if (statusCode >= 500) {
    logger.error(`${statusCode} — ${message}`, { stack: error.stack });
  } else {
    logger.warn(`${statusCode} — ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(NODE_ENV === 'development' && { stack: error.stack }),
  });
};

module.exports = errorHandler;
