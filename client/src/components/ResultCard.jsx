import { AlertTriangle, CheckCircle, XCircle, Info, Copy, Check, Sparkles, Target, Zap, Volume2, BookOpen, ShieldAlert, TrendingUp, Flag } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { submitReport } from '../services/api';
const riskConfig = {
  'Safe':        { border: 'border-[var(--color-signal)]', text: 'text-[var(--color-signal)]', icon: CheckCircle, shadow: 'shadow-[0_0_15px_rgba(0,217,146,0.15)]' },
  'Low Risk':    { border: 'border-yellow-500/50', text: 'text-yellow-400', icon: Info, shadow: 'shadow-[0_0_15px_rgba(234,179,8,0.1)]' },
  'Medium Risk': { border: 'border-orange-500/50', text: 'text-orange-400', icon: AlertTriangle, shadow: 'shadow-[0_0_15px_rgba(249,115,22,0.1)]' },
  'High Risk':   { border: 'border-red-500/50', text: 'text-red-400', icon: XCircle, shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.15)]' },
};

const scoreColor = (level) => {
  const m = { 'Safe': 'var(--color-signal)', 'Low Risk': '#eab308', 'Medium Risk': '#f97316', 'High Risk': '#ef4444' };
  return m[level] || 'var(--color-steel)';
};

// Signal display names for better UX
const SIGNAL_NAMES = {
  'URGENCY_TACTICS': '⏰ URGENCY_TACTICS',
  'SCAM_KEYWORDS': '🚨 SCAM_KEYWORDS',
  'HIGH_RISK_KEYWORDS': '⛔ HIGH_RISK_KEYWORDS',
  'EMBEDDED_LINK': '🔗 SUSPICIOUS_LINK',
  'SHORT_MSG_WITH_LINK': '📩 SHORT_MSG_LINK',
  'EXCESSIVE_CAPS': '🔠 EXCESSIVE_CAPS',
  'EXCESSIVE_PUNCTUATION': '❗ EXCESSIVE_PUNC',
  'MONEY_MENTION': '💰 MONEY_MENTION',
  'PHONE_SOLICITATION': '📞 PHONE_SOLICITATION',
  'AI_SCAM_DETECTED': '🤖 AI_SCAM_DETECT',
  'AI_SPAM_DETECTED': '🤖 AI_SPAM_DETECT',
  'AI_SUSPICIOUS': '🤖 AI_SUSPICIOUS',
  'OCR_SCAM_TEXT': '📝 OCR_SCAM_TEXT',
  'OCR_URGENCY_TEXT': '⏰ OCR_URGENCY',
  'OCR_NO_TEXT': '📄 OCR_NO_TEXT',
  'VISION_SCAM_DETECTED': '👁️ VISION_SCAM',
  'QR_CONTAINS_URL': '🔗 QR_URL',
  'QR_NO_CODE_FOUND': '❌ QR_NOT_FOUND',
  'QR_FREE_EMAIL': '📧 QR_FREE_EMAIL',
  'QR_PHONE_NUMBER': '📞 QR_PHONE',
  'QR_PROCESSING_ERROR': '⚠️ QR_ERROR',
};

// Signal badge colors based on signal category
const signalColor = (type) => {
  if (type.includes('AI_') || type.includes('VISION_')) return { text: 'text-purple-400', border: 'border-purple-500/30' };
  if (type.includes('OCR_')) return { text: 'text-amber-400', border: 'border-amber-500/30' };
  if (type.includes('QR_')) return { text: 'text-cyan-400', border: 'border-cyan-500/30' };
  if (type.includes('URGENCY') || type.includes('HIGH_RISK')) return { text: 'text-red-400', border: 'border-red-500/30' };
  return { text: 'text-[var(--color-steel)]', border: 'border-[var(--color-charcoal)]' };
};

