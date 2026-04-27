import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { sendChatMessage } from '../services/api';

export default function Chatbot({ context }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Hi! I am ScamShield AI. Do you have any questions about online safety or your recent scan results?' }
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
        { role: 'model', text: 'Sorry, I am having trouble connecting to the server right now.' }
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
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 transition-transform hover:scale-110"
      >
        {isOpen ? <X className="h-6 w-6 text-white" /> : <MessageCircle className="h-6 w-6 text-white" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[500px] max-h-[80vh] w-[350px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F19]/95 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-white/10 bg-white/5 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20">
              <Sparkles className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">ScamShield AI</h3>
              <p className="text-xs text-slate-400">Security Assistant</p>
            </div>
          </div>

          {/* Context Banner */}
          {context && (
            <div className="bg-indigo-500/10 px-4 py-2 border-b border-indigo-500/20">
              <p className="text-xs text-indigo-300 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Scan context attached
              </p>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${msg.role === 'user' ? 'bg-purple-500/20 text-purple-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                  {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-tr-sm' : 'bg-white/10 text-slate-200 rounded-tl-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl bg-white/10 px-4 py-3 rounded-tl-sm">
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]"></div>
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]"></div>
                  <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-white/10 bg-white/5 p-4">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about online safety..."
                className="w-full rounded-full border border-white/10 bg-slate-800/50 py-3 pl-4 pr-12 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-white transition-transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                <Send className="h-4 w-4 ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
