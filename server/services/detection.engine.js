/**
 * ╔══════════════════════════════════════════════╗
 * ║  DETECTION ENGINE — Multi-Layer Scam Analysis║
 * ╚══════════════════════════════════════════════╝
 *
 * Central, reusable detection engine used by all scan services
 * (message, image OCR, QR text, audio transcript).
 *
 * Layers:
 *   1. Text normalization (NLP)
 *   2. Pattern matching (regex + phrase)
 *   3. Formatting anomaly detection
 *   4. Combo bonus scoring
 *   5. Confidence calculation
 *   6. Dynamic explanation generation
 *   7. Intent detection
 */

const {
  CATEGORIES,
  PATTERN_GROUPS,
  COMBO_BONUSES,
  normalizeText,
  detectFormattingAnomalies,
  detectIntent,
} = require('../utils/patterns');

const logger = require('../utils/logger');

// ──────────────────────────────────────────────
// Core Text Analysis
// ──────────────────────────────────────────────

/**
 * Run multi-layer text analysis on any text input.
 * Used by message, image (OCR), QR (decoded text), and audio (transcript) services.
 *
 * @param {string} rawText - The raw input text
 * @param {object} [options] - { skipCategories: string[], boostCategories: string[] }
 * @returns {object} Detection result
 */
const analyzeText = (rawText, options = {}) => {
  if (!rawText || typeof rawText !== 'string') {
    return createEmptyResult();
  }

  const original = rawText;
  const normalized = normalizeText(rawText);
  const { skipCategories = [], boostCategories = [] } = options;

  // ── Layer 1: Pattern Matching ──────────────
  const matchedSignals = [];
  const matchedCategories = new Set();
  const matchedKeywords = [];
  const categoryWeights = {};

  for (const group of PATTERN_GROUPS) {
    if (skipCategories.includes(group.category)) continue;

    for (const pattern of group.patterns) {
      // Test against both original and normalized text for better coverage
      const regexCopy = new RegExp(pattern.regex.source, pattern.regex.flags);
      const match = regexCopy.test(normalized) || regexCopy.test(original);

      if (match) {
        // Extract the matched text for transparency
        const matchResult = normalized.match(new RegExp(pattern.regex.source, pattern.regex.flags));
        const matched = matchResult ? matchResult[0] : null;

        const weight = boostCategories.includes(group.category)
          ? Math.round(pattern.weight * 1.3)
          : pattern.weight;

        matchedSignals.push({
          type: group.category,
          category: group.category,
          label: pattern.label,
          matched: matched || '(pattern match)',
          weight,
        });

        matchedCategories.add(group.category);
        if (matched) matchedKeywords.push(matched);

        // Track category total weight
        categoryWeights[group.category] = (categoryWeights[group.category] || 0) + weight;
      }
    }
  }

  // ── Layer 2: Formatting Anomalies ──────────
  const anomalies = detectFormattingAnomalies(original);
  for (const a of anomalies) {
    matchedSignals.push({
      type: a.type,
      category: 'FORMATTING',
      label: a.label,
      matched: null,
      weight: a.weight,
    });
  }

  // ── Layer 3: Combo Bonuses ─────────────────
  const comboBonuses = [];
  for (const combo of COMBO_BONUSES) {
    const allPresent = combo.categories.every(c => matchedCategories.has(c));
    if (allPresent) {
      comboBonuses.push({
        categories: combo.categories,
        bonus: combo.bonus,
        label: combo.label,
      });
      matchedSignals.push({
        type: 'COMBO_BONUS',
        category: 'COMBO',
        label: combo.label,
        matched: combo.categories.join(' + '),
        weight: combo.bonus,
      });
    }
  }

  // ── Layer 4: Score Calculation ──────────────
  const rawScore = matchedSignals.reduce((sum, s) => sum + s.weight, 0);
  const riskScore = Math.min(Math.max(rawScore, 0), 100);

  // ── Layer 5: Confidence ────────────────────
  const confidence = calculateConfidence(matchedSignals, matchedCategories, comboBonuses);

  // ── Layer 6: Intent Detection ──────────────
  const intents = detectIntent(matchedCategories);

  // ── Layer 7: Dynamic Explanation ────────────
  const explanation = generateDynamicExplanation(matchedSignals, matchedCategories, comboBonuses, riskScore);

  return {
    riskScore,
    confidence,
    intents,
    matchedCategories: [...matchedCategories],
    signals: matchedSignals,
    comboBonuses,
    explanation,
    keywords: [...new Set(matchedKeywords)],
    anomalies,
    stats: {
      totalSignals: matchedSignals.length,
      totalCategories: matchedCategories.size,
      totalCombos: comboBonuses.length,
      rawScore,
      cappedScore: riskScore,
    },
  };
};

// ──────────────────────────────────────────────
// Confidence Calculation
// ──────────────────────────────────────────────

