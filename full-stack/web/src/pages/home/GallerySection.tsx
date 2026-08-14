import { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';
import { Reveal } from '../../components/Reveal';
import { SectionHeading } from '../../components/ui';

const CATEGORIES = [
  { key: 'Academic Activities', img: 'gallery-1', count: 8 },
  { key: 'Laboratories', img: 'gallery-2', count: 12 },
  { key: 'Research', img: 'gallery-3', count: 6 },
  { key: 'Student Clubs', img: 'gallery-4', count: 10 },
  { key: 'Cultural Programs', img: 'gallery-5', count: 9 },
  { key: 'Sports', img: 'gallery-6', count: 7 },
  { key: 'Campus Events', img: 'gallery-7', count: 11 },
];

export function GallerySection() {
  const [active, setActive] = useState<string | null>(null);
  const item = CATEGORIES.find((c) => c.key === active);

  return (
    <section className="section bg-white">
      <div className="container-x">
        <SectionHeading eyebrow="Campus Life" title="Life at NITER" desc="A vibrant campus — academics, clubs, culture and sport." center />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.key} delay={i * 60}>
              <button
                onClick={() => setActive(c.key)}
                className={`group relative block w-full overflow-hidden rounded-2xl text-left shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift ${i === 0 || i === 6 ? 'col-span-2' : ''}`}
              >
                <img src={`/images/${c.img}.svg`} alt={c.key} className="h-52 w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="font-semibold text-white">{c.key}</p>
                  <p className="text-xs text-ink-300">{c.count} moments</p>
                </div>
                <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                  <ZoomIn size={15} />
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {item && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm animate-fadeIn" onClick={() => setActive(null)} />
          <div className="relative max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-slideDown">
            <img src={`/images/${item.img}.svg`} alt={item.key} className="h-72 w-full object-cover" />
            <button onClick={() => setActive(null)} aria-label="Close" className="absolute right-3 top-3 rounded-full bg-ink-950/60 p-2 text-white backdrop-blur transition hover:bg-ink-950">
              <X size={18} />
            </button>
            <div className="p-6">
              <p className="font-display text-xl font-semibold text-ink-900">{item.key}</p>
              <p className="mt-2 text-sm text-ink-500">
                A glimpse into {item.key.toLowerCase()} at NITER — where students learn, build, perform and grow together.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
