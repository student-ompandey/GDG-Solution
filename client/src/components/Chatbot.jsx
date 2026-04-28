import { useState, useRef, useEffect } from 'react';
import { Terminal, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { sendChatMessage } from '../services/api';

export default function Chatbot({ context }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: 'SYSTEM_ONLINE: I am ScamShield AI. Awaiting queries regarding threat vectors or scan results.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const res = await sendChatMessage(userMessage, messages, context);
      setMessages((prev) => [...prev, { role: 'model', text: res.data.data }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: 'FATAL_ERROR: Connection to AI core lost.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded border border-[var(--color-signal)] bg-[var(--color-carbon)] shadow-[0_0_15px_rgba(0,217,146,0.3)] transition-all hover:scale-110 hover:shadow-[0_0_20px_rgba(0,217,146,0.5)]"
      >
        {isOpen ? <X className="h-6 w-6 text-[var(--color-signal)]" /> : <Terminal className="h-6 w-6 text-[var(--color-signal)]" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[500px] max-h-[80vh] w-[350px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-md border border-[var(--color-charcoal)] bg-[var(--color-abyss)] shadow-[var(--shadow-dramatic)] animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-[var(--color-charcoal)] bg-[var(--color-carbon)] p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded border border-[var(--color-charcoal)] bg-[var(--color-abyss)] shadow-[0_0_8px_rgba(0,217,146,0.1)]">
              <Bot className="h-5 w-5 text-[var(--color-signal)]" />
            </div>
            <div>
              <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-[var(--color-snow)]">ScamShield_AI</h3>
              <p className="font-mono text-[10px] text-[var(--color-signal)] uppercase">STATUS: ONLINE</p>
            </div>
          </div>

          {/* Context Banner */}
          {context && (
            <div className="bg-[var(--color-signal)]/10 px-4 py-2 border-b border-[var(--color-signal)]/30">
              <p className="font-mono text-[10px] text-[var(--color-signal)] uppercase flex items-center gap-2 tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-signal)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-signal)]"></span>
                </span>
                SCAN_CONTEXT_LOADED
              </p>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded border ${msg.role === 'user' ? 'border-[var(--color-steel)] bg-[var(--color-carbon)] text-[var(--color-steel)]' : 'border-[var(--color-signal)]/50 bg-[var(--color-signal)]/10 text-[var(--color-signal)]'}`}>
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <Terminal className="h-4 w-4" />}
                </div>
                <div className={`max-w-[80%] rounded px-3 py-2 font-mono text-[13px] ${msg.role === 'user' ? 'border border-[var(--color-charcoal)] bg-[var(--color-carbon)] text-[var(--color-parchment)]' : 'bg-transparent text-[var(--color-snow)] leading-relaxed'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[var(--color-signal)]/50 bg-[var(--color-signal)]/10 text-[var(--color-signal)]">
                  <Terminal className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1 px-3 py-2">
                  <span className="font-mono text-[13px] text-[var(--color-signal)] animate-pulse">PROCESSING...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-[var(--color-charcoal)] bg-[var(--color-carbon)] p-3">
            <div className="relative flex items-center">
              <span className="absolute left-3 font-mono text-[13px] text-[var(--color-signal)]">{'>'}</span>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter query..."
                className="w-full rounded border border-[var(--color-charcoal)] bg-[var(--color-abyss)] py-2.5 pl-8 pr-12 font-mono text-[13px] text-[var(--color-snow)] placeholder-[var(--color-charcoal)] outline-none transition-colors focus:border-[var(--color-signal)] focus:shadow-[0_0_8px_rgba(0,217,146,0.2)]"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="absolute right-2 flex h-7 w-7 items-center justify-center rounded bg-[var(--color-carbon)] border border-[var(--color-charcoal)] text-[var(--color-mint)] transition-all hover:bg-black/20 hover:border-[var(--color-signal)] disabled:opacity-50 disabled:hover:border-[var(--color-charcoal)] disabled:cursor-not-allowed"
              >
                <Send className="h-3 w-3 ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
