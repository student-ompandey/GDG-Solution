/**
 * ╔══════════════════════════════════════════════╗
 * ║  SIGNAL SYSTEM — Centralised Detection Signals║
 * ╚══════════════════════════════════════════════╝
 *
 * Each signal has a unique type key, a human-readable label,
 * a category, and a weight that contributes to the final risk score.
 *
 * Services push signals when rules trigger; the response
 * builder sums the weights to compute the risk score.
 */

const { CATEGORIES } = require('./patterns');

// ──────────────────────────────────────────────
// URL Signals
// ──────────────────────────────────────────────
const URL_SIGNALS = {
  IP_ADDRESS_URL:        { type: 'IP_ADDRESS_URL',        weight: 30, category: CATEGORIES.SUSPICIOUS_URL, label: 'Uses IP address instead of domain name' },
  URL_SHORTENER:         { type: 'URL_SHORTENER',         weight: 20, category: CATEGORIES.SUSPICIOUS_URL, label: 'Uses a known URL shortener service' },
  SUSPICIOUS_TLD:        { type: 'SUSPICIOUS_TLD',        weight: 15, category: CATEGORIES.SUSPICIOUS_URL, label: 'Uses a frequently abused TLD' },
  RANDOM_DOMAIN:         { type: 'RANDOM_DOMAIN',         weight: 20, category: CATEGORIES.SUSPICIOUS_URL, label: 'Domain name appears randomly generated' },
  PUNYCODE_HOMOGRAPH:    { type: 'PUNYCODE_HOMOGRAPH',    weight: 25, category: CATEGORIES.SUSPICIOUS_URL, label: 'Uses Punycode/international characters (possible impersonation)' },
  EXCESSIVE_SUBDOMAINS:  { type: 'EXCESSIVE_SUBDOMAINS',  weight: 15, category: CATEGORIES.SUSPICIOUS_URL, label: 'Has excessive subdomains (possible spoofing)' },
  AT_SYMBOL:             { type: 'AT_SYMBOL',             weight: 25, category: CATEGORIES.SUSPICIOUS_URL, label: 'Contains @ symbol (can redirect to a different site)' },
  NON_STANDARD_PORT:     { type: 'NON_STANDARD_PORT',     weight: 10, category: CATEGORIES.SUSPICIOUS_URL, label: 'Uses a non-standard port number' },
  NO_HTTPS:              { type: 'NO_HTTPS',              weight: 10, category: CATEGORIES.SUSPICIOUS_URL, label: 'Uses HTTP instead of HTTPS (unencrypted)' },
  PHISHING_KEYWORDS:     { type: 'PHISHING_KEYWORDS',     weight: 15, category: CATEGORIES.SUSPICIOUS_URL, label: 'URL contains phishing-related keywords' },
  LONG_URL:              { type: 'LONG_URL',              weight: 10, category: CATEGORIES.SUSPICIOUS_URL, label: 'Unusually long URL (may hide true destination)' },
  DOUBLE_ENCODING:       { type: 'DOUBLE_ENCODING',       weight: 15, category: CATEGORIES.SUSPICIOUS_URL, label: 'Contains double-encoded characters (obfuscation)' },
  REDIRECT_PARAM:        { type: 'REDIRECT_PARAM',        weight: 10, category: CATEGORIES.SUSPICIOUS_URL, label: 'Contains redirect/forwarding parameters' },
  SAFE_BROWSING_FLAG:    { type: 'SAFE_BROWSING_FLAG',    weight: 40, category: CATEGORIES.SUSPICIOUS_URL, label: 'Flagged by Google Safe Browsing' },
  MALFORMED_URL:         { type: 'MALFORMED_URL',         weight: 25, category: CATEGORIES.SUSPICIOUS_URL, label: 'URL could not be parsed (malformed)' },
  HIGH_ENTROPY_DOMAIN:   { type: 'HIGH_ENTROPY_DOMAIN',   weight: 15, category: CATEGORIES.SUSPICIOUS_URL, label: 'Domain has high entropy (randomly generated)' },
  BRAND_IMPERSONATION:   { type: 'BRAND_IMPERSONATION',   weight: 25, category: CATEGORIES.IMPERSONATION, label: 'Domain impersonates a known brand' },
};

