import { Link } from 'react-router-dom';
import { ArrowRight, Monitor, Cpu, Shirt, Scissors, Factory } from 'lucide-react';
import { Reveal } from '../../components/Reveal';
import { SectionHeading } from '../../components/ui';

const DEPARTMENTS = [
  { code: 'CSE', name: 'Computer Science & Engineering', desc: 'Advancing software, computing, artificial intelligence, and digital innovation.', icon: Monitor, tone: 'bg-niter-50 text-niter-600', border: 'hover:border-niter-300' },
  { code: 'EEE', name: 'Electrical & Electronic Engineering', desc: 'Developing future engineers in electronics, power, communication, and automation.', icon: Cpu, tone: 'bg-emerald-50 text-emerald-600', border: 'hover:border-emerald-300' },
  { code: 'TEX', name: 'Textile Engineering', desc: 'Leading education and innovation in textile technology and manufacturing.', icon: Shirt, tone: 'bg-amber-50 text-amber-600', border: 'hover:border-amber-300' },
  { code: 'Fashion', name: 'Fashion Design & Apparel Engineering', desc: 'Combining creativity, technology, design, and apparel engineering.', icon: Scissors, tone: 'bg-rose-50 text-rose-600', border: 'hover:border-rose-300' },
  { code: 'IPE', name: 'Industrial & Production Engineering', desc: 'Improving industrial systems, productivity, quality, and operations.', icon: Factory, tone: 'bg-violet-50 text-violet-600', border: 'hover:border-violet-300' },
];

export function DepartmentsSection() {
  return (
    <section className="section bg-ink-50/50">
      <div className="container-x">
        <SectionHeading eyebrow="Academic Departments" title="Five Departments, One Mission" desc="Each department combines rigorous academics, hands-on laboratories and industry-aligned programs." center />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DEPARTMENTS.map((d, i) => (
            <Reveal key={d.code} delay={i * 70}>
              <Link to="/departments" className={`card card-hover group block h-full p-6 ${d.border}`}>
                <div className="flex items-center justify-between">
                  <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${d.tone} transition-transform group-hover:scale-110`}>
                    <d.icon size={22} />
                  </span>
                  <span className="font-display text-2xl font-semibold text-ink-200 transition-colors group-hover:text-niter-300">{d.code}</span>
                </div>
                <h3 className="mt-4 font-semibold text-ink-900">{d.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">{d.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-niter-700">
                  Explore Department
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
