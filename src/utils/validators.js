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

// ──────────────────────────────────────────────
// Report schemas
// ──────────────────────────────────────────────
const reportSchema = Joi.object({
  type: Joi.string()
    .valid('url', 'message', 'qr', 'image', 'audio')
    .required()
    .messages({
      'any.only': 'Type must be one of: url, message, qr, image, audio',
      'any.required': 'Report type is required',
    }),
  content: Joi.string()
    .trim()
    .min(1)
    .max(5000)
    .required()
    .messages({
      'string.min': 'Content cannot be empty',
      'string.max': 'Content cannot exceed 5000 characters',
      'any.required': 'Report content is required',
    }),
  riskScore: Joi.number().min(0).max(100).required().messages({
    'number.min': 'Risk score must be at least 0',
    'number.max': 'Risk score cannot exceed 100',
    'any.required': 'Risk score is required',
  }),
  riskLevel: Joi.string()
    .valid('safe', 'low', 'medium', 'high', 'critical')
    .required()
    .messages({
      'any.only': 'Risk level must be one of: safe, low, medium, high, critical',
      'any.required': 'Risk level is required',
    }),
  signals: Joi.array().items(Joi.string().trim().max(200)).max(50).default([]),
  explanation: Joi.array().items(Joi.string().trim().max(500)).max(20).default([]),
});

module.exports = {
  registerSchema,
  loginSchema,
  urlAnalysisSchema,
  messageAnalysisSchema,
  reportSchema,
};
