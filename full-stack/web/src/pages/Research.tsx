import { PageHero } from '../components/PageHero';
import { Reveal } from '../components/Reveal';
import { FlaskConical, Microscope, Leaf, Cpu, Factory, Layers } from 'lucide-react';

const AREAS = [
  { icon: Cpu, t: 'AI & Smart Systems', d: 'Machine learning for smart campus, transport optimization and industrial automation.' },
  { icon: Leaf, t: 'Sustainable Textiles', d: 'Eco-friendly fibers, recycling and circular manufacturing research.' },
  { icon: Microscope, t: 'Materials Science', d: 'Characterization and development of advanced textile and composite materials.' },
  { icon: Factory, t: 'Industrial Systems', d: 'Operations research, lean manufacturing and supply chain optimization.' },
  { icon: Layers, t: 'Smart Textiles & Wearables', d: 'Conductive fabrics, sensors and wearable technology prototypes.' },
  { icon: FlaskConical, t: 'Renewable Energy', d: 'Solar, power electronics and energy-efficient systems research.' },
];

export default function Research() {
  return (
    <>
      <PageHero title="Research & Innovation" crumb="Research" desc="NITER research laboratories advance textile technology, computing and sustainable engineering." img="/images/gallery-3.svg" />
      <section className="section">
        <div className="container-x">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {AREAS.map((a, i) => (
              <Reveal key={a.t} delay={i * 60}>
                <div className="card card-hover group h-full p-6">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition-transform group-hover:scale-110"><a.icon size={22} /></span>
                  <h3 className="mt-4 font-semibold text-ink-900">{a.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{a.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-12 rounded-2xl border border-ink-100 bg-ink-50/50 p-8 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-niter-600">Student Research at NITER</p>
            <p className="mx-auto mt-3 max-w-2xl text-ink-600">
              Final-year projects, undergraduate theses and interdisciplinary prototypes are showcased every year at the
              NITER Research and Project Exhibition — where student innovation meets industry.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
