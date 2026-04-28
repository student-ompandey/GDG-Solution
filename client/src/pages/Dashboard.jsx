import { useState, useEffect } from 'react';
import { getDashboardData } from '../services/api';
import { Activity, ShieldCheck, AlertOctagon, BarChart3, TrendingUp, History } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// VoltAgent design tokens for charts
const COLORS = {
  safe: '#00d992',     // var(--color-signal)
  low: '#eab308',      // yellow-500
  medium: '#f97316',   // orange-500
  high: '#ef4444',     // red-500
  charcoal: '#1A1A24', // var(--color-charcoal)
  steel: '#64748b',    // var(--color-steel)
  snow: '#F4F4F6'      // var(--color-snow)
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await getDashboardData();
      setData(response.data.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-t-2 border-[var(--color-signal)] animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-b-2 border-[var(--color-steel)] animate-spin opacity-50" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="font-mono text-sm text-[var(--color-signal)] tracking-widest uppercase animate-pulse">Initializing_Telemetry...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Format data for charts
  const pieData = [
    { name: 'Safe', value: data.safeCount, color: COLORS.safe },
    { name: 'Scam', value: data.scamCount, color: COLORS.high }
  ];

  const barData = [
    { name: 'Safe', count: data.riskDistribution.safe, color: COLORS.safe },
    { name: 'Low Risk', count: data.riskDistribution.low, color: COLORS.low },
    { name: 'Medium Risk', count: data.riskDistribution.medium, color: COLORS.medium },
    { name: 'High Risk', count: data.riskDistribution.high, color: COLORS.high }
  ];

  // Custom tooltips for VoltAgent aesthetic
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded border border-[var(--color-charcoal)] bg-[var(--color-abyss)]/90 backdrop-blur p-3 shadow-[var(--shadow-ambient)]">
          <p className="font-mono text-xs text-[var(--color-steel)] uppercase tracking-widest mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="font-mono text-sm font-bold" style={{ color: entry.color || entry.payload?.color || COLORS.snow }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-8 pt-12 pb-32">
      {/* ── Page Header ── */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded border border-[var(--color-charcoal)] bg-[var(--color-carbon)] shadow-[0_0_12px_rgba(0,217,146,0.1)]">
            <Activity className="h-5 w-5 text-[var(--color-signal)]" />
          </div>
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-normal text-[var(--color-snow)] tracking-[-0.9px]">
              System <span className="text-[var(--color-signal)]">Telemetry</span>
            </h1>
          </div>
        </div>
        <p className="font-mono text-sm text-[var(--color-steel)] uppercase tracking-widest">
          Personal threat detection analytics & history
        </p>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid gap-6 sm:grid-cols-3 mb-12">
        {/* Total Scans */}
        <div className="rounded-lg border border-[var(--color-charcoal)] bg-[var(--color-carbon)] p-6 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[var(--color-steel)]/5 group-hover:bg-[var(--color-steel)]/10 transition-colors"></div>
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-5 w-5 text-[var(--color-steel)]" />
            <h3 className="font-mono text-[11px] font-bold text-[var(--color-steel)] uppercase tracking-widest">Total_Scans</h3>
          </div>
          <p className="font-mono text-4xl font-bold text-[var(--color-snow)]">{data.totalScans}</p>
        </div>

        {/* Scams Detected */}
        <div className="rounded-lg border border-[var(--color-charcoal)] bg-[var(--color-carbon)] p-6 relative overflow-hidden group shadow-[0_0_15px_rgba(239,68,68,0.05)]">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-red-500/5 group-hover:bg-red-500/10 transition-colors"></div>
          <div className="flex items-center gap-3 mb-4">
            <AlertOctagon className="h-5 w-5 text-red-500" />
            <h3 className="font-mono text-[11px] font-bold text-red-500 uppercase tracking-widest">Threats_Detected</h3>
          </div>
          <p className="font-mono text-4xl font-bold text-red-400">{data.scamCount}</p>
        </div>

        {/* Safe Results */}
        <div className="rounded-lg border border-[var(--color-charcoal)] bg-[var(--color-carbon)] p-6 relative overflow-hidden group shadow-[0_0_15px_rgba(0,217,146,0.05)]">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[var(--color-signal)]/5 group-hover:bg-[var(--color-signal)]/10 transition-colors"></div>
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="h-5 w-5 text-[var(--color-signal)]" />
            <h3 className="font-mono text-[11px] font-bold text-[var(--color-signal)] uppercase tracking-widest">Safe_Results</h3>
          </div>
          <p className="font-mono text-4xl font-bold text-[var(--color-signal)]">{data.safeCount}</p>
        </div>
      </div>

      {/* ── Charts Grid ── */}
      <div className="grid gap-6 lg:grid-cols-2 mb-12">
        {/* Trend Line Chart */}
        <div className="rounded-lg border border-[var(--color-charcoal)] bg-[var(--color-carbon)] p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="h-5 w-5 text-[var(--color-snow)]" />
            <h2 className="font-mono text-sm font-bold text-[var(--color-snow)] uppercase tracking-widest">7_Day_Threat_Trend</h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.charcoal} vertical={false} />
                <XAxis dataKey="date" stroke={COLORS.steel} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                <YAxis stroke={COLORS.steel} fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="scams" name="Threats" stroke={COLORS.high} strokeWidth={3} dot={{ r: 4, fill: COLORS.high, strokeWidth: 0 }} activeDot={{ r: 6, fill: COLORS.high, stroke: COLORS.snow, strokeWidth: 2 }} animationDuration={1500} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution Bar Chart */}
        <div className="rounded-lg border border-[var(--color-charcoal)] bg-[var(--color-carbon)] p-6">
          <div className="flex items-center gap-2 mb-8">
            <BarChart3 className="h-5 w-5 text-[var(--color-snow)]" />
            <h2 className="font-mono text-sm font-bold text-[var(--color-snow)] uppercase tracking-widest">Risk_Distribution</h2>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.charcoal} vertical={false} />
                <XAxis dataKey="name" stroke={COLORS.steel} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={COLORS.steel} fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="count" name="Scans" radius={[4, 4, 0, 0]} animationDuration={1500}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Safe vs Scam Pie Chart */}
        <div className="rounded-lg border border-[var(--color-charcoal)] bg-[var(--color-carbon)] p-6">
          <div className="flex items-center gap-2 mb-8">
            <Activity className="h-5 w-5 text-[var(--color-snow)]" />
            <h2 className="font-mono text-sm font-bold text-[var(--color-snow)] uppercase tracking-widest">Detection_Ratio</h2>
          </div>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  animationDuration={1500}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-mono text-2xl font-bold text-[var(--color-snow)]">{data.totalScans}</span>
              <span className="font-mono text-[9px] text-[var(--color-steel)] uppercase tracking-widest">TOTAL</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Activity Table ── */}
      <div className="rounded-lg border border-[var(--color-charcoal)] bg-[var(--color-carbon)] p-6">
        <div className="flex items-center gap-2 mb-6 border-b border-[var(--color-charcoal)] pb-4">
          <History className="h-5 w-5 text-[var(--color-snow)]" />
          <h2 className="font-mono text-sm font-bold text-[var(--color-snow)] uppercase tracking-widest">Recent_Activity_Log</h2>
        </div>
        
        {data.recentScans.length === 0 ? (
          <p className="font-mono text-sm text-[var(--color-steel)] py-8 text-center uppercase tracking-widest">No recent scans found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-sm">
              <thead className="border-b border-[var(--color-charcoal)] text-[10px] uppercase tracking-widest text-[var(--color-steel)]">
                <tr>
                  <th className="pb-3 pr-4 font-normal">Timestamp</th>
                  <th className="pb-3 pr-4 font-normal">Vector</th>
                  <th className="pb-3 pr-4 font-normal">Payload</th>
                  <th className="pb-3 font-normal text-right">Risk_Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-charcoal)]">
                {data.recentScans.map((scan) => {
                  const isSafe = scan.riskScore === 0;
                  const scoreColor = isSafe ? 'text-[var(--color-signal)]' : scan.riskScore < 40 ? 'text-yellow-400' : scan.riskScore < 70 ? 'text-orange-400' : 'text-red-400';
                  return (
                    <tr key={scan._id} className="transition-colors hover:bg-[var(--color-abyss)]">
                      <td className="py-4 pr-4 whitespace-nowrap text-[11px] text-[var(--color-steel)]">
                        {new Date(scan.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-4 pr-4">
                        <span className="rounded border border-[var(--color-charcoal)] bg-[var(--color-abyss)] px-2 py-1 text-[10px] font-bold text-[var(--color-snow)] uppercase tracking-widest">
                          {scan.type}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-[var(--color-parchment)] max-w-[200px] sm:max-w-md truncate" title={scan.input}>
                        {scan.input}
                      </td>
                      <td className={`py-4 text-right font-bold ${scoreColor}`}>
                        {scan.riskScore}
                        <span className="text-[9px] ml-1 opacity-70">/100</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
