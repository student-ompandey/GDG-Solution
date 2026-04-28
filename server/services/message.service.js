/**
 * ╔══════════════════════════════════════════════╗
 * ║  MESSAGE SERVICE — Intelligent Scam Detection║
 * ╚══════════════════════════════════════════════╝
 *
 * Multi-layer message analysis pipeline:
 *   1. Detection Engine (patterns, NLP, combos)
 *   2. Legacy keyword matching (backward compat)
 *   3. Gemini AI classification
 *   4. Signal merging and deduplication
 *   5. Dynamic explanation generation
 */

const logger = require('../utils/logger');
const { buildScanResponse } = require('../utils/riskLevel');
const { MESSAGE_SIGNALS, createSignal } = require('../utils/signals');
const { analyzeText, applySafetyCheck } = require('./detection.engine');
const aiService = require('./ai.service');

// ──────────────────────────────────────────────
// Main message analysis — multi-layer
// ──────────────────────────────────────────────

/**
 * Analyse a text message for scam indicators using multi-layer detection.
 * @param {string} message
 * @param {object} [options] - { lang: 'en' | 'hi' }
 * @returns {Promise<object>}
 */
const analyzeMessage = async (message, options = {}) => {
  const signals = [];
  const explanations = [];
  const categories = new Set();

  // ── Layer 1: Detection Engine (patterns + NLP + combos) ──
  const engineResult = analyzeText(message);

  // Convert engine signals to our signal format
  for (const sig of engineResult.signals) {
    signals.push({
      type: sig.type,
      weight: sig.weight,
      category: sig.category,
      label: sig.label,
      detail: sig.matched ? `Matched: "${sig.matched}" — ${sig.label}` : sig.label,
    });
    if (sig.category && sig.category !== 'COMBO' && sig.category !== 'FORMATTING') {
      categories.add(sig.category);
    }
  }

  // Add engine explanations
  for (const exp of engineResult.explanation) {
    if (!explanations.includes(exp)) explanations.push(exp);
  }

  // ── Layer 2: Embedded links detection ──────
  const urls = message.match(/https?:\/\/[^\s]+/gi) || [];
  if (urls.length > 0 && message.split(/\s+/).length < 30) {
    signals.push(createSignal(MESSAGE_SIGNALS.SHORT_MSG_WITH_LINK));
    explanations.push('Short message with embedded link (classic scam pattern)');
  } else if (urls.length > 0) {
    signals.push(createSignal(MESSAGE_SIGNALS.EMBEDDED_LINK, `${urls.length} link(s) found`));
    explanations.push(`Contains ${urls.length} embedded link(s)`);
  }

  // ── Layer 3: Phone number detection ────────
  if (/\b(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/.test(message)) {
    signals.push(createSignal(MESSAGE_SIGNALS.PHONE_SOLICITATION));
    explanations.push('Contains phone number (may solicit calls)');
  }

  // ── Layer 4: Gemini AI Classification ──────
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

  // ── Layer 5: Apply safety check ────────────
  const safetyResult = applySafetyCheck(engineResult);

  // ── Build response ─────────────────────────
  const response = buildScanResponse({
    type: 'message',
    input: message.substring(0, 200) + (message.length > 200 ? '...' : ''),
    signals,
    explanation: explanations,
    details: {
      detectedKeywords: engineResult.keywords,
      categories: [...categories],
      intents: engineResult.intents,
      comboBonuses: engineResult.comboBonuses.map(c => c.label),
      urgencyPatterns: engineResult.signals
        .filter(s => s.category === 'URGENCY')
        .map(s => s.label),
      aiClassification,
      aiExplanation,
      aiIntent,
      aiTactics,
      messageLength: message.length,
      wordCount: message.split(/\s+/).length,
      engineConfidence: engineResult.confidence,
      engineStats: engineResult.stats,
      isSafe: safetyResult.isSafe,
      safeReason: safetyResult.safeReason || null,
    },
  });

  // ── Layer 6: Enhanced AI explanation ───────
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

  // ── Layer 7: Hindi translation (if requested) ─
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
