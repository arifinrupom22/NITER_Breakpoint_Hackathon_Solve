import { PageHero } from '../components/PageHero';
import { Reveal } from '../components/Reveal';
import { Monitor, Cpu, Shirt, Scissors, Factory } from 'lucide-react';

const DEPTS = [
  { icon: Monitor, code: 'CSE', name: 'Computer Science & Engineering', desc: 'Advancing software, computing, artificial intelligence, and digital innovation.', highlights: ['Data Structures & Algorithms', 'AI & Machine Learning', 'Software Engineering', 'Networking & Security'] },
  { icon: Cpu, code: 'EEE', name: 'Electrical & Electronic Engineering', desc: 'Developing future engineers in electronics, power, communication, and automation.', highlights: ['Circuit Theory', 'Power Systems', 'Embedded Systems', 'Communication Engineering'] },
  { icon: Shirt, code: 'TEX', name: 'Textile Engineering', desc: 'Leading education and innovation in textile technology and manufacturing.', highlights: ['Textile Fiber', 'Yarn & Fabric Manufacturing', 'Textile Chemistry', 'Smart Textiles'] },
  { icon: Scissors, code: 'Fashion', name: 'Fashion Design & Apparel Engineering', desc: 'Combining creativity, technology, design, and apparel engineering.', highlights: ['Fashion Illustration', 'Apparel Production', 'Garment Merchandising', 'Design Studio'] },
  { icon: Factory, code: 'IPE', name: 'Industrial & Production Engineering', desc: 'Improving industrial systems, productivity, quality, and operations.', highlights: ['Industrial Management', 'Production Planning', 'Quality Control', 'Operations Research'] },
];

export default function Departments() {
  return (
    <>
      <PageHero title="Academic Departments" crumb="Departments" desc="Five departments, each combining rigorous academics with hands-on laboratory work and industry alignment." img="/images/gallery-4.svg" />
      <section className="section">
        <div className="container-x space-y-6">
          {DEPTS.map((d, i) => (
            <Reveal key={d.code}>
              <div className={`card card-hover grid gap-6 p-6 md:grid-cols-[64px_1fr_1.2fr] md:items-center`}>
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-niter-50 text-niter-600">
                  <d.icon size={28} />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-niter-500">{d.code} · Department of</p>
                  <h2 className="font-display text-xl font-semibold text-ink-900">{d.name}</h2>
                  <p className="mt-1 text-sm text-ink-500">{d.desc}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {d.highlights.map((h) => (
                    <span key={h} className="rounded-lg border border-ink-100 bg-ink-50/50 px-3 py-2 text-xs font-medium text-ink-700">{h}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
