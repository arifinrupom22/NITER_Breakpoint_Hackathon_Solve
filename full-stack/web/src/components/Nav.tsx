import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { GraduationCap, Users, ShieldCheck, ChevronDown, Menu, X, Bus, LayoutGrid, ArrowUpRight } from 'lucide-react';
import { cls } from '../lib/format';

const LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About NITER', to: '/about' },
  { label: 'Academics', to: '/academics' },
  { label: 'Departments', to: '/departments' },
  { label: 'Admissions', to: '/admissions' },
  { label: 'Research', to: '/research' },
  { label: 'Notices', to: '/notices' },
  { label: 'News & Events', to: '/news-events' },
  { label: 'Campus Life', to: '/campus-life' },
  { label: 'Student Services', to: '/student-services' },
];

const PORTALS = [
  {
    to: '/portal/student',
    icon: GraduationCap,
    title: 'Student Portal',
    desc: 'Access courses, routine, attendance, results, notices, and Helping Zone.',
    accent: 'bg-niter-50 text-niter-600',
  },
  {
    to: '/portal/teacher',
    icon: Users,
    title: 'Teacher Portal',
    desc: 'Manage courses, attendance, marks, routine, and student support.',
    accent: 'bg-emerald-50 text-emerald-600',
  },
  {
    to: '/portal/admin',
    icon: ShieldCheck,
    title: 'Admin Portal',
    desc: 'Manage academic information, users, courses, rooms, routines, notices, and reports.',
    accent: 'bg-gold-50 text-gold-600',
  },
];

export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const portalRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
    setPortalOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (portalRef.current && !portalRef.current.contains(e.target as Node)) setPortalOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const navCls = ({ isActive }: { isActive: boolean }) =>
    cls(
      'inline-flex items-center rounded-md px-2.5 py-2 text-[13px] font-semibold tracking-wide transition-colors',
      isActive ? 'text-niter-700' : 'text-ink-700 hover:text-niter-600'
    );

  return (
    <nav className="border-b border-ink-100 bg-white">
      <div className="container-x flex items-center justify-between">
        <div className="hidden items-center gap-0.5 lg:flex">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={navCls} end={l.to === '/'}>
              {l.label}
            </NavLink>
          ))}

          {/* SMART TRANSPORT — top-level, separate from PORTAL */}
          <NavLink
            to="/transport"
            className={({ isActive }) =>
              cls(
                'ml-1 inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[13px] font-bold tracking-wide transition-all',
                isActive
                  ? 'border-niter-700 bg-niter-700 text-white shadow-soft'
                  : 'border-gold-400 bg-gold-50 text-gold-800 hover:bg-gold-100 hover:-translate-y-0.5 hover:shadow-card'
              )
            }
          >
            <Bus size={15} /> SMART TRANSPORT
          </NavLink>

          {/* PORTAL dropdown */}
          <div className="relative ml-1" ref={portalRef}>
            <button
              onClick={() => setPortalOpen((o) => !o)}
              aria-haspopup="true"
              aria-expanded={portalOpen}
              className={cls(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-bold tracking-wide transition-all',
                portalOpen || location.pathname.startsWith('/portal')
                  ? 'bg-ink-900 text-white shadow-soft'
                  : 'bg-ink-100 text-ink-800 hover:bg-ink-200'
              )}
            >
              <LayoutGrid size={15} /> PORTAL <ChevronDown size={14} className={cls('transition-transform', portalOpen && 'rotate-180')} />
            </button>
            {portalOpen && (
              <div className="absolute right-0 top-full z-50 w-[400px] pt-2 animate-slideDown">
                <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-lift">
                  <div className="border-b border-ink-100 bg-ink-950 px-5 py-3 text-white">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-300">Campus Portals</p>
                    <p className="mt-0.5 text-[13px] text-ink-300">Sign in to your academic workspace</p>
                  </div>
                  {PORTALS.map((p, i) => (
                    <Link
                      key={p.to}
                      to={p.to}
                      style={{ animationDelay: `${i * 60}ms` }}
                      className="group flex items-start gap-4 border-b border-ink-50 px-5 py-4 transition-colors last:border-0 hover:bg-niter-50/60 animate-slideDown"
                    >
                      <span className={cls('mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110', p.accent)}>
                        <p.icon size={19} />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5 font-semibold text-ink-900">
                          {p.title}
                          <ArrowUpRight size={14} className="text-ink-300 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-niter-600 group-hover:opacity-100" />
                        </span>
                        <span className="mt-1 block text-[13px] leading-snug text-ink-500">{p.desc}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <button onClick={() => setMobileOpen((o) => !o)} aria-label="Menu" className="rounded-lg p-2 text-ink-700 hover:bg-ink-50 lg:hidden">
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-ink-100 bg-white px-4 pb-6 pt-2 lg:hidden">
          <div className="grid gap-1">
            {[...LINKS, { label: 'SMART TRANSPORT', to: '/transport' }].map((l) => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => cls('rounded-lg px-3 py-2.5 text-sm font-semibold', isActive ? 'bg-niter-50 text-niter-700' : 'text-ink-700')}>
                {l.label}
              </NavLink>
            ))}
          </div>
          <p className="mt-4 px-3 text-xs font-bold uppercase tracking-wider text-ink-400">Portals</p>
          <div className="mt-1 grid gap-1">
            {PORTALS.map((p) => (
              <Link key={p.to} to={p.to} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">
                <p.icon size={16} className="text-niter-600" /> {p.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
