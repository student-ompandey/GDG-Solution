import { useState, useRef } from 'react';
import { Link2, MessageSquare, QrCode, Image, Search, Upload, X, RotateCcw, Languages, Eye, FileText, Link as LinkIcon } from 'lucide-react';
import { scanUrl, scanMessage, scanQr, scanImage } from '../services/api';
import ResultCard from '../components/ResultCard';
import Spinner from '../components/Spinner';

const tabs = [
  { id: 'url',     label: 'URL',     icon: Link2 },
  { id: 'message', label: 'Message', icon: MessageSquare },
  { id: 'qr',      label: 'QR Code', icon: QrCode },
  { id: 'image',   label: 'Image',   icon: Image },
];

// Keywords to highlight in OCR text
const SUSPICIOUS_WORDS = ['won', 'otp', 'urgent', 'reward', 'claim', 'click', 'free', 'winner', 'prize', 'lottery', 'congratulations', 'verify', 'account', 'suspended', 'locked', 'bank', 'credit', 'debit', 'upi', 'pin', 'cvv', 'aadhar', 'password', 'limited', 'offer', 'hurry', 'immediately', 'expires'];

/**
 * Highlight suspicious words inside OCR text.
 * Returns an array of React elements.
 */
function highlightText(text) {
  if (!text) return null;
  const regex = new RegExp(`\\b(${SUSPICIOUS_WORDS.join('|')})\\b`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) => {
    if (SUSPICIOUS_WORDS.includes(part.toLowerCase())) {
      return (
        <mark key={i} className="rounded bg-amber-500/25 px-1 py-0.5 text-amber-300 font-semibold">
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
  const isFileTab = activeTab === 'qr' || activeTab === 'image';

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Scan for Threats</h1>
        <p className="mt-2 text-sm text-slate-400">Upload → Preview → Scan → Result → Explanation</p>
      </div>

      {/* Step Indicator */}
      <div className="mb-6 flex items-center justify-center gap-2 text-xs text-slate-500">
        <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 font-medium transition-colors ${!result && !loading ? 'bg-indigo-500/15 text-indigo-400' : 'text-slate-500'}`}>
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-400">1</span>
          Upload
        </span>
        <span className="text-slate-600">→</span>
        <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 font-medium transition-colors ${file && !loading && !result ? 'bg-indigo-500/15 text-indigo-400' : 'text-slate-500'}`}>
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-400">2</span>
          Preview
        </span>
        <span className="text-slate-600">→</span>
        <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 font-medium transition-colors ${loading ? 'bg-indigo-500/15 text-indigo-400' : 'text-slate-500'}`}>
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-400">3</span>
          Scan
        </span>
        <span className="text-slate-600">→</span>
        <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 font-medium transition-colors ${result ? 'bg-emerald-500/15 text-emerald-400' : 'text-slate-500'}`}>
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">4</span>
          Result
        </span>
      </div>

      {/* Tab Bar */}
      <div className="mb-6 flex rounded-xl border border-white/5 bg-white/[0.02] p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => switchTab(t.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 ${
              activeTab === t.id
                ? 'bg-indigo-500/15 text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <t.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Input Area Card */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
        {(activeTab === 'url' || activeTab === 'message') ? (
          <div className="relative">
            {activeTab === 'url' ? (
              <input
                type="url"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter a URL to scan (e.g., https://suspicious-site.xyz/login)"
                className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3.5 pr-10 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
              />
            ) : (
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Paste a suspicious SMS or WhatsApp message here..."
                rows={5}
                className="w-full resize-none rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
              />
            )}
            {input && (
              <button onClick={() => setInput('')} className="absolute right-3 top-3.5 text-slate-500 hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div
              className={`flex w-full cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all duration-200 ${
                file
                  ? 'border-indigo-500/30 bg-indigo-500/5'
                  : 'border-white/10 bg-slate-800/30 hover:border-indigo-500/30 hover:bg-slate-800/50'
              }`}
              onClick={() => fileRef.current?.click()}
            >
              {file ? (
                <div className="flex flex-col items-center">
                  {/* Live Preview */}
                  <div className="relative mb-3 group">
                    <div className="h-36 w-36 overflow-hidden rounded-xl border border-white/10 shadow-xl transition-transform duration-300 group-hover:scale-105">
                      <img src={URL.createObjectURL(file)} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-white truncate max-w-[220px]">{file.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  {/* Helper text */}
                  <p className="mt-3 text-xs text-slate-400 text-center max-w-[280px]">
                    Preview your file before scanning to ensure correct analysis
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-slate-500 mb-2" />
                  <p className="text-sm text-slate-400">Click to upload {activeTab === 'qr' ? 'QR code' : 'an'} image</p>
                  <p className="text-xs text-slate-600 mt-1">PNG, JPG, WEBP up to 5MB</p>
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
              <button onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ''; }} className="text-xs text-slate-500 hover:text-red-400 transition-colors">
                Remove file
              </button>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={reset}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Clear
            </button>
            <div className="h-4 w-px bg-white/10 mx-1"></div>
            <button
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${lang === 'hi' ? 'bg-indigo-500/15 text-indigo-400' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}`}
              title="Translate output to Hindi"
            >
              <Languages className="h-3.5 w-3.5" />
              {lang === 'hi' ? 'Hindi Output' : 'English Output'}
            </button>
          </div>

          <button
            onClick={handleScan}
            disabled={!canScan() || loading}
            className="flex w-full sm:w-auto justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Search className="h-4 w-4" />
            {loading ? 'Scanning...' : 'Scan Now'}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && <Spinner text={`Analyzing ${activeTab === 'qr' ? 'QR code' : activeTab} for potential scams...`} />}

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* QR Decoded Data Card */}
      {result && !loading && result.type === 'qr' && decodedData && (
        <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5 transition-all duration-500">
          <div className="flex items-center gap-2 mb-3">
            <LinkIcon className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-cyan-300">QR Code Decoded Content</h3>
            <span className="ml-auto rounded-full bg-cyan-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-300 uppercase ring-1 ring-cyan-500/30">
              {contentType || 'text'}
            </span>
          </div>
          <div className="rounded-lg bg-slate-900/60 p-3 ring-1 ring-white/5">
            <p className="text-sm text-slate-200 break-all font-mono">{decodedData}</p>
          </div>
          {contentType === 'url' && (
            <p className="mt-2 text-xs text-cyan-400/70">⚠️ This QR code contains a URL — the destination was hidden before scanning</p>
          )}
        </div>
      )}

      {/* OCR Extracted Text Card */}
      {result && !loading && result.type === 'image' && extractedText && (
        <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 transition-all duration-500">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-amber-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-300">Detected Text (OCR)</h3>
            <span className="ml-auto text-[10px] text-amber-400/60">{extractedText.length} characters</span>
          </div>
          <div className="max-h-48 overflow-y-auto rounded-lg bg-slate-900/60 p-4 ring-1 ring-white/5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-[system-ui]">
              {highlightText(extractedText)}
            </p>
          </div>
          <p className="mt-2 text-xs text-amber-400/60">
            Suspicious words are <mark className="rounded bg-amber-500/25 px-1 py-0.5 text-amber-300 text-[10px]">highlighted</mark> for your reference
          </p>
        </div>
      )}

      {/* Result Card */}
      {result && !loading && <ResultCard result={result} requestedLang={lang} />}
    </div>
  );
}
