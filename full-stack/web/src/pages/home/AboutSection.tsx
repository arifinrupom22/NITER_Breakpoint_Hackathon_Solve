import { Target, Eye, Award, Lightbulb, FlaskConical, Handshake } from 'lucide-react';
import { Reveal } from '../../components/Reveal';
import { Counter } from './Counter';

const PILLARS = [
  { icon: Target, title: 'Mission', desc: 'To provide quality engineering education that builds skilled, ethical and innovative professionals.' },
  { icon: Eye, title: 'Vision', desc: 'To be a leading institution in textile and engineering education and research in the region.' },
  { icon: Award, title: 'Academic Excellence', desc: 'Rigorous curricula, dedicated faculty and continuous outcome-based improvement.' },
  { icon: Lightbulb, title: 'Innovation', desc: 'A culture of creativity, problem solving and technology-driven learning.' },
  { icon: FlaskConical, title: 'Research', desc: 'Modern laboratories and funded projects advancing textile and technology research.' },
  { icon: Handshake, title: 'Industry Collaboration', desc: 'Strong ties with industry for internships, joint research and graduate outcomes.' },
];

const COUNTERS = [
  { value: 5, label: 'Academic Departments', suffix: '' },
  { value: 5000, label: 'Students', suffix: '+' },
  { value: 150, label: 'Faculty Members', suffix: '+' },
  { value: 100, label: 'Courses', suffix: '+' },
  { value: 20, label: 'Modern Laboratories', suffix: '+' },
];

export function AboutSection() {
  return (
    <section id="about" className="section bg-white">
      <div className="container-x">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal direction="left">
            <div className="relative">
              <img src="/images/about.svg" alt="NITER campus" className="w-full rounded-2xl border border-ink-100 shadow-lift" />
              <div className="absolute -bottom-5 -right-5 hidden rounded-2xl bg-ink-950 px-6 py-5 text-white shadow-lift sm:block">
                <p className="font-display text-3xl font-semibold text-gold-300">Since 2012</p>
                <p className="text-xs uppercase tracking-widest text-ink-300">Building Engineers</p>
              </div>
            </div>
          </Reveal>
          <Reveal direction="right">
            <p className="eyebrow mb-3"><span className="h-px w-8 bg-gold-500" /> About NITER</p>
            <h2 className="h-display">Shaping the Engineers of Tomorrow</h2>
            <p className="mt-4 leading-relaxed text-ink-600">
              The National Institute of Textile Engineering and Research is committed to excellence in engineering education,
              research, innovation, and the development of skilled professionals for the textile and technology sectors.
            </p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {PILLARS.map((p, i) => (
                <div key={p.title} className="group flex gap-3 rounded-xl border border-ink-100 p-4 transition-all hover:border-niter-200 hover:bg-niter-50/40">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-niter-50 text-niter-600 transition-transform group-hover:scale-110">
                    <p.icon size={17} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink-900">{p.title}</p>
                    <p className="mt-0.5 text-[13px] leading-snug text-ink-500">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-5">
          {COUNTERS.map((c, i) => (
            <Reveal key={c.label} delay={i * 70}>
              <div className="rounded-2xl border border-ink-100 bg-ink-50/50 p-5 text-center">
                <Counter value={c.value} suffix={c.suffix} />
                <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-ink-500">{c.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
