const ScanHistory = require('../models/ScanHistory.model');

/**
 * Create a new scan history entry.
 * @param {object} data
 * @returns {Promise<object>}
 */
const createEntry = async (data) => {
  const entry = await ScanHistory.create(data);
  return entry;
};

/**
 * Get paginated scan history for a specific user.
 * @param {string} userId
 * @param {object} options - { page, limit, type }
 * @returns {Promise<object>}
 */
const getUserHistory = async (userId, options = {}) => {
  const { page = 1, limit = 20, type } = options;
  const skip = (page - 1) * limit;

  const filter = { user: userId };
  if (type) filter.type = type;

  const [entries, total] = await Promise.all([
    ScanHistory.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .lean(),
    ScanHistory.countDocuments(filter),
  ]);

  return {
    entries,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single scan history entry by ID.
 * @param {string} id
 * @param {string} [userId] - If provided, ensure the entry belongs to this user
 * @returns {Promise<object|null>}
 */
const getEntryById = async (id, userId = null) => {
  const filter = { _id: id };
  if (userId) filter.user = userId;
  return ScanHistory.findOne(filter).lean();
};

/**
 * Get aggregate scan statistics (admin only).
 * @returns {Promise<object>}
 */
const getStats = async () => {
  const [totalScans, byType, byResult, recentScans] = await Promise.all([
    ScanHistory.countDocuments(),
    ScanHistory.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 }, avgScore: { $avg: '$riskScore' } } },
      { $sort: { count: -1 } },
    ]),
    ScanHistory.aggregate([
      { $group: { _id: '$result', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    ScanHistory.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('type result riskScore createdAt')
      .lean(),
  ]);

  return { totalScans, byType, byResult, recentScans };
};

module.exports = { createEntry, getUserHistory, getEntryById, getStats };
