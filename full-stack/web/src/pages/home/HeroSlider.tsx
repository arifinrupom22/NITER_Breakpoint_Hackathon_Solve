import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Bus } from 'lucide-react';
import { cls } from '../../lib/format';

const SLIDES = [
  {
    img: '/images/hero-1.svg',
    tag: 'Welcome to NITER',
    title: 'Empowering Education, Innovation and Excellence',
    desc: 'An integrated digital platform connecting students, teachers, departments, and campus administration.',
  },
  {
    img: '/images/hero-2.svg',
    tag: 'NITER Smart Transport',
    title: 'Building Future Leaders Through Engineering and Technology',
    desc: 'Live campus bus tracking, digital smart passes and AI-powered arrival predictions.',
  },
  {
    img: '/images/hero-3.svg',
    tag: 'Connected Campus',
    title: 'Smart Learning, Connected Campus',
    desc: 'Five departments, one connected ecosystem — academics, transport and campus life in real time.',
  },
  {
    img: '/images/hero-4.svg',
    tag: 'Research & Development',
    title: 'Innovation, Research and Sustainable Development',
    desc: 'Modern laboratories and industry collaboration shaping the textile and technology workforce of tomorrow.',
  },
];

export function HeroSlider() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setIdx((i) => (i + 1) % SLIDES.length), []);
  const prev = () => setIdx((i) => (i - 1 + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    if (paused) return;
    const iv = setInterval(next, 6000);
    return () => clearInterval(iv);
  }, [next, paused]);

  return (
    <section className="relative h-[78vh] min-h-[540px] max-h-[820px] overflow-hidden bg-ink-950" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {SLIDES.map((s, i) => (
        <div key={i} className={cls('absolute inset-0 transition-opacity duration-1000', i === idx ? 'opacity-100' : 'opacity-0')} aria-hidden={i !== idx}>
          <img src={s.img} alt="" className={cls('h-full w-full object-cover', i === idx && 'animate-kenburns')} />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950/95 via-ink-950/70 to-ink-950/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-ink-950/30" />
        </div>
      ))}

      <div className="relative z-10 container-x flex h-full items-center">
        <div key={idx} className="max-w-3xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-gold-300 animate-fadeUp">
            {SLIDES[idx].tag}
          </p>
          <h1 className="font-display text-4xl font-semibold leading-[1.08] text-white md:text-6xl animate-fadeUp" style={{ animationDelay: '90ms' }}>
            NITER Smart Campus
            <span className="mt-3 block text-2xl text-gold-300 md:text-4xl">{SLIDES[idx].title}</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-ink-200 md:text-lg animate-fadeUp" style={{ animationDelay: '180ms' }}>
            {SLIDES[idx].desc}
          </p>
          <div className="mt-8 flex flex-wrap gap-3 animate-fadeUp" style={{ animationDelay: '260ms' }}>
            <Link to="/about" className="btn btn-gold">Explore NITER</Link>
            <Link to="/portal/student" className="btn btn-primary bg-white/10 backdrop-blur hover:bg-white/20 border border-white/25">Access Portal</Link>
            <Link to="/transport" className="btn btn-primary bg-niter-700 hover:bg-niter-600 border border-transparent">
              <Bus size={16} /> Smart Transport
            </Link>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 right-8 z-20 flex items-center gap-3">
        <button onClick={prev} aria-label="Previous slide" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur transition hover:bg-white/25">
          <ChevronLeft size={20} />
        </button>
        <button onClick={next} aria-label="Next slide" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur transition hover:bg-white/25">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} aria-label={`Slide ${i + 1}`} className={cls('h-1.5 rounded-full transition-all duration-500', i === idx ? 'w-10 bg-gold-400' : 'w-4 bg-white/40 hover:bg-white/70')} />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 z-10 w-full bg-gradient-to-t from-ink-950 to-transparent p-4 text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-ink-400">
        Excellence in Textile and Engineering Education
      </div>
    </section>
  );
}
