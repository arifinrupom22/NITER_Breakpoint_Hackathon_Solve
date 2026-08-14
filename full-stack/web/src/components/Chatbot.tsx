import { useEffect, useRef, useState } from 'react';
import { Bot, Send, X, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { cls } from '../lib/format';

type Msg = { role: 'user' | 'bot'; text: string };

const SUGGESTIONS = [
  'When will Student Bus 1 arrive?',
  "What is today's bus schedule?",
  'Which bus should I take?',
  'Is my bus crowded?',
  'What is the best time to leave?',
];

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'bot', text: 'Assalamu alaikum! I am the NITER Transport Assistant. Ask me about bus schedules, live location, occupancy, delays or the best time to leave.' }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs, open]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || busy) return;
    setInput('');
    setMsgs((m) => [...m, { role: 'user', text: msg }]);
    setBusy(true);
    try {
      const res = await api.post<{ reply: string }>('/api/ai/chat', { message: msg });
      setMsgs((m) => [...m, { role: 'bot', text: res.reply }]);
    } catch {
      setMsgs((m) => [...m, { role: 'bot', text: 'Connection temporarily unavailable. Please try again in a moment.' }]);
    }
    setBusy(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="NITER Transport Assistant"
        className={cls(
          'fixed bottom-6 left-6 z-[80] flex h-14 w-14 items-center justify-center rounded-full shadow-lift transition-all hover:scale-110',
          open ? 'bg-ink-900 text-white' : 'bg-niter-700 text-white'
        )}
      >
        {open ? <X size={22} /> : <Bot size={24} />}
        {!open && <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5"><span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative h-3.5 w-3.5 rounded-full bg-emerald-500" /></span>}
      </button>

      {open && (
        <div className="fixed bottom-24 left-6 z-[80] flex h-[520px] w-[380px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-lift animate-slideDown">
          <div className="flex items-center gap-3 bg-ink-950 px-4 py-3.5 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-niter-600"><Bot size={18} /></span>
            <div>
              <p className="text-sm font-semibold">NITER Transport Assistant</p>
              <p className="flex items-center gap-1.5 text-[11px] text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> AI-powered · live system data</p>
            </div>
          </div>
          <div ref={boxRef} className="flex-1 space-y-3 overflow-y-auto bg-ink-50/50 px-4 py-4">
            {msgs.map((m, i) => (
              <div key={i} className={cls('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={cls('max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm', m.role === 'user' ? 'bg-niter-700 text-white rounded-br-sm' : 'bg-white text-ink-800 shadow-card rounded-bl-sm')}>
                  {m.text}
                </div>
              </div>
            ))}
            {busy && <div className="flex items-center gap-2 text-xs text-ink-400"><Loader2 size={13} className="animate-spin" /> thinking…</div>}
          </div>
          <div className="border-t border-ink-100 bg-white p-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-full border border-niter-200 bg-niter-50 px-2.5 py-1 text-[11px] text-niter-700 transition hover:bg-niter-100">
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Ask about buses, routes, ETA…"
                className="input"
              />
              <button onClick={() => send()} disabled={busy} aria-label="Send" className="btn btn-primary shrink-0 !px-3.5">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
