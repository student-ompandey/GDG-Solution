const logger = require('../utils/logger');
const { OPENAI_API_KEY } = require('../config/env');
const { buildScanResponse } = require('../utils/riskLevel');
const { MESSAGE_SIGNALS, createSignal } = require('../utils/signals');

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
// Main message analysis — signal-based
// ──────────────────────────────────────────────

/**
 * Analyse a text message for scam indicators using signals.
 * @param {string} message
 * @returns {Promise<object>}
 */
const analyzeMessage = async (message) => {
  const signals = [];
  const explanations = [];
  const detectedKeywords = [];
  const categories = new Set();
  const lower = message.toLowerCase();

  // 1. Keyword matching
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

  // 2. Urgency patterns
  const urgency = [];
  for (const p of URGENCY_PATTERNS) {
    if (p.regex.test(message)) urgency.push(p.label);
  }
  if (urgency.length > 0) {
    signals.push(createSignal(MESSAGE_SIGNALS.URGENCY_TACTICS, `Tactics: ${[...new Set(urgency)].join(', ')}`));
    explanations.push(`Uses pressure tactics: ${[...new Set(urgency)].join(', ')}`);
  }

  // 3. Excessive caps
  const capsWords = message.split(/\s+/).filter((w) => w.length > 3 && w === w.toUpperCase() && /[A-Z]/.test(w));
  if (capsWords.length >= 3) {
    signals.push(createSignal(MESSAGE_SIGNALS.EXCESSIVE_CAPS));
    explanations.push('Uses excessive ALL CAPS to create urgency');
  }

  // 4. Excessive punctuation
  if ((message.match(/[!?]{2,}/g) || []).length >= 2) {
    signals.push(createSignal(MESSAGE_SIGNALS.EXCESSIVE_PUNCTUATION));
    explanations.push('Uses excessive punctuation (!!!, ???)');
  }

  // 5. Money mentions
  const money = message.match(/[\$₹€£¥]\s?\d+[\d,.]*/g) || message.match(/\d+[\d,.]*\s?(dollars?|rupees?|USD|INR)/gi) || [];
  if (money.length > 0) {
    signals.push(createSignal(MESSAGE_SIGNALS.MONEY_MENTION, `Amounts: ${money.slice(0, 3).join(', ')}`));
    explanations.push(`Mentions monetary amounts: ${money.slice(0, 2).join(', ')}`);
  }

  // 6. Links
  const urls = message.match(/https?:\/\/[^\s]+/gi) || [];
  if (urls.length > 0 && message.split(/\s+/).length < 30) {
    signals.push(createSignal(MESSAGE_SIGNALS.SHORT_MSG_WITH_LINK));
    explanations.push('Short message with embedded link (classic scam pattern)');
  } else if (urls.length > 0) {
    signals.push(createSignal(MESSAGE_SIGNALS.EMBEDDED_LINK, `${urls.length} link(s) found`));
    explanations.push(`Contains ${urls.length} embedded link(s)`);
  }

  // 7. Phone number
  if (/\b(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/.test(message)) {
    signals.push(createSignal(MESSAGE_SIGNALS.PHONE_SOLICITATION));
    explanations.push('Contains phone number (may solicit calls)');
  }

  // 8. AI classification
  let aiClassification = null;
  try {
    const ai = await classifyWithAI(message);
    aiClassification = ai.classification;
    if (ai.classification === 'scam') {
      signals.push(createSignal(MESSAGE_SIGNALS.AI_SCAM_DETECTED, `AI: scam (${(ai.confidence * 100).toFixed(0)}% confidence)`));
      explanations.push(`AI classified this message as "scam"`);
    } else if (ai.classification === 'spam') {
      signals.push(createSignal(MESSAGE_SIGNALS.AI_SPAM_DETECTED, `AI: spam (${(ai.confidence * 100).toFixed(0)}% confidence)`));
      explanations.push(`AI classified this message as "spam"`);
    } else if (ai.classification === 'suspicious') {
      signals.push(createSignal(MESSAGE_SIGNALS.AI_SUSPICIOUS, `AI: suspicious (${(ai.confidence * 100).toFixed(0)}% confidence)`));
      explanations.push(`AI classified this message as "suspicious"`);
    }
  } catch (err) {
    logger.warn(`AI skipped: ${err.message}`);
  }

  return buildScanResponse({
    type: 'message',
    input: message.substring(0, 200) + (message.length > 200 ? '...' : ''),
    signals,
    explanation: explanations,
    details: { detectedKeywords, categories: [...categories], urgencyPatterns: [...new Set(urgency)], aiClassification, messageLength: message.length, wordCount: message.split(/\s+/).length },
  });
};

// ── OpenAI classification ────────────────────

const classifyWithAI = async (message) => {
  if (!OPENAI_API_KEY) return { classification: null, confidence: null };
  try {
    const OpenAI = require('openai');
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Classify the message as "scam", "spam", "suspicious", or "legitimate". Respond ONLY with JSON: {"classification": "<class>", "confidence": <0.0-1.0>}' },
        { role: 'user', content: message },
      ],
      max_tokens: 100, temperature: 0.1,
    });
    const parsed = JSON.parse(completion.choices[0].message.content.trim().replace(/```json\n?/g, '').replace(/```\n?/g, ''));
    return { classification: parsed.classification, confidence: parsed.confidence || 0.8 };
  } catch (e) { logger.error(`OpenAI: ${e.message}`); return { classification: null, confidence: null }; }
};

module.exports = { analyzeMessage };
