const { createLogger, format, transports } = require('winston');
const path = require('path');
const { NODE_ENV } = require('../config/env');

/**
 * Winston logger instance.
 * - Console transport (colorized in dev, JSON in prod)
 * - File transports for error and combined logs
 */
const logger = createLogger({
  level: NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'scam-detection-api' },
  transports: [
    // Write errors to a dedicated file
    new transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024, // 5 MB
      maxFiles: 5,
    }),
    // Write all logs to combined file
    new transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
});

// In non-production, also log to the console with colour
if (NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message, stack }) => {
          return `${timestamp} ${level}: ${stack || message}`;
        })
      ),
    })
  );
}

module.exports = logger;
