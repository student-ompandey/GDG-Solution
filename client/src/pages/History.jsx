import { useState, useEffect } from 'react';
import { Clock, Shield, Filter, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { getHistory } from '../services/api';

const filterOptions = [
  { id: 'all', label: 'All Scans' },
  { id: 'dangerous', label: 'Scam' },
  { id: 'suspicious', label: 'Suspicious' },
  { id: 'safe', label: 'Safe' },
];

const riskBadge = (result) => {
  const m = {
    safe:       { bg: 'bg-emerald-500/10', text: 'text-emerald-400', ring: 'ring-emerald-500/30', icon: CheckCircle, label: 'Safe' },
    suspicious: { bg: 'bg-orange-500/10',  text: 'text-orange-400',  ring: 'ring-orange-500/30',  icon: AlertTriangle, label: 'Suspicious' },
    dangerous:  { bg: 'bg-red-500/10',     text: 'text-red-400',     ring: 'ring-red-500/30',     icon: XCircle, label: 'Dangerous' },
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
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Scan History</h1>
          <p className="mt-1 text-sm text-slate-400">View your previous scam detection analyses</p>
        </div>

        {/* Filter */}
        <div className="flex rounded-xl border border-white/5 bg-white/[0.02] p-1">
          {filterOptions.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                filter === f.id ? 'bg-indigo-500/15 text-indigo-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-500" />
        </div>
      ) : scans.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/5">
            <Clock className="h-7 w-7 text-slate-600" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-400">No scan history yet</p>
            <p className="mt-1 text-sm text-slate-600">Start scanning to build your history</p>
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
                className="group flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 transition-all hover:border-white/10 hover:bg-white/[0.04]"
              >
                {/* Type emoji */}
                <span className="text-2xl">{typeBadge(scan.type)}</span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {scan.input}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="uppercase">{scan.type}</span>
                    <span>•</span>
                    <span>{new Date(scan.createdAt).toLocaleDateString()}</span>
                    <span>{new Date(scan.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* Risk score */}
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-white">{scan.riskScore}</span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${badge.bg} ${badge.text} ${badge.ring}`}>
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
