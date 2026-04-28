import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfileStats, updateProfile } from '../services/api';
import { User as UserIcon, Mail, Shield, ShieldAlert, ShieldCheck, Activity, Edit2, Check, X, Camera, History } from 'lucide-react';
import { getApiUrl } from '../config/env';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getProfileStats();
      setStats(response.data.data);
    } catch (err) {
      console.error('Failed to fetch profile stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!editName.trim()) return;
    
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', editName);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }
      
      const response = await updateProfile(formData);
      setUser(response.data.data);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      // In a real app, show error toast here
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditName(user?.name || '');
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const avatarUrl = user?.avatar ? `${getApiUrl()}${user.avatar}` : null;
  const displayAvatar = avatarPreview || avatarUrl;

  if (loading || !stats) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-t-2 border-[var(--color-signal)] animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-b-2 border-[var(--color-steel)] animate-spin opacity-50" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="font-mono text-sm text-[var(--color-signal)] tracking-widest uppercase animate-pulse">Loading_Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-8 pt-12 pb-32">
      
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-normal text-[var(--color-snow)] tracking-[-0.9px]">
          User <span className="text-[var(--color-signal)]">Profile</span>
        </h1>
        <p className="font-mono text-sm text-[var(--color-steel)] uppercase tracking-widest mt-2">
          Identity & Telemetry Data
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* ── Left Column: User Info & Score ── */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* User Info Card */}
          <div className="rounded-lg border border-[var(--color-charcoal)] bg-[var(--color-carbon)] p-6 relative overflow-hidden group">
            {/* Action Buttons */}
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="absolute top-4 right-4 p-2 text-[var(--color-steel)] hover:text-[var(--color-signal)] hover:bg-[var(--color-signal)]/10 rounded-md transition-colors"
                title="Edit Profile"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            ) : null}

            <div className="flex flex-col items-center text-center">
              {/* Avatar Section */}
              <div className="relative mb-4">
                <div className="h-24 w-24 rounded-full border-2 border-[var(--color-charcoal)] bg-[var(--color-abyss)] overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(0,217,146,0.1)]">
                  {displayAvatar ? (
                    <img src={displayAvatar} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon className="h-10 w-10 text-[var(--color-steel)]" />
                  )}
                </div>
                
                {isEditing && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 bg-[var(--color-signal)] text-black rounded-full hover:bg-[var(--color-signal)]/80 transition-colors shadow-lg"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  accept="image/jpeg,image/png,image/webp" 
                  className="hidden" 
                />
              </div>

              {/* Name & Email */}
              {isEditing ? (
                <div className="w-full space-y-3 mb-4">
                  <div className="relative">
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full appearance-none rounded-md border border-[var(--color-charcoal)] bg-[var(--color-abyss)] px-3 py-2 text-center text-sm font-bold text-[var(--color-snow)] focus:border-[var(--color-signal)] focus:outline-none focus:ring-1 focus:ring-[var(--color-signal)]"
                      placeholder="Display Name"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="font-sans text-xl font-bold text-[var(--color-snow)] mb-1">{user?.name}</h2>
                  <div className="flex items-center justify-center gap-1.5 text-[var(--color-steel)] mb-4">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="font-mono text-xs">{user?.email}</span>
                  </div>
                  <div className="inline-flex items-center rounded border border-[var(--color-charcoal)] bg-[var(--color-abyss)] px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--color-snow)]">
                    Role: <span className="text-[var(--color-signal)] ml-1">{user?.role}</span>
                  </div>
                </>
              )}

              {/* Edit Controls */}
              {isEditing && (
                <div className="flex items-center gap-2 mt-4 w-full">
                  <button 
                    onClick={cancelEdit}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-md border border-[var(--color-charcoal)] bg-[var(--color-abyss)] py-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--color-steel)] hover:text-white transition-colors disabled:opacity-50"
                  >
                    <X className="h-3 w-3" /> Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={saving || !editName.trim()}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-md border border-[var(--color-signal)] bg-[var(--color-signal)]/10 py-2 text-[10px] font-mono font-bold uppercase tracking-widest text-[var(--color-signal)] hover:bg-[var(--color-signal)] hover:text-black transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : <><Check className="h-3 w-3" /> Save</>}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Safety Score Card */}
          <div className="rounded-lg border border-[var(--color-charcoal)] bg-[var(--color-carbon)] p-6 relative overflow-hidden group">
            <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full transition-colors ${stats.safetyScore < 40 ? 'bg-red-500/5 group-hover:bg-red-500/10' : stats.safetyScore < 70 ? 'bg-orange-500/5 group-hover:bg-orange-500/10' : 'bg-[var(--color-signal)]/5 group-hover:bg-[var(--color-signal)]/10'}`}></div>
            
            <div className="flex items-center gap-3 mb-6">
              <Shield className={`h-5 w-5 ${stats.safetyScore < 40 ? 'text-red-500' : stats.safetyScore < 70 ? 'text-orange-500' : 'text-[var(--color-signal)]'}`} />
              <h3 className="font-mono text-[11px] font-bold text-[var(--color-steel)] uppercase tracking-widest">User_Safety_Score</h3>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center mb-4">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="56" className="stroke-[var(--color-charcoal)] fill-none" strokeWidth="8" />
                  <circle 
                    cx="64" cy="64" r="56" 
                    className={`fill-none ${stats.safetyScore < 40 ? 'stroke-red-500' : stats.safetyScore < 70 ? 'stroke-orange-500' : 'stroke-[var(--color-signal)]'}`} 
                    strokeWidth="8" 
                    strokeDasharray="351.858" 
                    strokeDashoffset={351.858 - (351.858 * stats.safetyScore) / 100}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="font-mono text-3xl font-bold text-[var(--color-snow)]">{stats.safetyScore}</span>
                  <span className="font-mono text-[9px] text-[var(--color-steel)]">/100</span>
                </div>
              </div>
              <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest ${stats.safetyScore < 40 ? 'border-red-500/30 text-red-500 bg-red-500/10' : stats.safetyScore < 70 ? 'border-orange-500/30 text-orange-500 bg-orange-500/10' : 'border-[var(--color-signal)]/30 text-[var(--color-signal)] bg-[var(--color-signal)]/10'}`}>
                {stats.safetyLevel}
              </span>
            </div>
          </div>
        </div>

        {/* ── Right Column: Stats & Activity ── */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-[var(--color-charcoal)] bg-[var(--color-carbon)] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="h-4 w-4 text-[var(--color-steel)]" />
                <h3 className="font-mono text-[10px] font-bold text-[var(--color-steel)] uppercase tracking-widest">Total_Scans</h3>
              </div>
              <p className="font-mono text-3xl font-bold text-[var(--color-snow)]">{stats.totalScans}</p>
            </div>
            
            <div className="rounded-lg border border-[var(--color-charcoal)] bg-[var(--color-carbon)] p-5 shadow-[0_0_15px_rgba(0,217,146,0.05)]">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="h-4 w-4 text-[var(--color-signal)]" />
                <h3 className="font-mono text-[10px] font-bold text-[var(--color-signal)] uppercase tracking-widest">Safe_Results</h3>
              </div>
              <p className="font-mono text-3xl font-bold text-[var(--color-signal)]">{stats.safeCount}</p>
            </div>

            <div className="rounded-lg border border-[var(--color-charcoal)] bg-[var(--color-carbon)] p-5 shadow-[0_0_15px_rgba(239,68,68,0.05)]">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="h-4 w-4 text-red-500" />
                <h3 className="font-mono text-[10px] font-bold text-red-500 uppercase tracking-widest">Threats_Detected</h3>
              </div>
              <p className="font-mono text-3xl font-bold text-red-500">{stats.scamCount}</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-lg border border-[var(--color-charcoal)] bg-[var(--color-carbon)] p-6">
            <div className="flex items-center justify-between border-b border-[var(--color-charcoal)] pb-4 mb-4">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-[var(--color-snow)]" />
                <h2 className="font-mono text-sm font-bold text-[var(--color-snow)] uppercase tracking-widest">Recent_Activity</h2>
              </div>
            </div>

            {stats.recentScans.length === 0 ? (
              <div className="py-8 text-center">
                <p className="font-mono text-sm text-[var(--color-steel)] uppercase tracking-widest">No activity yet</p>
                <p className="font-sans text-xs text-[var(--color-parchment)] mt-1">Your scan history will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentScans.map((scan) => {
                  const isSafe = scan.riskScore === 0;
                  const isHighRisk = scan.riskScore >= 70;
                  const scoreColor = isSafe ? 'text-[var(--color-signal)]' : scan.riskScore < 40 ? 'text-yellow-400' : scan.riskScore < 70 ? 'text-orange-400' : 'text-red-400';
                  const bgBadge = isSafe ? 'bg-[var(--color-signal)]/10 border-[var(--color-signal)]/30' : scan.riskScore < 40 ? 'bg-yellow-500/10 border-yellow-500/30' : scan.riskScore < 70 ? 'bg-orange-500/10 border-orange-500/30' : 'bg-red-500/10 border-red-500/30';
                  
                  return (
                    <div key={scan._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded border border-[var(--color-charcoal)] bg-[var(--color-abyss)] p-4 transition-colors hover:border-[var(--color-steel)]/30">
                      <div className="flex items-start gap-3 overflow-hidden">
                        <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border ${bgBadge}`}>
                          {isSafe ? <ShieldCheck className={`h-3 w-3 ${scoreColor}`} /> : <ShieldAlert className={`h-3 w-3 ${scoreColor}`} />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-mono text-xs text-[var(--color-snow)] truncate mb-1" title={scan.input}>{scan.input}</p>
                          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[var(--color-steel)]">
                            <span>{scan.type}</span>
                            <span>•</span>
                            <span>{new Date(scan.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 mt-2 sm:mt-0 pl-9 sm:pl-0">
                        <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest ${bgBadge} ${scoreColor}`}>
                          {scan.result}
                        </span>
                        <span className={`font-mono text-sm font-bold ${scoreColor}`}>
                          {scan.riskScore}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
