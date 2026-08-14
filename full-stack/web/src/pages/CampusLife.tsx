import { useState } from 'react';
import { PageHero } from '../components/PageHero';
import { Reveal } from '../components/Reveal';
import { X } from 'lucide-react';

const GALLERY = [
  ['gallery-1', 'Academic Activities'], ['gallery-2', 'Laboratories'], ['gallery-3', 'Research'],
  ['gallery-4', 'Student Clubs'], ['gallery-5', 'Cultural Programs'], ['gallery-6', 'Sports'], ['gallery-7', 'Campus Events'],
];

export default function CampusLife() {
  const [active, setActive] = useState<string | null>(null);
  return (
    <>
      <PageHero title="Campus Life" crumb="Campus Life" desc="A vibrant, connected campus — clubs, culture, sports and daily life at NITER." img="/images/gallery-6.svg" />
      <section className="section">
        <div className="container-x">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {GALLERY.map(([img, label], i) => (
              <Reveal key={img} delay={i * 55}>
                <button onClick={() => setActive(label)} className={`group relative block w-full overflow-hidden rounded-2xl text-left ${i === 0 ? 'col-span-2 row-span-2' : ''}`}>
                  <img src={`/images/${img}.svg`} alt={label} className={`w-full object-cover transition-transform duration-700 group-hover:scale-110 ${i === 0 ? 'h-full min-h-[320px]' : 'h-48'}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 to-transparent" />
                  <p className="absolute bottom-3 left-4 font-semibold text-white">{label}</p>
                </button>
              </Reveal>
            ))}
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-4">
            {[
              ['12+', 'Active Clubs'], ['25+', 'Cultural Programs'], ['8', 'Sports Facilities'], ['20+', 'Modern Labs'],
            ].map(([v, l]) => (
              <div key={l} className="rounded-2xl border border-ink-100 bg-ink-50/50 p-6 text-center">
                <p className="font-display text-3xl font-semibold text-niter-700">{v}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-ink-500">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {active && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm" onClick={() => setActive(null)} />
          <div className="relative max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-slideDown">
            <img src={`/images/${GALLERY.find(([g]) => g === active) ? (GALLERY.find(([, l]) => l === active)?.[0]) : ''}.svg`} alt={active} className="h-72 w-full object-cover" />
            <button onClick={() => setActive(null)} aria-label="Close" className="absolute right-3 top-3 rounded-full bg-ink-950/60 p-2 text-white"><X size={18} /></button>
            <div className="p-6">
              <p className="font-display text-xl font-semibold text-ink-900">{active}</p>
              <p className="mt-2 text-sm text-ink-500">Life at NITER — where students learn, build, perform and grow together.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
