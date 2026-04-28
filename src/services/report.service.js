const ScamReport = require('../models/ScamReport.model');
const ApiError = require('../utils/ApiError');

/**
 * Service layer for community scam reports.
 * Handles duplicate detection, report increment, and trending queries.
 */

/**
 * Create a new scam report or increment the count if duplicate content exists.
 * @param {Object} reportData - The report payload
 * @returns {Object} - { report, isNew }
 */
const createReport = async (reportData) => {
  const { type, content, riskScore, riskLevel, signals, explanation } = reportData;

  // Check for existing report with identical content + type
  const existing = await ScamReport.findOne({
    content: content.trim(),
    type,
  });

  if (existing) {
    // Increment report count and update timestamp
    existing.reportCount += 1;
    existing.reportedAt = new Date();

    // Update risk data if the new report has a higher score
    if (riskScore > existing.riskScore) {
      existing.riskScore = riskScore;
      existing.riskLevel = riskLevel;
    }

    // Merge new signals (avoid duplicates)
    if (signals && signals.length > 0) {
      const merged = new Set([...existing.signals, ...signals]);
      existing.signals = [...merged];
    }

    await existing.save();
    return { report: existing, isNew: false };
  }

  // Create new report
  const report = await ScamReport.create({
    type,
    content: content.trim(),
    riskScore,
    riskLevel,
    signals: signals || [],
    explanation: explanation || [],
  });

  return { report, isNew: true };
};

/**
 * Fetch all reports, sorted by reportCount (desc) then latest.
 * @param {Object} options - Query options
 * @param {number} options.page  - Page number (default 1)
 * @param {number} options.limit - Results per page (default 20)
 * @param {string} options.type  - Optional filter by type
 * @returns {Object} - { reports, total, page, totalPages }
 */
const getReports = async ({ page = 1, limit = 20, type } = {}) => {
  const filter = {};
  if (type) {
    filter.type = type;
  }

  const skip = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    ScamReport.find(filter)
      .sort({ reportCount: -1, reportedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ScamReport.countDocuments(filter),
  ]);

  return {
    reports,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Fetch the top trending scam reports (most reported).
 * @param {number} count - Number of trending reports to return (default 10)
 * @returns {Array} - Top trending reports
 */
const getTrendingReports = async (count = 10) => {
  const trending = await ScamReport.find({ reportCount: { $gte: 1 } })
    .sort({ reportCount: -1, reportedAt: -1 })
    .limit(count)
    .lean();

  return trending;
};

module.exports = {
  createReport,
  getReports,
  getTrendingReports,
};
