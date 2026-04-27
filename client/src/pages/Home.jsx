import { Link } from 'react-router-dom';
import { Shield, Link2, MessageSquare, QrCode, Image, ArrowRight, Zap, Lock, Eye } from 'lucide-react';

const features = [
  { icon: Link2, title: 'URL Scanner', desc: 'Detect phishing links, IP-based URLs, and suspicious redirects in real time.', color: 'from-blue-500 to-cyan-500' },
  { icon: MessageSquare, title: 'Message Scanner', desc: 'Analyse SMS & WhatsApp messages for scam keywords, urgency tactics, and fraud patterns.', color: 'from-purple-500 to-pink-500' },
  { icon: QrCode, title: 'QR Scanner', desc: 'Upload QR code images to decode hidden URLs and check them for threats.', color: 'from-orange-500 to-red-500' },
  { icon: Image, title: 'Image Scanner', desc: 'Extract text from images via OCR and detect scam content automatically.', color: 'from-emerald-500 to-teal-500' },
];

const stats = [
  { icon: Zap, label: 'Real-time Analysis', value: '< 2s' },
  { icon: Lock, label: 'Detection Signals', value: '30+' },
  { icon: Eye, label: 'Threat Categories', value: '8' },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Hero */}
      <section className="flex flex-col items-center py-20 text-center sm:py-28">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-400">
          <Shield className="h-3.5 w-3.5" />
          AI-Powered Scam Detection
        </div>

        <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
          Protect Yourself from{' '}
          <span className="gradient-text">Online Scams</span>
        </h1>

        <p className="mt-5 max-w-xl text-lg text-slate-400">
          Scan links, messages, QR codes, and images to detect fraud instantly.
          Powered by advanced heuristics and AI classification.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/scan"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02]"
          >
            Start Scanning
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="/api/docs"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-semibold text-slate-300 transition-all hover:bg-white/10 hover:text-white"
          >
            API Documentation
          </a>
        </div>
      </section>

      {/* Stats */}
      <section className="mb-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5 backdrop-blur">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10">
              <s.icon className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Feature Cards */}
      <section className="mb-20">
        <h2 className="mb-8 text-center text-2xl font-bold text-white sm:text-3xl">
          What Can You Scan?
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {features.map((f, i) => (
            <Link
              key={i}
              to="/scan"
              className="group rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04] hover:shadow-xl"
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} shadow-lg transition-transform group-hover:scale-110`}>
                <f.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-white">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
