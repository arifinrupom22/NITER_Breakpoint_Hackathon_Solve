import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ArrowRight, FileText } from 'lucide-react';
import { api } from '../../lib/api';
import { Reveal } from '../../components/Reveal';
import { Badge, Skeleton, SectionHeading } from '../../components/ui';

type Notice = { id: string; title: string; summary: string; category: string; date: string; badge: string };

export function NoticesSection() {
  const [notices, setNotices] = useState<Notice[] | null>(null);

  useEffect(() => {
    api.get<Notice[]>('/api/portal/notices')
      .then(setNotices)
      .catch(() => setNotices([]));
  }, []);

  return (
    <section className="section bg-ink-50/50">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Notice Board" title="Latest Notices" desc="Official announcements and important updates from NITER administration." />
          <Link to="/notices" className="btn btn-outline mb-10">View All Notices <ArrowRight size={15} /></Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {!notices &&
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-44" />)}
          {notices?.slice(0, 6).map((n, i) => (
            <Reveal key={n.id} delay={i * 60}>
              <Link to="/notices" className="card card-hover group flex h-full flex-col p-5">
                <div className="flex items-center justify-between">
                  <Badge tone={n.badge === 'IMPORTANT' ? 'red' : 'gray'}>{n.category}</Badge>
                  {n.badge && <Badge tone={n.badge === 'NEW' ? 'green' : 'gold'}>{n.badge}</Badge>}
                </div>
                <h3 className="mt-3 line-clamp-2 font-semibold leading-snug text-ink-900 transition-colors group-hover:text-niter-700">{n.title}</h3>
                <p className="mt-2 line-clamp-2 flex-1 text-sm text-ink-500">{n.summary}</p>
                <div className="mt-4 flex items-center justify-between border-t border-ink-50 pt-3 text-xs text-ink-400">
                  <span className="inline-flex items-center gap-1.5"><CalendarDays size={13} /> {new Date(n.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-niter-600">Read More <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" /></span>
                </div>
              </Link>
            </Reveal>
          ))}
          {notices && notices.length === 0 && (
            <div className="col-span-full flex items-center gap-3 rounded-xl border border-dashed border-ink-200 p-8 text-ink-400">
              <FileText size={20} /> No notices published yet.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
