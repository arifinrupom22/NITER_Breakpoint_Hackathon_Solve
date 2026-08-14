import { ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Menu, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { Logo } from '../Logo';
import { cls } from '../../lib/format';

export type TabDef = { key: string; label: string; icon: ReactNode };

export function DashboardShell({
  title, subtitle, tabs, active, onTab, children,
}: {
  title: string; subtitle: string; tabs: TabDef[]; active: string; onTab: (k: string) => void; children: ReactNode;
}) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ink-50/40">
      {/* Sidebar */}
      <aside className={cls('fixed inset-y-0 left-0 z-50 w-64 bg-ink-950 text-ink-200 transition-transform lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <Logo size={40} dark />
          <div>
            <p className="text-sm font-semibold leading-tight text-white">{title}</p>
            <p className="text-[10px] uppercase tracking-widest text-gold-300">{subtitle}</p>
          </div>
        </div>
        <nav className="space-y-1 p-3">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => { onTab(t.key); setOpen(false); }}
              className={cls('flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition', active === t.key ? 'bg-niter-700 text-white shadow-card' : 'text-ink-300 hover:bg-white/5 hover:text-white')}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </nav>
        <div className="absolute inset-x-0 bottom-0 border-t border-white/10 p-3">
          <div className="rounded-xl bg-white/5 p-3">
            <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
            <p className="text-[11px] capitalize text-ink-300">{user?.role} · {user?.id}</p>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button onClick={() => nav('/')} className="flex items-center justify-center gap-1.5 rounded-lg bg-white/5 py-2 text-xs font-semibold text-ink-200 transition hover:bg-white/10">
              <ArrowLeft size={12} /> Website
            </button>
            <button onClick={() => { logout(); nav('/'); }} className="flex items-center justify-center gap-1.5 rounded-lg bg-red-500/15 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/25">
              <LogOut size={12} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-ink-100 bg-white/95 px-5 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="rounded-lg border border-ink-100 p-2 text-ink-600 lg:hidden"><Menu size={18} /></button>
            <LayoutDashboard size={18} className="text-niter-600" />
            <h1 className="font-display text-lg font-semibold text-ink-900">{tabs.find((t) => t.key === active)?.label || title}</h1>
          </div>
          <span className="hidden text-xs font-medium text-ink-400 sm:block">NITER Smart Campus Management System</span>
        </header>
        <main className="p-5 md:p-7">{children}</main>
      </div>

      {open && <div className="fixed inset-0 z-40 bg-ink-950/50 lg:hidden" onClick={() => setOpen(false)}><X /></div>}
    </div>
  );
}
