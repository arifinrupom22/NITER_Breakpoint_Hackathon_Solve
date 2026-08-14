import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { Modal } from './ui';

const INDEX = [
  { label: 'Home', to: '/', keys: 'home campus' },
  { label: 'About NITER', to: '/about', keys: 'about mission vision history' },
  { label: 'Academics', to: '/academics', keys: 'academic programs courses admission' },
  { label: 'Departments', to: '/departments', keys: 'department cse eee textile fashion ipe' },
  { label: 'Admissions', to: '/admissions', keys: 'admission apply admission form' },
  { label: 'Research', to: '/research', keys: 'research innovation lab' },
  { label: 'Notices', to: '/notices', keys: 'notice exam notice board' },
  { label: 'News & Events', to: '/news-events', keys: 'news event tech fest' },
  { label: 'Campus Life', to: '/campus-life', keys: 'campus life gallery club' },
  { label: 'Student Services', to: '/student-services', keys: 'services helping zone scholarship' },
  { label: 'Smart Transport', to: '/transport', keys: 'transport bus route tracking shuttle' },
  { label: 'Student Portal', to: '/portal/student', keys: 'student portal login routine result' },
  { label: 'Teacher Portal', to: '/portal/teacher', keys: 'teacher portal attendance marks' },
  { label: 'Admin Portal', to: '/portal/admin', keys: 'admin portal management' },
  { label: 'Driver Console', to: '/transport/driver', keys: 'driver login bus start trip' },
];

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('');
  const nav = useNavigate();
  useEffect(() => {
    if (open) {
      setQ('');
      const t = setTimeout(() => document.getElementById('global-search')?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [open]);
  const results = q.trim()
    ? INDEX.filter((i) => `${i.label} ${i.keys}`.toLowerCase().includes(q.toLowerCase()))
    : INDEX;

  return (
    <Modal open={open} onClose={onClose} title="Search NITER">
      <div className="relative">
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          id="global-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search pages, portals, transport…"
          className="input pl-10"
        />
      </div>
      <div className="mt-4 max-h-80 space-y-1 overflow-y-auto">
        {results.length === 0 && <p className="py-6 text-center text-sm text-ink-400">No results for “{q}”</p>}
        {results.map((r) => (
          <button
            key={r.to}
            onClick={() => {
              nav(r.to);
              onClose();
            }}
            className="group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition hover:bg-niter-50"
          >
            <span className="text-sm font-medium text-ink-800">{r.label}</span>
            <ArrowRight size={15} className="text-ink-300 transition group-hover:translate-x-1 group-hover:text-niter-600" />
          </button>
        ))}
      </div>
    </Modal>
  );
}
