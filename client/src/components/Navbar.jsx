import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X, User, LogOut, Terminal } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl } from '../config/env';

export default function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const { user, logout } = useAuth();

  const links = [
    { to: '/', label: 'Home' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/scan', label: 'Scan' },
    { to: '/history', label: 'History' },
    { to: '/reports', label: 'Reports' },
  ];

  const isActive = (path) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--color-charcoal)] bg-[var(--color-abyss)]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-transparent transition-all animate-signal-glow">
            <Terminal className="h-5 w-5 text-[var(--color-signal)]" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-[var(--color-snow)]">
            Scam<span className="text-[var(--color-signal)]">Shield</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 sm:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
                isActive(l.to)
                  ? 'text-[var(--color-signal)] bg-[var(--color-signal)]/10'
                  : 'text-[var(--color-parchment)] hover:text-[var(--color-mint)]'
              }`}
            >
              {l.label}
            </Link>
          ))}
          
          <div className="ml-4 flex items-center gap-3 border-l border-[var(--color-charcoal)] pl-5">
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setDropdown(!dropdown)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-transparent border border-[var(--color-charcoal)] transition-colors hover:bg-black/20 hover:border-[var(--color-signal)]/50 overflow-hidden"
                >
                  {user.avatar ? (
                    <img src={`${getApiUrl()}${user.avatar}`} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-4 w-4 text-[var(--color-parchment)]" />
                  )}
                </button>
                {dropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md border border-[var(--color-charcoal)] bg-[var(--color-carbon)] p-2 shadow-[var(--shadow-ambient)]">
                    <div className="px-3 py-2 border-b border-[var(--color-charcoal)] mb-1">
                      <p className="text-sm font-medium text-[var(--color-snow)] truncate">{user.name}</p>
                      <p className="text-xs text-[var(--color-steel)] truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setDropdown(false)}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--color-parchment)] hover:bg-[var(--color-signal)]/10 hover:text-[var(--color-signal)]"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <button
                      onClick={() => { logout(); setDropdown(false); }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 mt-1"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Ghost Button */}
                <Link to="/login" className="rounded-md border border-[var(--color-charcoal)] bg-transparent px-4 py-1.5 text-sm font-medium text-[var(--color-snow)] transition-all hover:bg-black/20 hover:text-white hover:border-[var(--color-signal)]/50">
                  Log in
                </Link>
                {/* Primary CTA */}
                <Link to="/signup" className="rounded-md border border-transparent bg-[var(--color-carbon)] px-4 py-1.5 text-sm font-medium text-[var(--color-mint)] ring-1 ring-[var(--color-signal)]/80 transition-all shadow-[0_0_10px_rgba(0,217,146,0.1)] hover:bg-black/20 hover:shadow-[0_0_15px_rgba(0,217,146,0.3)] hover:scale-[1.02]">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-md p-2 text-[var(--color-parchment)] hover:bg-white/5 sm:hidden border border-[var(--color-charcoal)]"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-[var(--color-charcoal)] px-4 pb-4 pt-2 sm:hidden bg-[var(--color-abyss)]">
          <div className="space-y-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`block rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive(l.to) ? 'bg-[var(--color-signal)]/10 text-[var(--color-signal)]' : 'text-[var(--color-parchment)] hover:text-[var(--color-mint)]'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="mt-4 border-t border-[var(--color-charcoal)] pt-4">
            {user ? (
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-charcoal)] overflow-hidden">
                    {user.avatar ? (
                      <img src={`${getApiUrl()}${user.avatar}`} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-4 w-4 text-[var(--color-parchment)]" />
                    )}
                  </div>
                  <Link to="/profile" onClick={() => setOpen(false)} className="block">
                    <p className="text-sm font-medium text-[var(--color-snow)] hover:text-[var(--color-signal)]">{user.name}</p>
                    <p className="text-xs text-[var(--color-steel)]">{user.email}</p>
                  </Link>
                </div>
                <button onClick={() => { logout(); setOpen(false); }} className="rounded-md p-2 text-red-400 hover:bg-red-500/10">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link to="/login" onClick={() => setOpen(false)} className="flex items-center justify-center rounded-md border border-[var(--color-charcoal)] bg-transparent py-2.5 text-sm font-medium text-[var(--color-snow)] hover:bg-black/20">
                  Log in
                </Link>
                <Link to="/signup" onClick={() => setOpen(false)} className="flex items-center justify-center rounded-md bg-[var(--color-carbon)] ring-1 ring-[var(--color-signal)] py-2.5 text-sm font-medium text-[var(--color-mint)] hover:bg-black/20">
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
