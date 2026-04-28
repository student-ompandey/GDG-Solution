/**
 * Centralised AI Service — Google Gemini integration.
 *
 * Provides intelligent scam classification, user-friendly explanations,
 * image analysis, and optional Hindi translation.
 *
 * All methods gracefully degrade — if Gemini is unavailable or the API key
 * is missing, callers receive `null` and fall back to keyword-based logic.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const { GEMINI_API_KEY } = require('../config/env');

// ── Singleton Gemini client ──────────────────

let genAI = null;

const getClient = () => {
  if (!GEMINI_API_KEY) return null;
  if (!genAI) genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  return genAI;
};

const MODELS = ['gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-pro'];

const getModel = (modelName = MODELS[0]) => {
  const client = getClient();
  if (!client) return null;
  return client.getGenerativeModel({ model: modelName });
};

/**
 * Determine if a Gemini error is retryable (quota, rate-limit, or temporary unavailability).
 */
const isRetryableError = (error) => {
  const msg = error.message || '';
  return msg.includes('429') || msg.includes('quota') || msg.includes('503') || msg.includes('Service Unavailable') || msg.includes('high demand') || msg.includes('RESOURCE_EXHAUSTED');
};

/**
 * Call Gemini with automatic model fallback on quota/availability errors.
 * Tries each model in the MODELS list until one succeeds.
 */
const callWithFallback = async (contentParts) => {
  const client = getClient();
  if (!client) return null;

  for (const modelName of MODELS) {
    try {
      const model = client.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(contentParts);
      return result;
    } catch (error) {
      if (isRetryableError(error) && modelName !== MODELS[MODELS.length - 1]) {
        logger.warn(`Gemini ${modelName} unavailable, trying next model...`);
        continue;
      }
      throw error;
    }
  }
  return null;
};

// ──────────────────────────────────────────────
// 1. Message Classification
// ──────────────────────────────────────────────

const MESSAGE_CLASSIFY_PROMPT = `You are a world-class scam and fraud detection AI.

Analyse the following message and respond ONLY with valid JSON (no markdown, no code fences):

{
  "classification": "scam" | "spam" | "suspicious" | "legitimate",
  "confidence": <0.0 to 1.0>,
  "intent": "<brief description of the sender's likely intent>",
  "tactics": ["<tactic1>", "<tactic2>"],
  "explanation": "<1-2 sentence user-friendly explanation of why this is or isn't a scam>"
}

Rules:
- "scam": Deliberate fraud attempt (phishing, financial theft, identity theft)
- "spam": Unsolicited marketing, not necessarily fraudulent
- "suspicious": Could be scam but not enough evidence
- "legitimate": Normal, genuine communication
- "tactics" should list manipulation techniques used (e.g., "urgency", "authority impersonation", "fear of loss", "too good to be true", "fake deadline")
- "explanation" should be written for a non-technical person who received this message`;

/**
 * Classify a text message using Gemini AI.
 *
 * @param {string} message - The message to classify
 * @returns {Promise<object|null>} Classification result or null
 */
const classifyMessage = async (message) => {
  if (!getClient()) return null;

  try {
    const result = await callWithFallback([
      MESSAGE_CLASSIFY_PROMPT,
      `Message to analyse:\n"""${message}"""`,
    ]);
    if (!result) return null;

    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      classification: parsed.classification || 'legitimate',
      confidence: Math.min(Math.max(parsed.confidence || 0, 0), 1),
      intent: parsed.intent || null,
      tactics: Array.isArray(parsed.tactics) ? parsed.tactics : [],
      explanation: parsed.explanation || null,
    };
  } catch (error) {
    logger.error(`Gemini classifyMessage error: ${error.message}`);
    return null;
  }
};

// ──────────────────────────────────────────────
// 2. Image / Visual Content Analysis
// ──────────────────────────────────────────────

const IMAGE_ANALYSE_PROMPT = `You are a scam and fraud detection expert specialising in visual content.

Analyse this image for any signs of scam, phishing, fraud, or social engineering.

Look for:
- Fake prize / lottery announcements
- Phishing login pages or forms
- Fake invoices, receipts, or payment confirmations
- Impersonation of banks, government agencies, or companies
- Urgent warnings designed to create panic
- QR codes that may link to malicious sites
- Too-good-to-be-true offers

Respond ONLY with valid JSON (no markdown, no code fences):

{
  "riskScore": <0 to 100>,
  "findings": ["<finding1>", "<finding2>"],
  "explanation": "<2-3 sentence user-friendly explanation>",
  "scamType": "<e.g., phishing, lottery scam, impersonation, fake offer, none>"
}

If the image appears safe, return: {"riskScore": 0, "findings": [], "explanation": "No suspicious content detected.", "scamType": "none"}`;