/**
 * Calculate confidence level based on signal quantity, weight, and category diversity.
 *
 * @param {Array} signals
 * @param {Set} categories
 * @param {Array} combos
 * @returns {'None' | 'Low' | 'Medium' | 'High'}
 */
const calculateConfidence = (signals, categories, combos) => {
  const meaningful = signals.filter(s => s.weight > 0);
  if (meaningful.length === 0) return 'None';

  let score = 0;

  // Factor 1: Number of signals
  score += Math.min(meaningful.length * 8, 30);

  // Factor 2: Category diversity
  score += Math.min(categories.size * 12, 30);

  // Factor 3: Combo bonuses present
  score += Math.min(combos.length * 15, 25);

  // Factor 4: Max individual signal weight
  const maxWeight = Math.max(...meaningful.map(s => s.weight));
  score += maxWeight >= 25 ? 15 : maxWeight >= 15 ? 8 : 3;

  if (score >= 60) return 'High';
  if (score >= 35) return 'Medium';
  return 'Low';
};

// ──────────────────────────────────────────────
// Dynamic Explanation Generator
// ──────────────────────────────────────────────

/**
 * Generate human-readable explanation from detected signals.
 *
 * @param {Array} signals
 * @param {Set} categories
 * @param {Array} combos
 * @param {number} riskScore
 * @returns {Array<string>}
 */
const generateDynamicExplanation = (signals, categories, combos, riskScore) => {
  if (signals.length === 0) {
    return ['No suspicious patterns detected. This content appears to be safe.'];
  }

  const explanations = [];

  // Group by category for narrative
  const categoryExplanations = {
    [CATEGORIES.URGENCY]: 'This content creates artificial urgency to pressure you into acting without thinking.',
    [CATEGORIES.SENSITIVE_REQUEST]: 'This content asks for sensitive personal or financial information, which legitimate organizations rarely do via messages.',
    [CATEGORIES.REWARD_SCAM]: 'This content promises rewards or prizes — a classic bait technique used in scams.',
    [CATEGORIES.THREAT_LANGUAGE]: 'This content uses threats or scare tactics to manipulate you into compliance.',
    [CATEGORIES.SUSPICIOUS_URL]: 'This content contains suspicious links that may lead to phishing or malicious websites.',
    [CATEGORIES.SOCIAL_ENGINEERING]: 'This content uses social engineering techniques to manipulate your trust.',
    [CATEGORIES.FINANCIAL_FRAUD]: 'This content involves financial requests or claims that may be fraudulent.',
    [CATEGORIES.IMPERSONATION]: 'This content impersonates a known organization or authority figure.',
    [CATEGORIES.DELIVERY_SCAM]: 'This content mimics delivery notifications, a common tactic in package delivery scams.',
  };

  // Add category-level explanations
  for (const cat of categories) {
    if (categoryExplanations[cat]) {
      explanations.push(categoryExplanations[cat]);
    }
  }

  // Add combo explanations
  for (const combo of combos) {
    explanations.push(`⚠️ Combined pattern: ${combo.label} — this significantly increases the scam likelihood.`);
  }

  // Add top specific signals (max 3 most weighted)
  const topSignals = signals
    .filter(s => s.category !== 'COMBO' && s.category !== 'FORMATTING')
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3);

  for (const sig of topSignals) {
    if (sig.matched && sig.matched !== '(pattern match)') {
      explanations.push(`Detected: "${sig.matched}" — ${sig.label}.`);
    }
  }

  return explanations;
};

// ──────────────────────────────────────────────
// Safe Content Detection
// ──────────────────────────────────────────────

/**
 * Determine if content should be explicitly marked as safe.
 * Reduces false positives by checking for weak-only signals.
 *
 * @param {object} result - Detection engine result
 * @returns {object} Updated result with safe determination
 */
const applySafetyCheck = (result) => {
  // If no signals at all — explicitly safe
  if (result.signals.length === 0) {
    return {
      ...result,
      isSafe: true,
      safeReason: 'No suspicious patterns detected in this content.',
    };
  }

  // If only weak signals (all weight <= 10) and score < 20 — mark as safe
  const hasStrongSignal = result.signals.some(s => s.weight > 10);
  if (!hasStrongSignal && result.riskScore < 20) {
    return {
      ...result,
      isSafe: true,
      safeReason: 'Only minor indicators found — content appears safe.',
    };
  }

  return {
    ...result,
    isSafe: false,
  };
};

// ──────────────────────────────────────────────
// URL Intelligence
// ──────────────────────────────────────────────

/**
 * Advanced URL analysis — extract intelligence from URL structure.
 *
 * @param {string} url
 * @returns {object} URL intelligence report
 */
