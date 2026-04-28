import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, User, ArrowRight, AlertTriangle, Terminal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-[var(--color-charcoal)] bg-[var(--color-carbon)] shadow-[var(--shadow-ambient)]">
        {/* Header */}
        <div className="border-b border-[var(--color-charcoal)] px-8 py-8 text-center bg-black/20">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded border border-[var(--color-charcoal)] bg-[var(--color-abyss)] shadow-[0_0_10px_rgba(0,217,146,0.1)]">
            <Terminal className="h-6 w-6 text-[var(--color-signal)]" />
          </div>
          <h2 className="font-display text-2xl font-normal text-[var(--color-snow)] tracking-tight">Request Access</h2>
          <p className="mt-2 font-mono text-xs text-[var(--color-steel)] uppercase tracking-widest">Register to use ScamShield Agent</p>
        </div>

        {/* Form */}
        <div className="px-8 py-8">
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded border border-red-500/30 bg-red-500/10 p-3 text-xs font-mono text-red-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <p>ERROR: {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block font-mono text-xs font-bold uppercase tracking-widest text-[var(--color-steel)]">Operator_Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <User className="h-4 w-4 text-[var(--color-steel)]" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded border border-[var(--color-charcoal)] bg-[var(--color-abyss)] py-3 pl-11 pr-4 font-mono text-sm text-[var(--color-snow)] placeholder-[var(--color-charcoal)] outline-none transition-colors focus:border-[var(--color-signal)] focus:shadow-[0_0_8px_rgba(0,217,146,0.2)]"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block font-mono text-xs font-bold uppercase tracking-widest text-[var(--color-steel)]">User_ID (Email)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Mail className="h-4 w-4 text-[var(--color-steel)]" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded border border-[var(--color-charcoal)] bg-[var(--color-abyss)] py-3 pl-11 pr-4 font-mono text-sm text-[var(--color-snow)] placeholder-[var(--color-charcoal)] outline-none transition-colors focus:border-[var(--color-signal)] focus:shadow-[0_0_8px_rgba(0,217,146,0.2)]"
                  placeholder="operator@system.io"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block font-mono text-xs font-bold uppercase tracking-widest text-[var(--color-steel)]">Access_Key (Password)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Lock className="h-4 w-4 text-[var(--color-steel)]" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded border border-[var(--color-charcoal)] bg-[var(--color-abyss)] py-3 pl-11 pr-4 font-mono text-sm text-[var(--color-snow)] placeholder-[var(--color-charcoal)] outline-none transition-colors focus:border-[var(--color-signal)] focus:shadow-[0_0_8px_rgba(0,217,146,0.2)]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group mt-4 flex w-full items-center justify-center gap-2 rounded border border-transparent bg-[var(--color-carbon)] py-3 text-sm font-bold uppercase tracking-widest text-[var(--color-mint)] ring-1 ring-[var(--color-signal)]/80 transition-all shadow-[0_0_10px_rgba(0,217,146,0.1)] hover:bg-black/20 hover:shadow-[0_0_15px_rgba(0,217,146,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'INITIALIZING...' : 'REGISTER'}
              {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--color-charcoal)] bg-black/40 px-8 py-5 text-center">
          <p className="font-mono text-xs text-[var(--color-steel)] uppercase">
            AUTHORIZED?{' '}
            <Link to="/login" className="font-bold text-[var(--color-signal)] hover:text-[var(--color-mint)] transition-colors">
              LOGIN HERE
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
