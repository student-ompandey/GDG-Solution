const Joi = require('joi');

/**
 * Joi validation schemas for all API endpoints.
 * Used by the validate middleware to reject malformed requests early.
 */

// ──────────────────────────────────────────────
// Auth schemas
// ──────────────────────────────────────────────
const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().email().lowercase().trim().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).max(128).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

// ──────────────────────────────────────────────
// Scan schemas
// ──────────────────────────────────────────────
const urlAnalysisSchema = Joi.object({
  url: Joi.string().uri().required().messages({
    'string.uri': 'Please provide a valid URL',
    'any.required': 'URL is required',
  }),
});

const messageAnalysisSchema = Joi.object({
  message: Joi.string().trim().min(1).max(5000).required().messages({
    'string.min': 'Message cannot be empty',
    'string.max': 'Message cannot exceed 5000 characters',
    'any.required': 'Message text is required',
  }),
});

// QR and Image endpoints accept file uploads — validated by Multer middleware

module.exports = {
  registerSchema,
  loginSchema,
  urlAnalysisSchema,
  messageAnalysisSchema,
};
