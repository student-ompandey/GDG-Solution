/**
 * ╔══════════════════════════════════════════════╗
 * ║  PATTERN ENGINE — Context-Aware Detection    ║
 * ╚══════════════════════════════════════════════╝
 *
 * Categorised pattern definitions for multi-layer scam detection.
 * Each pattern group has:
 *   - category: Signal category (URGENCY, SENSITIVE_REQUEST, etc.)
 *   - patterns: Array of { regex, label, weight }
 *
 * Reusable across message, image OCR, QR text, and audio transcript analysis.
 */

// ──────────────────────────────────────────────
// Signal Categories
// ──────────────────────────────────────────────

const CATEGORIES = {
  URGENCY: 'URGENCY',
  SENSITIVE_REQUEST: 'SENSITIVE_REQUEST',
  REWARD_SCAM: 'REWARD_SCAM',
  THREAT_LANGUAGE: 'THREAT_LANGUAGE',
  SUSPICIOUS_URL: 'SUSPICIOUS_URL',
  SOCIAL_ENGINEERING: 'SOCIAL_ENGINEERING',
  FINANCIAL_FRAUD: 'FINANCIAL_FRAUD',
  IMPERSONATION: 'IMPERSONATION',
  DELIVERY_SCAM: 'DELIVERY_SCAM',
};

// ──────────────────────────────────────────────
// Pattern Groups — Regex + Phrase Matching
// ──────────────────────────────────────────────

