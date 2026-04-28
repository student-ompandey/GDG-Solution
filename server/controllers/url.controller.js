const { analyzeUrl } = require('../services/url.service');
const historyService = require('../services/history.service');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Analyse a URL for phishing / scam indicators
 * @route   POST /api/v1/scan/url
 * @access  Public (optional auth)
 */
const analyze = asyncHandler(async (req, res) => {
  const { url } = req.body;
  const lang = req.query.lang || req.body.lang || 'en';

  const result = await analyzeUrl(url, { lang });

  const historyResult = result.riskScore >= 70 ? 'dangerous' : result.riskScore >= 40 ? 'suspicious' : 'safe';
  await historyService.createEntry({
    user: req.user ? req.user._id : null,
    type: 'url',
    input: url,
    result: historyResult,
    riskScore: result.riskScore,
    explanation: result.summary,
    metadata: result.details,
  });

  return res.status(200).json(result);
});

module.exports = { analyze };
