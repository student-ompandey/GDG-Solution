const logger = require('../utils/logger');
const { buildScanResponse } = require('../utils/riskLevel');
const { MESSAGE_SIGNALS, createSignal } = require('../utils/signals');
const aiService = require('./ai.service');

// ── Keyword database ─────────────────────────

const SCAM_KEYWORDS = {
  'otp': { weight: 10, category: 'Credential Theft' },
  'one time password': { weight: 10, category: 'Credential Theft' },
  'upi pin': { weight: 10, category: 'Credential Theft' },
  'cvv': { weight: 10, category: 'Credential Theft' },
  'atm pin': { weight: 10, category: 'Credential Theft' },
  'bank account': { weight: 9, category: 'Financial Fraud' },
  'credit card': { weight: 9, category: 'Financial Fraud' },
  'debit card': { weight: 9, category: 'Financial Fraud' },
  'social security': { weight: 9, category: 'Identity Theft' },
  'aadhar': { weight: 9, category: 'Identity Theft' },
  'pan card': { weight: 9, category: 'Identity Theft' },
  'lottery winner': { weight: 9, category: 'Prize Scam' },
  'you have won': { weight: 9, category: 'Prize Scam' },
  'claim your prize': { weight: 9, category: 'Prize Scam' },
  'you have been selected': { weight: 8, category: 'Prize Scam' },
  'jackpot': { weight: 8, category: 'Prize Scam' },
  'urgent': { weight: 7, category: 'Urgency Tactic' },
  'act now': { weight: 7, category: 'Urgency Tactic' },
  'act immediately': { weight: 7, category: 'Urgency Tactic' },
  'click now': { weight: 7, category: 'Urgency Tactic' },
  'limited time': { weight: 6, category: 'Urgency Tactic' },
  'limited offer': { weight: 6, category: 'Urgency Tactic' },
  'expires today': { weight: 7, category: 'Urgency Tactic' },
  'last chance': { weight: 7, category: 'Urgency Tactic' },
  'final warning': { weight: 8, category: 'Urgency Tactic' },
  'verify your account': { weight: 7, category: 'Phishing' },
  'confirm your identity': { weight: 7, category: 'Phishing' },
  'account suspended': { weight: 7, category: 'Phishing' },
  'account locked': { weight: 7, category: 'Phishing' },
  'unusual activity': { weight: 7, category: 'Phishing' },
  'unauthorized access': { weight: 7, category: 'Phishing' },
  'security alert': { weight: 6, category: 'Phishing' },
  'click here': { weight: 6, category: 'Suspicious CTA' },
  'click the link': { weight: 6, category: 'Suspicious CTA' },
  'click below': { weight: 6, category: 'Suspicious CTA' },
  'dear customer': { weight: 4, category: 'Impersonation' },
  'dear user': { weight: 4, category: 'Impersonation' },
  'dear account holder': { weight: 5, category: 'Impersonation' },
  'free gift': { weight: 5, category: 'Prize Scam' },
  'reward': { weight: 5, category: 'Prize Scam' },
  'lottery': { weight: 5, category: 'Prize Scam' },
  'prize': { weight: 5, category: 'Prize Scam' },
  'winner': { weight: 5, category: 'Prize Scam' },
  'congratulations': { weight: 5, category: 'Prize Scam' },
  'payment failed': { weight: 4, category: 'Financial Fraud' },
  'refund': { weight: 3, category: 'Financial Fraud' },
  'delivery failed': { weight: 3, category: 'Delivery Scam' },
  'package held': { weight: 4, category: 'Delivery Scam' },
};

