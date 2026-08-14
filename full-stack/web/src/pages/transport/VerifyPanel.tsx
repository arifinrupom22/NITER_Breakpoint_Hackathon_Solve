import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, Lock, ShieldCheck, UserRound } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { Spinner } from '../../components/ui';
import { cls } from '../../lib/format';

type VerUser = {
  role: string; name: string; card: string; studentId?: string; teacherId?: string;
  department?: string; batch?: string; eligibleBuses: string[];
};

export function VerifyPanel({ onDone }: { onDone?: () => void }) {
  const [tab, setTab] = useState<'student' | 'teacher'>('student');
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async () => {
    setError('');
    setBusy(true);
    try {
      const res = await api.post<{ token: string; user: VerUser }>('/api/auth/transport/verify', { name, card: id });
      login(res.user, res.token);
      nav('/transport/live');
      onDone?.();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Connection temporarily unavailable. Please try again.';
      setError(msg);
    }
    setBusy(false);
  };

  return (
    <div>
      <div className="mb-6 rounded-xl bg-niter-50 p-4 text-sm text-niter-800">
        <p className="flex items-center gap-2 font-semibold"><Lock size={14} /> Protected access</p>
        <p className="mt-1 text-niter-600">Live transport tracking is available only to authorized NITER students and teachers.</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {(
          [
            { key: 'student', icon: GraduationCap, label: 'Student', hint: 'Bus Card No.' },
            { key: 'teacher', icon: Users, label: 'Teacher', hint: 'Teacher / Transport ID' },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setError(''); }}
            className={cls(
              'flex flex-col items-center gap-1.5 rounded-xl border-2 px-4 py-4 transition-all',
              tab === t.key ? 'border-niter-600 bg-niter-50' : 'border-ink-100 hover:border-niter-200'
            )}
          >
            <t.icon size={22} className={tab === t.key ? 'text-niter-600' : 'text-ink-400'} />
            <span className="text-sm font-semibold text-ink-900">{t.label}</span>
            <span className="text-[11px] text-ink-400">{t.hint}</span>
          </button>
        ))}
      </div>

      <form
        className="mt-5 space-y-4"
        onSubmit={(e) => { e.preventDefault(); submit(); }}
      >
        <div>
          <label className="label">Full Name</label>
          <input className="input" placeholder={tab === 'student' ? 'e.g. Arifin Rupom' : 'e.g. Dr. Rahman'} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="label">{tab === 'student' ? 'Bus Card Number' : 'Teacher / Transport ID'}</label>
          <input className="input uppercase" placeholder={tab === 'student' ? 'e.g. BUS06' : 'e.g. T001'} value={id} onChange={(e) => setId(e.target.value)} required />
        </div>
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700 animate-fadeUp">
            <p className="flex items-center gap-2 font-semibold"><ShieldCheck size={15} /> Access denied</p>
            <p className="mt-1">{error}</p>
          </div>
        )}
        <button type="submit" disabled={busy} className="btn btn-primary w-full">
          {busy ? <Spinner /> : <><UserRound size={16} /> Verify & View Live Location</>}
        </button>
        <p className="text-center text-xs text-ink-400">
          Demo students: Arifin Rupom · BUS06 · Sneha Rahman · BUS26 · Nabila Nawshin · BUS32
        </p>
      </form>
    </div>
  );
}
