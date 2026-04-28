import { Terminal } from 'lucide-react';

const scanningMessages = [
  'INITIALIZING_HEURISTICS...',
  'CROSS_REFERENCING_THREAT_DB...',
  'ANALYZING_PAYLOAD_VECTORS...',
  'EXECUTING_NEURAL_FILTERS...',
];

export default function Spinner({ text }) {
  const displayText = text || scanningMessages[Math.floor(Math.random() * scanningMessages.length)];

  return (
    <div className="mt-8 flex flex-col items-center gap-5">
      {/* Animated terminal scanner */}
      <div className="relative flex items-center justify-center">
        {/* Outer ring */}
        <div className="absolute h-20 w-20 animate-spin rounded-full border border-transparent border-t-[var(--color-signal)] border-r-[var(--color-signal)]/20" style={{ animationDuration: '1.5s' }} />
        {/* Middle ring */}
        <div className="absolute h-16 w-16 animate-spin rounded-full border border-transparent border-b-[var(--color-charcoal)] border-l-[var(--color-charcoal)]/50" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
        {/* Center icon */}
        <div className="flex h-12 w-12 items-center justify-center rounded border border-[var(--color-charcoal)] bg-[var(--color-abyss)] shadow-[0_0_10px_rgba(0,217,146,0.1)]">
          <Terminal className="h-5 w-5 text-[var(--color-signal)] animate-pulse" />
        </div>
      </div>

      {/* Text */}
      <div className="text-center font-mono">
        <p className="text-[11px] font-bold tracking-widest text-[var(--color-signal)] animate-pulse uppercase">{displayText}</p>
        <p className="mt-2 text-[10px] text-[var(--color-steel)] uppercase tracking-widest">AWAITING_SYSTEM_RESPONSE</p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2">
        <div className="h-1.5 w-1.5 rounded-sm bg-[var(--color-signal)] animate-bounce shadow-[0_0_5px_rgba(0,217,146,0.5)]" style={{ animationDelay: '0ms' }} />
        <div className="h-1.5 w-1.5 rounded-sm bg-[var(--color-signal)] animate-bounce shadow-[0_0_5px_rgba(0,217,146,0.5)]" style={{ animationDelay: '150ms' }} />
        <div className="h-1.5 w-1.5 rounded-sm bg-[var(--color-signal)] animate-bounce shadow-[0_0_5px_rgba(0,217,146,0.5)]" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
