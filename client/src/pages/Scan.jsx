import { useState, useRef } from 'react';
import { Link2, MessageSquare, QrCode, Image as ImageIcon, Search, Upload, X, RotateCcw, Languages, Eye, FileText, Link as LinkIcon, Terminal } from 'lucide-react';
import { scanUrl, scanMessage, scanQr, scanImage } from '../services/api';
import ResultCard from '../components/ResultCard';
import Spinner from '../components/Spinner';

const tabs = [
  { id: 'url',     label: 'URL',     icon: Link2 },
  { id: 'message', label: 'Message', icon: MessageSquare },
  { id: 'qr',      label: 'QR Code', icon: QrCode },
  { id: 'image',   label: 'Image',   icon: ImageIcon },
];

// Keywords to highlight in OCR text
const SUSPICIOUS_WORDS = ['won', 'otp', 'urgent', 'reward', 'claim', 'click', 'free', 'winner', 'prize', 'lottery', 'congratulations', 'verify', 'account', 'suspended', 'locked', 'bank', 'credit', 'debit', 'upi', 'pin', 'cvv', 'aadhar', 'password', 'limited', 'offer', 'hurry', 'immediately', 'expires'];

/**
 * Highlight suspicious words inside OCR text.
 */
function highlightText(text) {
  if (!text) return null;
  const regex = new RegExp(`\\b(${SUSPICIOUS_WORDS.join('|')})\\b`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) => {
    if (SUSPICIOUS_WORDS.includes(part.toLowerCase())) {
      return (
        <mark key={i} className="rounded bg-amber-500/10 border border-amber-500/30 px-1 py-0.5 text-amber-400 font-mono text-[13px]">
          {part}
        </mark>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function Scan({ setLatestScan }) {
  const [activeTab, setActiveTab] = useState('url');
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [lang, setLang] = useState('en');
  const fileRef = useRef(null);

  const reset = () => {
    setInput('');
    setFile(null);
    setResult(null);
    setError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const switchTab = (id) => {
    reset();
    setActiveTab(id);
  };

  const canScan = () => {
    if (activeTab === 'url' || activeTab === 'message') return input.trim().length > 0;
    return file !== null;
  };

  const handleScan = async () => {
    if (!canScan()) return;
    setLoading(true);
    setResult(null);
    setError('');

    try {
      let res;
      switch (activeTab) {
        case 'url':     res = await scanUrl(input, lang); break;
        case 'message': res = await scanMessage(input, lang); break;
        case 'qr':      res = await scanQr(file, lang); break;
        case 'image':   res = await scanImage(file, lang); break;
      }
      setResult(res.data);
      if (setLatestScan) setLatestScan(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && canScan() && !loading) {
      e.preventDefault();
      handleScan();
    }
  };

  // Extracted data helpers
  const extractedText = result?.details?.extractedText;
  const decodedData = result?.details?.decodedData;
  const contentType = result?.details?.contentType;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Page Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-4">
          <Terminal className="h-5 w-5 text-[var(--color-signal)]" />
          <h1 className="font-display text-4xl font-normal text-[var(--color-snow)] tracking-tight">Threat Analysis</h1>
        </div>
        <p className="text-[var(--color-steel)] font-mono text-sm tracking-tight">System Workflow: Upload → Preview → Scan → Compile Results</p>
      </div>

      {/* Step Indicator (Terminal Style) */}
      <div className="mb-8 flex items-center justify-center gap-3 text-xs font-mono text-[var(--color-steel)]">
        <span className={`flex items-center gap-2 px-2 py-1 transition-colors ${!result && !loading ? 'text-[var(--color-signal)]' : 'opacity-50'}`}>
          <span className="opacity-50">[1]</span> UPLOAD
        </span>
        <span className="opacity-30">→</span>
        <span className={`flex items-center gap-2 px-2 py-1 transition-colors ${file && !loading && !result ? 'text-[var(--color-signal)]' : 'opacity-50'}`}>
          <span className="opacity-50">[2]</span> PREVIEW
        </span>
        <span className="opacity-30">→</span>
        <span className={`flex items-center gap-2 px-2 py-1 transition-colors ${loading ? 'text-[var(--color-signal)] animate-pulse' : 'opacity-50'}`}>
          <span className="opacity-50">[3]</span> SCANNING
        </span>
        <span className="opacity-30">→</span>
        <span className={`flex items-center gap-2 px-2 py-1 transition-colors ${result ? 'text-[var(--color-mint)]' : 'opacity-50'}`}>
          <span className="opacity-50">[4]</span> RESULTS
        </span>
      </div>

      {/* Tab Bar */}
      <div className="mb-6 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => switchTab(t.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-3 text-sm font-medium transition-all duration-200 border ${
              activeTab === t.id
                ? 'border-[var(--color-signal)] bg-[var(--color-carbon)] text-[var(--color-signal)] shadow-[var(--shadow-ambient)]'
                : 'border-[var(--color-charcoal)] bg-transparent text-[var(--color-parchment)] hover:border-[var(--color-steel)] hover:text-[var(--color-snow)]'
            }`}
          >
            <t.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Input Area Card */}
      <div className="rounded-lg border border-[var(--color-charcoal)] bg-[var(--color-carbon)] p-6 shadow-[var(--shadow-ambient)]">
        {(activeTab === 'url' || activeTab === 'message') ? (
          <div className="relative">
            {activeTab === 'url' ? (
              <input
                type="url"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="https://suspicious-site.xyz/login"
                className="w-full rounded-md border border-[var(--color-charcoal)] bg-[var(--color-abyss)] px-4 py-4 pr-10 text-[15px] font-mono text-[var(--color-snow)] placeholder-[var(--color-steel)] outline-none transition-colors focus:border-[var(--color-signal)] focus:shadow-[0_0_8px_rgba(0,217,146,0.2)]"
              />
            ) : (
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Paste payload here..."
                rows={5}
                className="w-full resize-none rounded-md border border-[var(--color-charcoal)] bg-[var(--color-abyss)] px-4 py-4 text-[14px] font-mono text-[var(--color-snow)] placeholder-[var(--color-steel)] outline-none transition-colors focus:border-[var(--color-signal)] focus:shadow-[0_0_8px_rgba(0,217,146,0.2)]"
              />
            )}
            {input && (
              <button onClick={() => setInput('')} className="absolute right-3 top-4 text-[var(--color-steel)] hover:text-[var(--color-snow)] transition-colors">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div
              className={`flex w-full cursor-pointer flex-col items-center gap-4 rounded-md border border-dashed p-10 transition-all duration-200 ${
                file
                  ? 'border-[var(--color-signal)] bg-[var(--color-signal)]/5'
                  : 'border-[var(--color-charcoal)] bg-[var(--color-abyss)] hover:border-[var(--color-steel)] hover:bg-black/40'
              }`}
              onClick={() => fileRef.current?.click()}
            >
              {file ? (
                <div className="flex flex-col items-center">
                  <div className="relative mb-4 group">
                    <div className="h-40 w-40 overflow-hidden rounded-md border border-[var(--color-charcoal)] shadow-[var(--shadow-ambient)] transition-transform duration-300 group-hover:scale-105">
                      <img src={URL.createObjectURL(file)} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                      <Eye className="h-8 w-8 text-[var(--color-snow)]" />
                    </div>
                  </div>
                  <div className="text-center font-mono">
                    <p className="text-[13px] font-semibold text-[var(--color-snow)] truncate max-w-[220px]">{file.name}</p>
                    <p className="text-[11px] text-[var(--color-steel)] mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-[var(--color-steel)] mb-3" />
                  <p className="font-mono text-[13px] text-[var(--color-parchment)]">Select {activeTab === 'qr' ? 'QR block' : 'image file'}</p>
                  <p className="font-mono text-[11px] text-[var(--color-charcoal)] mt-2">JPG, PNG, WEBP (MAX 5MB)</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {file && (
              <button onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ''; }} className="font-mono text-xs text-red-400/80 hover:text-red-400 transition-colors">
                [ REMOVE_FILE ]
              </button>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={reset}
              className="flex items-center gap-1.5 rounded bg-transparent px-3 py-1.5 text-xs font-mono text-[var(--color-steel)] border border-[var(--color-charcoal)] transition-colors hover:bg-[var(--color-charcoal)] hover:text-[var(--color-snow)]"
            >
              <RotateCcw className="h-3 w-3" />
              CLEAR
            </button>
            <button
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-mono border transition-colors ${
                lang === 'hi' 
                  ? 'bg-[var(--color-signal)]/10 text-[var(--color-signal)] border-[var(--color-signal)]' 
                  : 'bg-transparent text-[var(--color-steel)] border-[var(--color-charcoal)] hover:bg-[var(--color-charcoal)] hover:text-[var(--color-snow)]'
              }`}
            >
              <Languages className="h-3 w-3" />
              {lang === 'hi' ? 'LANG:HI' : 'LANG:EN'}
            </button>
          </div>

          <button
            onClick={handleScan}
            disabled={!canScan() || loading}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-md border border-transparent bg-[var(--color-carbon)] px-8 py-2.5 font-medium text-[var(--color-mint)] ring-1 ring-[var(--color-signal)]/80 transition-all shadow-[0_0_10px_rgba(0,217,146,0.1)] hover:bg-black/20 hover:shadow-[0_0_15px_rgba(0,217,146,0.3)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-[0_0_10px_rgba(0,217,146,0.1)]"
          >
            <Search className="h-4 w-4" />
            {loading ? 'EXECUTING...' : 'INITIALIZE SCAN'}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && <Spinner text={`Executing heuristic analysis on ${activeTab}...`} />}

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-md border border-red-500/30 bg-red-500/5 p-4 text-sm font-mono text-red-400">
          <span className="font-bold">FATAL_ERROR:</span> {error}
        </div>
      )}

      {/* QR Decoded Data Card */}
      {result && !loading && result.type === 'qr' && decodedData && (
        <div className="mt-6 rounded-md border border-cyan-500/30 bg-cyan-500/5 p-5 shadow-[var(--shadow-ambient)]">
          <div className="flex items-center gap-2 mb-3 border-b border-cyan-500/20 pb-2">
            <LinkIcon className="h-4 w-4 text-cyan-400" />
            <h3 className="text-[11px] font-mono font-bold tracking-widest text-cyan-400 uppercase">DECODED_PAYLOAD</h3>
            <span className="ml-auto rounded bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-300 uppercase">
              TYPE:{contentType || 'TEXT'}
            </span>
          </div>
          <div className="rounded bg-[var(--color-abyss)] p-3 border border-[var(--color-charcoal)]">
            <p className="text-[13px] text-[var(--color-snow)] break-all font-mono">{decodedData}</p>
          </div>
          {contentType === 'url' && (
            <p className="mt-3 text-[11px] font-mono text-cyan-400/80 uppercase">
              // WARNING: Destination was obfuscated in matrix format
            </p>
          )}
        </div>
      )}

      {/* OCR Extracted Text Card */}
      {result && !loading && result.type === 'image' && extractedText && (
        <div className="mt-6 rounded-md border border-amber-500/30 bg-amber-500/5 p-5 shadow-[var(--shadow-ambient)]">
          <div className="flex items-center gap-2 mb-3 border-b border-amber-500/20 pb-2">
            <FileText className="h-4 w-4 text-amber-400" />
            <h3 className="text-[11px] font-mono font-bold tracking-widest text-amber-400 uppercase">OCR_EXTRACT</h3>
            <span className="ml-auto text-[10px] font-mono text-amber-400/60">LEN:{extractedText.length}</span>
          </div>
          <div className="max-h-48 overflow-y-auto rounded bg-[var(--color-abyss)] p-4 border border-[var(--color-charcoal)] scrollbar-thin">
            <p className="text-[13px] text-[var(--color-parchment)] leading-relaxed whitespace-pre-wrap font-mono">
              {highlightText(extractedText)}
            </p>
          </div>
          <p className="mt-3 text-[11px] font-mono text-amber-400/80 uppercase">
            // HIGHLIGHT_TARGETS: social_engineering_keywords
          </p>
        </div>
      )}

      {/* Result Card */}
      {result && !loading && <ResultCard result={result} requestedLang={lang} />}
    </div>
  );
}
