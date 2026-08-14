import { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Search, ChevronRight, Clock } from 'lucide-react';
import { fmtClock, fmtDate } from '../lib/format';

const QUICK_LINKS = [
  { label: 'Admission', href: '/admissions' },
  { label: 'Academic Calendar', href: '/academics' },
  { label: 'Library', href: '/campus-life' },
  { label: 'Contact', href: '/student-services' },
];

export function TopBar() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="bg-ink-950 text-ink-100">
      <div className="container-x flex items-center justify-between gap-4 py-2 text-xs">
        <div className="flex min-w-0 items-center gap-3">
          <span className="hidden truncate font-medium text-white md:block">
            National Institute of Textile Engineering and Research
          </span>
          <span className="hidden truncate text-ink-300 lg:block">— Excellence in Textile and Engineering Education</span>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <a href="mailto:info@niter.edu.bd" className="hidden items-center gap-1.5 transition hover:text-gold-300 lg:flex">
            <Mail size={12} /> info@niter.edu.bd
          </a>
          <a href="tel:+88027791094" className="hidden items-center gap-1.5 transition hover:text-gold-300 lg:flex">
            <Phone size={12} /> +880 2-7791094
          </a>
          <span className="hidden items-center gap-1.5 xl:flex">
            <MapPin size={12} /> Nayarhat, Savar, Dhaka
          </span>
          <div className="hidden items-center gap-3 md:flex">
            {QUICK_LINKS.map((l) => (
              <a key={l.label} href={l.href} className="group inline-flex items-center gap-0.5 text-ink-300 transition hover:text-gold-300">
                {l.label} <ChevronRight size={10} className="transition group-hover:translate-x-0.5" />
              </a>
            ))}
          </div>
          <button aria-label="Search" className="transition hover:text-gold-300">
            <Search size={13} />
          </button>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2 py-1 font-medium tabular-nums text-gold-300">
            <Clock size={11} /> {fmtClock(now)} · {fmtDate(now)}
          </span>
        </div>
      </div>
    </div>
  );
}
