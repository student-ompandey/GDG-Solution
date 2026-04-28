const reportService = require('../services/report.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

/**
 * @desc    Submit a new scam report (or increment if duplicate)
 * @route   POST /api/v1/report
 * @access  Public (optional auth)
 */
const createReport = asyncHandler(async (req, res) => {
  const { type, content, riskScore, riskLevel, signals, explanation } = req.body;

  const { report, isNew } = await reportService.createReport({
    type,
    content,
    riskScore,
    riskLevel,
    signals,
    explanation,
  });

  const message = isNew
    ? 'Scam reported successfully'
    : `Report count incremented to ${report.reportCount}`;

  new ApiResponse(isNew ? 201 : 200, message, report).send(res);
});

/**
 * @desc    Fetch all scam reports (paginated, sorted)
 * @route   GET /api/v1/reports
 * @access  Public
 */
const getReports = asyncHandler(async (req, res) => {
  const { page, limit, type } = req.query;

  const result = await reportService.getReports({
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 20,
    type,
  });

  new ApiResponse(200, 'Reports fetched successfully', result).send(res);
});

/**
 * @desc    Fetch top trending scam reports
 * @route   GET /api/v1/reports/trending
 * @access  Public
 */
const getTrendingReports = asyncHandler(async (req, res) => {
  const count = parseInt(req.query.count, 10) || 10;
  const trending = await reportService.getTrendingReports(count);

  new ApiResponse(200, 'Trending reports fetched successfully', trending).send(res);
});

module.exports = {
  createReport,
  getReports,
  getTrendingReports,
};
