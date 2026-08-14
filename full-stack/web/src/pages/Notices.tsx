import { useEffect, useState } from 'react';
import { Search, CalendarDays, Megaphone } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { Badge, EmptyState, SectionHeading } from '../components/ui';
import { api } from '../lib/api';

type Notice = { id: string; title: string; summary: string; category: string; date: string; badge: string };

export default function Notices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');

  useEffect(() => {
    api.get<Notice[]>('/api/portal/notices').then(setNotices).catch(() => {});
  }, []);

  const cats = ['All', ...Array.from(new Set(notices.map((n) => n.category)))];
  const filtered = notices.filter(
    (n) => (cat === 'All' || n.category === cat) && (n.title + n.summary).toLowerCase().includes(q.toLowerCase())
  );

  return (
    <>
      <PageHero title="Notice Board" crumb="Notices" desc="Official announcements, exam schedules and important updates from NITER administration." img="/images/gallery-1.svg" />
      <section className="section">
        <div className="container-x">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notices…" className="input pl-10" />
            </div>
            <div className="flex flex-wrap gap-2">
              {cats.map((c) => (
                <button key={c} onClick={() => setCat(c)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${cat === c ? 'bg-niter-700 text-white' : 'bg-ink-50 text-ink-600 hover:bg-ink-100'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            {filtered.length === 0 && <EmptyState title="No notices found" hint="Try a different search or category." />}
            {filtered.map((n, i) => (
              <div key={n.id} className="card card-hover flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-niter-700 text-white">
                  <span className="text-lg font-bold leading-none">{new Date(n.date).getDate()}</span>
                  <span className="text-[9px] uppercase">{new Date(n.date).toLocaleString('en-GB', { month: 'short' })}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{n.category}</Badge>
                    {n.badge && <Badge tone={n.badge === 'IMPORTANT' ? 'red' : 'green'}>{n.badge}</Badge>}
                    <span className="inline-flex items-center gap-1 text-xs text-ink-400"><CalendarDays size={12} /> {new Date(n.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <h3 className="mt-1.5 font-semibold text-ink-900">{n.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-500">{n.summary}</p>
                </div>
                <button className="btn btn-outline btn-sm shrink-0">Read More</button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