/**
 * Analyse an image for scam content using Gemini Vision.
 *
 * @param {string} filePath - Path to the image file
 * @param {string} originalName - Original filename
 * @returns {Promise<object|null>} Analysis result or null
 */
const analyzeImageWithAI = async (filePath, originalName) => {
  if (!getClient()) return null;

  try {
    const imageBuffer = fs.readFileSync(filePath);
    const base64 = imageBuffer.toString('base64');
    const ext = path.extname(originalName).replace('.', '').toLowerCase() || 'png';
    const mimeMap = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' };
    const mimeType = mimeMap[ext] || 'image/png';

    const result = await callWithFallback([
      IMAGE_ANALYSE_PROMPT,
      { inlineData: { data: base64, mimeType } },
    ]);
    if (!result) return null;

    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      riskScore: Math.min(Math.max(parsed.riskScore || 0, 0), 100),
      findings: Array.isArray(parsed.findings) ? parsed.findings : [],
      explanation: parsed.explanation || null,
      scamType: parsed.scamType || 'unknown',
    };
  } catch (error) {
    logger.error(`Gemini analyzeImage error: ${error.message}`);
    return null;
  }
};

// ──────────────────────────────────────────────
// 3. Explanation Enhancement
// ──────────────────────────────────────────────

const EXPLAIN_PROMPT = `You are a friendly cybersecurity advisor explaining scan results to a non-technical person.

Given the following technical detection signals, rewrite them as a clear, user-friendly explanation paragraph (2-4 sentences). Use simple language, avoid jargon, and tell the user what the actual risk is and what they should do.

Respond ONLY with the explanation text (no JSON, no markdown).`;

/**
 * Convert technical signals into a user-friendly explanation paragraph.
 *
 * @param {string} type - Scan type ('url', 'message', 'qr', 'image')
 * @param {string} input - The scanned input
 * @param {string[]} signals - Array of technical signal descriptions
 * @param {number} riskScore - The calculated risk score
 * @returns {Promise<string|null>} User-friendly explanation or null
 */
const enhanceExplanation = async (type, input, signals, riskScore) => {
  if (!getClient() || signals.length === 0) return null;

  try {
    const context = `Scan type: ${type}\nInput: ${input.substring(0, 200)}\nRisk score: ${riskScore}/100\nDetection signals:\n${signals.map((s) => `• ${s}`).join('\n')}`;

    const result = await callWithFallback([EXPLAIN_PROMPT, context]);
    if (!result) return null;
    const text = result.response.text().trim();
    return text.length > 10 ? text : null;
  } catch (error) {
    logger.error(`Gemini enhanceExplanation error: ${error.message}`);
    return null;
  }
};

// ──────────────────────────────────────────────
// 4. Hindi Translation
// ──────────────────────────────────────────────

const TRANSLATE_PROMPT = `Translate the following scam detection report into Hindi. Keep the same structure — translate the summary, explanation points, and recommendation into clear, simple Hindi. Use Devanagari script. Do not translate technical terms like "URL", "IP address", "QR code", "phishing".

Respond ONLY with valid JSON (no markdown, no code fences):

{
  "summary": "<Hindi translation>",
  "explanation": ["<point1 in Hindi>", "<point2 in Hindi>"],
  "recommendation": "<Hindi translation>"
}`;

/**
 * Translate scan result fields into Hindi using Gemini.
 *
 * @param {object} result - The scan result object
 * @returns {Promise<object|null>} Translated fields or null
 */
const translateToHindi = async (result) => {
  if (!getClient()) return null;

  try {
    const content = `Summary: ${result.summary}\nExplanation:\n${(result.explanation || []).map((e) => `• ${e}`).join('\n')}\nRecommendation: ${result.recommendation}`;

    const response = await callWithFallback([TRANSLATE_PROMPT, content]);
    if (!response) return null;
    const text = response.response.text().trim();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      summary_hi: parsed.summary || null,
      explanation_hi: Array.isArray(parsed.explanation) ? parsed.explanation : [],
      recommendation_hi: parsed.recommendation || null,
    };
  } catch (error) {
    logger.error(`Gemini translateToHindi error: ${error.message}`);
    return null;
  }
};

