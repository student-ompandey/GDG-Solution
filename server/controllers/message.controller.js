const { analyzeMessage } = require('../services/message.service');
const historyService = require('../services/history.service');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Analyse a text message for scam indicators
 * @route   POST /api/v1/scan/message
 * @access  Public (optional auth)
 */
const analyze = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const lang = req.query.lang || req.body.lang || 'en';

  const result = await analyzeMessage(message, { lang });

  const historyResult = result.riskScore >= 70 ? 'dangerous' : result.riskScore >= 40 ? 'suspicious' : 'safe';
  await historyService.createEntry({
    user: req.user ? req.user._id : null,
    type: 'message',
    input: message.substring(0, 500),
    result: historyResult,
    riskScore: result.riskScore,
    explanation: result.summary,
    metadata: result.details,
  });

  return res.status(200).json(result);
});

module.exports = { analyze };