const URGENCY_PATTERNS = [
  { regex: /within \d+ (hour|minute|second|day)s?/i, label: 'Deadline pressure' },
  { regex: /last chance/i, label: 'Last chance warning' },
  { regex: /final warning/i, label: 'Final warning threat' },
  { regex: /immediate(ly)?/i, label: 'Demands immediate action' },
  { regex: /right (now|away)/i, label: 'Demands immediate action' },
  { regex: /don'?t (ignore|delay|wait)/i, label: 'Pressure to not ignore' },
  { regex: /your account (will be|has been) (blocked|locked|suspended|closed)/i, label: 'Account threat' },
  { regex: /legal action/i, label: 'Legal threat' },
  { regex: /police|arrest|warrant/i, label: 'Authority impersonation' },
];

// ──────────────────────────────────────────────
// Main message analysis — signal-based + Gemini AI
// ──────────────────────────────────────────────

/**
 * Analyse a text message for scam indicators using signals + Gemini AI.
 * @param {string} message
 * @param {object} [options] - { lang: 'en' | 'hi' }
 * @returns {Promise<object>}
 */
const analyzeMessage = async (message, options = {}) => {
  const signals = [];
  const explanations = [];
  const detectedKeywords = [];
  const categories = new Set();
  const lower = message.toLowerCase();

  // ── 1. Keyword matching ────────────────────
  let hasHighRisk = false;
  for (const [kw, meta] of Object.entries(SCAM_KEYWORDS)) {
    if (lower.includes(kw)) {
      detectedKeywords.push(kw);
      categories.add(meta.category);
      if (meta.weight >= 9) hasHighRisk = true;
    }
  }
  if (detectedKeywords.length > 0) {
    signals.push(createSignal(MESSAGE_SIGNALS.SCAM_KEYWORDS, `Keywords: ${detectedKeywords.join(', ')}`));
    explanations.push(`Contains ${detectedKeywords.length} scam keyword(s): ${detectedKeywords.join(', ')}`);
  }
  if (hasHighRisk) {
    signals.push(createSignal(MESSAGE_SIGNALS.HIGH_RISK_KEYWORDS, `High-risk keywords detected in categories: ${[...categories].join(', ')}`));
    explanations.push(`Contains high-risk keywords in: ${[...categories].filter((c) => ['Credential Theft', 'Financial Fraud', 'Identity Theft', 'Prize Scam'].includes(c)).join(', ')}`);
  }

  // ── 2. Urgency patterns ────────────────────
  const urgency = [];
  for (const p of URGENCY_PATTERNS) {
    if (p.regex.test(message)) urgency.push(p.label);
  }
  if (urgency.length > 0) {
    signals.push(createSignal(MESSAGE_SIGNALS.URGENCY_TACTICS, `Tactics: ${[...new Set(urgency)].join(', ')}`));
    explanations.push(`Uses pressure tactics: ${[...new Set(urgency)].join(', ')}`);
  }

  // ── 3. Excessive caps ──────────────────────
  const capsWords = message.split(/\s+/).filter((w) => w.length > 3 && w === w.toUpperCase() && /[A-Z]/.test(w));
  if (capsWords.length >= 3) {
    signals.push(createSignal(MESSAGE_SIGNALS.EXCESSIVE_CAPS));
    explanations.push('Uses excessive ALL CAPS to create urgency');
  }

  // ── 4. Excessive punctuation ───────────────
  if ((message.match(/[!?]{2,}/g) || []).length >= 2) {
    signals.push(createSignal(MESSAGE_SIGNALS.EXCESSIVE_PUNCTUATION));
    explanations.push('Uses excessive punctuation (!!!, ???)');
  }

  // ── 5. Money mentions ──────────────────────
  const money = message.match(/[\$₹€£¥]\s?\d+[\d,.]*/g) || message.match(/\d+[\d,.]*\s?(dollars?|rupees?|USD|INR)/gi) || [];
  if (money.length > 0) {
    signals.push(createSignal(MESSAGE_SIGNALS.MONEY_MENTION, `Amounts: ${money.slice(0, 3).join(', ')}`));
    explanations.push(`Mentions monetary amounts: ${money.slice(0, 2).join(', ')}`);
  }

  // ── 6. Embedded links ──────────────────────
  const urls = message.match(/https?:\/\/[^\s]+/gi) || [];
  if (urls.length > 0 && message.split(/\s+/).length < 30) {
    signals.push(createSignal(MESSAGE_SIGNALS.SHORT_MSG_WITH_LINK));
    explanations.push('Short message with embedded link (classic scam pattern)');
  } else if (urls.length > 0) {
    signals.push(createSignal(MESSAGE_SIGNALS.EMBEDDED_LINK, `${urls.length} link(s) found`));
    explanations.push(`Contains ${urls.length} embedded link(s)`);
  }

  // ── 7. Phone number ────────────────────────
  if (/\b(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/.test(message)) {
    signals.push(createSignal(MESSAGE_SIGNALS.PHONE_SOLICITATION));
    explanations.push('Contains phone number (may solicit calls)');
  }

  // ── 8. Gemini AI Classification (primary) ──
  let aiClassification = null;
  let aiExplanation = null;
  let aiIntent = null;
  let aiTactics = [];

  try {
    const geminiResult = await aiService.classifyMessage(message);
    if (geminiResult) {
      aiClassification = geminiResult.classification;
      aiExplanation = geminiResult.explanation;
      aiIntent = geminiResult.intent;
      aiTactics = geminiResult.tactics || [];

      if (geminiResult.classification === 'scam') {
        signals.push(createSignal(MESSAGE_SIGNALS.AI_SCAM_DETECTED, `Gemini AI: scam (${(geminiResult.confidence * 100).toFixed(0)}% confidence)`));
        if (geminiResult.explanation) explanations.push(`AI Analysis: ${geminiResult.explanation}`);
      } else if (geminiResult.classification === 'spam') {
        signals.push(createSignal(MESSAGE_SIGNALS.AI_SPAM_DETECTED, `Gemini AI: spam (${(geminiResult.confidence * 100).toFixed(0)}% confidence)`));
        if (geminiResult.explanation) explanations.push(`AI Analysis: ${geminiResult.explanation}`);
      } else if (geminiResult.classification === 'suspicious') {
        signals.push(createSignal(MESSAGE_SIGNALS.AI_SUSPICIOUS, `Gemini AI: suspicious (${(geminiResult.confidence * 100).toFixed(0)}% confidence)`));
        if (geminiResult.explanation) explanations.push(`AI Analysis: ${geminiResult.explanation}`);
      }
    }
  } catch (err) {
    logger.warn(`Gemini AI skipped: ${err.message}`);
  }

  // ── Build response ─────────────────────────
  const response = buildScanResponse({
    type: 'message',
    input: message.substring(0, 200) + (message.length > 200 ? '...' : ''),
    signals,
    explanation: explanations,
    details: {
      detectedKeywords,
      categories: [...categories],
      urgencyPatterns: [...new Set(urgency)],
      aiClassification,
      aiExplanation,
      aiIntent,
      aiTactics,
      messageLength: message.length,
      wordCount: message.split(/\s+/).length,
    },
  });

  // ── 9. Enhanced AI explanation ─────────────
  if (signals.length > 0 && response.riskScore > 20) {
    try {
      const enhanced = await aiService.enhanceExplanation(
        'message', message, explanations, response.riskScore
      );
      if (enhanced) response.aiSummary = enhanced;
    } catch (err) {
      logger.warn(`Explanation enhancement skipped: ${err.message}`);
    }
  }

  // ── 10. Hindi translation (if requested) ───
  if (options.lang === 'hi') {
    try {
      const hindi = await aiService.translateToHindi(response);
      if (hindi) response.hindi = hindi;
    } catch (err) {
      logger.warn(`Hindi translation skipped: ${err.message}`);
    }
  }

  return response;
};

module.exports = { analyzeMessage };
