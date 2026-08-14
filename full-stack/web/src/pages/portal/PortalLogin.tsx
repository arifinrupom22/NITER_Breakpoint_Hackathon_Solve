import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { GraduationCap, Users, ShieldCheck, Lock, KeyRound, ArrowLeft, Info } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { Logo } from '../../components/Logo';
import { Spinner } from '../../components/ui';

const META = {
  student: {
    title: 'Student Portal',
    desc: 'Access courses, routine, attendance, results, notices, and Helping Zone.',
    icon: GraduationCap,
    hint: 'Demo: 2023001 / student123',
    to: '/portal/student/dashboard',
    bg: 'from-niter-800 to-niter-600',
  },
  teacher: {
    title: 'Teacher Portal',
    desc: 'Manage courses, attendance, marks, routine, and student support.',
    icon: Users,
    hint: 'Demo: T001 / teacher123',
    to: '/portal/teacher/dashboard',
    bg: 'from-emerald-800 to-emerald-600',
  },
  admin: {
    title: 'Admin Portal',
    desc: 'Manage academic information, users, courses, rooms, routines, notices, and reports.',
    icon: ShieldCheck,
    hint: 'Demo: admin / admin123',
    to: '/portal/admin/dashboard',
    bg: 'from-gold-700 to-gold-500',
  },
} as const;

export default function PortalLogin({ role }: { role: keyof typeof META }) {
  const m = META[role];
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await api.post<{ token: string; user: Record<string, unknown> }>('/api/auth/login', { username, password, role });
      login({ role, ...res.user }, res.token);
      nav(params.get('next') || m.to);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Connection temporarily unavailable. Please try again.');
    }
    setBusy(false);
  };

  return (
    <section className="relative min-h-[80vh] overflow-hidden bg-ink-950 py-16">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 15% 25%, #2563eb 0, transparent 40%), radial-gradient(circle at 85% 75%, #c9a227 0, transparent 35%)' }} />
      <div className="container-x relative grid items-center gap-10 lg:grid-cols-2">
        <div>
          <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-300 transition hover:text-white">
            <ArrowLeft size={15} /> Back to Website
          </Link>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-gold-300">
            <m.icon size={13} /> NITER Smart Campus
          </p>
          <h1 className="font-display text-4xl font-semibold text-white md:text-5xl">{m.title}</h1>
          <p className="mt-4 max-w-md text-ink-300">{m.desc}</p>
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
            <Info size={18} className="shrink-0 text-gold-300" />
            <p className="text-sm text-ink-300">
              For the hackathon demo use the documented credentials: <span className="font-semibold text-white">{m.hint}</span>
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
          <div className="mb-6 flex flex-col items-center text-center">
            <Logo size={56} />
            <h2 className="mt-3 font-display text-xl font-semibold text-ink-900">{m.title}</h2>
            <p className="text-sm text-ink-400">Sign in to continue</p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">{role === 'student' ? 'Student ID' : role === 'teacher' ? 'Teacher ID' : 'Username'}</label>
              <input className="input" placeholder={role === 'admin' ? 'admin' : role === 'teacher' ? 'T001' : '2023001'} value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button disabled={busy} className="btn btn-primary w-full !py-3">
              {busy ? <Spinner /> : <><Lock size={15} /> Sign In</>}
            </button>
          </form>
          <div className="mt-6 grid grid-cols-3 gap-2 text-center text-[11px]">
            <Link to="/portal/student" className="rounded-lg bg-ink-50 p-2.5 font-semibold text-ink-600 transition hover:bg-niter-50 hover:text-niter-700">Student</Link>
            <Link to="/portal/teacher" className="rounded-lg bg-ink-50 p-2.5 font-semibold text-ink-600 transition hover:bg-emerald-50 hover:text-emerald-700">Teacher</Link>
            <Link to="/portal/admin" className="rounded-lg bg-ink-50 p-2.5 font-semibold text-ink-600 transition hover:bg-gold-50 hover:text-gold-700">Admin</Link>
          </div>
          <p className="mt-4 flex items-center justify-center gap-1 text-[11px] text-ink-400">
            <KeyRound size={11} /> Protected by secure JWT authentication
          </p>
        </div>
      </div>
    </section>
  );
}
