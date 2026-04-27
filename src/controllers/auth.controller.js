const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

/** Generate a signed JWT for the given user ID. */
const signToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const user = await User.create({ name, email, password });
  const token = signToken(user._id);

  new ApiResponse(201, 'User registered successfully', {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token,
  }).send(res);
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and explicitly select the password field
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = signToken(user._id);

  new ApiResponse(200, 'Login successful', {
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    token,
  }).send(res);
});

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/profile
 * @access  Protected
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  new ApiResponse(200, 'Profile retrieved', {
    id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt,
  }).send(res);
});

module.exports = { register, login, getProfile };
