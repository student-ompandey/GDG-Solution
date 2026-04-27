import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F19]/80 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="bg-indigo-500/5 px-8 py-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/20 ring-1 ring-indigo-500/30">
            <Shield className="h-7 w-7 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-400">Log in to ScamShield to access your scan history and personalized security alerts.</p>
        </div>

        {/* Form */}
        <div className="px-8 py-8">
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-500/10 p-4 text-sm text-red-400 ring-1 ring-red-500/20">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-800/50 py-3 pl-11 pr-4 text-white placeholder-slate-500 outline-none transition-colors focus:border-indigo-500/50 focus:bg-slate-800 focus:ring-1 focus:ring-indigo-500/50"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <a href="#" className="text-xs font-medium text-indigo-400 hover:text-indigo-300">Forgot password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-800/50 py-3 pl-11 pr-4 text-white placeholder-slate-500 outline-none transition-colors focus:border-indigo-500/50 focus:bg-slate-800 focus:ring-1 focus:ring-indigo-500/50"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-400 disabled:opacity-50 disabled:hover:bg-indigo-500"
            >
              {loading ? 'Logging in...' : 'Log in'}
              {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 bg-slate-900/50 px-8 py-6 text-center">
          <p className="text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
