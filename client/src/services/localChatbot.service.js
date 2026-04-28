/**
 * ╔══════════════════════════════════════════════╗
 * ║  Local Chatbot — Context-Aware Response Engine║
 * ╚══════════════════════════════════════════════╝
 *
 * Generates intelligent responses without external APIs.
 * Uses scan context, keyword matching, and bilingual templates.
 */

// ── Intent Detection ───────────────────────────

const INTENTS = [
  { id: 'is_safe',       keywords: ['safe', 'secure', 'trust', 'open', 'click', 'ok', 'fine', 'legit', 'real', 'genuine', 'sahi', 'surakshit', 'khole', 'vishwas', 'sach'] },
  { id: 'why_risky',     keywords: ['why', 'reason', 'how', 'explain', 'kyon', 'kyu', 'kyun', 'kaise', 'wajah', 'kaaran'] },
  { id: 'what_to_do',    keywords: ['do', 'action', 'next', 'should', 'step', 'help', 'protect', 'kya karu', 'karna', 'madad', 'suraksha', 'bachao'] },
  { id: 'about_otp',     keywords: ['otp', 'password', 'pin', 'cvv', 'credential', 'login'] },
  { id: 'about_urgency', keywords: ['urgent', 'hurry', 'time', 'deadline', 'jaldi', 'turant', 'fauran'] },
  { id: 'about_link',    keywords: ['link', 'url', 'website', 'site', 'click', 'download'] },
  { id: 'about_scam',    keywords: ['scam', 'fraud', 'fake', 'phishing', 'dhokha', 'thagi', 'nakli'] },
  { id: 'greeting',      keywords: ['hello', 'hi', 'hey', 'namaste', 'namaskar', 'hlo'] },
  { id: 'thanks',        keywords: ['thanks', 'thank', 'dhanyavaad', 'shukriya', 'thnx'] },
  { id: 'what_is',       keywords: ['what is', 'define', 'meaning', 'kya hai', 'kya hota', 'matlab'] },
];

function detectIntent(message) {
  const lower = message.toLowerCase().trim();
  for (const intent of INTENTS) {
    if (intent.keywords.some(kw => lower.includes(kw))) return intent.id;
  }
  return 'general';
}

// ── Signal Helpers ─────────────────────────────

function hasSignal(ctx, ...types) {
  if (!ctx?.signals) return false;
  return ctx.signals.some(s => types.includes(s.type) || types.includes(s.category));
}

function getSignalTypes(ctx) {
  if (!ctx?.signals) return [];
  return [...new Set(ctx.signals.map(s => s.type))];
}

function getRiskTier(ctx) {
  if (!ctx) return 'none';
  const score = ctx.riskScore || 0;
  if (score >= 80) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'medium';
  if (score > 0) return 'low';
  return 'safe';
}

// ── Response Templates ─────────────────────────

