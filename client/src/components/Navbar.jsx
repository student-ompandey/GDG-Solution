import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const { user, logout } = useAuth();

  const links = [
    { to: '/', label: 'Home' },
    { to: '/scan', label: 'Scan' },
    { to: '/history', label: 'History' },
  ];

  const isActive = (path) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20 transition-transform group-hover:scale-110">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Scam<span className="text-indigo-400">Shield</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 sm:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                isActive(l.to)
                  ? 'bg-indigo-500/15 text-indigo-400'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {l.label}
            </Link>
          ))}
          
          <div className="ml-4 flex items-center gap-2 border-l border-white/10 pl-4">
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setDropdown(!dropdown)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-300 ring-1 ring-white/10 transition-colors hover:bg-slate-700 hover:text-white"
                >
                  <User className="h-4 w-4" />
                </button>
                {dropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-[#0B0F19] p-2 shadow-xl">
                    <div className="px-3 py-2 border-b border-white/5 mb-1">
                      <p className="text-sm font-medium text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => { logout(); setDropdown(false); }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white">
                  Log in
                </Link>
                <Link to="/signup" className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition-colors hover:bg-indigo-400">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-lg p-2 text-slate-400 hover:bg-white/5 sm:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/5 px-4 pb-4 pt-2 sm:hidden">
          <div className="space-y-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive(l.to) ? 'bg-indigo-500/15 text-indigo-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="mt-4 border-t border-white/5 pt-4">
            {user ? (
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-300">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                </div>
                <button onClick={() => { logout(); setOpen(false); }} className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login" onClick={() => setOpen(false)} className="flex items-center justify-center rounded-lg border border-white/10 bg-slate-800/50 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800">
                  Log in
                </Link>
                <Link to="/signup" onClick={() => setOpen(false)} className="flex items-center justify-center rounded-lg bg-indigo-500 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition-colors hover:bg-indigo-400">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
