import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Search, LayoutGrid, X } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { fmtRelative } from '../lib/format';

type Notif = { id: string; title: string; body: string; at: string; read?: boolean };

export function Header({ onOpenSearch }: { onOpenSearch: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const { user, logout } = useAuth();
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const fetchNotifs = () => {
      if (user) api.get<Notif[]>('/api/transport/notifications').then(setNotifs).catch(() => {});
    };
    fetchNotifs();
    const iv = setInterval(fetchNotifs, 20000);
    return () => clearInterval(iv);
  }, [user]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <header className={`sticky top-0 z-50 border-b border-ink-100 bg-white/95 backdrop-blur transition-shadow ${scrolled ? 'shadow-card' : ''}`}>
      <div className="container-x flex items-center justify-between gap-4 py-3">
        <div className="flex items-center gap-3.5">
          <Link to="/" aria-label="NITER home" className="transition-transform hover:scale-[1.03]">
            <Logo size={54} />
          </Link>
          <div className="leading-tight">
            <Link to="/" className="block font-display text-lg font-semibold text-ink-900 md:text-xl">
              National Institute of Textile Engineering and Research
            </Link>
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-niter-600">Smart Campus Management System</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={onOpenSearch} aria-label="Search" className="rounded-lg border border-ink-100 p-2.5 text-ink-500 transition hover:border-niter-300 hover:text-niter-600">
            <Search size={18} />
          </button>
          <div className="relative" ref={bellRef}>
            <button onClick={() => setNotifOpen((o) => !o)} aria-label="Notifications" className="relative rounded-lg border border-ink-100 p-2.5 text-ink-500 transition hover:border-niter-300 hover:text-niter-600">
              <Bell size={18} />
              {notifs.some((n) => !n.read) && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-12 w-80 rounded-xl border border-ink-100 bg-white p-2 shadow-lift animate-slideDown">
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Notifications</p>
                {notifs.length === 0 && <p className="px-3 py-4 text-center text-sm text-ink-400">No notifications yet.</p>}
                {notifs.slice(0, 6).map((n) => (
                  <div key={n.id} className="rounded-lg px-3 py-2.5 transition hover:bg-niter-50">
                    <p className="text-sm font-medium text-ink-800">{n.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-ink-500">{n.body}</p>
                    <p className="mt-1 text-[10px] text-ink-400">{fmtRelative(n.at)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Link to="/portal/student" className="hidden items-center gap-2 rounded-lg bg-niter-700 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-niter-600 sm:inline-flex">
            <LayoutGrid size={16} /> Quick Access
          </Link>
          {user && (
            <div className="hidden items-center gap-2 rounded-lg border border-ink-100 px-3 py-1.5 md:flex">
              <span className="text-sm font-medium text-ink-700">{user.name}</span>
              <button onClick={logout} aria-label="Logout" className="text-ink-400 transition hover:text-red-500">
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
