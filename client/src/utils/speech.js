/**
 * ╔══════════════════════════════════════════════╗
 * ║  Speech Utility — Text-to-Speech Engine      ║
 * ╚══════════════════════════════════════════════╝
 *
 * Reusable speech utility using the Web Speech API.
 * Supports English (en-US) and Hindi (hi-IN) voices.
 */

// ── State ──────────────────────────────────────
let currentUtterance = null;
let isSpeaking = false;
let isPaused = false;
let onStateChange = null;

// ── Voice Selection ────────────────────────────

/**
 * Get the best available voice for a language.
 * Prefers natural/premium voices over default ones.
 */
const getVoice = (lang = 'en') => {
  const voices = window.speechSynthesis?.getVoices() || [];
  const langCode = lang === 'hi' ? 'hi' : 'en';

  // Priority: find a voice matching the language
  const candidates = voices.filter(v =>
    v.lang.startsWith(langCode) || v.lang.startsWith(langCode.toUpperCase())
  );

  // Prefer non-local, premium voices
  const premium = candidates.find(v => v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium'));
  if (premium) return premium;

  // Fallback to any matching voice
  if (candidates.length > 0) return candidates[0];

  // Last resort: default voice
  return voices[0] || null;
};

// ── Core Functions ─────────────────────────────

/**
 * Check if the browser supports speech synthesis.
 * @returns {boolean}
 */
export const isSpeechSupported = () => {
  return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
};

/**
 * Speak text in the specified language.
 * @param {string} text - Text to speak
 * @param {string} lang - Language code ('en' or 'hi')
 * @param {function} stateCallback - Optional callback for state changes
 * @returns {boolean} Whether speech started successfully
 */
export const speakText = (text, lang = 'en', stateCallback = null) => {
  if (!isSpeechSupported()) return false;
  if (!text || text.trim().length === 0) return false;

  // Stop any current speech
  stopSpeech();

  onStateChange = stateCallback;

  // Clean the text for speech
  const cleanText = text
    .replace(/[🔴🟡🟢⚠️🚨✅❌🔗💰📞🤖👁️📝⏰🎁🔐⚡🎭📦👤🔥🎲🌐🖥️🔓🎣↪️🛡️☠️]/g, '') // Remove emojis
    .replace(/\*\*/g, '')      // Remove markdown bold
    .replace(/[_*~`]/g, '')    // Remove markdown formatting
    .replace(/\s+/g, ' ')     // Collapse whitespace
    .trim();

  if (cleanText.length === 0) return false;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  
  // Set language
  utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
  
  // Set voice
  const voice = getVoice(lang);
  if (voice) utterance.voice = voice;

  // Speech settings for clarity
  utterance.rate = lang === 'hi' ? 0.9 : 0.95;   // Slightly slower for clarity
  utterance.pitch = 1;
  utterance.volume = 1;

  // Event handlers
  utterance.onstart = () => {
    isSpeaking = true;
    isPaused = false;
    onStateChange?.({ speaking: true, paused: false });
  };

  utterance.onend = () => {
    isSpeaking = false;
    isPaused = false;
    currentUtterance = null;
    onStateChange?.({ speaking: false, paused: false });
  };

  utterance.onerror = (event) => {
    // 'interrupted' is not a real error — it happens when we stop manually
    if (event.error !== 'interrupted') {
      console.warn('Speech error:', event.error);
    }
    isSpeaking = false;
    isPaused = false;
    currentUtterance = null;
    onStateChange?.({ speaking: false, paused: false, error: event.error });
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  return true;
};

/**
 * Stop current speech.
 */
export const stopSpeech = () => {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
  isSpeaking = false;
  isPaused = false;
  currentUtterance = null;
  onStateChange?.({ speaking: false, paused: false });
};

/**
 * Pause current speech.
 */
export const pauseSpeech = () => {
  if (!isSpeechSupported() || !isSpeaking) return;
  window.speechSynthesis.pause();
  isPaused = true;
  onStateChange?.({ speaking: true, paused: true });
};

/**
 * Resume paused speech.
 */
export const resumeSpeech = () => {
  if (!isSpeechSupported() || !isPaused) return;
  window.speechSynthesis.resume();
  isPaused = false;
  onStateChange?.({ speaking: true, paused: false });
};

/**
 * Get current speech state.
 * @returns {{ speaking: boolean, paused: boolean, supported: boolean }}
 */
export const getSpeechState = () => ({
  speaking: isSpeaking,
  paused: isPaused,
  supported: isSpeechSupported(),
});

// ── Result Formatter ───────────────────────────

/**
 * Build a natural speech script from scan results.
 * @param {object} result - The scan result object
 * @param {string} lang - Language ('en' or 'hi')
 * @returns {string} Formatted speech text
 */
export const buildSpeechFromResult = (result, lang = 'en') => {
  if (!result) return '';

  const parts = [];

  if (lang === 'hi') {
    // ── Hindi Speech ──
    const hindiLevel = {
      'Safe': 'सुरक्षित',
      'Low Risk': 'कम खतरा',
      'Medium Risk': 'मध्यम खतरा',
      'High Risk': 'ज़्यादा खतरा',
      'Critical': 'बहुत ख़तरनाक',
    };

    // Verdict
    const level = hindiLevel[result.riskLevel] || result.riskLevel;
    parts.push(`रिज़ल्ट: ${level}। रिस्क स्कोर ${result.riskScore} में से 100 है।`);

    // Summary
    const summary = result.hindi?.summary_hi || result.aiSummary || result.summary;
    if (summary) parts.push(summary);

    // Explanation (max 3 points for brevity)
    const explanation = result.hindi?.explanation_hi || result.explanation || [];
    if (explanation.length > 0) {
      const topPoints = explanation.slice(0, 3);
      parts.push('कारण: ' + topPoints.join('। '));
    }

    // Recommendation
    const recommendation = result.hindi?.recommendation_hi || result.recommendation;
    if (recommendation && result.riskScore > 0) {
      parts.push('सलाह: ' + recommendation);
    }
  } else {
    // ── English Speech ──
    // Verdict
    parts.push(`Result: ${result.riskLevel}. Risk score is ${result.riskScore} out of 100.`);

    // Summary
    const summary = result.aiSummary || result.summary;
    if (summary) parts.push(summary);

    // Explanation (max 3 points for brevity)
    const explanation = result.explanation || [];
    if (explanation.length > 0) {
      const topPoints = explanation.slice(0, 3);
      parts.push('Key findings: ' + topPoints.join('. '));
    }

    // Recommendation
    if (result.recommendation && result.riskScore > 0) {
      parts.push('Recommendation: ' + result.recommendation);
    }
  }

  return parts.join(' ... ');
};

// ── Voice Preload ──────────────────────────────
// Chrome loads voices asynchronously — preload them
if (isSpeechSupported()) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}
