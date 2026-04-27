import { Shield } from 'lucide-react';

const scanningMessages = [
  'Analyzing for potential scams...',
  'Checking against known threat patterns...',
  'Running AI-powered detection...',
  'Scanning for suspicious content...',
];

export default function Spinner({ text }) {
  const displayText = text || scanningMessages[Math.floor(Math.random() * scanningMessages.length)];

  return (
    <div className="mt-8 flex flex-col items-center gap-4">
      {/* Animated shield scanner */}
      <div className="relative flex items-center justify-center">
        {/* Outer ring */}
        <div className="absolute h-20 w-20 animate-spin rounded-full border-2 border-transparent border-t-indigo-500 border-r-indigo-500/30" style={{ animationDuration: '1.5s' }} />
        {/* Middle ring */}
        <div className="absolute h-16 w-16 animate-spin rounded-full border-2 border-transparent border-b-purple-500 border-l-purple-500/30" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
        {/* Center icon */}
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/20 ring-1 ring-indigo-500/30">
          <Shield className="h-6 w-6 text-indigo-400 animate-pulse" />
        </div>
      </div>

      {/* Text */}
      <div className="text-center">
        <p className="text-sm font-medium text-slate-300 animate-pulse">{displayText}</p>
        <p className="mt-1 text-xs text-slate-500">This may take a few seconds</p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