// ──────────────────────────────────────────────
// Message Signals
// ──────────────────────────────────────────────
const MESSAGE_SIGNALS = {
  SCAM_KEYWORDS:         { type: 'SCAM_KEYWORDS',         weight: 20, category: CATEGORIES.SOCIAL_ENGINEERING, label: 'Contains known scam keywords' },
  HIGH_RISK_KEYWORDS:    { type: 'HIGH_RISK_KEYWORDS',    weight: 15, category: CATEGORIES.SENSITIVE_REQUEST, label: 'Contains high-risk financial/credential keywords' },
  URGENCY_TACTICS:       { type: 'URGENCY_TACTICS',       weight: 15, category: CATEGORIES.URGENCY, label: 'Uses urgency/pressure tactics' },
  EXCESSIVE_CAPS:        { type: 'EXCESSIVE_CAPS',        weight: 5,  category: CATEGORIES.SOCIAL_ENGINEERING, label: 'Uses excessive ALL CAPS' },
  EXCESSIVE_PUNCTUATION: { type: 'EXCESSIVE_PUNCTUATION', weight: 5,  category: CATEGORIES.SOCIAL_ENGINEERING, label: 'Uses excessive punctuation (!!!, ???)' },
  MONEY_MENTION:         { type: 'MONEY_MENTION',         weight: 10, category: CATEGORIES.FINANCIAL_FRAUD, label: 'Mentions specific monetary amounts' },
  EMBEDDED_LINK:         { type: 'EMBEDDED_LINK',         weight: 10, category: CATEGORIES.SUSPICIOUS_URL, label: 'Contains embedded link(s)' },
  SHORT_MSG_WITH_LINK:   { type: 'SHORT_MSG_WITH_LINK',   weight: 15, category: CATEGORIES.SUSPICIOUS_URL, label: 'Short message with embedded link (classic scam pattern)' },
  PHONE_SOLICITATION:    { type: 'PHONE_SOLICITATION',    weight: 5,  category: CATEGORIES.SOCIAL_ENGINEERING, label: 'Contains phone number (may solicit calls)' },
  AI_SCAM_DETECTED:      { type: 'AI_SCAM_DETECTED',     weight: 25, category: CATEGORIES.SOCIAL_ENGINEERING, label: 'AI classified message as scam' },
  AI_SPAM_DETECTED:      { type: 'AI_SPAM_DETECTED',     weight: 15, category: CATEGORIES.SOCIAL_ENGINEERING, label: 'AI classified message as spam' },
  AI_SUSPICIOUS:         { type: 'AI_SUSPICIOUS',         weight: 10, category: CATEGORIES.SOCIAL_ENGINEERING, label: 'AI classified message as suspicious' },
  // New signals from detection engine
  PATTERN_MATCH:         { type: 'PATTERN_MATCH',         weight: 0,  category: CATEGORIES.SOCIAL_ENGINEERING, label: 'Pattern-based detection signal' },
  COMBO_DETECTED:        { type: 'COMBO_DETECTED',        weight: 0,  category: CATEGORIES.SOCIAL_ENGINEERING, label: 'Dangerous signal combination detected' },
};

// ──────────────────────────────────────────────
// QR Signals
// ──────────────────────────────────────────────
const QR_SIGNALS = {
  QR_CONTAINS_URL:       { type: 'QR_CONTAINS_URL',       weight: 5,  category: CATEGORIES.SUSPICIOUS_URL, label: 'QR code contains a URL (destination hidden from user)' },
  QR_NO_CODE_FOUND:      { type: 'QR_NO_CODE_FOUND',      weight: 0,  category: CATEGORIES.SUSPICIOUS_URL, label: 'No QR code detected in image' },
  QR_FREE_EMAIL:         { type: 'QR_FREE_EMAIL',         weight: 10, category: CATEGORIES.SOCIAL_ENGINEERING, label: 'QR code links to a free email provider' },
  QR_PHONE_NUMBER:       { type: 'QR_PHONE_NUMBER',       weight: 5,  category: CATEGORIES.SOCIAL_ENGINEERING, label: 'QR code contains a phone number' },
  QR_PROCESSING_ERROR:   { type: 'QR_PROCESSING_ERROR',   weight: 10, category: CATEGORIES.SUSPICIOUS_URL, label: 'QR image could not be processed' },
};

// ──────────────────────────────────────────────
// Image Signals
// ──────────────────────────────────────────────
const IMAGE_SIGNALS = {
  OCR_SCAM_TEXT:         { type: 'OCR_SCAM_TEXT',         weight: 20, category: CATEGORIES.SOCIAL_ENGINEERING, label: 'Image contains scam-related text (OCR detected)' },
  OCR_URGENCY_TEXT:      { type: 'OCR_URGENCY_TEXT',      weight: 10, category: CATEGORIES.URGENCY, label: 'Image text uses urgency/pressure language' },
  VISION_SCAM_DETECTED:  { type: 'VISION_SCAM_DETECTED',  weight: 25, category: CATEGORIES.SOCIAL_ENGINEERING, label: 'AI Vision detected scam/fraud content' },
  OCR_NO_TEXT:           { type: 'OCR_NO_TEXT',           weight: 0,  category: CATEGORIES.SOCIAL_ENGINEERING, label: 'No significant text found in image' },
};

/**
 * Create a signal instance with optional detail override.
 *
 * @param {object} signalDef - Signal definition from constants above
 * @param {string} [detail]  - Optional custom detail text
 * @returns {{ type: string, weight: number, category: string, label: string, detail: string }}
 */
const createSignal = (signalDef, detail = null) => ({
  type: signalDef.type,
  weight: signalDef.weight,
  category: signalDef.category || 'UNKNOWN',
  label: signalDef.label,
  detail: detail || signalDef.label,
});

/**
 * Calculate the confidence level based on signal count and strength.
 *
 * @param {Array} signals - Array of triggered signals
 * @returns {'None' | 'Low' | 'Medium' | 'High'}
 */
const getConfidence = (signals) => {
  const meaningful = signals.filter((s) => s.weight > 0);
  if (meaningful.length === 0) return 'None';

  // Gather unique categories
  const categories = new Set(meaningful.map(s => s.category).filter(Boolean));
  const maxWeight = Math.max(...meaningful.map(s => s.weight));

  let score = 0;
  score += Math.min(meaningful.length * 8, 30);     // Signal count
  score += Math.min(categories.size * 12, 30);       // Category diversity
  score += maxWeight >= 25 ? 15 : maxWeight >= 15 ? 8 : 3; // Signal strength

  if (score >= 55) return 'High';
  if (score >= 30) return 'Medium';
  return 'Low';
};

/**
 * Calculate total risk score from signals (capped at 100).
 *
 * @param {Array} signals
 * @returns {number}
 */
const calculateRiskScore = (signals) => {
  const total = signals.reduce((sum, s) => sum + s.weight, 0);
  return Math.min(Math.max(total, 0), 100);
};

module.exports = {
  URL_SIGNALS,
  MESSAGE_SIGNALS,
  QR_SIGNALS,
  IMAGE_SIGNALS,
  createSignal,
  getConfidence,
  calculateRiskScore,
};
