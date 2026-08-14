import { useEffect, useState } from 'react';
import { CalendarDays, Clock, MapPin, ArrowRight, Tag } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { Badge, EmptyState, SectionHeading } from '../components/ui';
import { api } from '../lib/api';

type NewsItem = { id: string; title: string; summary: string; date: string; category: string; image: string };
type EventItem = { id: string; title: string; date: string; time: string; location: string; category: string; registration: string; description: string };

export default function NewsEventsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    api.get<NewsItem[]>('/api/portal/news').then(setNews).catch(() => {});
    api.get<EventItem[]>('/api/portal/events').then(setEvents).catch(() => {});
  }, []);

  return (
    <>
      <PageHero title="News & Events" crumb="News & Events" desc="The latest stories, announcements and upcoming events from across the NITER community." img="/images/gallery-5.svg" />
      <section className="section">
        <div className="container-x">
          <SectionHeading eyebrow="Latest Stories" title="News" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.map((n, i) => (
              <div key={n.id} className="card card-hover group overflow-hidden">
                <div className="overflow-hidden">
                  <img src={`/images/${n.image}.svg`} alt="" className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-ink-400">
                    <CalendarDays size={12} /> {new Date(n.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    <Badge>{n.category}</Badge>
                  </div>
                  <h3 className="mt-2 font-semibold leading-snug text-ink-900 group-hover:text-niter-700">{n.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-ink-500">{n.summary}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-niter-600">Read More <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" /></span>
                </div>
              </div>
            ))}
          </div>

          <SectionHeading eyebrow="Calendar" title="Upcoming Events" />
          {events.length === 0 && <EmptyState title="No events scheduled yet" />}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => {
              const d = new Date(e.date);
              return (
                <div key={e.id} className="card card-hover p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-niter-700 text-white">
                      <span className="text-lg font-bold leading-none">{d.getDate()}</span>
                      <span className="text-[9px] uppercase">{d.toLocaleString('en-GB', { month: 'short' })}</span>
                    </span>
                    <div>
                      <h3 className="font-semibold leading-snug text-ink-900">{e.title}</h3>
                      <Badge tone={e.registration === 'Open' ? 'green' : 'gold'}>{e.registration}</Badge>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-500">
                    <span className="inline-flex items-center gap-1"><Clock size={12} /> {e.time}</span>
                    <span className="inline-flex items-center gap-1"><MapPin size={12} /> {e.location}</span>
                    <span className="inline-flex items-center gap-1"><Tag size={12} /> {e.category}</span>
                  </div>
                  <p className="mt-3 text-sm text-ink-500">{e.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
