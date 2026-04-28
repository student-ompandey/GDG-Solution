/**
 * ╔══════════════════════════════════════════════╗
 * ║  RISK LEVEL — Response Builder & Scoring     ║
 * ╚══════════════════════════════════════════════╝
 *
 * Standardized scan response builder with:
 *   - Signal-based risk scoring
 *   - Confidence levels
 *   - Dynamic summaries and recommendations
 *   - Signal transparency
 */

const { getConfidence, calculateRiskScore } = require('./signals');

/**
 * Map a numeric risk score (0–100) to a human-readable risk level.
 * @param {number} score
 * @returns {string}
 */
const getRiskLevel = (score) => {
  if (score <= 15) return 'Safe';
  if (score <= 35) return 'Low Risk';
  if (score <= 60) return 'Medium Risk';
  if (score <= 80) return 'High Risk';
  return 'Critical';
};

/**
 * Generate a user-friendly summary based on scan type and risk score.
 * @param {string} type
 * @param {number} score
 * @returns {string}
 */
const getSummary = (type, score) => {
  const labels = {
    url: {
      safe: 'This link appears to be safe — no suspicious patterns detected.',
      low: 'This link has some minor red flags — proceed with caution.',
      medium: 'This link shows signs of being a phishing or scam attempt.',
      high: 'This link is highly dangerous and likely a phishing attack.',
      critical: '🚨 This link is extremely dangerous — confirmed scam/malware indicators.',
    },
    message: {
      safe: 'This message appears to be genuine and safe.',
      low: 'This message has a few suspicious elements — stay alert.',
      medium: 'This message shows multiple scam indicators — be very cautious.',
      high: 'This message is very likely a scam — do not respond or click any links.',
      critical: '🚨 This message is a confirmed scam — block the sender immediately.',
    },
    qr: {
      safe: 'This QR code appears to be safe.',
      low: 'This QR code has minor suspicious indicators — verify before acting.',
      medium: 'This QR code may lead to a malicious destination.',
      high: 'This QR code is highly suspicious and may be part of a scam.',
      critical: '🚨 This QR code is extremely dangerous — do not visit the destination.',
    },
    image: {
      safe: 'No suspicious content detected in this image.',
      low: 'This image has a few minor red flags — review carefully.',
      medium: 'This image contains content that may be part of a scam.',
      high: 'This image shows strong indicators of fraudulent content.',
      critical: '🚨 This image contains confirmed scam/fraud content.',
    },
  };
  const tier = score <= 15 ? 'safe' : score <= 35 ? 'low' : score <= 60 ? 'medium' : score <= 80 ? 'high' : 'critical';
  return (labels[type] && labels[type][tier]) || 'Analysis complete.';
};

/**
 * Generate a recommendation based on scan type and risk score.
 * @param {string} type
 * @param {number} score
 * @returns {string}
 */
const getRecommendation = (type, score) => {
  if (score <= 15) return 'No suspicious patterns detected. You can proceed safely.';

  const recs = {
    url: {
      low: 'Exercise caution before clicking. Verify the destination with the sender if possible.',
      medium: 'Avoid opening this link. Do not enter any personal or financial information.',
      high: 'Do NOT open this link. Report it as phishing and delete the message immediately.',
      critical: '🛑 BLOCK this URL. Report to your IT department and cybersecurity authorities.',
    },
    message: {
      low: 'Be cautious — verify the sender before taking any action mentioned in the message.',
      medium: 'Do not click any links or share personal details. Verify with the official source directly.',
      high: 'Do NOT respond, click links, or share any information. Block the sender and report as scam.',
      critical: '🛑 BLOCK the sender immediately. Do not interact. Report to cybercrime authorities.',
    },
    qr: {
      low: 'Verify the source of this QR code before visiting the embedded link.',
      medium: 'Avoid scanning this QR code from an untrusted source. The destination may be malicious.',
      high: 'Do NOT visit the link from this QR code. It is likely a scam or phishing attempt.',
      critical: '🛑 This QR code is dangerous. Do not scan or visit any link from it.',
    },
    image: {
      low: 'Review the image content carefully before taking any action suggested in it.',
      medium: 'Do not follow any instructions shown in this image. Verify with the official source.',
      high: 'This image is likely part of a scam. Do not share personal information or make payments.',
      critical: '🛑 This image is a confirmed scam. Report it and warn others.',
    },
  };
  const tier = score <= 35 ? 'low' : score <= 60 ? 'medium' : score <= 80 ? 'high' : 'critical';
  return (recs[type] && recs[type][tier]) || 'Exercise caution.';
};

/**
 * Build a standardized, UI-friendly scan response with signal-based scoring.
 *
 * @param {object} options
 * @param {string}   options.type        - 'url' | 'message' | 'qr' | 'image'
 * @param {string}   options.input       - Original input
 * @param {Array}    options.signals     - Array of signal objects from services
 * @param {string[]} options.explanation - Array of human-readable findings
 * @param {object}   [options.details]   - Additional structured details
 * @returns {object} Standardized response
 */
const buildScanResponse = ({ type, input, signals = [], explanation = [], details = {} }) => {
  const riskScore = calculateRiskScore(signals);
  const confidence = getConfidence(signals);
  const riskLevel = getRiskLevel(riskScore);

  return {
    success: true,
    type,
    input,
    riskScore,
    riskLevel,
    isScam: riskScore > 50,
    isSafe: riskScore <= 15,
    confidence,
    summary: getSummary(type, riskScore),
    explanation: explanation.length > 0 ? explanation : ['No suspicious patterns detected.'],
    recommendation: getRecommendation(type, riskScore),
    signals: signals.map((s) => ({
      type: s.type,
      category: s.category || null,
      weight: s.weight,
      description: s.detail || s.label || s.description,
    })),
    timestamp: new Date().toISOString(),
    details,
  };
};

module.exports = {
  getRiskLevel,
  getSummary,
  getRecommendation,
  buildScanResponse,
};
