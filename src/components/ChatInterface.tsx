import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import type { ChatMessage, Language } from '../types';
import { chatWithAdvisor } from '../services/claudeService';

export default function ChatInterface({
  context,
  lang,
}: {
  context: string;
  lang: Language;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        lang === 'hi'
          ? 'नमस्ते! अपनी रिपोर्ट के बारे में कुछ भी पूछें।'
          : 'Hello! Ask me anything about your reading.',
    },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    const next = [...messages, { role: 'user' as const, content: text }];
    setMessages(next);
    setInput('');
    setBusy(true);
    const reply = await chatWithAdvisor(next, context, lang);
    setMessages([...next, { role: 'assistant', content: reply }]);
    setBusy(false);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-gold-soft to-gold-deep text-slate-950 shadow-glow-lg transition-transform hover:scale-105 active:scale-95"
        aria-label="Open advisor chat"
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[28rem] w-[min(22rem,90vw)] flex-col overflow-hidden rounded-2xl glass-gold shadow-glow-lg animate-fade-in">
          <div className="flex items-center gap-2 border-b border-white/10 bg-slate-900/60 px-4 py-3">
            <Sparkles size={16} className="text-gold" />
            <span className="text-sm font-semibold text-slate-100">Cosmic Advisor</span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'ml-auto bg-gold/15 text-slate-100'
                    : 'bg-slate-800/70 text-slate-200'
                }`}
              >
                {m.content}
              </div>
            ))}
            {busy && (
              <div className="max-w-[85%] rounded-2xl bg-slate-800/70 px-3.5 py-2.5 text-sm text-slate-400">
                <span className="animate-pulse-glow">Consulting the stars…</span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="flex items-center gap-2 border-t border-white/10 p-3">
            <input
              className="input-field py-2 text-sm"
              placeholder={lang === 'hi' ? 'अपना प्रश्न लिखें…' : 'Type your question…'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
            />
            <button onClick={send} disabled={busy} className="btn-gold !px-3 !py-2">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
