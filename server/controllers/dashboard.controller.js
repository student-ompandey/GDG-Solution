const dashboardService = require('../services/dashboard.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @desc    Get dashboard statistics for the authenticated user
 * @route   GET /api/v1/dashboard
 * @access  Private
 */
const getDashboardData = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const data = await dashboardService.getDashboardStats(userId);
  
  new ApiResponse(200, 'Dashboard data fetched successfully', data).send(res);
});

module.exports = {
  getDashboardData,
};