const PATTERN_GROUPS = [
  // ── URGENCY ────────────────────────────────
  {
    category: CATEGORIES.URGENCY,
    patterns: [
      { regex: /\b(act|respond|reply|click|call)\s+(now|immediately|right\s+away|asap)\b/i, label: 'Demands immediate action', weight: 20 },
      { regex: /within\s+\d+\s*(hour|minute|second|day|hr|min)s?\b/i, label: 'Deadline pressure', weight: 20 },
      { regex: /\b(last\s+chance|final\s+warning|final\s+notice|final\s+reminder)\b/i, label: 'Final warning pressure', weight: 25 },
      { regex: /\b(expires?\s+today|expir(es?|ing)\s+soon|deadline\s+today)\b/i, label: 'Expiry pressure', weight: 18 },
      { regex: /\b(limited\s+time|limited\s+offer|limited\s+period|hurry|rush)\b/i, label: 'Artificial scarcity', weight: 15 },
      { regex: /\bdon'?t\s+(ignore|delay|wait|miss)\b/i, label: 'Pressure to not ignore', weight: 18 },
      { regex: /\b(urgent|urgently|immediate(ly)?)\b/i, label: 'Urgency language', weight: 15 },
      { regex: /\b(right\s+(now|away)|as\s+soon\s+as\s+possible)\b/i, label: 'Immediate action demanded', weight: 15 },
      { regex: /\b(time\s+is\s+running\s+out|running\s+out\s+of\s+time)\b/i, label: 'Time pressure', weight: 20 },
      { regex: /\b(before\s+it'?s?\s+too\s+late)\b/i, label: 'Fear of missing out', weight: 18 },
    ],
  },

  // ── SENSITIVE_REQUEST ──────────────────────
  {
    category: CATEGORIES.SENSITIVE_REQUEST,
    patterns: [
      { regex: /\b(otp|one[\s-]time[\s-]password|verification\s+code)\b/i, label: 'Requests OTP/verification code', weight: 30 },
      { regex: /\b(cvv|cvc|security\s+code|card\s+number)\b/i, label: 'Requests card details', weight: 30 },
      { regex: /\b(atm\s+pin|upi\s+pin|pin\s+number|mpin)\b/i, label: 'Requests PIN', weight: 30 },
      { regex: /\b(bank\s+account|account\s+number|ifsc|routing\s+number|sort\s+code)\b/i, label: 'Requests bank account details', weight: 25 },
      { regex: /\b(social\s+security|ssn|aadhar|aadhaar|pan\s+card|passport\s+number)\b/i, label: 'Requests government ID', weight: 28 },
      { regex: /\b(credit\s+card|debit\s+card)\b/i, label: 'Mentions payment card', weight: 20 },
      { regex: /\b(password|login\s+credential|username\s+and\s+password)\b/i, label: 'Requests login credentials', weight: 28 },
      { regex: /\b(send\s+(me\s+)?(your|the)\s+)?(details|information|data|documents)\b/i, label: 'Requests personal information', weight: 12 },
      { regex: /\b(verify\s+your\s+(identity|account|details|information))\b/i, label: 'Identity verification request', weight: 22 },
      { regex: /\b(confirm\s+your\s+(identity|account|payment|details))\b/i, label: 'Confirmation phishing', weight: 22 },
    ],
  },

  // ── REWARD_SCAM ────────────────────────────
  {
    category: CATEGORIES.REWARD_SCAM,
    patterns: [
      { regex: /\b(you('ve|\s+have)\s+(been\s+)?selected|you('ve|\s+have)\s+won)\b/i, label: 'Prize/selection claim', weight: 28 },
      { regex: /\b(lottery\s+winner|won\s+(a|the)\s+(lottery|prize|jackpot))\b/i, label: 'Lottery scam', weight: 30 },
      { regex: /\b(claim\s+(your|the)\s+(prize|reward|gift|bonus|winnings))\b/i, label: 'Prize claim request', weight: 28 },
      { regex: /\b(free\s+(gift|iphone|laptop|money|cash|item))\b/i, label: 'Free gift lure', weight: 22 },
      { regex: /\b(congratulations|congrats)[\s!.,]*\s*(you|winner|lucky)/i, label: 'Congratulatory scam opening', weight: 25 },
      { regex: /\b(exclusive\s+(offer|deal|discount|reward))\b/i, label: 'Exclusive offer bait', weight: 15 },
      { regex: /\b(cash\s+(prize|reward|back|bonus))\b/i, label: 'Cash reward lure', weight: 20 },
      { regex: /\b(lucky\s+(winner|draw|number|customer))\b/i, label: 'Lucky draw scam', weight: 25 },
      { regex: /\b(jackpot|grand\s+prize|mega\s+prize)\b/i, label: 'Jackpot scam', weight: 28 },
      { regex: /\b(100%\s+free|completely\s+free|no\s+cost|zero\s+cost)\b/i, label: 'Too-good-to-be-true free offer', weight: 18 },
    ],
  },

  // ── THREAT_LANGUAGE ────────────────────────
  {
    category: CATEGORIES.THREAT_LANGUAGE,
    patterns: [
      { regex: /\b(your\s+account\s+(will\s+be|has\s+been|is)\s+(blocked|locked|suspended|closed|terminated|deactivated))\b/i, label: 'Account suspension threat', weight: 25 },
      { regex: /\b(legal\s+action|lawsuit|court\s+order|prosecution)\b/i, label: 'Legal threat', weight: 25 },
      { regex: /\b(police|arrest|warrant|criminal\s+charges?|investigation)\b/i, label: 'Law enforcement threat', weight: 28 },
      { regex: /\b(unauthorized\s+(access|transaction|activity|login))\b/i, label: 'Unauthorized activity claim', weight: 22 },
      { regex: /\b(unusual\s+(activity|login|transaction|access))\b/i, label: 'Unusual activity alert', weight: 20 },
      { regex: /\b(security\s+(alert|breach|warning|threat|issue))\b/i, label: 'Security threat claim', weight: 18 },
      { regex: /\b(your\s+data\s+(will\s+be|has\s+been)\s+(deleted|lost|compromised))\b/i, label: 'Data loss threat', weight: 22 },
      { regex: /\b(penalty|fine|fee|charge)\s+(of|will\s+be)\s+(applied|charged|imposed)\b/i, label: 'Financial penalty threat', weight: 20 },
      { regex: /\b(failure\s+to\s+(comply|respond|act|verify))\b/i, label: 'Compliance pressure', weight: 20 },
      { regex: /\b(we\s+will\s+(suspend|block|close|terminate|disable))\b/i, label: 'Action threat', weight: 22 },
    ],
  },

  // ── SUSPICIOUS_URL ─────────────────────────
  {
    category: CATEGORIES.SUSPICIOUS_URL,
    patterns: [
      { regex: /\b(click\s+(here|below|the\s+link|this\s+link|now))\b/i, label: 'Click-bait call to action', weight: 15 },
      { regex: /\b(visit\s+(this|the|our)\s+(link|website|page|url))\b/i, label: 'URL visit request', weight: 12 },
      { regex: /\b(open\s+(this|the)\s+(link|attachment|file|document))\b/i, label: 'Suspicious open request', weight: 15 },
      { regex: /https?:\/\/[^\s]+/i, label: 'Contains URL', weight: 8 },
      { regex: /\b(bit\.ly|tinyurl|t\.co|goo\.gl|cutt\.ly|rb\.gy)\b/i, label: 'Shortened URL detected', weight: 18 },
      { regex: /\b(download\s+(now|here|this|the))\b/i, label: 'Download prompt', weight: 15 },
    ],
  },

  // ── SOCIAL_ENGINEERING ─────────────────────
  {
    category: CATEGORIES.SOCIAL_ENGINEERING,
    patterns: [
      { regex: /\b(dear\s+(customer|user|account\s+holder|member|sir|madam|friend|valued))\b/i, label: 'Generic formal greeting', weight: 10 },
      { regex: /\b(this\s+is\s+(not\s+)?a\s+(spam|scam|fraud|fake))\b/i, label: 'Anti-spam disclaimer (ironic)', weight: 15 },
      { regex: /\b(do\s+not\s+share\s+(this|with\s+anyone))\b/i, label: 'Secrecy request', weight: 18 },
      { regex: /\b(keep\s+(this|it)\s+(confidential|secret|private|between\s+us))\b/i, label: 'Confidentiality manipulation', weight: 20 },
      { regex: /\b(trust\s+(me|us)|believe\s+(me|us)|i\s+promise)\b/i, label: 'Trust manipulation', weight: 12 },
      { regex: /\b(from\s+(the\s+)?(government|bank|irs|tax|hmrc|microsoft|apple|google|amazon|paypal))\b/i, label: 'Authority impersonation', weight: 22 },
      { regex: /\b(customer\s+(service|support|care)|tech\s+support|help\s+desk)\b/i, label: 'Support impersonation', weight: 15 },
      { regex: /\b(official\s+(notice|notification|communication|message))\b/i, label: 'Official notice impersonation', weight: 18 },
      { regex: /\b(your\s+cooperation\s+is\s+(required|appreciated|needed))\b/i, label: 'Cooperation pressure', weight: 12 },
      { regex: /\b(for\s+your\s+(safety|security|protection|benefit))\b/i, label: 'Safety manipulation', weight: 10 },
    ],
  },

  // ── FINANCIAL_FRAUD ────────────────────────
  {
    category: CATEGORIES.FINANCIAL_FRAUD,
    patterns: [
      { regex: /[\$₹€£¥]\s?\d+[\d,.]*/g, label: 'Monetary amount mentioned', weight: 10 },
      { regex: /\d+[\d,.]*\s*(dollars?|rupees?|USD|INR|EUR|GBP|pounds?)/gi, label: 'Currency amount mentioned', weight: 10 },
      { regex: /\b(payment\s+(failed|declined|pending|required|due))\b/i, label: 'Payment issue claim', weight: 18 },
      { regex: /\b(refund|reimbursement|cashback)\b/i, label: 'Refund/cashback lure', weight: 12 },
      { regex: /\b(transfer|wire|send)\s+(money|funds|payment|amount)\b/i, label: 'Money transfer request', weight: 22 },
      { regex: /\b(invest(ment)?\s+(opportunity|scheme|plan|guaranteed))\b/i, label: 'Investment scam', weight: 22 },
      { regex: /\b(guaranteed\s+(returns?|profit|income))\b/i, label: 'Guaranteed returns (scam)', weight: 25 },
      { regex: /\b(double\s+your\s+(money|investment|income))\b/i, label: 'Money doubling scam', weight: 28 },
      { regex: /\b(processing\s+fee|handling\s+fee|shipping\s+fee|advance\s+fee)\b/i, label: 'Advance fee scam', weight: 20 },
      { regex: /\b(pay\s+(a\s+)?small\s+(fee|amount|charge))\b/i, label: 'Small fee advance scam', weight: 20 },
    ],
  },

  // ── IMPERSONATION ──────────────────────────
  {
    category: CATEGORIES.IMPERSONATION,
    patterns: [
      { regex: /\b(rbi|reserve\s+bank|federal\s+reserve|central\s+bank)\b/i, label: 'Central bank impersonation', weight: 25 },
      { regex: /\b(income\s+tax|irs|hmrc|tax\s+department|tax\s+authority)\b/i, label: 'Tax authority impersonation', weight: 25 },
      { regex: /\b(sbi|hdfc|icici|axis|kotak|bob|pnb|canara)\s*(bank)?\b/i, label: 'Bank impersonation', weight: 20 },
      { regex: /\b(whatsapp|telegram|signal)\s+(team|support|official)\b/i, label: 'Messenger platform impersonation', weight: 22 },
      { regex: /\b(amazon|flipkart|ebay|walmart)\s+(team|support|customer\s+service)\b/i, label: 'E-commerce impersonation', weight: 20 },
      { regex: /\b(ceo|director|manager|head\s+of)\s+(of\s+)?[a-z]+/i, label: 'Executive impersonation', weight: 15 },
    ],
  },

  // ── DELIVERY_SCAM ──────────────────────────
  {
    category: CATEGORIES.DELIVERY_SCAM,
    patterns: [
      { regex: /\b(delivery\s+(failed|pending|attempted|issue|problem))\b/i, label: 'Delivery failure claim', weight: 18 },
      { regex: /\b(package\s+(held|stuck|waiting|returned|undelivered))\b/i, label: 'Package issue claim', weight: 18 },
      { regex: /\b(tracking\s+(number|id|code|update))\b/i, label: 'Fake tracking notification', weight: 12 },
      { regex: /\b(reschedule\s+(delivery|shipment))\b/i, label: 'Reschedule scam', weight: 15 },
      { regex: /\b(customs?\s+(fee|charge|duty|clearance))\b/i, label: 'Customs fee scam', weight: 20 },
    ],
  },

  // ── HINDI / HINGLISH PATTERNS ──────────────
  // Urgency (Hindi)
  {
    category: CATEGORIES.URGENCY,
    patterns: [
      { regex: /\b(turant|fauran|abhi|jaldi|tatkaal)\b/i, label: 'Hindi: तुरंत/जल्दी (urgency)', weight: 18 },
      { regex: /(तुरंत|फ़ौरन|अभी|जल्दी|तत्काल)/i, label: 'Hindi: Urgency language (Devanagari)', weight: 18 },
      { regex: /(समय\s*सीमा|आखिरी\s*मौका|अंतिम\s*चेतावनी|आखिरी\s*चेतावनी)/i, label: 'Hindi: Deadline/final warning', weight: 22 },
      { regex: /\b(aakhri\s+(mauka|chance|warning)|last\s+mauka)\b/i, label: 'Hinglish: Last chance/warning', weight: 20 },
      { regex: /(देर\s*न\s*करें|इंतज़ार\s*न\s*करें)/i, label: 'Hindi: Do not delay', weight: 15 },
    ],
  },
  // Sensitive Request (Hindi)
  {
    category: CATEGORIES.SENSITIVE_REQUEST,
    patterns: [
      { regex: /\b(otp\s+(bhejo|batao|do|dijiye|send\s+karo|bata\s+do))\b/i, label: 'Hinglish: OTP request', weight: 30 },
      { regex: /(ओटीपी|पासवर्ड|पिन\s*नंबर|बैंक\s*खाता|सीवीवी)/i, label: 'Hindi: OTP/password/PIN request (Devanagari)', weight: 28 },
      { regex: /(अपना\s*(खाता|अकाउंट|पहचान|विवरण)\s*(सत्यापित|वेरीफाई)\s*करें)/i, label: 'Hindi: Account verification request', weight: 25 },
      { regex: /\b(apna\s+(account|khata)\s+(verify|check)\s+kar(o|ein|iye))\b/i, label: 'Hinglish: Account verify request', weight: 22 },
      { regex: /\b(bank\s+details?\s+(bhejo|batao|do|dijiye|send\s+karo))\b/i, label: 'Hinglish: Bank details request', weight: 25 },
    ],
  },
  // Reward Scam (Hindi)
  {
    category: CATEGORIES.REWARD_SCAM,
    patterns: [
      { regex: /(आपने\s*जीता|आप\s*विजेता|इनाम\s*जीता|लकी\s*ड्रॉ)/i, label: 'Hindi: You won/lucky draw', weight: 28 },
      { regex: /\b(aapne\s+jeeta|aap\s+winner|lucky\s+draw\s+mein|inam\s+jeeta)\b/i, label: 'Hinglish: Prize winning claim', weight: 25 },
      { regex: /(मुफ़्त|फ्री\s*(गिफ्ट|इनाम|रिचार्ज|पैसे))/i, label: 'Hindi: Free gift/money', weight: 22 },
      { regex: /\b(free\s+(recharge|gift|paisa|money)\s+(milega|jeetiye|paye))\b/i, label: 'Hinglish: Free reward lure', weight: 20 },
    ],
  },
  // Threat Language (Hindi)
  {
    category: CATEGORIES.THREAT_LANGUAGE,
    patterns: [
      { regex: /(खाता\s*(बंद|ब्लॉक|निलंबित|सस्पेंड)\s*(हो\s*जाएगा|कर\s*दिया))/i, label: 'Hindi: Account block/suspend threat', weight: 25 },
      { regex: /\b(account\s+(band|block|suspend)\s+(ho\s+jayega|kar\s+diya|kar\s+denge))\b/i, label: 'Hinglish: Account block threat', weight: 22 },
      { regex: /(कानूनी\s*कार्रवाई|पुलिस\s*शिकायत|गिरफ्तार|FIR)/i, label: 'Hindi: Legal/police threat', weight: 25 },
      { regex: /\b(kanuni\s+karvai|police\s+complaint|fir\s+darj|arrest\s+ho\s+jayega)\b/i, label: 'Hinglish: Legal action threat', weight: 22 },
    ],
  },
  // Impersonation (Hindi)
  {
    category: CATEGORIES.IMPERSONATION,
    patterns: [
      { regex: /(भारतीय\s*रिज़र्व\s*बैंक|आरबीआई|एसबीआई|आयकर\s*विभाग)/i, label: 'Hindi: RBI/SBI/Tax impersonation', weight: 25 },
      { regex: /\b(sarkari\s+yojana|government\s+scheme|pm\s+kisan|modi\s+yojana)\b/i, label: 'Hinglish: Government scheme scam', weight: 20 },
      { regex: /(सरकारी\s*योजना|प्रधानमंत्री|केंद्र\s*सरकार)/i, label: 'Hindi: Government scheme impersonation', weight: 22 },
    ],
  },
];

// ──────────────────────────────────────────────
// Combo Bonuses — Extra weight when categories co-occur
// ──────────────────────────────────────────────

const COMBO_BONUSES = [
  { categories: [CATEGORIES.URGENCY, CATEGORIES.SENSITIVE_REQUEST], bonus: 20, label: 'Urgent + credential request (classic phishing combo)' },
  { categories: [CATEGORIES.SUSPICIOUS_URL, CATEGORIES.REWARD_SCAM], bonus: 15, label: 'Link + reward (lure + payload combo)' },
  { categories: [CATEGORIES.THREAT_LANGUAGE, CATEGORIES.SENSITIVE_REQUEST], bonus: 18, label: 'Threat + data request (intimidation phishing)' },
  { categories: [CATEGORIES.URGENCY, CATEGORIES.FINANCIAL_FRAUD], bonus: 15, label: 'Urgent + financial request (pressure fraud)' },
  { categories: [CATEGORIES.SOCIAL_ENGINEERING, CATEGORIES.SENSITIVE_REQUEST], bonus: 15, label: 'Social engineering + credential request' },
  { categories: [CATEGORIES.IMPERSONATION, CATEGORIES.THREAT_LANGUAGE], bonus: 18, label: 'Authority impersonation + threats' },
  { categories: [CATEGORIES.IMPERSONATION, CATEGORIES.SENSITIVE_REQUEST], bonus: 20, label: 'Authority impersonation + data request' },
  { categories: [CATEGORIES.REWARD_SCAM, CATEGORIES.FINANCIAL_FRAUD], bonus: 15, label: 'Prize lure + fee request (advance fee scam)' },
  { categories: [CATEGORIES.DELIVERY_SCAM, CATEGORIES.FINANCIAL_FRAUD], bonus: 15, label: 'Delivery issue + payment request' },
  { categories: [CATEGORIES.URGENCY, CATEGORIES.THREAT_LANGUAGE], bonus: 12, label: 'Urgency + threats (double pressure)' },
];

// ──────────────────────────────────────────────
// NLP — Lightweight text normalization
// ──────────────────────────────────────────────

/**
 * Normalize text for consistent pattern matching.
 * @param {string} text
 * @returns {string}
 */
const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/['']/g, "'")           // Smart quotes → straight
    .replace(/[""]/g, '"')           // Smart double quotes
    .replace(/\s+/g, ' ')           // Collapse whitespace
    .replace(/\.{2,}/g, '.')        // Collapse dots
    .replace(/!{2,}/g, '!')         // Collapse exclamations
    .replace(/\?{2,}/g, '?')        // Collapse questions
    .trim();
};

/**
 * Detect text formatting anomalies that may indicate scam.
 * @param {string} text - Original (un-normalized) text
 * @returns {Array<{type: string, label: string, weight: number}>}
 */
const detectFormattingAnomalies = (text) => {
  const anomalies = [];

  // Excessive ALL CAPS words
  const capsWords = text.split(/\s+/).filter(w => w.length > 3 && w === w.toUpperCase() && /[A-Z]/.test(w));
  if (capsWords.length >= 3) {
    anomalies.push({ type: 'EXCESSIVE_CAPS', label: `Uses excessive ALL CAPS (${capsWords.length} words)`, weight: 8 });
  }

  // Excessive punctuation
  const excessivePunct = (text.match(/[!?]{2,}/g) || []);
  if (excessivePunct.length >= 2) {
    anomalies.push({ type: 'EXCESSIVE_PUNCTUATION', label: 'Uses excessive punctuation (!!!, ???)', weight: 5 });
  }

  // Mixed character sets (leet speak, homograph)
  if (/[а-яА-Я]/.test(text) && /[a-zA-Z]/.test(text)) {
    anomalies.push({ type: 'MIXED_SCRIPTS', label: 'Mixes Latin and Cyrillic characters (possible homograph attack)', weight: 20 });
  }

  // Zero-width characters
  if (/[\u200B\u200C\u200D\uFEFF]/.test(text)) {
    anomalies.push({ type: 'ZERO_WIDTH_CHARS', label: 'Contains invisible/zero-width characters (obfuscation)', weight: 15 });
  }

  return anomalies;
};

/**
 * Detect intent from matched categories.
 * @param {Set<string>} matchedCategories
 * @returns {Array<string>}
 */
const detectIntent = (matchedCategories) => {
  const intents = [];

  if (matchedCategories.has(CATEGORIES.URGENCY)) intents.push('urgency_intent');
  if (matchedCategories.has(CATEGORIES.SENSITIVE_REQUEST)) intents.push('data_harvesting_intent');
  if (matchedCategories.has(CATEGORIES.REWARD_SCAM)) intents.push('reward_manipulation_intent');
  if (matchedCategories.has(CATEGORIES.THREAT_LANGUAGE)) intents.push('intimidation_intent');
  if (matchedCategories.has(CATEGORIES.SOCIAL_ENGINEERING)) intents.push('manipulation_intent');
  if (matchedCategories.has(CATEGORIES.FINANCIAL_FRAUD)) intents.push('financial_fraud_intent');
  if (matchedCategories.has(CATEGORIES.IMPERSONATION)) intents.push('impersonation_intent');
  if (matchedCategories.has(CATEGORIES.DELIVERY_SCAM)) intents.push('delivery_fraud_intent');

  return intents;
};

// ──────────────────────────────────────────────
// Exports
// ──────────────────────────────────────────────

module.exports = {
  CATEGORIES,
  PATTERN_GROUPS,
  COMBO_BONUSES,
  normalizeText,
  detectFormattingAnomalies,
  detectIntent,
};
