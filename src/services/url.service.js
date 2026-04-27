const logger = require('../utils/logger');
const { GOOGLE_SAFE_BROWSING_API_KEY } = require('../config/env');
const { buildScanResponse } = require('../utils/riskLevel');
const { URL_SIGNALS, createSignal } = require('../utils/signals');
const aiService = require('./ai.service');

// ── Pattern databases ────────────────────────

const URL_SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd',
  'buff.ly', 'adf.ly', 'tiny.cc', 'lnkd.in', 'rb.gy', 'cutt.ly',
  'shorturl.at', 'rebrand.ly', 'v.gd', 'soo.gd', 'clck.ru',
  'bc.vc', 'trib.al', 'x.co', 'u.to', 'bl.ink', 'short.io',
]);

const SUSPICIOUS_TLDS = new Set([
  '.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.club',
  '.work', '.buzz', '.surf', '.icu', '.cam', '.rest', '.click',
  '.link', '.info', '.online', '.site', '.fun', '.monster', '.pw',
]);

const PHISHING_KEYWORDS = [
  'login', 'signin', 'sign-in', 'verify', 'update', 'secure',
  'account', 'banking', 'password', 'confirm', 'suspend', 'alert',
  'paypal', 'apple', 'microsoft', 'google', 'amazon', 'netflix',
  'wallet', 'crypto', 'authenticate', 'credential', 'unlock',
  'restore', 'recover', 'invoice', 'payment', 'billing',
];

const TRUSTED_DOMAINS = new Set([
  'google.com', 'youtube.com', 'facebook.com', 'twitter.com',
  'github.com', 'microsoft.com', 'apple.com', 'amazon.com',
  'linkedin.com', 'instagram.com', 'wikipedia.org', 'netflix.com',
  'stackoverflow.com', 'reddit.com', 'paypal.com', 'outlook.com',
]);

// ── Entropy helper ───────────────────────────

const calculateEntropy = (str) => {
  if (!str) return 0;
  const freq = {};
  for (const ch of str) freq[ch] = (freq[ch] || 0) + 1;
  let entropy = 0;
  for (const count of Object.values(freq)) {
    const p = count / str.length;
    entropy -= p * Math.log2(p);
  }
  return entropy;
};

const isRandomDomain = (hostname) => {
  const parts = hostname.split('.');
  if (parts.length < 2) return false;
  const name = parts.slice(0, -1).join('');
  const entropy = calculateEntropy(name);
  const digitRatio = (name.match(/\d/g) || []).length / name.length;
  return entropy > 3.8 || digitRatio > 0.4 || name.length > 20;
};

// ──────────────────────────────────────────────
// Main URL analysis — signal-based
// ──────────────────────────────────────────────

/**
 * Analyse a URL for phishing/scam indicators using signals + Gemini AI.
 * @param {string} url
 * @param {object} [options] - { lang: 'en' | 'hi' }
 * @returns {Promise<object>}
 */
