import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X, XCircle } from 'lucide-react';
import { cls } from '../lib/format';

/* ----------------------------- Modal ------------------------------------ */
export function Modal({
  open, onClose, title, children, wide,
}: { open: boolean; onClose: () => void; title?: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className={`relative w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} max-h-[88vh] overflow-y-auto rounded-2xl bg-white shadow-2xl animate-slideDown`}>
        <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
          <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-ink-400 transition hover:bg-ink-50 hover:text-ink-700">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

/* ----------------------------- Toasts ----------------------------------- */
type Toast = { id: number; kind: 'success' | 'error' | 'info'; message: string };
const ToastCtx = createContext<{ toast: (kind: Toast['kind'], message: string) => void }>({ toast: () => {} });
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((kind: Toast['kind'], message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);
  const icons = {
    success: <CheckCircle2 size={18} className="text-emerald-500" />,
    error: <XCircle size={18} className="text-red-500" />,
    info: <Info size={18} className="text-niter-500" />,
  };
  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex w-80 flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="flex items-start gap-3 rounded-xl border border-ink-100 bg-white p-4 shadow-lift animate-slideInRight">
            {icons[t.kind]}
            <p className="flex-1 text-sm text-ink-800">{t.message}</p>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ----------------------------- Badge ------------------------------------ */
export function Badge({ children, tone = 'niter' }: { children: ReactNode; tone?: string }) {
  const tones: Record<string, string> = {
    niter: 'bg-niter-50 text-niter-700 border-niter-200',
    gold: 'bg-gold-50 text-gold-700 border-gold-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    gray: 'bg-ink-50 text-ink-600 border-ink-100',
    purple: 'bg-violet-50 text-violet-700 border-violet-200',
  };
  return <span className={cls('chip border', tones[tone] || tones.niter)}>{children}</span>;
}

/* ----------------------------- Stat ------------------------------------- */
export function Stat({ label, value, icon, delay = 0 }: { label: string; value: number; icon?: ReactNode; delay?: number }) {
  const [n, setN] = useState(0);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = document.getElementById(`stat-${label}`);
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setSeen(true);
        obs.disconnect();
      }
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [label]);
  useEffect(() => {
    if (!seen) return;
    const start = performance.now();
    const dur = 1400;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [seen, value]);
  return (
    <div id={`stat-${label}`} className="card card-hover p-5 text-center">
      {icon && <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-niter-50 text-niter-600">{icon}</div>}
      <div className="font-display text-3xl font-semibold text-ink-900">{n.toLocaleString()}</div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wide text-ink-500">{label}</div>
    </div>
  );
}

/* ----------------------------- Skeleton / Empty -------------------------- */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={cls('skeleton', className)} />;
}
export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50/40 p-10 text-center">
      <p className="font-medium text-ink-700">{title}</p>
      {hint && <p className="mt-1 text-sm text-ink-400">{hint}</p>}
    </div>
  );
}

/* ----------------------------- Tabs ------------------------------------- */
export function Tabs({ items, active, onChange }: { items: { key: string; label: string }[]; active: string; onChange: (k: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl bg-ink-50 p-1">
      {items.map((it) => (
        <button
          key={it.key}
          onClick={() => onChange(it.key)}
          className={cls(
            'rounded-lg px-4 py-2 text-sm font-medium transition-all',
            active === it.key ? 'bg-white text-niter-700 shadow-card' : 'text-ink-500 hover:text-ink-800'
          )}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

/* ----------------------------- Section heading --------------------------- */
export function SectionHeading({ eyebrow, title, desc, center }: { eyebrow?: string; title: string; desc?: string; center?: boolean }) {
  return (
    <div className={cls('mb-10 max-w-2xl', center && 'mx-auto text-center')}>
      {eyebrow && (
        <p className={cls('eyebrow mb-3', center && 'justify-center')}>
          <span className="h-px w-8 bg-gold-500" />
          {eyebrow}
        </p>
      )}
      <h2 className="h-display">{title}</h2>
      {desc && <p className="mt-3 text-ink-500">{desc}</p>}
    </div>
  );
}

/* ----------------------------- Loading button ---------------------------- */
export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={cls('animate-spin text-current', className)} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
    </svg>
  );
}

export { cls };
