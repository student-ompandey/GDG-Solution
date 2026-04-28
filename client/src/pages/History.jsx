import { useState, useEffect } from 'react';
import { Clock, Shield, Filter, AlertTriangle, CheckCircle, XCircle, Terminal } from 'lucide-react';
import { getHistory } from '../services/api';

const filterOptions = [
  { id: 'all', label: 'ALL_SCANS' },
  { id: 'dangerous', label: 'HIGH_RISK' },
  { id: 'suspicious', label: 'SUSPICIOUS' },
  { id: 'safe', label: 'SAFE' },
];

const riskBadge = (result) => {
  const m = {
    safe:       { bg: 'bg-[var(--color-abyss)]', text: 'text-[var(--color-signal)]', border: 'border-[var(--color-signal)]/30', icon: CheckCircle, label: 'SAFE' },
    suspicious: { bg: 'bg-orange-500/5',  text: 'text-orange-400',  border: 'border-orange-500/30',  icon: AlertTriangle, label: 'SUSPICIOUS' },
    dangerous:  { bg: 'bg-red-500/5',     text: 'text-red-400',     border: 'border-red-500/30',     icon: XCircle, label: 'HIGH_RISK' },
  };
  return m[result] || m.safe;
};

const typeBadge = (type) => {
  const m = { url: '🔗', message: '💬', qr: '📱', image: '🖼️' };
  return m[type] || '📄';
};

export default function History() {
  const [scans, setScans] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [filter]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter !== 'all') params.result = filter;
      params.limit = 50;
      const res = await getHistory(params);
      setScans(res.data?.data?.scans || []);
    } catch {
      setScans([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-[var(--color-charcoal)] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 mb-2">
            <Terminal className="h-5 w-5 text-[var(--color-signal)]" />
            <h1 className="font-display text-3xl font-normal text-[var(--color-snow)] tracking-tight">Access Logs</h1>
          </div>
          <p className="font-mono text-xs text-[var(--color-steel)] tracking-widest uppercase">Query historical scan records</p>
        </div>

        {/* Filter */}
        <div className="flex gap-1">
          {filterOptions.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded border px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-widest transition-all ${
                filter === f.id ? 'bg-[var(--color-carbon)] border-[var(--color-signal)] text-[var(--color-signal)] shadow-[var(--shadow-ambient)]' : 'bg-transparent border-[var(--color-charcoal)] text-[var(--color-steel)] hover:text-[var(--color-snow)] hover:border-[var(--color-steel)]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-charcoal)] border-t-[var(--color-signal)]" />
        </div>
      ) : scans.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded border border-[var(--color-charcoal)] bg-[var(--color-carbon)]">
            <Clock className="h-7 w-7 text-[var(--color-steel)]" />
          </div>
          <div>
            <p className="font-mono text-sm font-bold text-[var(--color-steel)] uppercase tracking-widest">No Records Found</p>
            <p className="mt-2 font-mono text-xs text-[var(--color-charcoal)]">Execute a scan to generate history</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {scans.map((scan) => {
            const badge = riskBadge(scan.result);
            const Icon = badge.icon;
            return (
              <div
                key={scan._id}
                className="group flex flex-col sm:flex-row sm:items-center gap-4 rounded border border-[var(--color-charcoal)] bg-[var(--color-carbon)] p-4 transition-all hover:border-[var(--color-steel)] hover:shadow-[var(--shadow-ambient)]"
              >
                {/* Type emoji */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-[var(--color-charcoal)] bg-[var(--color-abyss)] text-lg">
                  {typeBadge(scan.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="truncate font-mono text-[13px] text-[var(--color-snow)]">
                    {scan.input}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[10px] text-[var(--color-steel)] tracking-widest">
                    <span className="uppercase border border-[var(--color-charcoal)] px-1.5 py-0.5 rounded bg-[var(--color-abyss)]">TYPE:{scan.type}</span>
                    <span>{new Date(scan.createdAt).toLocaleDateString()}</span>
                    <span>{new Date(scan.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* Risk score */}
                <div className="flex items-center gap-4 mt-2 sm:mt-0 pl-14 sm:pl-0">
                  <div className="text-center">
                    <span className="font-mono text-lg font-bold text-[var(--color-snow)] block leading-none">{scan.riskScore}</span>
                    <span className="font-mono text-[9px] text-[var(--color-steel)] tracking-widest block mt-0.5">SCORE</span>
                  </div>
                  <span className={`inline-flex min-w-[100px] justify-center items-center gap-1.5 rounded border px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest ${badge.bg} ${badge.text} ${badge.border}`}>
                    <Icon className="h-3 w-3" />
                    {badge.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
