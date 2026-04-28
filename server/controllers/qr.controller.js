const { analyzeQr } = require('../services/qr.service');
const historyService = require('../services/history.service');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Analyse a QR code image
 * @route   POST /api/v1/scan/qr
 * @access  Public (optional auth)
 */
const analyze = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Please upload an image file containing a QR code');
  }

  // Delegate all business logic to the service layer
  const result = await analyzeQr(req.file.path, req.file.originalname);

  // Map riskScore to history-compatible result
  const historyResult = result.riskScore >= 70 ? 'dangerous' : result.riskScore >= 40 ? 'suspicious' : 'safe';

  // Persist scan to history
  await historyService.createEntry({
    user: req.user ? req.user._id : null,
    type: 'qr',
    input: req.file.originalname,
    result: historyResult,
    riskScore: result.riskScore,
    explanation: result.summary,
    metadata: result.details,
  });

  return res.status(200).json(result);
});

module.exports = { analyze };
