/**
 * Centralised environment configuration.
 * All env vars are validated and exported from here so the rest
 * of the codebase never touches `process.env` directly.
 */
require('dotenv').config();

const env = {
  // Server
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  MONGODB_URI:
    process.env.MONGODB_URI || 'mongodb://localhost:27017/scam-detection',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'default_jwt_secret_change_me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // External APIs
  GOOGLE_SAFE_BROWSING_API_KEY:
    process.env.GOOGLE_SAFE_BROWSING_API_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',

  // Rate limiting
  RATE_LIMIT_WINDOW_MS:
    parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 min
  RATE_LIMIT_MAX_REQUESTS:
    parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
};

module.exports = env;
