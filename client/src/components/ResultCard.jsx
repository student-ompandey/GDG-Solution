import { AlertTriangle, CheckCircle, XCircle, Info, Copy, Check, Sparkles, Target, Zap, Volume2, BookOpen, ShieldAlert, TrendingUp } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const riskConfig = {
  'Safe':        { color: 'emerald', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', ring: 'ring-emerald-500/30', icon: CheckCircle, gradient: 'from-emerald-500 to-green-500' },
  'Low Risk':    { color: 'yellow',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/30',  text: 'text-yellow-400',  ring: 'ring-yellow-500/30',  icon: Info,        gradient: 'from-yellow-500 to-amber-500' },
  'Medium Risk': { color: 'orange',  bg: 'bg-orange-500/10',  border: 'border-orange-500/30',  text: 'text-orange-400',  ring: 'ring-orange-500/30',  icon: AlertTriangle, gradient: 'from-orange-500 to-red-500' },
  'High Risk':   { color: 'red',     bg: 'bg-red-500/10',     border: 'border-red-500/30',     text: 'text-red-400',     ring: 'ring-red-500/30',     icon: XCircle,     gradient: 'from-red-500 to-rose-600' },
};

const scoreColor = (level) => {
  const m = { 'Safe': '#22c55e', 'Low Risk': '#eab308', 'Medium Risk': '#f97316', 'High Risk': '#ef4444' };
  return m[level] || '#94a3b8';
};

// Signal display names for better UX
const SIGNAL_NAMES = {
  'URGENCY_TACTICS': '⏰ Urgency Tactics',
  'SCAM_KEYWORDS': '🚨 Scam Keywords',
  'HIGH_RISK_KEYWORDS': '⛔ High Risk Keywords',
  'EMBEDDED_LINK': '🔗 Suspicious Link',
  'SHORT_MSG_WITH_LINK': '📩 Short Message + Link',
  'EXCESSIVE_CAPS': '🔠 Excessive Caps',
  'EXCESSIVE_PUNCTUATION': '❗ Excessive Punctuation',
  'MONEY_MENTION': '💰 Money Mentioned',
  'PHONE_SOLICITATION': '📞 Phone Number',
  'AI_SCAM_DETECTED': '🤖 AI: Scam Detected',
  'AI_SPAM_DETECTED': '🤖 AI: Spam Detected',
  'AI_SUSPICIOUS': '🤖 AI: Suspicious',
  'OCR_SCAM_TEXT': '📝 Scam Text in Image',
  'OCR_URGENCY_TEXT': '⏰ Image Urgency Text',
  'OCR_NO_TEXT': '📄 No Text Found',
  'VISION_SCAM_DETECTED': '👁️ Visual Scam Detected',
  'QR_CONTAINS_URL': '🔗 QR → URL',
  'QR_NO_CODE_FOUND': '❌ No QR Found',
  'QR_FREE_EMAIL': '📧 Free Email Provider',
  'QR_PHONE_NUMBER': '📞 Phone Number',
  'QR_PROCESSING_ERROR': '⚠️ Processing Error',
};

// Signal badge colors based on signal category
const signalColor = (type) => {
  if (type.includes('AI_') || type.includes('VISION_')) return { bg: 'bg-purple-500/15', text: 'text-purple-300', ring: 'ring-purple-500/30' };
  if (type.includes('OCR_')) return { bg: 'bg-amber-500/15', text: 'text-amber-300', ring: 'ring-amber-500/30' };
  if (type.includes('QR_')) return { bg: 'bg-cyan-500/15', text: 'text-cyan-300', ring: 'ring-cyan-500/30' };
  if (type.includes('URGENCY') || type.includes('HIGH_RISK')) return { bg: 'bg-red-500/15', text: 'text-red-300', ring: 'ring-red-500/30' };
  return { bg: 'bg-slate-500/15', text: 'text-slate-300', ring: 'ring-slate-500/30' };
};

export default function ResultCard({ result, requestedLang }) {
  const [showHindi, setShowHindi] = useState(requestedLang === 'hi');
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const cardRef = useRef(null);

  // Update showHindi if the prop changes
  useEffect(() => {
    setShowHindi(requestedLang === 'hi');
  }, [requestedLang]);

  // Animated risk score counter
  useEffect(() => {
    if (!result) return;
    setAnimatedScore(0);
    const target = result.riskScore;
    const duration = 1200;
    const start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [result?.riskScore]);

  if (!result) return null;

  const cfg = riskConfig[result.riskLevel] || riskConfig['Safe'];
  const Icon = cfg.icon;

  const hasHindi = !!result.hindi;
  
  // Use Hindi values if toggled, otherwise English values (fallback to English if missing)
  const displaySummary = showHindi && hasHindi && result.hindi.summary_hi ? result.hindi.summary_hi : (result.aiSummary || result.summary);
  const displayExplanation = showHindi && hasHindi && result.hindi.explanation_hi ? result.hindi.explanation_hi : result.explanation;
  const displayRecommendation = showHindi && hasHindi && result.hindi.recommendation_hi ? result.hindi.recommendation_hi : result.recommendation;

  const handleCopy = () => {
    const text = `ScamShield Report\nType: ${result.type}\nRisk: ${result.riskScore}/100 (${result.riskLevel})\nSummary: ${displaySummary}\n\nExplanation:\n${(displayExplanation || []).map((e) => `• ${e}`).join('\n')}\n\nRecommendation: ${displayRecommendation}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const playVoiceAlert = () => {
    if ('speechSynthesis' in window) {
      setIsPlaying(true);
      window.speechSynthesis.cancel();
      
      const isDangerous = result.riskLevel === 'High Risk' || result.riskLevel === 'Medium Risk';
      const utterance = new SpeechSynthesisUtterance();
      
      if (showHindi) {
        utterance.text = isDangerous
          ? `Yeh ${result.type} unsafe hai, ise open mat karo. Risk score ${result.riskScore} percent hai.`
          : 'Yeh link safe lag raha hai.';
        utterance.lang = 'hi-IN';
      } else {
        utterance.text = isDangerous
          ? `Warning. This ${result.type} is unsafe with a risk score of ${result.riskScore}. Do not open or interact with it.`
          : 'This content looks safe to open.';
        utterance.lang = 'en-US';
      }
      
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div ref={cardRef} className={`mt-6 rounded-2xl border ${cfg.border} ${cfg.bg} p-6 transition-all duration-500`} style={{ animation: 'fadeSlideIn 0.5s ease-out' }}>
      <style>{`
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scoreGlow { 0%, 100% { box-shadow: 0 0 20px ${scoreColor(result.riskLevel)}20; } 50% { box-shadow: 0 0 40px ${scoreColor(result.riskLevel)}40; } }
      `}</style>

      {/* ── Risk Score Header ── */}
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start sm:justify-between">
        {/* Animated Risk Score Circle */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="relative flex h-28 w-28 items-center justify-center rounded-full border-4"
            style={{
              borderColor: scoreColor(result.riskLevel),
              animation: 'scoreGlow 3s ease-in-out infinite',
            }}
          >
            {/* Background ring track */}
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-800" />
              <circle
                cx="60" cy="60" r="54" fill="none"
                stroke={scoreColor(result.riskLevel)}
                strokeWidth="3"
                strokeDasharray={`${(animatedScore / 100) * 339.3} 339.3`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="text-center">
              <span className="text-3xl font-extrabold" style={{ color: scoreColor(result.riskLevel) }}>
                {animatedScore}
              </span>
              <span className="text-xs font-medium" style={{ color: scoreColor(result.riskLevel) }}>/100</span>
            </div>
          </div>
          <span className={`text-xs font-bold uppercase tracking-wider ${cfg.text}`}>
            {result.riskLevel}
          </span>
        </div>

        {/* Summary + Badges */}
        <div className="flex-1 text-center sm:text-left">
          <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <Icon className={`h-5 w-5 ${cfg.text}`} />
            <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${cfg.bg} ${cfg.text} ring-1 ${cfg.ring}`}>
              {result.isScam ? '⚠️ SCAM DETECTED' : '✅ SAFE'}
            </span>
            {result.confidence && result.confidence !== 'None' && (
              <span className="rounded-full bg-slate-700/50 px-3 py-0.5 text-xs font-medium text-slate-300 ring-1 ring-slate-600/50">
                {result.confidence} Confidence
              </span>
            )}
            {result.type && (
              <span className="rounded-full bg-slate-700/50 px-3 py-0.5 text-xs font-medium text-slate-400 ring-1 ring-slate-600/50 uppercase">
                {result.type}
              </span>
            )}
            {hasHindi && (
              <button
                onClick={() => setShowHindi(!showHindi)}
                className={`rounded-full px-3 py-0.5 text-xs font-medium transition-colors ring-1 ${showHindi ? 'bg-indigo-500/20 text-indigo-300 ring-indigo-500/30' : 'bg-slate-700/50 text-slate-400 ring-slate-600/50 hover:bg-slate-700'}`}
              >
                {showHindi ? 'अ → A' : 'A → अ'}
              </button>
            )}
            
            {/* Voice Alert */}
            {(result.riskLevel === 'High Risk' || result.riskLevel === 'Medium Risk') && (
              <button
                onClick={playVoiceAlert}
                className={`flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-medium transition-colors ring-1 ${isPlaying ? 'bg-red-500/20 text-red-400 ring-red-500/30 animate-pulse' : 'bg-slate-700/50 text-slate-400 ring-slate-600/50 hover:bg-slate-700 hover:text-white'}`}
                title="Play Audio Alert"
              >
                <Volume2 className="h-3 w-3" />
                {isPlaying ? 'Playing...' : '🔊 Alert'}
              </button>
            )}
          </div>
          
          {/* One-line Summary */}
          <p className="text-base font-medium text-white leading-relaxed">{displaySummary}</p>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-slate-400 transition-all hover:bg-white/10 hover:text-white hover:scale-105"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* ── Why This Is Risky ── */}
      {displayExplanation && displayExplanation.length > 0 && displayExplanation[0] !== 'No suspicious patterns detected.' && (
        <div className="mt-6 rounded-xl bg-slate-800/40 p-4 ring-1 ring-white/5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="h-4 w-4 text-slate-300" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Why This Is Risky</h4>
          </div>
          <ul className="space-y-2">
            {displayExplanation.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-300 group">
                <span
                  className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full transition-transform group-hover:scale-125"
                  style={{ backgroundColor: scoreColor(result.riskLevel) }}
                />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── AI Insights (Intent & Tactics) ── */}
      {result.details && (result.details.aiIntent || (result.details.aiTactics && result.details.aiTactics.length > 0)) && (
        <div className="mt-5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 relative overflow-hidden group hover:bg-indigo-500/[0.08] transition-colors">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-indigo-500/10 blur-xl group-hover:bg-indigo-500/20 transition-colors"></div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">Gemini AI Insights</h4>
          </div>
          
          {result.details.aiIntent && (
            <div className="mb-3">
              <div className="flex items-center gap-1.5 mb-1 text-xs text-indigo-300/80">
                <Target className="h-3 w-3" />
                <span className="uppercase tracking-wider font-medium">Detected Intent</span>
              </div>
              <p className="text-sm text-slate-200">{result.details.aiIntent}</p>
            </div>
          )}

          {result.details.aiTactics && result.details.aiTactics.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2 text-xs text-indigo-300/80">
                <Zap className="h-3 w-3" />
                <span className="uppercase tracking-wider font-medium">Manipulation Tactics</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.details.aiTactics.map((tactic, i) => (
                  <span key={i} className="rounded-lg bg-indigo-500/20 px-2.5 py-1 text-[11px] font-medium text-indigo-200 ring-1 ring-indigo-500/30 hover:bg-indigo-500/30 transition-colors cursor-default">
                    {tactic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Detection Signals (Redesigned Badges) ── */}
      {result.signals && result.signals.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-slate-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Detection Signals</h4>
            <span className="ml-auto text-[10px] text-slate-500">{result.signals.length} signals detected</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.signals.map((s, i) => {
              const sc = signalColor(s.type);
              const label = SIGNAL_NAMES[s.type] || s.type.replace(/_/g, ' ');
              return (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ${sc.bg} ${sc.text} ${sc.ring} hover:scale-105 transition-transform cursor-default`}
                  title={s.detail || s.type}
                >
                  {label}
                  <span className="ml-0.5 rounded bg-white/10 px-1 py-0.5 text-[9px] font-mono opacity-70">+{s.weight}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Scam Learning Mode ── */}
      {result.riskScore > 0 && (
        <div className="mt-5 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 relative overflow-hidden hover:bg-blue-500/[0.08] transition-colors">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-cyan-500"></div>
          <div className="flex items-center gap-2 mb-3 pl-2">
            <BookOpen className="h-4 w-4 text-blue-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300">Scam Learning Mode: How to spot this</h4>
          </div>
          <ul className="space-y-2.5 text-sm text-slate-300 pl-2">
            {result.signals && result.signals.map((s, i) => {
              if (s.type === 'URGENCY_TACTICS') return <li key={`learn-${i}`} className="flex gap-2 items-start"><span className="text-blue-400 mt-0.5">•</span> <span><strong className="text-white">Urgency Tactics:</strong> Scammers use artificial deadlines (e.g. "act now") to make you panic. Always pause and verify independently.</span></li>;
              if (s.type === 'SCAM_KEYWORDS' || s.type === 'HIGH_RISK_KEYWORDS') return <li key={`learn-${i}`} className="flex gap-2 items-start"><span className="text-blue-400 mt-0.5">•</span> <span><strong className="text-white">Keyword Traps:</strong> Words like "free", "winner", or "OTP" are heavily used by fraudsters to grab attention.</span></li>;
              if (s.type === 'EMBEDDED_LINK' || s.type === 'SHORT_MSG_WITH_LINK') return <li key={`learn-${i}`} className="flex gap-2 items-start"><span className="text-blue-400 mt-0.5">•</span> <span><strong className="text-white">Embedded Links:</strong> Never click unexpected links. Scammers use them to steal your login credentials or install malware.</span></li>;
              if (s.type.includes('AI_')) return <li key={`learn-${i}`} className="flex gap-2 items-start"><span className="text-blue-400 mt-0.5">•</span> <span><strong className="text-white">AI Pattern Match:</strong> Our AI matched the intent of this content against thousands of known scam formats.</span></li>;
              if (s.type === 'PHONE_SOLICITATION') return <li key={`learn-${i}`} className="flex gap-2 items-start"><span className="text-blue-400 mt-0.5">•</span> <span><strong className="text-white">Phone Numbers:</strong> Do not call numbers from unsolicited messages. Always look up the official customer service number separately.</span></li>;
              if (s.type === 'MONEY_MENTION') return <li key={`learn-${i}`} className="flex gap-2 items-start"><span className="text-blue-400 mt-0.5">•</span> <span><strong className="text-white">Money Mentions:</strong> Legitimate businesses rarely mention specific amounts in unsolicited messages. Verify with official channels.</span></li>;
              if (s.type.includes('OCR_')) return <li key={`learn-${i}`} className="flex gap-2 items-start"><span className="text-blue-400 mt-0.5">•</span> <span><strong className="text-white">Image Text Analysis:</strong> Scammers embed deceptive text in images to bypass text-based filters. Always read embedded text carefully.</span></li>;
              if (s.type.includes('QR_')) return <li key={`learn-${i}`} className="flex gap-2 items-start"><span className="text-blue-400 mt-0.5">•</span> <span><strong className="text-white">QR Code Safety:</strong> Never scan QR codes from unknown sources. They can redirect to phishing sites or trigger payments.</span></li>;
              return null;
            }).filter(Boolean)}
            {(!result.signals || result.signals.filter(s => ['URGENCY_TACTICS', 'SCAM_KEYWORDS', 'HIGH_RISK_KEYWORDS', 'EMBEDDED_LINK', 'SHORT_MSG_WITH_LINK', 'PHONE_SOLICITATION', 'MONEY_MENTION'].includes(s.type) || s.type.includes('AI_') || s.type.includes('OCR_') || s.type.includes('QR_')).length === 0) && (
              <li className="flex gap-2 items-start"><span className="text-blue-400 mt-0.5">•</span> <span>Always verify the sender before taking any action. If it sounds too good to be true, it probably is.</span></li>
            )}
          </ul>
        </div>
      )}

      {/* ── Recommendation ── */}
      {displayRecommendation && result.riskScore > 0 && (
        <div className="mt-5 rounded-xl bg-slate-800/50 p-4 ring-1 ring-white/5 hover:bg-slate-800/70 transition-colors">
          <h4 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">💡 Recommendation</h4>
          <p className="text-sm font-medium text-slate-200 leading-relaxed">{displayRecommendation}</p>
        </div>
      )}

      {/* ── Timestamp ── */}
      <p className="mt-4 text-right text-xs text-slate-500">
        Scanned at {new Date(result.timestamp).toLocaleString()}
      </p>
    </div>
  );
}