const analyzeUrl = async (url, options = {}) => {
  const signals = [];
  const explanations = [];

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const pathAndQuery = (parsed.pathname + parsed.search).toLowerCase();

    // Whitelist
    const rootDomain = hostname.split('.').slice(-2).join('.');
    if (TRUSTED_DOMAINS.has(rootDomain)) {
      return buildScanResponse({ type: 'url', input: url, signals: [], explanation: [] });
    }

    // 1. IP-based host
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || /^\[?[0-9a-f:]+\]?$/i.test(hostname)) {
      signals.push(createSignal(URL_SIGNALS.IP_ADDRESS_URL));
      explanations.push('Uses IP address instead of domain name');
    }

    // 2. URL shortener
    if (URL_SHORTENERS.has(hostname)) {
      signals.push(createSignal(URL_SIGNALS.URL_SHORTENER, `Uses known shortener: ${hostname}`));
      explanations.push(`Uses URL shortener service (${hostname})`);
    }

    // 3. Suspicious TLD
    const tld = '.' + hostname.split('.').pop();
    if (SUSPICIOUS_TLDS.has(tld)) {
      signals.push(createSignal(URL_SIGNALS.SUSPICIOUS_TLD, `Uses abused TLD: ${tld}`));
      explanations.push(`Uses frequently abused TLD (${tld})`);
    }

    // 4. Random domain
    if (isRandomDomain(hostname)) {
      signals.push(createSignal(URL_SIGNALS.RANDOM_DOMAIN));
      explanations.push('Domain name appears randomly generated');
    }

    // 5. Punycode / homograph
    if (hostname.startsWith('xn--') || /[^\x00-\x7F]/.test(hostname)) {
      signals.push(createSignal(URL_SIGNALS.PUNYCODE_HOMOGRAPH));
      explanations.push('Uses international characters (possible impersonation)');
    }

    // 6. Excessive subdomains
    const subCount = hostname.split('.').length - 2;
    if (subCount >= 3) {
      signals.push(createSignal(URL_SIGNALS.EXCESSIVE_SUBDOMAINS, `${subCount} subdomains detected`));
      explanations.push(`Has ${subCount} subdomains (possible spoofing)`);
    }

    // 7. @ symbol
    if (url.includes('@')) {
      signals.push(createSignal(URL_SIGNALS.AT_SYMBOL));
      explanations.push('Contains @ symbol (can redirect to a different site)');
    }

    // 8. Non-standard port
    if (parsed.port && !['80', '443', ''].includes(parsed.port)) {
      signals.push(createSignal(URL_SIGNALS.NON_STANDARD_PORT, `Port ${parsed.port} detected`));
      explanations.push(`Contains port number (${parsed.port})`);
    }

    // 9. No HTTPS
    if (parsed.protocol === 'http:') {
      signals.push(createSignal(URL_SIGNALS.NO_HTTPS));
      explanations.push('Uses HTTP instead of HTTPS (unencrypted)');
    }

    // 10. Phishing keywords
    const kw = PHISHING_KEYWORDS.filter((k) => pathAndQuery.includes(k) || (hostname.includes(k) && !hostname.endsWith(`.${k}.com`)));
    if (kw.length > 0) {
      signals.push(createSignal(URL_SIGNALS.PHISHING_KEYWORDS, `Keywords: ${kw.join(', ')}`));
      explanations.push(`Matches known phishing patterns (${kw.join(', ')})`);
    }

    // 11. Long URL
    if (url.length > 200) {
      signals.push(createSignal(URL_SIGNALS.LONG_URL, `URL is ${url.length} characters`));
      explanations.push('Unusually long URL');
    }

    // 12. Double encoding
    if (/%25|%2520/.test(url)) {
      signals.push(createSignal(URL_SIGNALS.DOUBLE_ENCODING));
      explanations.push('Contains double-encoded characters (obfuscation)');
    }

    // 13. Redirect params
    const rp = ['redirect', 'url', 'next', 'return', 'goto', 'dest', 'redir'].filter((p) => parsed.searchParams.has(p));
    if (rp.length > 0) {
      signals.push(createSignal(URL_SIGNALS.REDIRECT_PARAM, `Params: ${rp.join(', ')}`));
      explanations.push(`Contains redirect parameter (${rp.join(', ')})`);
    }

    // 14. Google Safe Browsing
    const sb = await checkGoogleSafeBrowsing(url);
    if (sb.isMalicious) {
      signals.push(createSignal(URL_SIGNALS.SAFE_BROWSING_FLAG, `Threat: ${sb.threatType}`));
      explanations.push(`Flagged by Google Safe Browsing as ${sb.threatType}`);
    }

  } catch (err) {
    signals.push(createSignal(URL_SIGNALS.MALFORMED_URL, err.message));
    explanations.push('URL could not be parsed (malformed)');
  }

  const response = buildScanResponse({ type: 'url', input: url, signals, explanation: explanations, details: { totalChecks: 14, flaggedChecks: signals.length } });

  // AI-enhanced explanation
  if (signals.length > 0 && response.riskScore > 20) {
    try {
      const enhanced = await aiService.enhanceExplanation('url', url, explanations, response.riskScore);
      if (enhanced) response.aiSummary = enhanced;
    } catch (err) {
      logger.warn(`AI explanation skipped: ${err.message}`);
    }
  }

  // Hindi translation (if requested)
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

// ── Google Safe Browsing ─────────────────────

const checkGoogleSafeBrowsing = async (url) => {
  if (!GOOGLE_SAFE_BROWSING_API_KEY) return { isMalicious: false };
  try {
    const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_SAFE_BROWSING_API_KEY}`;
    const body = { client: { clientId: 'scam-detection-platform', clientVersion: '1.0.0' }, threatInfo: { threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'], platformTypes: ['ANY_PLATFORM'], threatEntryTypes: ['URL'], threatEntries: [{ url }] } };
    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.matches && data.matches.length > 0) return { isMalicious: true, threatType: data.matches[0].threatType };
    return { isMalicious: false };
  } catch (e) { logger.error(`Safe Browsing error: ${e.message}`); return { isMalicious: false }; }
};

module.exports = { analyzeUrl };
