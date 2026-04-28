const User = require('../models/User.model');
const ScanHistory = require('../models/ScanHistory.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const fs = require('fs');

/**
 * @desc    Get user profile stats including safety score
 * @route   GET /api/v1/profile/stats
 * @access  Private
 */
const getProfileStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const statsAgg = await ScanHistory.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: null,
        totalScans: { $sum: 1 },
        safeCount: { $sum: { $cond: [{ $eq: ['$riskScore', 0] }, 1, 0] } },
        scamCount: { $sum: { $cond: [{ $gt: ['$riskScore', 0] }, 1, 0] } },
      },
    },
  ]);

  const stats = statsAgg[0] || { totalScans: 0, safeCount: 0, scamCount: 0 };
  
  // Calculate Safety Score
  let safetyScore = 100;
  if (stats.totalScans > 0) {
    safetyScore = Math.round((stats.safeCount / stats.totalScans) * 100);
  }

  // Determine Risk Level from Safety Score
  let safetyLevel = 'Safe';
  if (safetyScore < 40) safetyLevel = 'High Risk';
  else if (safetyScore < 70) safetyLevel = 'Medium Risk';

  const recentScans = await ScanHistory.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  new ApiResponse(200, 'Profile stats retrieved', {
    ...stats,
    safetyScore,
    safetyLevel,
    recentScans,
  }).send(res);
});

/**
 * @desc    Update user profile (name, avatar)
 * @route   PUT /api/v1/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { name } = req.body;
  let avatar = undefined;

  const updateData = {};
  if (name) updateData.name = name;

  // Handle avatar upload
  if (req.file) {
    // Local path to the file
    avatar = `/uploads/${req.file.filename}`;
    updateData.avatar = avatar;

    // Optional: remove old avatar to save space
    const user = await User.findById(userId);
    if (user.avatar && user.avatar.startsWith('/uploads/')) {
      try {
        const oldPath = user.avatar.replace('/uploads/', '');
        const fullPath = require('path').join(process.cwd(), 'uploads', oldPath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      } catch (err) {
        console.error('Failed to delete old avatar', err);
      }
    }
  }

  const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });

  new ApiResponse(200, 'Profile updated successfully', {
    id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    avatar: updatedUser.avatar,
    createdAt: updatedUser.createdAt,
  }).send(res);
});

module.exports = {
  getProfileStats,
  updateProfile,
};