const TEMPLATES = {
  en: {
    // ── Safety responses ──
    safe_yes: "This content looks safe — no major threats were detected. You can proceed, but always stay cautious with unfamiliar sources.",
    safe_low: "There are minor concerns (score: {score}/100), but nothing alarming. Stay alert and verify the sender if unsure.",
    unsafe_medium: "This is moderately risky (score: {score}/100). It shows some scam patterns. Avoid sharing personal info and verify through official channels.",
    unsafe_high: "⚠️ This is dangerous (score: {score}/100). Multiple scam signals detected. Do NOT click links, share OTP, or respond. Block the sender.",
    unsafe_critical: "🚨 CRITICAL THREAT (score: {score}/100). This is almost certainly a scam. Block immediately, do not interact, and report to cybercrime authorities.",

    // ── Explanation responses ──
    why_signals: "Here's why it was flagged: {explanations}",
    why_no_context: "I don't have a scan result to analyze. Try scanning a message, URL, or image first, then ask me about the results.",

    // ── Action responses ──
    action_safe: "No action needed — this appears safe. Just be careful with any embedded links.",
    action_risky: "Here's what to do: 1) Don't reply or click any links. 2) Block the sender. 3) Report it as spam. 4) If you shared any info, change your passwords immediately.",
    action_critical: "URGENT: 1) Block the sender NOW. 2) Do NOT share any OTP, PIN, or password. 3) Report to cybercrime.gov.in or call 1930. 4) If money was sent, contact your bank immediately.",

    // ── Topic responses ──
    otp_warn: "Never share your OTP with anyone — not even your bank. Legitimate companies will NEVER ask for OTP via message or call. If someone asks, it's 100% a scam.",
    urgency_explain: "Scammers use fake urgency ('act now!', 'last chance!') to make you panic and skip thinking. Real organizations give you time to verify. Always pause and check.",
    link_warn: "Don't click suspicious links. They can steal your login credentials or install malware. Always verify URLs by checking the domain carefully.",
    scam_explain: "A scam is a trick to steal your money or personal information. Common types: phishing (fake login pages), lottery scams, OTP theft, and fake delivery messages.",
    phishing_explain: "Phishing is when scammers create fake websites or messages that look like real companies (like your bank) to steal your password or card details.",

    // ── General ──
    greeting: "Hello! I'm ScamShield AI. I can help you understand scan results and stay safe online. Try scanning something and ask me about it!",
    thanks: "You're welcome! Stay safe online. If you have more questions about scams or security, just ask.",
    no_context: "I work best when you scan something first! Go to the Scan page, analyze a message/URL/image, and then ask me about the results.",
    fallback: "I can help with: understanding scan results, explaining scam tactics, and giving safety advice. Try asking 'Is this safe?' or 'What should I do?'",
  },

  hi: {
    safe_yes: "यह सुरक्षित दिखता है — कोई बड़ा खतरा नहीं मिला। आप आगे बढ़ सकते हैं, लेकिन अनजान स्रोतों से सावधान रहें।",
    safe_low: "कुछ छोटी चिंताएं हैं (स्कोर: {score}/100), लेकिन चिंता की बात नहीं। सतर्क रहें।",
    unsafe_medium: "यह थोड़ा खतरनाक है (स्कोर: {score}/100)। कुछ स्कैम पैटर्न दिखे। निजी जानकारी शेयर न करें।",
    unsafe_high: "⚠️ यह खतरनाक है (स्कोर: {score}/100)। कई स्कैम संकेत मिले। लिंक न खोलें, OTP न दें, जवाब न दें। भेजने वाले को ब्लॉक करें।",
    unsafe_critical: "🚨 गंभीर खतरा (स्कोर: {score}/100)। यह लगभग निश्चित रूप से स्कैम है। तुरंत ब्लॉक करें और साइबर क्राइम में शिकायत करें।",

    why_signals: "यह इसलिए flagged हुआ: {explanations}",
    why_no_context: "मेरे पास कोई स्कैन रिजल्ट नहीं है। पहले कोई मैसेज, URL या इमेज स्कैन करें।",

    action_safe: "कोई कार्रवाई जरूरी नहीं — यह सुरक्षित लगता है।",
    action_risky: "यह करें: 1) जवाब न दें, लिंक न खोलें। 2) भेजने वाले को ब्लॉक करें। 3) स्पैम रिपोर्ट करें। 4) अगर कुछ शेयर किया है तो पासवर्ड बदलें।",
    action_critical: "तुरंत करें: 1) भेजने वाले को ब्लॉक करें। 2) OTP/PIN/पासवर्ड न दें। 3) cybercrime.gov.in पर शिकायत करें या 1930 पर कॉल करें।",

    otp_warn: "अपना OTP किसी को न दें — बैंक भी नहीं माँगता। अगर कोई माँगे तो 100% स्कैम है।",
    urgency_explain: "स्कैमर्स 'तुरंत करो!', 'आखिरी मौका!' जैसी बातें बोलकर डराते हैं ताकि आप बिना सोचे काम करें। असली कंपनियाँ समय देती हैं।",
    link_warn: "संदिग्ध लिंक न खोलें। ये आपका पासवर्ड चुरा सकते हैं। हमेशा URL ध्यान से जाँचें।",
    scam_explain: "स्कैम एक धोखा है जिसमें आपके पैसे या जानकारी चुराई जाती है। जैसे: फर्जी बैंक मैसेज, लॉटरी स्कैम, OTP चोरी।",
    phishing_explain: "फ़िशिंग में स्कैमर्स नकली वेबसाइट बनाते हैं जो असली जैसी दिखती हैं, ताकि आपका पासवर्ड या कार्ड डिटेल्स चुरा सकें।",

    greeting: "नमस्ते! मैं ScamShield AI हूँ। स्कैन रिजल्ट समझने और ऑनलाइन सुरक्षित रहने में मदद कर सकता हूँ।",
    thanks: "आपका स्वागत है! सुरक्षित रहें। कोई और सवाल हो तो पूछें।",
    no_context: "मैं तब बेहतर काम करता हूँ जब आप पहले कुछ स्कैन करें! Scan पेज पर जाकर मैसेज/URL/इमेज स्कैन करें।",
    fallback: "मैं इसमें मदद कर सकता हूँ: स्कैन रिजल्ट समझना, स्कैम की जानकारी, और सुरक्षा सलाह। पूछें 'क्या यह सुरक्षित है?' या 'मुझे क्या करना चाहिए?'",
  },
};

