const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const { OPENAI_API_KEY } = require('../config/env');
const { analyzeMessage } = require('./message.service');
const { buildScanResponse } = require('../utils/riskLevel');
const { IMAGE_SIGNALS, createSignal } = require('../utils/signals');

/**
 * Analyse an uploaded image for scam content using OCR + Vision API.
 * @param {string} filePath
 * @param {string} originalName
 * @returns {Promise<object>}
 */
const analyzeImage = async (filePath, originalName) => {
  const signals = [];
  const explanations = [];
  let extractedText = '';
  let ocrKeywords = [];

  try {
    // 1. OCR text extraction
    try {
      extractedText = await extractTextWithOCR(filePath);
      if (extractedText && extractedText.trim().length > 10) {
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
      } else {
        signals.push(createSignal(IMAGE_SIGNALS.OCR_NO_TEXT));
      }
    } catch (ocrErr) {
      logger.warn(`OCR failed: ${ocrErr.message}`);
    }

    // 2. Vision API
    if (OPENAI_API_KEY) {
      try {
        const vision = await analyzeWithVisionAPI(filePath, originalName);
        if (vision.riskScore > 10 && vision.findings.length > 0) {
          signals.push(createSignal(IMAGE_SIGNALS.VISION_SCAM_DETECTED, vision.findings.join('; ')));
          vision.findings.forEach((f) => explanations.push(f));
        }
      } catch (vErr) {
        logger.warn(`Vision failed: ${vErr.message}`);
      }
    }

    return buildScanResponse({
      type: 'image',
      input: originalName,
      signals,
      explanation: explanations,
      details: {
        extractedText: extractedText ? extractedText.substring(0, 300) : null,
        detectedKeywords: ocrKeywords,
        analysisMethod: OPENAI_API_KEY ? 'OCR + AI Vision' : 'OCR Only',
      },
    });

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

// ── OCR ──────────────────────────────────────

const extractTextWithOCR = async (filePath) => {
  const Tesseract = require('tesseract.js');
  const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
    logger: (m) => { if (m.status === 'recognizing text') logger.debug(`OCR: ${(m.progress * 100).toFixed(0)}%`); },
  });
  return text.replace(/\n{3,}/g, '\n\n').replace(/[ \t]+/g, ' ').trim();
};

// ── Vision API ───────────────────────────────

const analyzeWithVisionAPI = async (filePath, originalName) => {
  const OpenAI = require('openai');
  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  const base64 = fs.readFileSync(filePath).toString('base64');
  const ext = path.extname(originalName).replace('.', '') || 'png';
  const mime = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Analyse the image for scam/fraud. Respond ONLY with JSON: {"riskScore": <0-100>, "findings": ["<finding>"]}. If safe: {"riskScore": 0, "findings": []}' },
      { role: 'user', content: [{ type: 'text', text: 'Analyse this image for scam content.' }, { type: 'image_url', image_url: { url: `data:${mime};base64,${base64}` } }] },
    ],
    max_tokens: 400, temperature: 0.1,
  });

  const parsed = JSON.parse(completion.choices[0].message.content.trim().replace(/```json\n?/g, '').replace(/```\n?/g, ''));
  return { riskScore: Math.min(Math.max(parsed.riskScore || 0, 0), 100), findings: parsed.findings || [] };
};

module.exports = { analyzeImage };