// ──────────────────────────────────────────────
// 5. Extracted Text Analysis (for images/OCR)
// ──────────────────────────────────────────────

const TEXT_FROM_IMAGE_PROMPT = `You are a scam detection expert. The following text was extracted from an image using OCR.

Analyse it for scam patterns: fake offers, lottery wins, phishing, impersonation, urgency tactics, or financial fraud.

Respond ONLY with valid JSON (no markdown, no code fences):

{
  "classification": "scam" | "spam" | "suspicious" | "legitimate",
  "riskScore": <0 to 100>,
  "findings": ["<finding1>", "<finding2>"],
  "explanation": "<1-2 sentence user-friendly explanation>"
}`;

/**
 * Analyse OCR-extracted text from an image for scam patterns.
 *
 * @param {string} extractedText - Text extracted from image via OCR
 * @returns {Promise<object|null>}
 */
const analyzeExtractedText = async (extractedText) => {
  if (!getClient() || !extractedText || extractedText.trim().length < 10) return null;

  try {
    const result = await callWithFallback([
      TEXT_FROM_IMAGE_PROMPT,
      `Extracted text:\n"""${extractedText.substring(0, 2000)}"""`,
    ]);
    if (!result) return null;

    const text = result.response.text().trim();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return {
      classification: parsed.classification || 'legitimate',
      riskScore: Math.min(Math.max(parsed.riskScore || 0, 0), 100),
      findings: Array.isArray(parsed.findings) ? parsed.findings : [],
      explanation: parsed.explanation || null,
    };
  } catch (error) {
    logger.error(`Gemini analyzeExtractedText error: ${error.message}`);
    return null;
  }
};

// ──────────────────────────────────────────────
// Health check
// ──────────────────────────────────────────────

/**
 * Check if Gemini API is configured and responsive.
 * @returns {Promise<boolean>}
 */
const isAvailable = async () => {
  const model = getModel();
  if (!model) return false;
  try {
    const result = await model.generateContent('Respond with "ok"');
    return result.response.text().trim().toLowerCase().includes('ok');
  } catch {
    return false;
  }
};

// ──────────────────────────────────────────────
// 6. Chatbot Assistant
// ──────────────────────────────────────────────

const CHAT_SYSTEM_PROMPT = `You are ScamShield AI — a concise cybersecurity assistant.

RULES (STRICT):
1. Keep ALL replies under 3-4 sentences maximum. Never write long paragraphs.
2. Use simple, non-technical language a 10-year-old could understand.
3. If user writes in Hindi (Devanagari script or Hinglish), respond ENTIRELY in Hindi using Devanagari script.
4. If user writes in English, respond in English.
5. For scan results: give a 1-line verdict, 1-line reason, and 1-line action step.
6. Never use bullet lists with more than 3 items.
7. If the user asks something unrelated to security, say "I only help with online safety" in their language.

EXAMPLE (English):
User: "Is this link safe?"
You: "This link looks suspicious — it uses a fake domain to impersonate PayPal. Don't click it. Block the sender and delete the message."

EXAMPLE (Hindi):
User: "क्या ये लिंक सुरक्षित है?"
You: "यह लिंक खतरनाक है — यह नकली डोमेन इस्तेमाल कर रहा है। इसे न खोलें और भेजने वाले को ब्लॉक करें।"

EXAMPLE (Hinglish):
User: "ye message safe hai kya?"
You: "Yeh message scam hai — OTP maangna aur urgency dikhana scam ke clear signs hain. Reply mat karo aur sender ko block karo."`;

/**
 * Sanitize chat history to ensure it follows Gemini's strict alternating
 * user/model turn requirement.  Drops any messages that would break the
 * pattern and ensures the sequence starts with a 'user' turn.
 *
 * @param {Array} rawHistory - Raw messages from the frontend [{role, text}]
 * @returns {Array} Gemini-compatible history [{role, parts: [{text}]}]
 */
