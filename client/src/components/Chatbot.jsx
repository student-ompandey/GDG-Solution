import { useState, useRef, useEffect } from 'react';
import { Terminal, X, Send, Bot, User, Languages, Wifi, WifiOff, Sparkles } from 'lucide-react';
import { sendChatMessage } from '../services/api';
import { generateResponse } from '../services/localChatbot.service';

const GREETINGS = {
  en: 'Hey! I\'m ScamShield AI — your online safety assistant. Scan something and ask me about it, or pick a question below 👇',
  hi: 'नमस्ते! मैं ScamShield AI हूँ — आपका ऑनलाइन सुरक्षा सहायक। कुछ स्कैन करें और मुझसे पूछें, या नीचे से सवाल चुनें 👇',
};

const QUICK_CHIPS = {
  en: [
    { label: '🛡️ Is this safe?', msg: 'Is this safe?' },
    { label: '❓ Why risky?', msg: 'Why is this risky?' },
    { label: '🔧 What to do?', msg: 'What should I do?' },
    { label: '🔑 About OTP', msg: 'What is OTP and why should I not share it?' },
  ],
  hi: [
    { label: '🛡️ सुरक्षित है?', msg: 'क्या यह सुरक्षित है?' },
    { label: '❓ खतरा क्यों?', msg: 'यह खतरनाक क्यों है?' },
    { label: '🔧 क्या करें?', msg: 'मुझे क्या करना चाहिए?' },
    { label: '🔑 OTP क्या है?', msg: 'OTP क्या है और क्यों नहीं बताना चाहिए?' },
  ],
};

