const historyService = require('../services/history.service');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get scan history for the authenticated user
 * @route   GET /api/v1/history
 * @access  Protected
 */
const getHistory = asyncHandler(async (req, res) => {
  const { page, limit, type } = req.query;

  const data = await historyService.getUserHistory(req.user._id, {
    page, limit, type,
  });

  new ApiResponse(200, 'Scan history retrieved', data).send(res);
});

/**
 * @desc    Get a single scan history entry by ID
 * @route   GET /api/v1/history/:id
 * @access  Protected
 */
const getHistoryById = asyncHandler(async (req, res) => {
  const entry = await historyService.getEntryById(req.params.id, req.user._id);

  if (!entry) {
    throw new ApiError(404, 'Scan history entry not found');
  }

  new ApiResponse(200, 'Scan history entry retrieved', entry).send(res);
});

/**
 * @desc    Get aggregate scan statistics
 * @route   GET /api/v1/history/stats
 * @access  Admin
 */
const getStats = asyncHandler(async (req, res) => {
  const stats = await historyService.getStats();
  new ApiResponse(200, 'Scan statistics retrieved', stats).send(res);
});

module.exports = { getHistory, getHistoryById, getStats };
