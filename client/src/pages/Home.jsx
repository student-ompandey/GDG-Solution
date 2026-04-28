import { Link } from 'react-router-dom';
import { Link2, MessageSquare, QrCode, Image as ImageIcon, ArrowRight, Terminal, Copy, Check, Activity, Server, Code, Cpu, ShieldAlert, Sparkles, Eye, Zap, Globe, Smartphone, Monitor, Database, Cloud, Share2, Shield, Mail, Layers, GitBranch, Hash, RefreshCw, Search, Wrench, Clock, Mic, Brain, ShieldCheck, Users, FileText, Radar, LayoutGrid, Circle, Heart, ChevronRight, Triangle, Atom, Wind, UploadCloud, MicOff, ImageOff, CreditCard, UserX, Ghost, Fingerprint, Lock, MessageCircle, Send } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

// Animated counter hook
function useCounter(end, duration = 2000, start = 0) {
  const [count, setCount] = useState(start);
  const [triggered, setTriggered] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !triggered) setTriggered(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [triggered]);

  useEffect(() => {
    if (!triggered) return;
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(start + (end - start) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [triggered, end, duration, start]);

  return { count, ref };
}

// Scroll reveal hook
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

const features = [
  { icon: Link2, title: 'URL Scanner', desc: 'Detect phishing links, IP-based URLs, and suspicious redirects in real time using heuristic analysis.' },
  { icon: MessageSquare, title: 'Message Scanner', desc: 'Analyse SMS & WhatsApp messages for scam keywords, urgency tactics, and advanced fraud patterns.' },
  { icon: QrCode, title: 'QR Scanner', desc: 'Upload QR code images to decode hidden URLs and check them for threats before opening.' },
  { icon: ImageIcon, title: 'Image Scanner', desc: 'Extract text from images via OCR and detect scam content automatically using Gemini Vision.' },
];

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [apiCopied, setApiCopied] = useState(false);

  // Animated counters
  const accuracy = useCounter(99, 1800);
  const threats = useCounter(12, 1500);
  const latency = useCounter(850, 1600);

  // Section reveals
  const statsReveal = useReveal();
  const bentoReveal = useReveal();
  const featuresReveal = useReveal();
  const apiReveal = useReveal();

  const copyCommand = () => {
    navigator.clipboard.writeText('npm create scamshield-agent@latest');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyApiCommand = () => {
    const code = `curl -X POST https://api.scamshield.io/v1/scan \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"type": "url", "payload": "https://suspicious-link.com"}'`;
    navigator.clipboard.writeText(code);
    setApiCopied(true);
    setTimeout(() => setApiCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-8 pb-32">
      <style>{`
        @keyframes scan-laser {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes scroll-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes data-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes flow-dot {
          0% { offset-distance: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { offset-distance: 100%; opacity: 0; }
        }
        @keyframes draw-line {
          0% { stroke-dashoffset: 800; opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0; }
        }
        @keyframes march-ants {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -100; }
        }
        @keyframes pulse-scale {
          0%, 100% { transform: translate(-50%, -50%) scale(1); filter: drop-shadow(0 0 20px rgba(0,217,146,0.2)); }
          50% { transform: translate(-50%, -50%) scale(1.05); filter: drop-shadow(0 0 40px rgba(0,217,146,0.6)); }
        }
        .path-animated {
          stroke-dasharray: 150 1000;
          stroke-linecap: round;
        }
        @keyframes slide-left {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes slide-right {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
        @keyframes hero-grid-fade {
          0% { opacity: 0.03; }
          50% { opacity: 0.08; }
          100% { opacity: 0.03; }
        }
        @keyframes hero-glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        .reveal-up {
          opacity: 0; transform: translateY(30px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .reveal-up.visible {
          opacity: 1; transform: translateY(0);
        }
      `}</style>

      {/* ── Hero Section ── */}
      <section className="flex flex-col items-center pt-28 pb-32 text-center relative overflow-hidden">
        {/* Animated gradient glow */}
        <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[var(--color-signal)]/12 via-transparent to-transparent pointer-events-none" style={{ animation: 'hero-glow 6s ease-in-out infinite' }}></div>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a1a1a_1px,_transparent_1px)] bg-[size:32px_32px] pointer-events-none" style={{ animation: 'hero-grid-fade 8s ease-in-out infinite' }}></div>
        
        {/* Overline Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--color-charcoal)] bg-[var(--color-carbon)] px-4 py-1.5 shadow-[var(--shadow-ambient)]">
          <Terminal className="h-4 w-4 text-[var(--color-signal)] animate-pulse" />
          <span className="font-display text-sm font-semibold tracking-widest uppercase text-[var(--color-snow)]">v2.0 Architecture</span>
        </div>

        {/* Compressed Authority Heading */}
        <h1 className="max-w-4xl font-display text-3xl sm:text-5xl md:text-7xl font-normal text-[var(--color-snow)] tracking-[-1.5px] leading-[1.05] mb-8">
          The Intelligent Agent for{' '}
          <span className="text-[var(--color-signal)] relative inline-block">
            Threat Detection
            <div className="absolute -bottom-2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-signal)] to-transparent opacity-50"></div>
          </span>
        </h1>

        <p className="max-w-2xl text-base sm:text-lg md:text-xl text-[var(--color-parchment)] leading-relaxed mb-12 font-medium px-2">
          Deploy deep-space terminal security. Scan links, extracted OCR text, and structural QR data instantly with autonomous AI heuristics.
        </p>

        {/* Terminal / Code Hero CTA */}
        <div className="flex flex-col items-center gap-4 sm:gap-6 w-full px-2">
          {/* Main Code CTA */}
          <div className="flex items-center justify-between rounded-md border-[3px] border-[var(--color-charcoal)] bg-[var(--color-carbon)] p-1.5 pl-4 sm:pl-5 pr-2 shadow-[var(--shadow-dramatic)] w-full sm:w-auto sm:min-w-[320px] transition-all hover:border-[var(--color-steel)]">
            <span className="font-mono text-[12px] sm:text-[14px] text-[var(--color-snow)] opacity-90 tracking-tight">npm create scamshield-agent@latest</span>
            <button 
              onClick={copyCommand}
              className="ml-6 flex items-center justify-center rounded bg-transparent p-2 text-[var(--color-parchment)] hover:text-[var(--color-snow)] hover:bg-black/30 transition-all border border-transparent hover:border-[var(--color-charcoal)]"
              title="Copy installation command"
            >
              {copied ? <Check className="h-4 w-4 text-[var(--color-signal)]" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          <span className="text-[var(--color-steel)] font-mono text-sm">— OR —</span>

          {/* Web App CTA */}
          <Link
            to="/scan"
            className="flex h-[52px] items-center justify-center gap-2 rounded-md border border-transparent bg-[var(--color-carbon)] px-8 font-medium text-[var(--color-mint)] ring-1 ring-[var(--color-signal)]/80 transition-all shadow-[0_0_10px_rgba(0,217,146,0.1)] hover:bg-black/20 hover:shadow-[0_0_15px_rgba(0,217,146,0.3)] hover:scale-[1.02]"
          >
            Launch Web Console
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── System Telemetry (Live Analytics) ── */}
      <section className="mb-32" ref={statsReveal.ref}>
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto border-y border-[var(--color-charcoal)] py-10 bg-[var(--color-carbon)]/30 backdrop-blur-sm relative overflow-hidden rounded-xl px-10 reveal-up ${statsReveal.visible ? 'visible' : ''}`}>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
          
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-signal)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-signal)]"></span>
              </span>
              <span className="font-mono text-xs text-[var(--color-steel)] uppercase tracking-widest">Detection Accuracy</span>
            </div>
            <span className="font-mono text-4xl font-bold text-[var(--color-snow)]" ref={accuracy.ref}>{accuracy.count}.8<span className="text-xl text-[var(--color-signal)]">%</span></span>
          </div>

          <div className="flex flex-col items-center justify-center text-center border-y md:border-y-0 md:border-x border-[var(--color-charcoal)] py-6 md:py-0">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-3 w-3 text-purple-400" />
              <span className="font-mono text-xs text-[var(--color-steel)] uppercase tracking-widest">Threats Neutralized</span>
            </div>
            <span className="font-mono text-4xl font-bold text-[var(--color-snow)]" ref={threats.ref}>{threats.count > 0 ? `${threats.count / 10}` : '0'}M<span className="text-xl text-purple-400">+</span></span>
          </div>

          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex items-center gap-2 mb-2">
              <Server className="h-3 w-3 text-cyan-400" />
              <span className="font-mono text-xs text-[var(--color-steel)] uppercase tracking-widest">Avg Scan Latency</span>
            </div>
            <span className="font-mono text-4xl font-bold text-[var(--color-snow)]" ref={latency.ref}>{latency.count}<span className="text-xl text-cyan-400">ms</span></span>
          </div>
        </div>
      </section>

      {/* ── Security Capabilities Marquee ── */}
      <section className="py-20 mb-32 max-w-full mx-auto relative overflow-hidden bg-[#050507]">
        {/* Subtle dot grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#222_1px,_transparent_1px)] bg-[size:24px_24px] opacity-40 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center mb-12">
          <span className="font-mono text-[11px] md:text-xs text-[var(--color-steel)] font-medium uppercase tracking-[0.2em]">
            Continuous Protection Against Advanced Threat Vectors
          </span>
        </div>

        <div className="w-full flex flex-col gap-10 relative z-10 mask-image-fade">
          <style>{`.mask-image-fade { -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent); mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent); }`}</style>
          
          {/* Row 1 - Slide Left - Threat Vectors */}
          <div className="flex overflow-hidden">
            <div className="flex gap-16 md:gap-24 items-center min-w-max w-[200%]" style={{ animation: 'slide-left 40s linear infinite' }}>
              {[1, 2].map((set) => (
                <div key={set} className="flex gap-16 md:gap-24 items-center">
                  <div className="flex items-center gap-2 text-[#666]"><Link2 className="h-6 w-6 md:h-8 md:w-8"/><span className="font-sans font-bold text-xl md:text-2xl tracking-wider uppercase">PHISHING URLs</span></div>
                  <div className="flex items-center gap-2 text-[#666]"><MessageSquare className="h-6 w-6 md:h-8 md:w-8"/><span className="font-sans font-semibold text-xl md:text-2xl">SMS Smishing</span></div>
                  <div className="flex items-center gap-2 text-[#666]"><QrCode className="h-6 w-6 md:h-8 md:w-8"/><span className="font-sans font-black text-2xl md:text-3xl tracking-tighter uppercase">MALICIOUS QR</span></div>
                  <div className="flex items-center gap-2 text-[#666]"><MicOff className="h-6 w-6 md:h-8 md:w-8"/><span className="font-serif font-medium italic text-2xl md:text-3xl">Audio Deepfakes</span></div>
                  <div className="flex items-center gap-2 text-[#666]"><CreditCard className="h-6 w-6 md:h-8 md:w-8"/><span className="font-sans font-bold text-xl md:text-2xl uppercase tracking-widest">CRYPTO FRAUD</span></div>
                  <div className="flex items-center gap-2 text-[#666]"><UserX className="h-6 w-6 md:h-8 md:w-8"/><span className="font-sans font-medium text-xl md:text-2xl tracking-tight">Identity Theft</span></div>
                  <div className="flex items-center gap-2 text-[#666] px-4 py-1 border-[3px] border-[#666] rounded-full"><Ghost className="h-5 w-5 md:h-6 md:w-6"/><span className="font-sans font-bold text-sm md:text-base uppercase">SOCIAL ENGINEERING</span></div>
                  <div className="flex items-center gap-2 text-[#666]"><ImageOff className="h-6 w-6 md:h-8 md:w-8"/><span className="font-sans font-black text-2xl md:text-3xl tracking-tighter lowercase">image spoofing</span></div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2 - Slide Right - Security Capabilities */}
          <div className="flex overflow-hidden">
            <div className="flex gap-16 md:gap-24 items-center min-w-max w-[200%]" style={{ animation: 'slide-right 45s linear infinite' }}>
              {[1, 2].map((set) => (
                <div key={set} className="flex gap-16 md:gap-24 items-center">
                  <div className="flex items-center gap-2 text-[#666]"><ShieldCheck className="h-6 w-6 md:h-8 md:w-8"/><span className="font-sans font-bold text-2xl md:text-3xl tracking-tighter lowercase">real-time blocking</span></div>
                  <div className="flex items-center gap-2 text-[#666]"><Brain className="h-6 w-6 md:h-8 md:w-8"/><span className="font-sans font-bold text-xl md:text-2xl uppercase tracking-widest">BEHAVIORAL ANALYSIS</span></div>
                  <div className="flex items-center gap-2 text-[#666]"><Radar className="h-6 w-6 md:h-8 md:w-8"/><span className="font-sans font-bold text-xl md:text-2xl">Global Threat Intel</span></div>
                  <div className="flex items-center gap-2 text-[#666]"><Fingerprint className="h-6 w-6 md:h-8 md:w-8"/><span className="font-sans font-black text-2xl md:text-3xl uppercase tracking-tighter">ZERO-TRUST</span></div>
                  <div className="flex items-center gap-2 text-[#666]"><Activity className="h-6 w-6 md:h-8 md:w-8"/><span className="font-sans font-medium text-xl md:text-2xl tracking-tight">Predictive Heuristics</span></div>
                  <div className="flex items-center gap-2 text-[#666]"><Lock className="h-6 w-6 md:h-8 md:w-8"/><span className="font-sans font-semibold text-xl md:text-2xl tracking-wider">End-to-End Encryption</span></div>
                  <div className="flex items-center gap-2 text-[#666]"><Eye className="h-6 w-6 md:h-8 md:w-8"/><span className="font-sans font-black text-2xl md:text-3xl tracking-tighter lowercase">optical extraction</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Core Infrastructure (Bento Grid) ── */}
      <section className="mb-32 max-w-6xl mx-auto" ref={bentoReveal.ref}>
        <div className={`mb-12 reveal-up ${bentoReveal.visible ? 'visible' : ''}`}>
          <h2 className="font-display text-4xl font-normal tracking-[-0.9px] text-[var(--color-snow)] leading-[1.11] mb-3">
            Core <span className="text-[var(--color-signal)]">Infrastructure</span>
          </h2>
          <p className="font-mono text-sm text-[var(--color-steel)] uppercase tracking-widest">Deep Space Tech Stack Implementation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-6 h-auto md:h-[500px]">
          
          {/* Grid Item 1: Gemini AI (Spans 2 columns) */}
          <div className={`md:col-span-2 md:row-span-1 rounded-xl border border-[var(--color-charcoal)] bg-[var(--color-carbon)] overflow-hidden relative group shadow-[var(--shadow-ambient)] transition-all duration-500 hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)] reveal-up ${bentoReveal.visible ? 'visible' : ''}`} style={{ transitionDelay: '100ms' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none transition-opacity group-hover:opacity-100 opacity-50"></div>
            <div className="p-8 h-full flex flex-col justify-between relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 rounded border border-purple-500/30 bg-[var(--color-abyss)] px-3 py-1 mb-4">
                  <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                  <span className="font-mono text-[10px] font-bold text-purple-400 uppercase tracking-widest">Neural Net Active</span>
                </div>
                <h3 className="font-display text-2xl text-[var(--color-snow)] mb-2">Gemini 2.0 Flash</h3>
                <p className="text-[var(--color-parchment)] text-sm max-w-md">Multi-modal AI payload inspection. Cross-references text, images, and embedded semantics simultaneously against known fraud tactics.</p>
              </div>
              
              {/* Visual Animation: Data Stream */}
              <div className="absolute right-8 bottom-8 flex gap-1.5 opacity-50">
                {[1, 2, 3, 4, 5, 6].map((bar) => (
                  <div key={bar} className="w-1.5 bg-purple-500/50 rounded-full" style={{ height: `${Math.random() * 40 + 10}px`, animation: `data-pulse ${Math.random() * 2 + 1}s infinite ease-in-out` }}></div>
                ))}
              </div>
            </div>
          </div>

          {/* Grid Item 2: Heuristic Analysis */}
          <div className={`md:col-span-1 md:row-span-2 rounded-xl border border-[var(--color-charcoal)] bg-[var(--color-carbon)] overflow-hidden relative group shadow-[var(--shadow-ambient)] flex flex-col transition-all duration-500 hover:border-[var(--color-signal)]/30 hover:shadow-[0_0_30px_rgba(0,217,146,0.1)] reveal-up ${bentoReveal.visible ? 'visible' : ''}`} style={{ transitionDelay: '200ms' }}>
            <div className="p-8 flex-1">
              <div className="inline-flex items-center gap-2 rounded border border-[var(--color-signal)]/30 bg-[var(--color-abyss)] px-3 py-1 mb-4">
                <ShieldAlert className="h-3.5 w-3.5 text-[var(--color-signal)]" />
                <span className="font-mono text-[10px] font-bold text-[var(--color-signal)] uppercase tracking-widest">Zero-Day Engine</span>
              </div>
              <h3 className="font-display text-2xl text-[var(--color-snow)] mb-2">Heuristic Engine</h3>
              <p className="text-[var(--color-parchment)] text-sm mb-6">Real-time terminal execution scanning for urgency tactics and manipulation vectors.</p>
            </div>
            
            {/* Visual Animation: Scrolling Terminal Log */}
            <div className="h-48 bg-[#030303] border-t border-[var(--color-charcoal)] p-4 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-[#030303] via-transparent to-[#030303] z-10"></div>
              <div className="font-mono text-[10px] text-[var(--color-signal)]/70 space-y-2" style={{ animation: 'scroll-up 10s linear infinite' }}>
                <p>{'>'} INIT THREAT_ANALYSIS_PROTOCOL</p>
                <p className="text-yellow-400">{'>'} WRN: URGENCY_KEYWORD_DETECTED ["ACT NOW"]</p>
                <p>{'>'} CROSS_REF_DB: POSITIVE_HIT</p>
                <p className="text-red-400">{'>'} ERR: PAYLOAD_MALICIOUS_98%</p>
                <p>{'>'} FLUSHING_MEMORY...</p>
                <p>{'>'} INIT THREAT_ANALYSIS_PROTOCOL</p>
                <p className="text-yellow-400">{'>'} WRN: URGENCY_KEYWORD_DETECTED ["ACT NOW"]</p>
                <p>{'>'} CROSS_REF_DB: POSITIVE_HIT</p>
                <p className="text-red-400">{'>'} ERR: PAYLOAD_MALICIOUS_98%</p>
                <p>{'>'} FLUSHING_MEMORY...</p>
              </div>
            </div>
          </div>

          {/* Grid Item 3: OCR Pipeline */}
          <div className={`md:col-span-2 md:row-span-1 rounded-xl border border-[var(--color-charcoal)] bg-[var(--color-carbon)] overflow-hidden relative group shadow-[var(--shadow-ambient)] transition-all duration-500 hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] reveal-up ${bentoReveal.visible ? 'visible' : ''}`} style={{ transitionDelay: '300ms' }}>
            <div className="absolute inset-0 bg-[var(--color-charcoal)]/10 pattern-diagonal-lines pattern-[var(--color-charcoal)] pattern-size-4 pointer-events-none"></div>
            <div className="p-8 h-full flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 rounded border border-cyan-500/30 bg-[var(--color-abyss)] px-3 py-1 mb-4">
                  <Eye className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="font-mono text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Optical Extraction</span>
                </div>
                <h3 className="font-display text-2xl text-[var(--color-snow)] mb-2">Tesseract OCR Pipeline</h3>
                <p className="text-[var(--color-parchment)] text-sm">Extracts deeply embedded text from heavily compressed images and QR codes to bypass standard filter evasion techniques.</p>
              </div>
              
              {/* Visual Animation: Scanning Laser */}
              <div className="w-32 h-32 bg-[var(--color-abyss)] border border-[var(--color-charcoal)] rounded shrink-0 relative overflow-hidden flex items-center justify-center shadow-inner">
                <span className="font-mono text-[8px] text-[var(--color-steel)] text-center leading-tight">WINNER!<br/>CLICK HERE<br/>TO CLAIM</span>
                <div className="absolute inset-x-0 h-[2px] bg-cyan-400 shadow-[0_0_8px_cyan]" style={{ animation: 'scan-laser 2.5s infinite ease-in-out' }}></div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Agentic Workflow (Node Diagram) ── */}
      <section className="mb-32 max-w-5xl mx-auto hidden md:block">
        <div className="mb-12 text-center">
          <h2 className="mb-3 font-display text-4xl font-normal tracking-[-0.9px] text-[var(--color-snow)] leading-[1.11]">
            How ScamShield <span className="text-[var(--color-signal)]">Works</span>
          </h2>
          <p className="font-mono text-sm text-[var(--color-steel)] uppercase tracking-widest max-w-2xl mx-auto">A hybrid system combining rule-based detection and AI-powered explanation</p>
        </div>
        
        <div className="relative w-full h-[600px] bg-[#050507] border border-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center">
          {/* Background Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#222_1px,_transparent_1px)] bg-[size:24px_24px] opacity-40"></div>
          
          {/* SVG Connections */}
          <svg className="absolute inset-0 h-full w-full pointer-events-none z-10" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="lineGradIn" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#1a1a1a" />
                <stop offset="100%" stopColor="var(--color-signal)" stopOpacity="0.4" />
              </linearGradient>
              <linearGradient id="lineGradOut" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--color-signal)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#1a1a1a" />
              </linearGradient>
            </defs>

            {/* Faint Background Lines (Inputs: y=100, 175, 250, 325, 400) */}
            <path d="M 210 100 C 300 100 400 250 460 250" stroke="var(--color-charcoal)" strokeWidth="1.5" fill="none" opacity="0.5" />
            <path d="M 210 175 C 300 175 400 250 460 250" stroke="var(--color-charcoal)" strokeWidth="1.5" fill="none" opacity="0.5" />
            <path d="M 210 250 C 300 250 400 250 460 250" stroke="var(--color-charcoal)" strokeWidth="1.5" fill="none" opacity="0.5" />
            <path d="M 210 325 C 300 325 400 250 460 250" stroke="var(--color-charcoal)" strokeWidth="1.5" fill="none" opacity="0.5" />
            <path d="M 210 400 C 300 400 400 250 460 250" stroke="var(--color-charcoal)" strokeWidth="1.5" fill="none" opacity="0.5" />

            {/* Faint Background Lines (Outputs: y=130, 210, 290, 370) */}
            <path d="M 540 250 C 600 250 700 130 790 130" stroke="var(--color-charcoal)" strokeWidth="1.5" fill="none" opacity="0.5" />
            <path d="M 540 250 C 600 250 700 210 790 210" stroke="var(--color-charcoal)" strokeWidth="1.5" fill="none" opacity="0.5" />
            <path d="M 540 250 C 600 250 700 290 790 290" stroke="var(--color-charcoal)" strokeWidth="1.5" fill="none" opacity="0.5" />
            <path d="M 540 250 C 600 250 700 370 790 370" stroke="var(--color-charcoal)" strokeWidth="1.5" fill="none" opacity="0.5" />

            {/* Flowing Animated Lines (Input) */}
            <path d="M 210 100 C 300 100 400 250 460 250" stroke="url(#lineGradIn)" strokeWidth="2.5" fill="none" className="path-animated" style={{ animation: 'draw-line 3s linear infinite 0s' }} />
            <path d="M 210 175 C 300 175 400 250 460 250" stroke="url(#lineGradIn)" strokeWidth="2.5" fill="none" className="path-animated" style={{ animation: 'draw-line 3s linear infinite 0.3s' }} />
            <path d="M 210 250 C 300 250 400 250 460 250" stroke="url(#lineGradIn)" strokeWidth="2.5" fill="none" className="path-animated" style={{ animation: 'draw-line 3s linear infinite 0.6s' }} />
            <path d="M 210 325 C 300 325 400 250 460 250" stroke="url(#lineGradIn)" strokeWidth="2.5" fill="none" className="path-animated" style={{ animation: 'draw-line 3s linear infinite 0.9s' }} />
            <path d="M 210 400 C 300 400 400 250 460 250" stroke="url(#lineGradIn)" strokeWidth="2.5" fill="none" className="path-animated" style={{ animation: 'draw-line 3s linear infinite 1.2s' }} />

            {/* Flowing Animated Lines (Output) */}
            <path d="M 540 250 C 600 250 700 130 790 130" stroke="url(#lineGradOut)" strokeWidth="2.5" fill="none" className="path-animated" style={{ animation: 'draw-line 3s linear infinite 1.5s' }} />
            <path d="M 540 250 C 600 250 700 210 790 210" stroke="url(#lineGradOut)" strokeWidth="2.5" fill="none" className="path-animated" style={{ animation: 'draw-line 3s linear infinite 1.8s' }} />
            <path d="M 540 250 C 600 250 700 290 790 290" stroke="url(#lineGradOut)" strokeWidth="2.5" fill="none" className="path-animated" style={{ animation: 'draw-line 3s linear infinite 2.1s' }} />
            <path d="M 540 250 C 600 250 700 370 790 370" stroke="url(#lineGradOut)" strokeWidth="2.5" fill="none" className="path-animated" style={{ animation: 'draw-line 3s linear infinite 2.4s' }} />

            {/* Bottom Vertical Dashed Line - Marching Ants */}
            <line x1="500" y1="310" x2="500" y2="430" stroke="var(--color-signal)" strokeWidth="2" strokeDasharray="4 6" opacity="0.6" style={{ animation: 'march-ants 1s linear infinite' }} />
          </svg>

          {/* Animated Particles flowing along the paths */}
          <div className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_12px_#fff] z-20" style={{ offsetPath: 'path("M 210 100 C 300 100 400 250 460 250")', animation: 'flow-dot 3s linear infinite 0s' }}></div>
          <div className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_12px_#fff] z-20" style={{ offsetPath: 'path("M 210 175 C 300 175 400 250 460 250")', animation: 'flow-dot 3s linear infinite 0.3s' }}></div>
          <div className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_12px_#fff] z-20" style={{ offsetPath: 'path("M 210 250 C 300 250 400 250 460 250")', animation: 'flow-dot 3s linear infinite 0.6s' }}></div>
          <div className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_12px_#fff] z-20" style={{ offsetPath: 'path("M 210 325 C 300 325 400 250 460 250")', animation: 'flow-dot 3s linear infinite 0.9s' }}></div>
          <div className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_12px_#fff] z-20" style={{ offsetPath: 'path("M 210 400 C 300 400 400 250 460 250")', animation: 'flow-dot 3s linear infinite 1.2s' }}></div>

          <div className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_12px_#fff] z-20" style={{ offsetPath: 'path("M 540 250 C 600 250 700 130 790 130")', animation: 'flow-dot 3s linear infinite 1.5s' }}></div>
          <div className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_12px_#fff] z-20" style={{ offsetPath: 'path("M 540 250 C 600 250 700 210 790 210")', animation: 'flow-dot 3s linear infinite 1.8s' }}></div>
          <div className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_12px_#fff] z-20" style={{ offsetPath: 'path("M 540 250 C 600 250 700 290 790 290")', animation: 'flow-dot 3s linear infinite 2.1s' }}></div>
          <div className="absolute w-2 h-2 bg-white rounded-full shadow-[0_0_12px_#fff] z-20" style={{ offsetPath: 'path("M 540 250 C 600 250 700 370 790 370")', animation: 'flow-dot 3s linear infinite 2.4s' }}></div>

          <div className="absolute w-2 h-2 bg-[var(--color-signal)] rounded-full shadow-[0_0_12px_var(--color-signal)] z-20" style={{ offsetPath: 'path("M 500 310 L 500 430")', animation: 'flow-dot 1s linear infinite 0s' }}></div>

          {/* Core Node (Center) */}
          <div className="absolute top-[250px] left-[500px] z-30 flex flex-col items-center" style={{ animation: 'pulse-scale 3s infinite ease-in-out' }}>
            <span className="font-sans text-[12px] text-[var(--color-steel)] font-medium mb-1 uppercase tracking-widest text-center">Signal-Based</span>
            <span className="font-sans text-[14px] text-white font-bold mb-3 text-center">ScamShield Engine</span>
            <div className="h-[84px] w-[84px] rounded-full border-[2px] border-[var(--color-signal)] bg-[#050507] shadow-[0_0_40px_rgba(0,217,146,0.25)] flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full bg-[var(--color-signal)]/10 animate-pulse"></div>
              <Shield className="h-10 w-10 text-[var(--color-signal)] fill-[var(--color-signal)]/20 z-10" style={{ filter: 'drop-shadow(0 0 8px rgba(0,217,146,0.6))' }} />
            </div>
          </div>

          {/* Inputs (Left: URL, Message, QR, Image, Audio) */}
          <div className="absolute left-[50px] top-[100px] -translate-y-1/2 z-20 flex items-center gap-4 bg-[#0a0a0c] border border-dashed border-[#2a2a2a] rounded-xl px-4 py-3 shadow-lg w-[160px] transition-colors hover:border-[#444]">
            <Link2 className="h-5 w-5 text-blue-400 shrink-0"/>
            <span className="font-sans text-[13px] text-white font-semibold leading-tight">URL Scanner</span>
          </div>
          <div className="absolute left-[50px] top-[175px] -translate-y-1/2 z-20 flex items-center gap-4 bg-[#0a0a0c] border border-dashed border-[#2a2a2a] rounded-xl px-4 py-3 shadow-lg w-[160px] transition-colors hover:border-[#444]">
            <MessageSquare className="h-5 w-5 text-green-400 shrink-0"/>
            <span className="font-sans text-[13px] text-white font-semibold leading-tight">Message Scanner</span>
          </div>
          <div className="absolute left-[50px] top-[250px] -translate-y-1/2 z-20 flex items-center gap-4 bg-[#0a0a0c] border border-dashed border-[#2a2a2a] rounded-xl px-4 py-3 shadow-lg w-[160px] transition-colors hover:border-[#444]">
            <QrCode className="h-5 w-5 text-purple-400 shrink-0"/>
            <span className="font-sans text-[13px] text-white font-semibold leading-tight">QR Scanner</span>
          </div>
          <div className="absolute left-[50px] top-[325px] -translate-y-1/2 z-20 flex items-center gap-4 bg-[#0a0a0c] border border-dashed border-[#2a2a2a] rounded-xl px-4 py-3 shadow-lg w-[160px] transition-colors hover:border-[#444]">
            <ImageIcon className="h-5 w-5 text-yellow-400 shrink-0"/>
            <span className="font-sans text-[13px] text-white font-semibold leading-tight">Image Scanner</span>
          </div>
          <div className="absolute left-[50px] top-[400px] -translate-y-1/2 z-20 flex items-center gap-4 bg-[#0a0a0c] border border-dashed border-[#2a2a2a] rounded-xl px-4 py-3 shadow-lg w-[160px] transition-colors hover:border-[#444]">
            <Mic className="h-5 w-5 text-pink-400 shrink-0"/>
            <span className="font-sans text-[13px] text-white font-semibold leading-tight">Audio Scanner</span>
          </div>

          {/* Outputs (Right: Risk, Type, Explain, Recommend) */}
          <div className="absolute right-[50px] top-[130px] -translate-y-1/2 z-20 flex items-center gap-4 bg-[#0a0a0c] border border-dashed border-[#2a2a2a] rounded-xl px-4 py-3 shadow-lg w-[180px] transition-colors hover:border-[#444]">
            <ShieldAlert className="h-5 w-5 text-[var(--color-signal)] shrink-0"/>
            <span className="font-sans text-[13px] text-white font-semibold leading-tight">Risk Score</span>
          </div>
          <div className="absolute right-[50px] top-[210px] -translate-y-1/2 z-20 flex items-center gap-4 bg-[#0a0a0c] border border-dashed border-[#2a2a2a] rounded-xl px-4 py-3 shadow-lg w-[180px] transition-colors hover:border-[#444]">
            <Radar className="h-5 w-5 text-[var(--color-signal)] shrink-0"/>
            <span className="font-sans text-[13px] text-white font-semibold leading-tight">Scam Type Detection</span>
          </div>
          <div className="absolute right-[50px] top-[290px] -translate-y-1/2 z-20 flex items-center gap-4 bg-[#0a0a0c] border border-dashed border-[#2a2a2a] rounded-xl px-4 py-3 shadow-lg w-[180px] transition-colors hover:border-[#444]">
            <Brain className="h-5 w-5 text-[var(--color-signal)] shrink-0"/>
            <span className="font-sans text-[13px] text-white font-semibold leading-tight">AI Explanation</span>
          </div>
          <div className="absolute right-[50px] top-[370px] -translate-y-1/2 z-20 flex items-center gap-4 bg-[#0a0a0c] border border-dashed border-[#2a2a2a] rounded-xl px-4 py-3 shadow-lg w-[180px] transition-colors hover:border-[#444]">
            <ShieldCheck className="h-5 w-5 text-[var(--color-signal)] shrink-0"/>
            <span className="font-sans text-[13px] text-white font-semibold leading-tight">Safety Recommendation</span>
          </div>

          {/* Capabilities (Bottom Box) */}
          <div className="absolute bottom-[30px] left-1/2 -translate-x-1/2 z-20 flex gap-4 md:gap-6 px-6 py-4 rounded-2xl border border-dashed border-[#333] bg-[#08080a] whitespace-nowrap overflow-x-auto max-w-full hide-scrollbar">
            <div className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-[var(--color-signal)] bg-transparent flex items-center justify-center">
                <Cpu className="h-4 w-4 md:h-5 md:w-5 text-[var(--color-signal)]"/>
              </div>
              <span className="font-sans text-[11px] md:text-[12px] text-white font-semibold">Detection Engine</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-[var(--color-signal)] bg-transparent flex items-center justify-center">
                <Activity className="h-4 w-4 md:h-5 md:w-5 text-[var(--color-signal)]"/>
              </div>
              <span className="font-sans text-[11px] md:text-[12px] text-white font-semibold">Signal Scoring</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-[var(--color-signal)] bg-transparent flex items-center justify-center">
                <Brain className="h-4 w-4 md:h-5 md:w-5 text-[var(--color-signal)]"/>
              </div>
              <span className="font-sans text-[11px] md:text-[12px] text-white font-semibold">AI Explanation</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-[var(--color-signal)] bg-transparent flex items-center justify-center">
                <FileText className="h-4 w-4 md:h-5 md:w-5 text-[var(--color-signal)]"/>
              </div>
              <span className="font-sans text-[11px] md:text-[12px] text-white font-semibold">OCR / Speech</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-[var(--color-signal)] bg-transparent flex items-center justify-center">
                <Users className="h-4 w-4 md:h-5 md:w-5 text-[var(--color-signal)]"/>
              </div>
              <span className="font-sans text-[11px] md:text-[12px] text-white font-semibold">Community Intel</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Cards (VoltAgent Style) ── */}

      <section className="mb-32 max-w-6xl mx-auto" ref={featuresReveal.ref}>
        <div className={`mb-12 text-center reveal-up ${featuresReveal.visible ? 'visible' : ''}`}>
          <h2 className="mb-3 font-display text-4xl font-normal tracking-[-0.9px] text-[var(--color-snow)] leading-[1.11]">
            Multi-Vector <span className="text-[var(--color-signal)]">Coverage</span>
          </h2>
          <p className="font-mono text-sm text-[var(--color-steel)] uppercase tracking-widest">Supported Scan Modules</p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <Link
              key={i}
              to="/scan"
              className="group relative flex flex-col rounded-2xl border border-[var(--color-charcoal)] bg-gradient-to-b from-[#111115] to-[var(--color-carbon)] p-8 transition-all duration-500 hover:-translate-y-2 hover:border-[var(--color-signal)]/50 hover:shadow-[0_15px_40px_-15px_rgba(0,217,146,0.3)] overflow-hidden"
            >
              {/* Subtle hover background highlight */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-signal)]/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none"></div>
              
              {/* Animated top border line */}
              <div className="absolute top-0 left-0 h-[2px] w-0 bg-[var(--color-signal)] transition-all duration-500 group-hover:w-full shadow-[0_0_10px_var(--color-signal)]"></div>

              <div className="relative mb-8 inline-flex h-14 w-14 items-center justify-center rounded-xl border border-[var(--color-charcoal)] bg-[var(--color-abyss)] shadow-inner transition-all duration-500 group-hover:border-[var(--color-signal)]/50 group-hover:bg-[var(--color-signal)]/10 group-hover:scale-110">
                <f.icon className="h-6 w-6 text-[var(--color-steel)] transition-colors duration-500 group-hover:text-[var(--color-signal)] drop-shadow-[0_0_8px_rgba(0,217,146,0)] group-hover:drop-shadow-[0_0_8px_rgba(0,217,146,0.5)]" />
              </div>
              
              <h3 className="relative mb-4 font-sans text-xl font-bold text-[var(--color-snow)] tracking-tight transition-colors group-hover:text-white">
                {f.title}
              </h3>
              
              <p className="relative font-sans text-sm text-[var(--color-steel)] leading-[1.7] flex-1 group-hover:text-[var(--color-parchment)] transition-colors">
                {f.desc}
              </p>
              
              {/* Hidden Call-to-Action that slides in on hover */}
              <div className="mt-8 flex items-center font-mono text-[10px] font-semibold uppercase tracking-widest text-[var(--color-signal)] opacity-0 transition-all duration-500 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0">
                Initialize Module <ArrowRight className="ml-2 h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Developer API Mockup ── */}
      <section className={`mb-20 max-w-4xl mx-auto rounded-xl border border-[var(--color-charcoal)] bg-[var(--color-carbon)] overflow-hidden shadow-[var(--shadow-ambient)] reveal-up ${apiReveal.visible ? 'visible' : ''}`} ref={apiReveal.ref}>
        <div className="flex flex-col md:flex-row">
          <div className="p-10 flex-1 border-b md:border-b-0 md:border-r border-[var(--color-charcoal)]">
            <div className="inline-flex items-center gap-2 rounded border border-[var(--color-charcoal)] bg-[var(--color-abyss)] px-3 py-1 mb-6">
              <Code className="h-4 w-4 text-[var(--color-snow)]" />
              <span className="font-mono text-[10px] font-bold text-[var(--color-snow)] uppercase tracking-widest">Developer Rest API</span>
            </div>
            <h3 className="font-display text-3xl text-[var(--color-snow)] mb-4">Integrate Security Anywhere.</h3>
            <p className="text-[var(--color-parchment)] mb-8">Access the ScamShield AI engine directly via our low-latency REST API to protect your own platforms and communication channels.</p>
            <Link to="/scan" className="inline-flex items-center font-mono text-sm text-[var(--color-signal)] hover:text-[var(--color-mint)] transition-colors underline underline-offset-4">
              READ DOCUMENTATION <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          
          <div className="flex-1 bg-[#030303] p-6 relative">
            <div className="flex items-center justify-between mb-4 border-b border-[var(--color-charcoal)] pb-3">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="h-3 w-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
              </div>
              <span className="font-mono text-[10px] text-[var(--color-steel)]">bash</span>
            </div>
            
            <pre className="font-mono text-xs text-[var(--color-parchment)] whitespace-pre-wrap leading-[1.8]">
              <span className="text-pink-400">curl</span> -X POST https://api.scamshield.io/v1/scan \<br/>
              <span className="text-yellow-300">  -H</span> <span className="text-green-300">"Authorization: Bearer YOUR_API_KEY"</span> \<br/>
              <span className="text-yellow-300">  -H</span> <span className="text-green-300">"Content-Type: application/json"</span> \<br/>
              <span className="text-yellow-300">  -d</span> <span className="text-cyan-300">'{'{"type": "url", "payload": "https://suspicious-link.com"}'}'</span>
            </pre>

            <button 
              onClick={copyApiCommand}
              className="absolute top-6 right-6 flex items-center justify-center rounded border border-[var(--color-charcoal)] bg-[var(--color-abyss)] p-2 text-[var(--color-steel)] hover:text-[var(--color-snow)] hover:border-[var(--color-steel)] transition-all"
              title="Copy snippet"
            >
              {apiCopied ? <Check className="h-4 w-4 text-[var(--color-signal)]" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </section>

      {/* ── Supported Platforms Marquee (Bottom) ── */}
      <section className="overflow-hidden border-y border-[var(--color-charcoal)] bg-[var(--color-carbon)]/50 py-10 relative -mx-4 sm:-mx-8">
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[var(--color-abyss)] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[var(--color-abyss)] to-transparent z-10 pointer-events-none"></div>
        
        <div className="flex overflow-hidden">
          <div className="flex items-center min-w-max w-[200%]" style={{ animation: 'slide-left 40s linear infinite' }}>
            {/* Duplicate 4 times for smooth infinity loop */}
            {[1, 2, 3, 4].map((set) => (
              <div key={set} className="flex gap-16 md:gap-24 items-center px-8 md:px-12">
                <div className="flex items-center gap-3 text-[#666]"><MessageCircle className="h-6 w-6"/><span className="font-sans font-bold text-lg md:text-xl tracking-wider">WhatsApp</span></div>
                <div className="flex items-center gap-3 text-[#666]"><Send className="h-6 w-6"/><span className="font-sans font-bold text-lg md:text-xl tracking-wider">Telegram</span></div>
                <div className="flex items-center gap-3 text-[#666]"><MessageSquare className="h-6 w-6"/><span className="font-sans font-bold text-lg md:text-xl tracking-wider">Discord</span></div>
                <div className="flex items-center gap-3 text-[#666]"><Hash className="h-6 w-6"/><span className="font-sans font-bold text-lg md:text-xl tracking-wider">Slack</span></div>
                <div className="flex items-center gap-3 text-[#666]"><Mail className="h-6 w-6"/><span className="font-sans font-bold text-lg md:text-xl tracking-wider">Gmail & Outlook</span></div>
                <div className="flex items-center gap-3 text-[#666]"><Smartphone className="h-6 w-6"/><span className="font-sans font-bold text-lg md:text-xl tracking-wider">SMS / Cellular</span></div>
                <div className="flex items-center gap-3 text-[#666]"><Globe className="h-6 w-6"/><span className="font-sans font-bold text-lg md:text-xl tracking-wider">Web Browsers</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
