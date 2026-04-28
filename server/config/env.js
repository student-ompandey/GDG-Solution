/**
 * Centralised environment configuration.
 * All env vars are validated and exported from here so the rest
 * of the codebase never touches `process.env` directly.
 *
 * Deployment-safe: validates critical vars and provides sensible defaults.
 */
require('dotenv').config();

const env = {
  // Server
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'production',

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
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',

  // Rate limiting
  RATE_LIMIT_WINDOW_MS:
    parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 min
  RATE_LIMIT_MAX_REQUESTS:
    parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,

  // CORS — deployment-safe
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};

// ── Deployment Validation Warnings ───────────
const warnings = [];
if (env.JWT_SECRET === 'default_jwt_secret_change_me' && env.NODE_ENV === 'production') {
  warnings.push('⚠️  JWT_SECRET is using the default value — SET A STRONG SECRET for production!');
}
if (!env.GEMINI_API_KEY) {
  warnings.push('⚠️  GEMINI_API_KEY is not set — AI features will be disabled.');
}
if (!env.MONGODB_URI || env.MONGODB_URI === 'mongodb://localhost:27017/scam-detection') {
  warnings.push('⚠️  MONGODB_URI is using localhost — set a cloud MongoDB URI for deployment.');
}
if (env.CORS_ORIGIN === '*' && env.NODE_ENV === 'production') {
  warnings.push('⚠️  CORS_ORIGIN is set to * — restrict to your frontend domain for production.');
}

if (warnings.length > 0) {
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║  DEPLOYMENT CONFIGURATION WARNINGS           ║');
  console.log('╚══════════════════════════════════════════════╝');
  warnings.forEach(w => console.log(w));
  console.log('');
}

module.exports = env;
