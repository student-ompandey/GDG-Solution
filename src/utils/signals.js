/**
 * Signal Constants — centralised detection signal definitions.
 * Each signal has a unique type key, a human-readable label,
 * and a weight that contributes to the final risk score.
 *
 * Services push signals when rules trigger; the response
 * builder sums the weights to compute the risk score.
 */

// ──────────────────────────────────────────────
// URL Signals
// ──────────────────────────────────────────────
const URL_SIGNALS = {
  IP_ADDRESS_URL:        { type: 'IP_ADDRESS_URL',        weight: 30, label: 'Uses IP address instead of domain name' },
  URL_SHORTENER:         { type: 'URL_SHORTENER',         weight: 20, label: 'Uses a known URL shortener service' },
  SUSPICIOUS_TLD:        { type: 'SUSPICIOUS_TLD',        weight: 15, label: 'Uses a frequently abused TLD' },
  RANDOM_DOMAIN:         { type: 'RANDOM_DOMAIN',         weight: 20, label: 'Domain name appears randomly generated' },
  PUNYCODE_HOMOGRAPH:    { type: 'PUNYCODE_HOMOGRAPH',    weight: 25, label: 'Uses Punycode/international characters (possible impersonation)' },
  EXCESSIVE_SUBDOMAINS:  { type: 'EXCESSIVE_SUBDOMAINS',  weight: 15, label: 'Has excessive subdomains (possible spoofing)' },
  AT_SYMBOL:             { type: 'AT_SYMBOL',             weight: 25, label: 'Contains @ symbol (can redirect to a different site)' },
  NON_STANDARD_PORT:     { type: 'NON_STANDARD_PORT',     weight: 10, label: 'Uses a non-standard port number' },
  NO_HTTPS:              { type: 'NO_HTTPS',              weight: 10, label: 'Uses HTTP instead of HTTPS (unencrypted)' },
  PHISHING_KEYWORDS:     { type: 'PHISHING_KEYWORDS',     weight: 15, label: 'URL contains phishing-related keywords' },
  LONG_URL:              { type: 'LONG_URL',              weight: 10, label: 'Unusually long URL (may hide true destination)' },
  DOUBLE_ENCODING:       { type: 'DOUBLE_ENCODING',       weight: 15, label: 'Contains double-encoded characters (obfuscation)' },
  REDIRECT_PARAM:        { type: 'REDIRECT_PARAM',        weight: 10, label: 'Contains redirect/forwarding parameters' },
  SAFE_BROWSING_FLAG:    { type: 'SAFE_BROWSING_FLAG',    weight: 40, label: 'Flagged by Google Safe Browsing' },
  MALFORMED_URL:         { type: 'MALFORMED_URL',         weight: 25, label: 'URL could not be parsed (malformed)' },
};

// ──────────────────────────────────────────────
// Message Signals
// ──────────────────────────────────────────────
const MESSAGE_SIGNALS = {
  SCAM_KEYWORDS:         { type: 'SCAM_KEYWORDS',         weight: 20, label: 'Contains known scam keywords' },
  HIGH_RISK_KEYWORDS:    { type: 'HIGH_RISK_KEYWORDS',    weight: 15, label: 'Contains high-risk financial/credential keywords' },
  URGENCY_TACTICS:       { type: 'URGENCY_TACTICS',       weight: 15, label: 'Uses urgency/pressure tactics' },
  EXCESSIVE_CAPS:        { type: 'EXCESSIVE_CAPS',        weight: 5,  label: 'Uses excessive ALL CAPS' },
  EXCESSIVE_PUNCTUATION: { type: 'EXCESSIVE_PUNCTUATION', weight: 5,  label: 'Uses excessive punctuation (!!!, ???)' },
  MONEY_MENTION:         { type: 'MONEY_MENTION',         weight: 10, label: 'Mentions specific monetary amounts' },
  EMBEDDED_LINK:         { type: 'EMBEDDED_LINK',         weight: 10, label: 'Contains embedded link(s)' },
  SHORT_MSG_WITH_LINK:   { type: 'SHORT_MSG_WITH_LINK',   weight: 15, label: 'Short message with embedded link (classic scam pattern)' },
  PHONE_SOLICITATION:    { type: 'PHONE_SOLICITATION',    weight: 5,  label: 'Contains phone number (may solicit calls)' },
  AI_SCAM_DETECTED:      { type: 'AI_SCAM_DETECTED',     weight: 25, label: 'AI classified message as scam' },
  AI_SPAM_DETECTED:      { type: 'AI_SPAM_DETECTED',     weight: 15, label: 'AI classified message as spam' },
  AI_SUSPICIOUS:         { type: 'AI_SUSPICIOUS',         weight: 10, label: 'AI classified message as suspicious' },
};

// ──────────────────────────────────────────────
// QR Signals
// ──────────────────────────────────────────────
const QR_SIGNALS = {
  QR_CONTAINS_URL:       { type: 'QR_CONTAINS_URL',       weight: 5,  label: 'QR code contains a URL (destination hidden from user)' },
  QR_NO_CODE_FOUND:      { type: 'QR_NO_CODE_FOUND',      weight: 0,  label: 'No QR code detected in image' },
  QR_FREE_EMAIL:         { type: 'QR_FREE_EMAIL',         weight: 10, label: 'QR code links to a free email provider' },
  QR_PHONE_NUMBER:       { type: 'QR_PHONE_NUMBER',       weight: 5,  label: 'QR code contains a phone number' },
  QR_PROCESSING_ERROR:   { type: 'QR_PROCESSING_ERROR',   weight: 10, label: 'QR image could not be processed' },
};

// ──────────────────────────────────────────────
// Image Signals
// ──────────────────────────────────────────────
const IMAGE_SIGNALS = {
  OCR_SCAM_TEXT:         { type: 'OCR_SCAM_TEXT',         weight: 20, label: 'Image contains scam-related text (OCR detected)' },
  OCR_URGENCY_TEXT:      { type: 'OCR_URGENCY_TEXT',      weight: 10, label: 'Image text uses urgency/pressure language' },
  VISION_SCAM_DETECTED:  { type: 'VISION_SCAM_DETECTED',  weight: 25, label: 'AI Vision detected scam/fraud content' },
  OCR_NO_TEXT:           { type: 'OCR_NO_TEXT',           weight: 0,  label: 'No significant text found in image' },
};

/**
 * Create a signal instance with optional detail override.
 *
 * @param {object} signalDef - Signal definition from constants above
 * @param {string} [detail]  - Optional custom detail text
 * @returns {{ type: string, weight: number, label: string, detail: string }}
 */
const createSignal = (signalDef, detail = null) => ({
  type: signalDef.type,
  weight: signalDef.weight,
  label: signalDef.label,
  detail: detail || signalDef.label,
});

/**
 * Calculate the confidence level based on signal count.
 *
 * @param {Array} signals - Array of triggered signals
 * @returns {string} 'Low' | 'Medium' | 'High'
 */
const getConfidence = (signals) => {
  // Only count signals with weight > 0
  const meaningful = signals.filter((s) => s.weight > 0);
  if (meaningful.length === 0) return 'None';
  if (meaningful.length === 1) return 'Low';
  if (meaningful.length <= 3) return 'Medium';
  return 'High';
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