const analyzeUrlIntelligence = (url) => {
  const signals = [];

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const fullPath = parsed.pathname + parsed.search;

    // Protocol analysis
    if (parsed.protocol === 'http:') {
      signals.push({ type: 'HTTP_NO_SSL', category: CATEGORIES.SUSPICIOUS_URL, label: 'Uses HTTP instead of HTTPS (unencrypted)', weight: 12 });
    }

    // Domain length (very long domains are suspicious)
    if (hostname.length > 30) {
      signals.push({ type: 'LONG_DOMAIN', category: CATEGORIES.SUSPICIOUS_URL, label: `Unusually long domain name (${hostname.length} chars)`, weight: 12 });
    }

    // URL total length
    if (url.length > 200) {
      signals.push({ type: 'LONG_URL', category: CATEGORIES.SUSPICIOUS_URL, label: `Unusually long URL (${url.length} chars)`, weight: 10 });
    }

    // Suspicious characters in URL
    if (url.includes('@')) {
      signals.push({ type: 'AT_IN_URL', category: CATEGORIES.SUSPICIOUS_URL, label: 'Contains @ symbol (credential-based redirect)', weight: 25 });
    }

    // Double encoding
    if (/%25|%2520/.test(url)) {
      signals.push({ type: 'DOUBLE_ENCODING', category: CATEGORIES.SUSPICIOUS_URL, label: 'Contains double-encoded characters (obfuscation)', weight: 18 });
    }

    // Digit ratio in domain
    const domainName = hostname.split('.').slice(0, -1).join('');
    const digitCount = (domainName.match(/\d/g) || []).length;
    const digitRatio = domainName.length > 0 ? digitCount / domainName.length : 0;
    if (digitRatio > 0.4) {
      signals.push({ type: 'HIGH_DIGIT_RATIO', category: CATEGORIES.SUSPICIOUS_URL, label: 'Domain has excessive numbers (randomly generated)', weight: 15 });
    }

    // Hyphen count in domain
    const hyphenCount = (hostname.match(/-/g) || []).length;
    if (hyphenCount > 3) {
      signals.push({ type: 'EXCESSIVE_HYPHENS', category: CATEGORIES.SUSPICIOUS_URL, label: `Domain has ${hyphenCount} hyphens (suspicious)`, weight: 12 });
    }

    // Subdomain depth
    const subdomainCount = hostname.split('.').length - 2;
    if (subdomainCount >= 3) {
      signals.push({ type: 'DEEP_SUBDOMAINS', category: CATEGORIES.SUSPICIOUS_URL, label: `${subdomainCount} subdomains deep (possible spoofing)`, weight: 15 });
    }

    // Path depth
    const pathDepth = (fullPath.match(/\//g) || []).length;
    if (pathDepth > 6) {
      signals.push({ type: 'DEEP_PATH', category: CATEGORIES.SUSPICIOUS_URL, label: 'Deeply nested URL path', weight: 8 });
    }

    // Redirect parameters
    const redirectParams = ['redirect', 'url', 'next', 'return', 'goto', 'dest', 'redir', 'returnTo', 'continue'];
    const foundRedirects = redirectParams.filter(p => parsed.searchParams.has(p));
    if (foundRedirects.length > 0) {
      signals.push({ type: 'REDIRECT_PARAMS', category: CATEGORIES.SUSPICIOUS_URL, label: `Contains redirect parameter: ${foundRedirects.join(', ')}`, weight: 12 });
    }

    // Data URI in params
    if (/data:/i.test(parsed.search)) {
      signals.push({ type: 'DATA_URI_PARAM', category: CATEGORIES.SUSPICIOUS_URL, label: 'Contains data URI in parameters (possible payload)', weight: 20 });
    }

    return {
      protocol: parsed.protocol,
      hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? '443' : '80'),
      path: parsed.pathname,
      queryParams: Object.fromEntries(parsed.searchParams),
      domainLength: hostname.length,
      urlLength: url.length,
      subdomainCount,
      digitRatio: Math.round(digitRatio * 100) + '%',
      hyphenCount,
      pathDepth,
      isHttps: parsed.protocol === 'https:',
      signals,
    };
  } catch {
    return {
      error: 'Malformed URL — could not parse',
      signals: [{ type: 'MALFORMED_URL', category: CATEGORIES.SUSPICIOUS_URL, label: 'URL could not be parsed (malformed)', weight: 25 }],
    };
  }
};

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

const createEmptyResult = () => ({
  riskScore: 0,
  confidence: 'None',
  intents: [],
  matchedCategories: [],
  signals: [],
  comboBonuses: [],
  explanation: ['No content to analyze.'],
  keywords: [],
  anomalies: [],
  stats: { totalSignals: 0, totalCategories: 0, totalCombos: 0, rawScore: 0, cappedScore: 0 },
  isSafe: true,
  safeReason: 'No content provided.',
});

// ──────────────────────────────────────────────
// Exports
// ──────────────────────────────────────────────

module.exports = {
  analyzeText,
  applySafetyCheck,
  analyzeUrlIntelligence,
  normalizeText,
};
