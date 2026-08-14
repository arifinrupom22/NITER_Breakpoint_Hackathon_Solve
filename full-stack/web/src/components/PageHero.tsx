import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PageHero({ title, crumb, desc, img = '/images/hero-3.svg' }: { title: string; crumb: string; desc?: string; img?: string }) {
  return (
    <section className="relative overflow-hidden bg-ink-950 py-16 md:py-20">
      <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink-950/95 via-ink-950/70 to-ink-950/40" />
      <div className="container-x relative">
        <nav aria-label="breadcrumb" className="mb-3 flex items-center gap-1.5 text-xs font-medium text-ink-300">
          <Link to="/" className="transition hover:text-gold-300">Home</Link>
          <ChevronRight size={12} />
          <span className="text-gold-300">{crumb}</span>
        </nav>
        <h1 className="font-display text-3xl font-semibold text-white md:text-5xl">{title}</h1>
        {desc && <p className="mt-3 max-w-2xl text-ink-300">{desc}</p>}
      </div>
    </section>
  );
}
