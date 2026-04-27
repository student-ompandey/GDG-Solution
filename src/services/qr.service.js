const path = require('path');
const fs = require('fs');
const Jimp = require('jimp');
const jsQR = require('jsqr');
const logger = require('../utils/logger');
const { analyzeUrl } = require('./url.service');
const { analyzeMessage } = require('./message.service');
const { buildScanResponse } = require('../utils/riskLevel');
const { QR_SIGNALS, createSignal } = require('../utils/signals');

/**
 * Analyse a QR code image — decode and run appropriate analysis.
 * @param {string} filePath
 * @param {string} originalName
 * @returns {Promise<object>}
 */
const analyzeQr = async (filePath, originalName) => {
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
        explanation: [],
        details: { decodedData: null, contentType: null },
      });
    }

    const decoded = qrCode.data;
    logger.info(`QR decoded: ${decoded.substring(0, 100)}`);

    // URL content → delegate to URL service
    if (/^https?:\/\//i.test(decoded)) {
      const urlResult = await analyzeUrl(decoded);
      // Merge QR signal with URL signals
      const qrSignal = createSignal(QR_SIGNALS.QR_CONTAINS_URL, `Destination: ${decoded.substring(0, 80)}`);
      const mergedSignals = [qrSignal, ...(urlResult.signals || []).map((s) => ({ type: s.type, weight: s.weight, detail: s.description }))];

      return buildScanResponse({
        type: 'qr',
        input: originalName,
        signals: mergedSignals,
        explanation: [
          'QR code contains a URL — destination hidden from user before scanning',
          ...(urlResult.explanation || []).filter((e) => e !== 'No suspicious patterns detected.'),
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
        explanation: isFree ? ['QR code links to a free email provider — verify before responding'] : [],
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

    // Plain text → delegate to message service
    const msgResult = await analyzeMessage(decoded);
    const mergedSignals = (msgResult.signals || []).map((s) => ({ type: s.type, weight: s.weight, detail: s.description }));

    return buildScanResponse({
      type: 'qr',
      input: originalName,
      signals: mergedSignals,
      explanation: [
        'QR code contains text content',
        ...(msgResult.explanation || []).filter((e) => e !== 'No suspicious patterns detected.'),
      ],
      details: { decodedData: decoded, contentType: 'text', textAnalysis: msgResult.details },
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
