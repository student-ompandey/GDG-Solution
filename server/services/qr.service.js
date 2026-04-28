/**
 * ╔══════════════════════════════════════════════╗
 * ║  QR SERVICE — Intelligent QR Code Analysis   ║
 * ╚══════════════════════════════════════════════╝
 *
 * Pipeline: Decode QR → identify content type → delegate to
 * URL/message detection engine → merge signals.
 */

const path = require('path');
const fs = require('fs');
const Jimp = require('jimp');
const jsQR = require('jsqr');
const logger = require('../utils/logger');
const { analyzeUrl } = require('./url.service');
const { analyzeText, applySafetyCheck } = require('./detection.engine');
const { buildScanResponse } = require('../utils/riskLevel');
const { QR_SIGNALS, createSignal } = require('../utils/signals');
const aiService = require('./ai.service');

/**
 * Analyse a QR code image — decode and run appropriate analysis.
 * @param {string} filePath
 * @param {string} originalName
 * @param {object} [options] - { lang: 'en' | 'hi' }
 * @returns {Promise<object>}
 */
const analyzeQr = async (filePath, originalName, options = {}) => {
  try {
    const image = await Jimp.read(filePath);
    image.greyscale().contrast(0.5);
    const { width, height, data } = image.bitmap;

    const qrCode = jsQR(new Uint8ClampedArray(data), width, height, { inversionAttempts: 'attemptBoth' });

    if (!qrCode) {
      return buildScanResponse({
        type: 'qr',
        input: originalName,
        signals: [createSignal(QR_SIGNALS.QR_NO_CODE_FOUND)],
        explanation: ['No QR code could be detected in this image.'],
        details: { decodedData: null, contentType: null },
      });
    }

    const decoded = qrCode.data;
    logger.info(`QR decoded: ${decoded.substring(0, 100)}`);

    // URL content → delegate to URL service
    if (/^https?:\/\//i.test(decoded)) {
      const urlResult = await analyzeUrl(decoded, options);
      const qrSignal = createSignal(QR_SIGNALS.QR_CONTAINS_URL, `Destination: ${decoded.substring(0, 80)}`);
      const mergedSignals = [qrSignal, ...(urlResult.signals || []).map((s) => ({
        type: s.type,
        weight: s.weight,
        category: s.category || 'SUSPICIOUS_URL',
        label: s.label || s.description,
        detail: s.description,
      }))];

      return buildScanResponse({
        type: 'qr',
        input: originalName,
        signals: mergedSignals,
        explanation: [
          'QR code contains a URL — the destination was hidden from you before scanning.',
          ...(urlResult.explanation || []).filter((e) => e !== 'No suspicious patterns detected.' && e !== 'This URL belongs to a trusted, well-known domain.'),
        ],
        details: { decodedData: decoded, contentType: 'url', urlAnalysis: urlResult.details },
      });
    }

    // Email content
    if (/^mailto:/i.test(decoded)) {
      const email = decoded.replace('mailto:', '');
      const isFree = /(@gmail|@yahoo|@hotmail|@outlook)/i.test(email);
      const signals = isFree
        ? [createSignal(QR_SIGNALS.QR_FREE_EMAIL, `Email: ${email}`)]
        : [];
      return buildScanResponse({
        type: 'qr',
        input: originalName,
        signals,
        explanation: isFree ? ['QR code links to a free email provider — verify before responding'] : ['QR code contains an email address.'],
        details: { decodedData: decoded, contentType: 'email', email },
      });
    }

    // Phone content
    if (/^tel:/i.test(decoded)) {
      return buildScanResponse({
        type: 'qr',
        input: originalName,
        signals: [createSignal(QR_SIGNALS.QR_PHONE_NUMBER, `Number: ${decoded.replace('tel:', '')}`)],
        explanation: ['QR code contains a phone number — verify before calling'],
        details: { decodedData: decoded, contentType: 'phone' },
      });
    }

    // Plain text → run through detection engine
    const engineResult = analyzeText(decoded);
    const safetyResult = applySafetyCheck(engineResult);
    const mergedSignals = engineResult.signals.map((s) => ({
      type: s.type,
      weight: s.weight,
      category: s.category,
      label: s.label,
      detail: s.matched ? `Matched: "${s.matched}"` : s.label,
    }));

    const textExplanations = [
      'QR code contains text content.',
      ...engineResult.explanation.filter((e) => e !== 'No suspicious patterns detected. This content appears to be safe.'),
    ];

    return buildScanResponse({
      type: 'qr',
      input: originalName,
      signals: mergedSignals,
      explanation: textExplanations,
      details: {
        decodedData: decoded,
        contentType: 'text',
        intents: engineResult.intents,
        comboBonuses: engineResult.comboBonuses.map(c => c.label),
        engineConfidence: engineResult.confidence,
        isSafe: safetyResult.isSafe,
        safeReason: safetyResult.safeReason || null,
      },
    });

  } catch (error) {
    logger.error(`QR error: ${error.message}`);
    return buildScanResponse({
      type: 'qr',
      input: originalName,
      signals: [createSignal(QR_SIGNALS.QR_PROCESSING_ERROR, error.message)],
      explanation: [`Failed to process QR image: ${error.message}`],
      details: { error: error.message },
    });
  } finally {
    try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (_) {}
  }
};

module.exports = { analyzeQr };
