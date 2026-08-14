import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, CalendarDays, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { Reveal } from '../../components/Reveal';
import { Badge, SectionHeading } from '../../components/ui';

type EventItem = { id: string; title: string; date: string; time: string; location: string; category: string; registration: string; description: string };

export function UpcomingEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);
  useEffect(() => {
    api.get<EventItem[]>('/api/portal/events').then(setEvents).catch(() => {});
  }, []);

  return (
    <section className="section bg-ink-50/50">
      <div className="container-x">
        <SectionHeading eyebrow="Mark Your Calendar" title="Upcoming Events" desc="Conferences, competitions and workshops across the NITER campus." />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {events.map((e, i) => {
            const d = new Date(e.date);
            return (
              <Reveal key={e.id} delay={i * 70}>
                <div className="card card-hover group h-full overflow-hidden">
                  <div className="flex items-center justify-between bg-ink-950 px-5 py-4 text-white">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-niter-700">
                        <span className="text-lg font-bold leading-none">{d.getDate()}</span>
                        <span className="text-[9px] uppercase tracking-wider">{d.toLocaleString('en-GB', { month: 'short' })}</span>
                      </span>
                      <div>
                        <p className="font-semibold">{e.title}</p>
                        <p className="text-xs text-gold-300">{d.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-sm leading-relaxed text-ink-600">{e.description}</p>
                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-500">
                      <span className="inline-flex items-center gap-1"><Clock size={12} /> {e.time}</span>
                      <span className="inline-flex items-center gap-1"><MapPin size={12} /> {e.location}</span>
                      <span className="inline-flex items-center gap-1"><CalendarDays size={12} /> {e.category}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-ink-50 pt-3">
                      <Badge tone={e.registration === 'Open' ? 'green' : 'gold'}>{e.registration === 'Open' ? 'Registration Open' : 'Registration Soon'}</Badge>
                      <Link to="/news-events" className="inline-flex items-center gap-1 text-sm font-semibold text-niter-600">
                        Details <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
