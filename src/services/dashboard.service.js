const mongoose = require('mongoose');
const ScanHistory = require('../models/ScanHistory.model');

/**
 * Fetch dashboard statistics for a specific user.
 * @param {string} userId - The ID of the user.
 * @returns {Object} Dashboard data
 */
const getDashboardStats = async (userId) => {
  const matchUser = { user: new mongoose.Types.ObjectId(userId) };

  // 1. Overall stats (total, safe, scam) and Risk Distribution
  const statsAgg = await ScanHistory.aggregate([
    { $match: matchUser },
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: null,
              totalScans: { $sum: 1 },
              safeCount: {
                $sum: { $cond: [{ $eq: ['$riskScore', 0] }, 1, 0] },
              },
              scamCount: {
                $sum: { $cond: [{ $gt: ['$riskScore', 0] }, 1, 0] },
              },
            },
          },
        ],
        distribution: [
          {
            $group: {
              _id: null,
              safe: { $sum: { $cond: [{ $eq: ['$riskScore', 0] }, 1, 0] } },
              low: { $sum: { $cond: [{ $and: [{ $gt: ['$riskScore', 0] }, { $lt: ['$riskScore', 40] }] }, 1, 0] } },
              medium: { $sum: { $cond: [{ $and: [{ $gte: ['$riskScore', 40] }, { $lt: ['$riskScore', 70] }] }, 1, 0] } },
              high: { $sum: { $cond: [{ $gte: ['$riskScore', 70] }, 1, 0] } },
            },
          },
        ],
      },
    },
  ]);

  const totals = statsAgg[0]?.totals[0] || { totalScans: 0, safeCount: 0, scamCount: 0 };
  const distribution = statsAgg[0]?.distribution[0] || { safe: 0, low: 0, medium: 0, high: 0 };

  // Clean up _id from aggregation output
  delete totals._id;
  delete distribution._id;

  // 2. Trend over last 7 days (only scams, i.e., riskScore > 0)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const trendAgg = await ScanHistory.aggregate([
    {
      $match: {
        ...matchUser,
        riskScore: { $gt: 0 },
        createdAt: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        scams: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Fill in missing days so the chart always shows 7 days
  const trendMap = trendAgg.reduce((acc, curr) => {
    acc[curr._id] = curr.scams;
    return acc;
  }, {});

  const trend = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    trend.push({
      date: dateStr,
      scams: trendMap[dateStr] || 0,
    });
  }

  // 3. Recent Scans (last 10)
  const recentScans = await ScanHistory.find(matchUser)
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return {
    totalScans: totals.totalScans,
    scamCount: totals.scamCount,
    safeCount: totals.safeCount,
    riskDistribution: distribution,
    trend,
    recentScans,
  };
};

module.exports = {
  getDashboardStats,
};