// ── Main Response Generator ────────────────────

/**
 * Generate a local chatbot response based on user question and scan context.
 * @param {string} question - User's message
 * @param {object|null} context - Latest scan result (riskScore, signals, explanation, etc.)
 * @param {string} lang - Language ('en' or 'hi')
 * @returns {string} Response text
 */
export function generateResponse(question, context = null, lang = 'en') {
  const t = TEMPLATES[lang] || TEMPLATES.en;
  const intent = detectIntent(question);
  const tier = getRiskTier(context);
  const score = context?.riskScore || 0;

  const fill = (template) => template.replace('{score}', score);

  switch (intent) {
    case 'greeting':
      return t.greeting;

    case 'thanks':
      return t.thanks;

    case 'is_safe': {
      if (!context) return t.no_context;
      if (tier === 'safe') return fill(t.safe_yes);
      if (tier === 'low') return fill(t.safe_low);
      if (tier === 'medium') return fill(t.unsafe_medium);
      if (tier === 'high') return fill(t.unsafe_high);
      return fill(t.unsafe_critical);
    }

    case 'why_risky': {
      if (!context) return t.why_no_context;
      const explanations = context.explanation || [];
      if (explanations.length === 0 && tier === 'safe') return fill(t.safe_yes);
      const top3 = explanations.slice(0, 3).join(lang === 'hi' ? '। ' : '. ');
      return t.why_signals.replace('{explanations}', top3 || (lang === 'hi' ? 'विशिष्ट पैटर्न का मिलान हुआ।' : 'Pattern-based signals matched.'));
    }

    case 'what_to_do': {
      if (!context) return t.no_context;
      if (tier === 'safe' || tier === 'low') return t.action_safe;
      if (tier === 'critical') return t.action_critical;
      return t.action_risky;
    }

    case 'about_otp':
      return t.otp_warn;

    case 'about_urgency':
      return t.urgency_explain;

    case 'about_link':
      if (context && hasSignal(context, 'SUSPICIOUS_URL', 'EMBEDDED_LINK', 'BRAND_IMPERSONATION')) {
        return t.link_warn + ' ' + (tier !== 'safe' ? fill(lang === 'hi' ? t.unsafe_high : t.unsafe_high) : '');
      }
      return t.link_warn;

    case 'about_scam':
      return t.scam_explain;

    case 'what_is': {
      const lower = question.toLowerCase();
      if (lower.includes('phishing') || lower.includes('फ़िशिंग') || lower.includes('फिशिंग')) return t.phishing_explain;
      if (lower.includes('scam') || lower.includes('स्कैम') || lower.includes('dhokha')) return t.scam_explain;
      if (lower.includes('otp')) return t.otp_warn;
      return t.scam_explain;
    }

    case 'general':
    default: {
      // Try to give a context-aware response
      if (context && tier !== 'safe' && tier !== 'none') {
        if (tier === 'critical') return fill(t.unsafe_critical);
        if (tier === 'high') return fill(t.unsafe_high);
        return fill(t.unsafe_medium);
      }
      if (context && tier === 'safe') return fill(t.safe_yes);
      return t.fallback;
    }
  }
}
