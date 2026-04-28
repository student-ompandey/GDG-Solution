const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { JWT_SECRET } = require('../config/env');

/**
 * Protect middleware — verifies the JWT token from the Authorization header
 * and attaches the authenticated user to `req.user`.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Extract token from "Bearer <token>" header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized — no token provided');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user to request (exclude password)
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(401, 'User belonging to this token no longer exists');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new ApiError(401, 'Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token has expired');
    }
    throw error;
  }
});

/**
 * Optional auth middleware — attaches user if token is present,
 * but does NOT reject the request if no token is provided.
 * Useful for endpoints that support both anonymous and authenticated use.
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
      }
    } catch (_) {
      // Silently ignore invalid tokens for optional auth
    }
  }

  next();
});

/**
 * Role-based authorization middleware.
 * Must be used AFTER `protect`.
 *
 * Usage:  authorize('admin')
 *
 * @param  {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(
        403,
        'You do not have permission to perform this action'
      );
    }
    next();
  };
};

module.exports = { protect, optionalAuth, authorize };
