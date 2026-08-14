import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, MapPin, ArrowRight, Tag } from 'lucide-react';
import { api } from '../../lib/api';
import { Reveal } from '../../components/Reveal';
import { Badge, SectionHeading } from '../../components/ui';

type NewsItem = { id: string; title: string; summary: string; date: string; category: string; image: string };
type EventItem = { id: string; title: string; date: string; time: string; location: string; category: string; registration: string };

export function NewsEvents() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    api.get<NewsItem[]>('/api/portal/news').then(setNews).catch(() => {});
    api.get<EventItem[]>('/api/portal/events').then(setEvents).catch(() => {});
  }, []);

  return (
    <section className="section">
      <div className="container-x">
        <SectionHeading eyebrow="Stay Informed" title="News and Events" desc="The latest from the NITER campus community." />
        <div className="grid gap-10 lg:grid-cols-5">
          {/* Latest news */}
          <div className="lg:col-span-3">
            <h3 className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-ink-500">
              <span className="h-2 w-2 rounded-full bg-niter-600" /> Latest News
            </h3>
            <div className="space-y-6">
              {news.map((n, i) => (
                <Reveal key={n.id} delay={i * 80}>
                  <Link to="/news-events" className="group grid gap-4 rounded-2xl border border-ink-100 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-lift sm:grid-cols-[200px_1fr]">
                    <div className="overflow-hidden rounded-xl">
                      <img src={`/images/${n.image}.svg`} alt="" className="h-36 w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs text-ink-400">
                        <CalendarDays size={13} /> {new Date(n.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        <Badge>{n.category}</Badge>
                      </div>
                      <h4 className="mt-2 font-semibold leading-snug text-ink-900 transition-colors group-hover:text-niter-700">{n.title}</h4>
                      <p className="mt-1.5 line-clamp-2 text-sm text-ink-500">{n.summary}</p>
                      <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-niter-600">Read More <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" /></span>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Upcoming events */}
          <div className="lg:col-span-2">
            <h3 className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-ink-500">
              <span className="h-2 w-2 rounded-full bg-gold-500" /> Upcoming Events
            </h3>
            <div className="space-y-4">
              {events.slice(0, 4).map((e, i) => (
                <Reveal key={e.id} delay={i * 70} direction="right">
                  <div className="card card-hover group flex gap-4 p-4">
                    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-niter-700 text-white">
                      <span className="text-xl font-bold leading-none">{new Date(e.date).getDate()}</span>
                      <span className="text-[10px] uppercase tracking-wider">{new Date(e.date).toLocaleString('en-GB', { month: 'short' })}</span>
                    </div>
                    <div className="min-w-0">
                      <Badge tone={e.registration === 'Open' ? 'green' : 'gold'}>{e.registration === 'Open' ? 'Registration Open' : 'Coming Soon'}</Badge>
                      <h4 className="mt-1.5 font-semibold leading-snug text-ink-900">{e.title}</h4>
                      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-400">
                        <span className="inline-flex items-center gap-1"><Clock size={11} /> {e.time}</span>
                        <span className="inline-flex items-center gap-1"><MapPin size={11} /> {e.location}</span>
                        <span className="inline-flex items-center gap-1"><Tag size={11} /> {e.category}</span>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <Link to="/news-events" className="btn btn-outline mt-6 w-full">View All Events</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