const sanitizeHistory = (rawHistory) => {
  if (!Array.isArray(rawHistory) || rawHistory.length === 0) return [];

  // Convert to Gemini format
  const converted = rawHistory.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text || (Array.isArray(msg.parts) ? msg.parts[0]?.text : '') || '' }],
  }));

  // Filter out empty messages
  const nonEmpty = converted.filter(msg => msg.parts[0].text.trim().length > 0);

  // Ensure alternating roles — drop consecutive same-role messages (keep the last one)
  const alternating = [];
  for (const msg of nonEmpty) {
    if (alternating.length > 0 && alternating[alternating.length - 1].role === msg.role) {
      // Replace the last one with this one (keep the more recent message)
      alternating[alternating.length - 1] = msg;
    } else {
      alternating.push(msg);
    }
  }

  // Gemini requires history to start with 'user'
  while (alternating.length > 0 && alternating[0].role !== 'user') {
    alternating.shift();
  }

  // Gemini requires history to end with 'model' (the current user message is sent via sendMessage)
  while (alternating.length > 0 && alternating[alternating.length - 1].role !== 'model') {
    alternating.pop();
  }

  return alternating;
};

/**
 * Handle a chat message with the ScamShield Assistant.
 * @param {Array} history - Previous chat messages [{role: 'user'|'model', text: string}]
 * @param {string} message - The new message from the user
 * @param {object} context - Optional context about the latest scan result
 * @returns {Promise<string|null>} The AI's response text
 */
const chatWithAI = async (history = [], message, context = null) => {
  const client = getClient();
  if (!client) {
    logger.error('Gemini chatWithAI: No API key configured');
    return null;
  }

  try {
    let finalMessage = message;
    
    // Inject context silently into the prompt if provided
    if (context && context.input) {
      finalMessage = `[SYSTEM CONTEXT: The user just ran a scan on the following content: "${context.input.substring(0, 500)}". The scan result was a risk score of ${context.riskScore}/100. Signals: ${context.signals?.map(s => s.type).join(', ') || 'none'}. Explanation: ${JSON.stringify(context.explanation)}]\n\nUser Message: ${message}`;
    }

    // Build a clean, Gemini-compatible history (limit to last 10 messages for context)
    const formattedHistory = sanitizeHistory((history || []).slice(-10));

    for (const modelName of MODELS) {
      try {
        const model = client.getGenerativeModel({ 
          model: modelName,
          systemInstruction: CHAT_SYSTEM_PROMPT
        });
        
        const chat = model.startChat({
          history: formattedHistory,
        });

        const result = await chat.sendMessage([{ text: finalMessage }]);
        const responseText = result.response.text().trim();
        
        if (!responseText) {
          logger.warn(`Gemini ${modelName} returned empty response, trying next...`);
          continue;
        }
        
        return responseText;
      } catch (error) {
        const isHistoryError = error.message?.includes('history') || error.message?.includes('turn');
        
        if (isHistoryError) {
          // If history causes issues, retry with no history
          logger.warn(`Gemini ${modelName} history error, retrying without history...`);
          try {
            const model = client.getGenerativeModel({ 
              model: modelName,
              systemInstruction: CHAT_SYSTEM_PROMPT
            });
            const chat = model.startChat({ history: [] });
            const result = await chat.sendMessage([{ text: finalMessage }]);
            return result.response.text().trim();
          } catch (retryError) {
            logger.error(`Gemini ${modelName} retry without history also failed: ${retryError.message}`);
          }
        }
        
        if (isRetryableError(error) && modelName !== MODELS[MODELS.length - 1]) {
          logger.warn(`Gemini ${modelName} unavailable in chat, trying next model...`);
          continue;
        }
        logger.error(`Gemini model ${modelName} chat error: ${error.message}`);
        // If this was the last model, throw to the outer catch
        if (modelName === MODELS[MODELS.length - 1]) throw error;
      }
    }
    return "I am currently experiencing high traffic and my AI service is temporarily unavailable. Please try again in a few moments.";
  } catch (error) {
    logger.error(`Gemini chatWithAI error: ${error.message}`);
    return "I am currently experiencing high traffic and my AI service is temporarily unavailable. Please try again in a few moments.";
  }
};

module.exports = {
  classifyMessage,
  analyzeImageWithAI,
  enhanceExplanation,
  translateToHindi,
  analyzeExtractedText,
  isAvailable,
  chatWithAI,
};