export default function ResultCard({ result, requestedLang }) {
  const [showHindi, setShowHindi] = useState(requestedLang === 'hi');
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [reportStatus, setReportStatus] = useState('idle'); // idle | loading | success | error
  const cardRef = useRef(null);

  useEffect(() => {
    setShowHindi(requestedLang === 'hi');
  }, [requestedLang]);

  useEffect(() => {
    if (!result) return;
    setAnimatedScore(0);
    const target = result.riskScore;
    const duration = 1200;
    const start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
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

  const handleReport = async () => {
    if (reportStatus === 'success' || reportStatus === 'loading') return;
    setReportStatus('loading');
    try {
      const riskLevelMap = { 'Safe': 'safe', 'Low Risk': 'low', 'Medium Risk': 'medium', 'High Risk': 'high' };
      await submitReport({
        type: result.type || 'message',
        content: result.input || result.url || displaySummary || 'Unknown content',
        riskScore: result.riskScore,
        riskLevel: riskLevelMap[result.riskLevel] || 'medium',
        signals: (result.signals || []).map(s => s.type || s),
        explanation: displayExplanation || [],
      });
      setReportStatus('success');
    } catch (err) {
      console.error('Report failed:', err);
      setReportStatus('error');
      setTimeout(() => setReportStatus('idle'), 3000);
    }
  };

  return (
    <div ref={cardRef} className={`mt-8 rounded-lg border-2 ${cfg.border} bg-[var(--color-carbon)] p-8 transition-all duration-500 ${cfg.shadow}`} style={{ animation: 'fadeSlideIn 0.5s ease-out' }}>
      <style>{`
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scorePulse { 0%, 100% { filter: drop-shadow(0 0 4px ${scoreColor(result.riskLevel)}); } 50% { filter: drop-shadow(0 0 12px ${scoreColor(result.riskLevel)}); } }
      `}</style>

      {/* ── Risk Score Header ── */}
      <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-between">
        {/* Animated Risk Score Circle */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="relative flex h-32 w-32 items-center justify-center rounded-full bg-[var(--color-abyss)]"
            style={{ animation: 'scorePulse 3s ease-in-out infinite' }}
          >
            {/* Background ring track */}
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r="60" fill="none" stroke="var(--color-charcoal)" strokeWidth="4" />
              <circle
                cx="64" cy="64" r="60" fill="none"
                stroke={scoreColor(result.riskLevel)}
                strokeWidth="4"
                strokeDasharray={`${(animatedScore / 100) * 377} 377`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="text-center font-mono">
              <span className="text-4xl font-bold" style={{ color: scoreColor(result.riskLevel) }}>
                {animatedScore}
              </span>
              <span className="text-xs text-[var(--color-steel)] block mt-1">SCORE/100</span>
            </div>
          </div>
          <span className={`text-[13px] font-mono font-bold tracking-widest uppercase ${cfg.text}`}>
            [{result.riskLevel}]
          </span>
        </div>

        {/* Summary + Badges */}
        <div className="flex-1 text-center sm:text-left">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <Icon className={`h-5 w-5 ${cfg.text}`} />
            <span className={`rounded px-2.5 py-1 border text-[11px] font-mono font-bold uppercase tracking-widest ${cfg.border} ${cfg.text}`}>
              {result.isScam ? '⚠️ SCAM_DETECTED' : '✅ SYS_SAFE'}
            </span>
            {result.confidence && result.confidence !== 'None' && (
              <span className="rounded border border-[var(--color-charcoal)] bg-[var(--color-abyss)] px-2.5 py-1 text-[11px] font-mono font-bold text-[var(--color-steel)] uppercase tracking-widest">
                CONFIDENCE:{result.confidence}
              </span>
            )}
            {result.type && (
              <span className="rounded border border-[var(--color-charcoal)] bg-[var(--color-abyss)] px-2.5 py-1 text-[11px] font-mono font-bold text-[var(--color-steel)] uppercase tracking-widest">
                TYPE:{result.type}
              </span>
            )}
            {hasHindi && (
              <button
                onClick={() => setShowHindi(!showHindi)}
                className={`rounded border px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-widest transition-colors ${showHindi ? 'border-[var(--color-signal)] text-[var(--color-signal)] bg-[var(--color-signal)]/10' : 'border-[var(--color-charcoal)] text-[var(--color-steel)] hover:bg-[var(--color-charcoal)]'}`}
              >
                {showHindi ? 'LANG:HI' : 'LANG:EN'}
              </button>
            )}
            
            {/* Voice Alert */}
            {(result.riskLevel === 'High Risk' || result.riskLevel === 'Medium Risk') && (
              <button
                onClick={playVoiceAlert}
                className={`flex items-center gap-1.5 rounded border px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-widest transition-colors ${isPlaying ? 'border-red-500/50 text-red-400 bg-red-500/10 animate-pulse' : 'border-[var(--color-charcoal)] text-[var(--color-steel)] hover:bg-[var(--color-charcoal)]'}`}
                title="Play Audio Alert"
              >
                <Volume2 className="h-3 w-3" />
                {isPlaying ? 'PLAYING...' : 'PLAY_ALERT'}
              </button>
            )}
          </div>
          
          {/* One-line Summary */}
          <p className="text-base font-sans text-[var(--color-snow)] leading-relaxed">{displaySummary}</p>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded border border-[var(--color-charcoal)] bg-[var(--color-abyss)] px-3 py-1.5 text-xs font-mono font-bold text-[var(--color-steel)] transition-all hover:bg-[var(--color-charcoal)] hover:text-[var(--color-snow)] uppercase"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-[var(--color-signal)]" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'COPIED' : 'COPY'}
        </button>
      </div>

      {/* ── Why This Is Risky ── */}
      {displayExplanation && displayExplanation.length > 0 && displayExplanation[0] !== 'No suspicious patterns detected.' && (
        <div className="mt-8 rounded-lg border border-[var(--color-charcoal)] bg-[var(--color-abyss)] p-5 shadow-[var(--shadow-ambient)]">
          <div className="flex items-center gap-2 mb-4 border-b border-[var(--color-charcoal)] pb-2">
            <ShieldAlert className="h-4 w-4 text-[var(--color-steel)]" />
            <h4 className="text-[11px] font-mono font-bold tracking-widest text-[var(--color-steel)] uppercase">THREAT_ANALYSIS</h4>
          </div>
          <ul className="space-y-3">
            {displayExplanation.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-[var(--color-parchment)] group font-mono">
                <span
                  className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-sm transition-transform group-hover:scale-125 shadow-[0_0_5px_currentColor]"
                  style={{ backgroundColor: scoreColor(result.riskLevel), color: scoreColor(result.riskLevel) }}
                />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── AI Insights (Intent & Tactics) ── */}
      {result.details && (result.details.aiIntent || (result.details.aiTactics && result.details.aiTactics.length > 0)) && (
        <div className="mt-6 rounded-lg border border-purple-500/20 bg-[var(--color-abyss)] p-5 relative overflow-hidden group shadow-[var(--shadow-ambient)] transition-colors">
          <div className="flex items-center gap-2 mb-4 border-b border-purple-500/20 pb-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <h4 className="text-[11px] font-mono font-bold tracking-widest text-purple-400 uppercase">GEMINI_INSIGHTS</h4>
          </div>
          
          {result.details.aiIntent && (
            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-2 text-[10px] text-purple-400/80 font-mono">
                <Target className="h-3 w-3" />
                <span className="uppercase tracking-widest font-bold">DETECTED_INTENT</span>
              </div>
              <p className="text-sm font-sans text-[var(--color-snow)] bg-[var(--color-carbon)] p-3 rounded border border-[var(--color-charcoal)]">{result.details.aiIntent}</p>
            </div>
          )}

          {result.details.aiTactics && result.details.aiTactics.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2 text-[10px] text-purple-400/80 font-mono">
                <Zap className="h-3 w-3" />
                <span className="uppercase tracking-widest font-bold">MANIPULATION_TACTICS</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.details.aiTactics.map((tactic, i) => (
                  <span key={i} className="rounded border border-purple-500/30 bg-[var(--color-carbon)] px-2 py-1 text-[11px] font-mono font-bold text-purple-300 transition-colors cursor-default">
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
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3 border-b border-[var(--color-charcoal)] pb-2">
            <TrendingUp className="h-4 w-4 text-[var(--color-steel)]" />
            <h4 className="text-[11px] font-mono font-bold tracking-widest text-[var(--color-steel)] uppercase">DETECTION_SIGNALS</h4>
            <span className="ml-auto text-[10px] font-mono text-[var(--color-steel)]">COUNT:{result.signals.length}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.signals.map((s, i) => {
              const sc = signalColor(s.type);
              const label = SIGNAL_NAMES[s.type] || s.type.replace(/_/g, ' ');
              return (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1.5 rounded border px-2 py-1 text-[11px] font-mono font-bold bg-[var(--color-abyss)] ${sc.border} ${sc.text} hover:scale-[1.02] transition-transform cursor-default`}
                  title={s.detail || s.type}
                >
                  {label}
                  <span className="ml-1 rounded border border-[var(--color-charcoal)] bg-[var(--color-carbon)] px-1 py-0.5 text-[9px] opacity-80">+{s.weight}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Scam Learning Mode ── */}
      {result.riskScore > 0 && (
        <div className="mt-6 rounded-lg border border-cyan-500/20 bg-[var(--color-abyss)] p-5 relative overflow-hidden transition-colors shadow-[var(--shadow-ambient)]">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/50"></div>
          <div className="flex items-center gap-2 mb-4 border-b border-cyan-500/20 pb-2 pl-2">
            <BookOpen className="h-4 w-4 text-cyan-400" />
            <h4 className="text-[11px] font-mono font-bold tracking-widest text-cyan-400 uppercase">LEARNING_MODE_INIT</h4>
          </div>
          <ul className="space-y-3 text-sm font-mono text-[var(--color-parchment)] pl-2">
            {result.signals && result.signals.map((s, i) => {
              if (s.type === 'URGENCY_TACTICS') return <li key={`learn-${i}`} className="flex gap-3 items-start"><span className="text-cyan-400 mt-0.5">/*</span> <span><strong className="text-[var(--color-snow)] font-sans">Urgency Tactics:</strong> Scammers use artificial deadlines (e.g. "act now") to make you panic. Always pause and verify independently.</span></li>;
              if (s.type === 'SCAM_KEYWORDS' || s.type === 'HIGH_RISK_KEYWORDS') return <li key={`learn-${i}`} className="flex gap-3 items-start"><span className="text-cyan-400 mt-0.5">/*</span> <span><strong className="text-[var(--color-snow)] font-sans">Keyword Traps:</strong> Words like "free", "winner", or "OTP" are heavily used by fraudsters to grab attention.</span></li>;
              if (s.type === 'EMBEDDED_LINK' || s.type === 'SHORT_MSG_WITH_LINK') return <li key={`learn-${i}`} className="flex gap-3 items-start"><span className="text-cyan-400 mt-0.5">/*</span> <span><strong className="text-[var(--color-snow)] font-sans">Embedded Links:</strong> Never click unexpected links. Scammers use them to steal your login credentials or install malware.</span></li>;
              if (s.type.includes('AI_')) return <li key={`learn-${i}`} className="flex gap-3 items-start"><span className="text-cyan-400 mt-0.5">/*</span> <span><strong className="text-[var(--color-snow)] font-sans">AI Pattern Match:</strong> Our AI matched the intent of this content against thousands of known scam formats.</span></li>;
              if (s.type === 'PHONE_SOLICITATION') return <li key={`learn-${i}`} className="flex gap-3 items-start"><span className="text-cyan-400 mt-0.5">/*</span> <span><strong className="text-[var(--color-snow)] font-sans">Phone Numbers:</strong> Do not call numbers from unsolicited messages. Always look up the official customer service number separately.</span></li>;
              if (s.type === 'MONEY_MENTION') return <li key={`learn-${i}`} className="flex gap-3 items-start"><span className="text-cyan-400 mt-0.5">/*</span> <span><strong className="text-[var(--color-snow)] font-sans">Money Mentions:</strong> Legitimate businesses rarely mention specific amounts in unsolicited messages. Verify with official channels.</span></li>;
              if (s.type.includes('OCR_')) return <li key={`learn-${i}`} className="flex gap-3 items-start"><span className="text-cyan-400 mt-0.5">/*</span> <span><strong className="text-[var(--color-snow)] font-sans">Image Text Analysis:</strong> Scammers embed deceptive text in images to bypass text-based filters. Always read embedded text carefully.</span></li>;
              if (s.type.includes('QR_')) return <li key={`learn-${i}`} className="flex gap-3 items-start"><span className="text-cyan-400 mt-0.5">/*</span> <span><strong className="text-[var(--color-snow)] font-sans">QR Code Safety:</strong> Never scan QR codes from unknown sources. They can redirect to phishing sites or trigger payments.</span></li>;
              return null;
            }).filter(Boolean)}
            {(!result.signals || result.signals.filter(s => ['URGENCY_TACTICS', 'SCAM_KEYWORDS', 'HIGH_RISK_KEYWORDS', 'EMBEDDED_LINK', 'SHORT_MSG_WITH_LINK', 'PHONE_SOLICITATION', 'MONEY_MENTION'].includes(s.type) || s.type.includes('AI_') || s.type.includes('OCR_') || s.type.includes('QR_')).length === 0) && (
              <li className="flex gap-3 items-start"><span className="text-cyan-400 mt-0.5">/*</span> <span>Always verify the sender before taking any action. If it sounds too good to be true, it probably is.</span></li>
            )}
          </ul>
        </div>
      )}

      {/* ── Recommendation ── */}
      {displayRecommendation && result.riskScore > 0 && (
        <div className="mt-6 rounded-lg border border-[var(--color-charcoal)] bg-[var(--color-abyss)] p-5 shadow-[var(--shadow-ambient)]">
          <h4 className="mb-2 text-[11px] font-mono font-bold tracking-widest text-[var(--color-snow)] uppercase">{'//'} SYSTEM_RECOMMENDATION</h4>
          <p className="text-sm font-sans font-medium text-[var(--color-signal)] leading-relaxed pl-4 border-l-2 border-[var(--color-signal)]">{displayRecommendation}</p>
        </div>
      )}

      {/* ── Report + Timestamp Footer ── */}
      <div className="mt-6 flex items-center justify-between border-t border-[var(--color-charcoal)] pt-5">
        <button
          onClick={handleReport}
          disabled={reportStatus === 'success' || reportStatus === 'loading'}
          className={`flex items-center gap-2 rounded-md border px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest transition-all ${
            reportStatus === 'success'
              ? 'border-[var(--color-signal)]/50 text-[var(--color-signal)] bg-[var(--color-signal)]/10 cursor-default'
              : reportStatus === 'loading'
              ? 'border-[var(--color-charcoal)] text-[var(--color-steel)] bg-[var(--color-abyss)] cursor-wait animate-pulse'
              : reportStatus === 'error'
              ? 'border-red-500/50 text-red-400 bg-red-500/10 hover:bg-red-500/20'
              : 'border-[var(--color-charcoal)] text-[var(--color-steel)] bg-[var(--color-abyss)] hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/5'
          }`}
        >
          {reportStatus === 'success' ? (
            <><Check className="h-3.5 w-3.5" /> REPORTED</>
          ) : reportStatus === 'loading' ? (
            <><Flag className="h-3.5 w-3.5" /> REPORTING...</>
          ) : reportStatus === 'error' ? (
            <><Flag className="h-3.5 w-3.5" /> RETRY_REPORT</>
          ) : (
            <><Flag className="h-3.5 w-3.5" /> REPORT_SCAM</>
          )}
        </button>
        
        <p className="font-mono text-[10px] uppercase text-[var(--color-steel)] tracking-widest">
          TIMESTAMP_UTC: {new Date(result.timestamp).toISOString()}
        </p>
      </div>
    </div>
  );
}