export default function Chatbot({ context }) {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState('en');
  const [useAI, setUseAI] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: GREETINGS.en }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [messages, isOpen]);

  const toggleLang = () => {
    const newLang = lang === 'en' ? 'hi' : 'en';
    setLang(newLang);
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === 'model') {
        return [{ role: 'model', text: GREETINGS[newLang] }];
      }
      return prev;
    });
  };

  const processMessage = async (userMessage) => {
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);

    if (!useAI) {
      // Small delay for natural feel
      await new Promise(r => setTimeout(r, 150));
      const reply = generateResponse(userMessage, context, lang);
      setMessages((prev) => [...prev, { role: 'model', text: reply }]);
      return;
    }

    setLoading(true);
    try {
      const chatHistory = messages.filter(
        (msg) => msg.text !== GREETINGS.en && msg.text !== GREETINGS.hi
      );
      let finalMessage = userMessage;
      if (lang === 'hi') finalMessage = `[Respond in Hindi/Devanagari] ${userMessage}`;

      const res = await sendChatMessage(finalMessage, chatHistory, context);
      const reply = res?.data?.data || res?.data?.message;

      if (reply && reply.trim().length > 0) {
        setMessages((prev) => [...prev, { role: 'model', text: reply }]);
      } else {
        const localReply = generateResponse(userMessage, context, lang);
        setMessages((prev) => [...prev, { role: 'model', text: localReply }]);
      }
    } catch {
      const localReply = generateResponse(userMessage, context, lang);
      setMessages((prev) => [...prev, { role: 'model', text: localReply }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput('');
    await processMessage(userMessage);
  };

  const handleChip = async (msg) => {
    if (loading) return;
    await processMessage(msg);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showChips = messages.length <= 2 && !loading;

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-signal)] bg-[var(--color-carbon)] shadow-[0_0_15px_rgba(0,217,146,0.3)] transition-all duration-300 ${isOpen ? 'rotate-0 scale-100' : 'animate-float hover:scale-110'} hover:shadow-[0_0_25px_rgba(0,217,146,0.5)]`}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-[var(--color-signal)] transition-transform duration-200" />
        ) : (
          <>
            <Terminal className="h-6 w-6 text-[var(--color-signal)]" />
            {/* Notification dot */}
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-signal)] opacity-50"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--color-signal)]"></span>
            </span>
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[520px] max-h-[80vh] w-[380px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-xl border border-[var(--color-charcoal)] bg-[var(--color-abyss)] shadow-[var(--shadow-dramatic)] animate-slide-up">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-[var(--color-charcoal)] bg-[var(--color-carbon)] p-4 shimmer-bg">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-charcoal)] bg-[var(--color-abyss)] shadow-[0_0_8px_rgba(0,217,146,0.1)]">
              <Bot className="h-5 w-5 text-[var(--color-signal)]" />
              {/* Online indicator */}
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[var(--color-signal)] border-2 border-[var(--color-carbon)]"></span>
            </div>
            <div className="flex-1">
              <h3 className="font-mono text-[13px] font-bold uppercase tracking-widest text-[var(--color-snow)]">ScamShield AI</h3>
              <p className="font-mono text-[9px] uppercase tracking-wider flex items-center gap-1">
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${useAI ? 'bg-purple-400' : 'bg-[var(--color-signal)]'}`}></span>
                <span className={useAI ? 'text-purple-400' : 'text-[var(--color-signal)]'}>
                  {useAI ? 'GEMINI AI' : 'INSTANT MODE'}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setUseAI(!useAI)}
                className={`flex items-center gap-1 rounded-lg border px-2 py-1.5 text-[9px] font-mono font-bold uppercase tracking-wider transition-all hover-lift ${
                  useAI
                    ? 'border-purple-500/50 text-purple-400 bg-purple-500/10 shadow-[0_0_8px_rgba(139,92,246,0.15)]'
                    : 'border-[var(--color-signal)]/40 text-[var(--color-signal)] bg-[var(--color-signal)]/5'
                }`}
                title={useAI ? 'Using Gemini AI (may be slow)' : 'Using local engine (instant)'}
              >
                {useAI ? <Wifi className="h-2.5 w-2.5" /> : <WifiOff className="h-2.5 w-2.5" />}
                {useAI ? 'AI' : 'LOCAL'}
              </button>
              <button
                onClick={toggleLang}
                className={`flex items-center gap-1 rounded-lg border px-2 py-1.5 text-[9px] font-mono font-bold uppercase tracking-wider transition-all hover-lift ${
                  lang === 'hi'
                    ? 'border-[var(--color-signal)] text-[var(--color-signal)] bg-[var(--color-signal)]/10'
                    : 'border-[var(--color-charcoal)] text-[var(--color-steel)] hover:border-[var(--color-steel)]'
                }`}
              >
                <Languages className="h-2.5 w-2.5" />
                {lang === 'hi' ? 'हिं' : 'EN'}
              </button>
            </div>
          </div>

          {/* Context Banner */}
          {context && (
            <div className="bg-gradient-to-r from-[var(--color-signal)]/10 to-transparent px-4 py-2 border-b border-[var(--color-signal)]/20">
              <p className="font-mono text-[10px] text-[var(--color-signal)] uppercase flex items-center gap-2 tracking-widest">
                <Sparkles className="h-3 w-3" />
                {lang === 'hi' ? 'स्कैन संदर्भ' : 'CONTEXT'}: SCORE {context.riskScore || 0}/100
              </p>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 animate-msg-in ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                style={{ animationDelay: `${Math.min(i * 50, 200)}ms` }}
              >
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${
                  msg.role === 'user'
                    ? 'border-[var(--color-steel)]/30 bg-[var(--color-carbon)] text-[var(--color-steel)]'
                    : 'border-[var(--color-signal)]/30 bg-[var(--color-signal)]/10 text-[var(--color-signal)]'
                }`}>
                  {msg.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                </div>
                <div className={`max-w-[80%] rounded-lg px-3.5 py-2.5 text-[13px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[var(--color-signal)]/10 border border-[var(--color-signal)]/20 text-[var(--color-snow)] font-mono'
                    : 'bg-[var(--color-carbon)] border border-[var(--color-charcoal)] text-[var(--color-parchment)] font-sans'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-2.5 animate-msg-in">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--color-signal)]/30 bg-[var(--color-signal)]/10 text-[var(--color-signal)]">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="bg-[var(--color-carbon)] border border-[var(--color-charcoal)] rounded-lg px-4 py-3 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-signal)] animate-typing-dot" style={{ animationDelay: '0ms' }}></span>
                  <span className="h-2 w-2 rounded-full bg-[var(--color-signal)] animate-typing-dot" style={{ animationDelay: '200ms' }}></span>
                  <span className="h-2 w-2 rounded-full bg-[var(--color-signal)] animate-typing-dot" style={{ animationDelay: '400ms' }}></span>
                </div>
              </div>
            )}

            {/* Quick suggestion chips */}
            {showChips && (
              <div className="pt-2 animate-slide-up" style={{ animationDelay: '300ms' }}>
                <p className="font-mono text-[9px] text-[var(--color-steel)] uppercase tracking-widest mb-2">
                  {lang === 'hi' ? '— सुझाव —' : '— SUGGESTIONS —'}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(QUICK_CHIPS[lang] || QUICK_CHIPS.en).map((chip, i) => (
                    <button
                      key={i}
                      onClick={() => handleChip(chip.msg)}
                      className="rounded-lg border border-[var(--color-charcoal)] bg-[var(--color-carbon)] px-3 py-1.5 text-[11px] font-mono text-[var(--color-parchment)] transition-all hover:border-[var(--color-signal)]/50 hover:text-[var(--color-signal)] hover:bg-[var(--color-signal)]/5 hover-lift"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-[var(--color-charcoal)] bg-[var(--color-carbon)] p-3">
            <div className="relative flex items-center">
              <span className="absolute left-3 font-mono text-[13px] text-[var(--color-signal)] opacity-60">{'>'}</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={lang === 'hi' ? 'यहाँ पूछें...' : 'Ask anything...'}
                className="w-full rounded-lg border border-[var(--color-charcoal)] bg-[var(--color-abyss)] py-2.5 pl-8 pr-12 font-mono text-[13px] text-[var(--color-snow)] placeholder-[var(--color-charcoal)] outline-none transition-all duration-300 focus:border-[var(--color-signal)]/60 focus:shadow-[0_0_12px_rgba(0,217,146,0.12)]"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="absolute right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-signal)]/10 border border-[var(--color-signal)]/30 text-[var(--color-signal)] transition-all hover:bg-[var(--color-signal)]/20 hover:shadow-[0_0_8px_rgba(0,217,146,0.2)] disabled:opacity-30 disabled:hover:bg-[var(--color-signal)]/10 disabled:cursor-not-allowed"
              >
                <Send className="h-3 w-3 ml-0.5" />
              </button>
            </div>
            <p className="mt-1.5 text-center font-mono text-[8px] text-[var(--color-charcoal)] uppercase tracking-wider">
              {useAI ? '⚡ Powered by Gemini AI' : '🔒 100% Local • Zero API calls'}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
