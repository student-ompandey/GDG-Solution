const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const { analyzeMessage } = require('./message.service');
const { buildScanResponse } = require('../utils/riskLevel');
const { IMAGE_SIGNALS, createSignal } = require('../utils/signals');
const aiService = require('./ai.service');

/**
 * Analyse an uploaded image for scam content.
 * Pipeline: OCR text extraction → Gemini Vision → combine scores.
 *
 * @param {string} filePath
 * @param {string} originalName
 * @param {object} [options] - { lang: 'en' | 'hi' }
 * @returns {Promise<object>}
 */
const analyzeImage = async (filePath, originalName, options = {}) => {
  const signals = [];
  const explanations = [];
  let extractedText = '';
  let ocrKeywords = [];

  try {
    // ── 1. OCR text extraction ─────────────────
    try {
      extractedText = await extractTextWithOCR(filePath);
      if (extractedText && extractedText.trim().length > 10) {
        // 1a. Keyword-based analysis on extracted text
        const msgResult = await analyzeMessage(extractedText);
        ocrKeywords = msgResult.details?.detectedKeywords || [];

        if (ocrKeywords.length > 0) {
          signals.push(createSignal(IMAGE_SIGNALS.OCR_SCAM_TEXT, `OCR detected keywords: ${ocrKeywords.join(', ')}`));
          explanations.push(`Image contains scam text: ${ocrKeywords.join(', ')}`);
        }
        if ((msgResult.details?.urgencyPatterns || []).length > 0) {
          signals.push(createSignal(IMAGE_SIGNALS.OCR_URGENCY_TEXT, `Tactics: ${msgResult.details.urgencyPatterns.join(', ')}`));
          explanations.push(`Image text uses pressure tactics: ${msgResult.details.urgencyPatterns.join(', ')}`);
        }

        // 1b. Gemini analysis on extracted text
        try {
          const textAI = await aiService.analyzeExtractedText(extractedText);
          if (textAI && textAI.riskScore > 10 && textAI.findings.length > 0) {
            signals.push(createSignal(IMAGE_SIGNALS.VISION_SCAM_DETECTED, `AI text analysis: ${textAI.findings.join('; ')}`));
            textAI.findings.forEach((f) => {
              if (!explanations.includes(f)) explanations.push(f);
            });
          }
        } catch (aiErr) {
          logger.warn(`Gemini text analysis skipped: ${aiErr.message}`);
        }
      } else {
        signals.push(createSignal(IMAGE_SIGNALS.OCR_NO_TEXT));
      }
    } catch (ocrErr) {
      logger.warn(`OCR failed: ${ocrErr.message}`);
    }

    // ── 2. Gemini Vision (direct image analysis) ─
    try {
      const vision = await aiService.analyzeImageWithAI(filePath, originalName);
      if (vision && vision.riskScore > 10 && vision.findings.length > 0) {
        signals.push(createSignal(IMAGE_SIGNALS.VISION_SCAM_DETECTED, `Gemini Vision: ${vision.findings.join('; ')}`));
        vision.findings.forEach((f) => {
          if (!explanations.includes(f)) explanations.push(f);
        });
      }
    } catch (vErr) {
      logger.warn(`Gemini Vision failed: ${vErr.message}`);
    }

    // ── 3. Build response ──────────────────────
    const response = buildScanResponse({
      type: 'image',
      input: originalName,
      signals,
      explanation: explanations,
      details: {
        extractedText: extractedText ? extractedText.substring(0, 300) : null,
        detectedKeywords: ocrKeywords,
        analysisMethod: 'OCR + Gemini AI',
      },
    });

    // ── 4. Hindi translation (if requested) ────
    if (options.lang === 'hi') {
      try {
        const hindi = await aiService.translateToHindi(response);
        if (hindi) response.hindi = hindi;
      } catch (err) {
        logger.warn(`Hindi translation skipped: ${err.message}`);
      }
    }

    return response;

  } catch (error) {
    logger.error(`Image error: ${error.message}`);
    return buildScanResponse({
      type: 'image',
      input: originalName,
      signals: [],
      explanation: [`Analysis failed: ${error.message}`],
      details: { error: error.message },
    });
  } finally {
    try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (_) {}
  }
};

// ── OCR via Tesseract.js ─────────────────────

const extractTextWithOCR = async (filePath) => {
  const Tesseract = require('tesseract.js');
  const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
    logger: (m) => { if (m.status === 'recognizing text') logger.debug(`OCR: ${(m.progress * 100).toFixed(0)}%`); },
  });
  return text.replace(/\n{3,}/g, '\n\n').replace(/[ \t]+/g, ' ').trim();
};

module.exports = { analyzeImage };
