import { useState, useEffect } from 'react';
import { getReports, getTrendingReports } from '../services/api';
import { Link2, MessageSquare, QrCode, Image, Flame, AlertTriangle, ChevronDown, Users, TrendingUp, Clock, Filter, ShieldAlert, Volume2 } from 'lucide-react';

const TYPE_META = {
  url:     { icon: Link2, label: 'URL', color: 'text-cyan-400', border: 'border-cyan-500/30' },
  message: { icon: MessageSquare, label: 'MESSAGE', color: 'text-purple-400', border: 'border-purple-500/30' },
  qr:      { icon: QrCode, label: 'QR_CODE', color: 'text-amber-400', border: 'border-amber-500/30' },
  image:   { icon: Image, label: 'IMAGE', color: 'text-pink-400', border: 'border-pink-500/30' },
  audio:   { icon: Volume2, label: 'AUDIO', color: 'text-teal-400', border: 'border-teal-500/30' },
};

const RISK_BADGE = {
  safe:     { text: 'text-[var(--color-signal)]', bg: 'bg-[var(--color-signal)]/10', border: 'border-[var(--color-signal)]/30', label: 'SAFE' },
  low:      { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', label: 'LOW' },
  medium:   { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', label: 'MEDIUM' },
  high:     { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'HIGH' },
  critical: { text: 'text-red-500', bg: 'bg-red-600/10', border: 'border-red-600/30', label: 'CRITICAL' },
};

export default function Reports() {
  const [trending, setTrending] = useState([]);
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(true);

  useEffect(() => {
    fetchTrending();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [page, typeFilter]);

  const fetchTrending = async () => {
    setTrendingLoading(true);
    try {
      const { data } = await getTrendingReports(10);
      setTrending(data.data || []);
    } catch (err) {
      console.error('Failed to fetch trending:', err);
    } finally {
      setTrendingLoading(false);
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (typeFilter) params.type = typeFilter;
      const { data } = await getReports(params);
      setReports(data.data?.reports || []);
      setTotal(data.data?.total || 0);
      setTotalPages(data.data?.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const truncate = (str, len = 80) => {
    if (!str) return '—';
    return str.length > len ? str.slice(0, len) + '...' : str;
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-8 pt-12 pb-32">
      
      {/* ── Page Header ── */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded border border-[var(--color-charcoal)] bg-[var(--color-carbon)] shadow-[0_0_12px_rgba(0,217,146,0.1)]">
            <Users className="h-5 w-5 text-[var(--color-signal)]" />
          </div>
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-normal text-[var(--color-snow)] tracking-[-0.9px]">
              Community <span className="text-[var(--color-signal)]">Reports</span>
            </h1>
          </div>
        </div>
        <p className="font-mono text-sm text-[var(--color-steel)] uppercase tracking-widest">
          Crowd-sourced threat intelligence feed — {total} total reports
        </p>
      </div>

      {/* ── Trending Scams ── */}
      <section className="mb-16">
        <div className="flex items-center gap-2 mb-6">
          <Flame className="h-5 w-5 text-orange-400" />
          <h2 className="font-mono text-sm font-bold text-[var(--color-snow)] uppercase tracking-widest">Trending_Threats</h2>
          <span className="ml-auto font-mono text-[10px] text-[var(--color-steel)] uppercase tracking-widest">TOP {trending.length} MOST REPORTED</span>
        </div>

        {trendingLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-36 rounded-lg border border-[var(--color-charcoal)] bg-[var(--color-carbon)] animate-pulse"></div>
            ))}
          </div>
        ) : trending.length === 0 ? (
          <div className="rounded-lg border border-[var(--color-charcoal)] bg-[var(--color-carbon)] p-12 text-center">
            <ShieldAlert className="h-8 w-8 text-[var(--color-steel)] mx-auto mb-3" />
            <p className="font-mono text-sm text-[var(--color-steel)] uppercase tracking-widest">No trending threats yet</p>
            <p className="font-sans text-sm text-[var(--color-parchment)] mt-2">Be the first to report a scam from the scan results.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trending.map((r, i) => {
              const tmeta = TYPE_META[r.type] || TYPE_META.message;
              const rbadge = RISK_BADGE[r.riskLevel] || RISK_BADGE.medium;
              const TypeIcon = tmeta.icon;
              return (
                <div 
                  key={r._id || i}
                  className="group rounded-lg border border-[var(--color-charcoal)] bg-[var(--color-carbon)] p-5 transition-all duration-300 hover:border-orange-500/40 hover:shadow-[0_0_20px_rgba(249,115,22,0.08)] relative overflow-hidden"
                >
                  {/* Hot badge for top 3 */}
                  {i < 3 && (
                    <div className="absolute top-0 right-0 bg-orange-500/20 border-l border-b border-orange-500/30 px-2.5 py-1 rounded-bl-lg">
                      <span className="font-mono text-[9px] font-bold text-orange-400 uppercase tracking-widest">#{i + 1} HOT</span>
                    </div>
                  )}

                  {/* Header Row */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded border ${tmeta.border} bg-[var(--color-abyss)]`}>
                      <TypeIcon className={`h-4 w-4 ${tmeta.color}`} />
                    </div>
                    <span className={`font-mono text-[10px] font-bold uppercase tracking-widest ${tmeta.color}`}>{tmeta.label}</span>
                    <span className={`ml-auto inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest ${rbadge.border} ${rbadge.text} ${rbadge.bg}`}>
                      {rbadge.label}
                    </span>
                  </div>

                  {/* Content */}
                  <p className="font-mono text-xs text-[var(--color-parchment)] leading-relaxed mb-4 min-h-[2.5rem]">
                    {truncate(r.content, 100)}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-[var(--color-charcoal)] pt-3">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-3 w-3 text-orange-400" />
                      <span className="font-mono text-[10px] font-bold text-orange-400 uppercase tracking-widest">
                        {r.reportCount}× REPORTED
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[var(--color-steel)] uppercase tracking-widest">
                      SCORE:{r.riskScore}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── All Reports (Filterable) ── */}
      <section>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[var(--color-steel)]" />
            <h2 className="font-mono text-sm font-bold text-[var(--color-snow)] uppercase tracking-widest">All_Reports</h2>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-[var(--color-steel)]" />
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                className="appearance-none rounded-md border border-[var(--color-charcoal)] bg-[var(--color-abyss)] px-4 py-2 pr-8 text-xs font-mono font-bold text-[var(--color-snow)] uppercase tracking-widest focus:outline-none focus:border-[var(--color-signal)]/50 transition-colors cursor-pointer"
              >
                <option value="">ALL_TYPES</option>
                <option value="url">URL</option>
                <option value="message">MESSAGE</option>
                <option value="qr">QR_CODE</option>
                <option value="image">IMAGE</option>
                <option value="audio">AUDIO</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-steel)] pointer-events-none" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-44 rounded-lg border border-[var(--color-charcoal)] bg-[var(--color-carbon)] animate-pulse"></div>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-lg border border-[var(--color-charcoal)] bg-[var(--color-carbon)] p-16 text-center">
            <AlertTriangle className="h-8 w-8 text-[var(--color-steel)] mx-auto mb-3" />
            <p className="font-mono text-sm text-[var(--color-steel)] uppercase tracking-widest">No reports found</p>
            <p className="font-sans text-sm text-[var(--color-parchment)] mt-2">
              {typeFilter ? `No "${typeFilter}" reports yet. Try a different filter.` : 'Community reports will appear here once users start reporting scams.'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reports.map((r, i) => {
                const tmeta = TYPE_META[r.type] || TYPE_META.message;
                const rbadge = RISK_BADGE[r.riskLevel] || RISK_BADGE.medium;
                const TypeIcon = tmeta.icon;
                return (
                  <div
                    key={r._id || i}
                    className="rounded-lg border border-[var(--color-charcoal)] bg-[var(--color-carbon)] p-5 transition-all duration-300 hover:border-[var(--color-signal)]/30 hover:shadow-[var(--shadow-ambient)]"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded border ${tmeta.border} bg-[var(--color-abyss)]`}>
                        <TypeIcon className={`h-4 w-4 ${tmeta.color}`} />
                      </div>
                      <span className={`font-mono text-[10px] font-bold uppercase tracking-widest ${tmeta.color}`}>{tmeta.label}</span>
                      <span className={`ml-auto inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest ${rbadge.border} ${rbadge.text} ${rbadge.bg}`}>
                        {rbadge.label}
                      </span>
                    </div>

                    {/* Content */}
                    <p className="font-mono text-xs text-[var(--color-parchment)] leading-relaxed mb-3 min-h-[2rem]">
                      {truncate(r.content)}
                    </p>

                    {/* Signals preview */}
                    {r.signals && r.signals.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {r.signals.slice(0, 3).map((s, si) => (
                          <span key={si} className="rounded border border-[var(--color-charcoal)] bg-[var(--color-abyss)] px-1.5 py-0.5 text-[9px] font-mono font-bold text-[var(--color-steel)] uppercase tracking-widest">
                            {s}
                          </span>
                        ))}
                        {r.signals.length > 3 && (
                          <span className="rounded border border-[var(--color-charcoal)] bg-[var(--color-abyss)] px-1.5 py-0.5 text-[9px] font-mono font-bold text-[var(--color-steel)] uppercase tracking-widest">
                            +{r.signals.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-[var(--color-charcoal)] pt-3">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3 w-3 text-[var(--color-signal)]" />
                        <span className="font-mono text-[10px] font-bold text-[var(--color-signal)] uppercase tracking-widest">
                          {r.reportCount}× REPORTED
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-[var(--color-steel)] uppercase tracking-widest">
                        SCORE:{r.riskScore}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded border border-[var(--color-charcoal)] bg-[var(--color-abyss)] px-4 py-2 text-xs font-mono font-bold text-[var(--color-snow)] uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--color-carbon)] transition-colors"
                >
                  ← PREV
                </button>
                <span className="font-mono text-xs text-[var(--color-steel)] uppercase tracking-widest">
                  PAGE {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded border border-[var(--color-charcoal)] bg-[var(--color-abyss)] px-4 py-2 text-xs font-mono font-bold text-[var(--color-snow)] uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--color-carbon)] transition-colors"
                >
                  NEXT →
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
