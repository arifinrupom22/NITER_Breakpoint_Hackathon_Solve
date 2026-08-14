import { PageHero } from '../components/PageHero';
import { Reveal } from '../components/Reveal';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, CalendarDays, Building2, ArrowRight } from 'lucide-react';

const PROGRAMS = [
  { code: 'B.Sc. CSE', name: 'Computer Science & Engineering', credit: '160+', duration: '4 years' },
  { code: 'B.Sc. EEE', name: 'Electrical & Electronic Engineering', credit: '160+', duration: '4 years' },
  { code: 'B.Sc. TEX', name: 'Textile Engineering', credit: '160+', duration: '4 years' },
  { code: 'B.Sc. Fashion', name: 'Fashion Design & Apparel Engineering', credit: '160+', duration: '4 years' },
  { code: 'B.Sc. IPE', name: 'Industrial & Production Engineering', credit: '160+', duration: '4 years' },
];

export default function Academics() {
  return (
    <>
      <PageHero title="Academics" crumb="Academics" desc="Undergraduate engineering programs designed around modern curricula, laboratories and industry needs." img="/images/gallery-1.svg" />
      <section className="section">
        <div className="container-x">
          <div className="mb-10 flex flex-wrap gap-3">
            {[
              { icon: CalendarDays, label: 'Academic Calendar', desc: 'Semester timelines, exams and holidays' },
              { icon: FileText, label: 'Course Catalogue', desc: 'Theory and lab courses by department' },
              { icon: Building2, label: 'Class Routine', desc: 'Department and batch-wise routines' },
            ].map((c) => (
              <div key={c.label} className="card card-hover flex items-center gap-3 px-5 py-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-niter-50 text-niter-600"><c.icon size={18} /></span>
                <div>
                  <p className="text-sm font-semibold text-ink-900">{c.label}</p>
                  <p className="text-xs text-ink-500">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-ink-100 shadow-card">
            <div className="grid grid-cols-[120px_1fr_90px_90px] bg-ink-950 px-6 py-3 text-xs font-bold uppercase tracking-wider text-ink-300">
              <span>Program</span><span>Name</span><span>Credits</span><span>Duration</span>
            </div>
            {PROGRAMS.map((p, i) => (
              <Reveal key={p.code} delay={i * 50}>
                <div className={`grid grid-cols-[120px_1fr_90px_90px] items-center px-6 py-4 ${i % 2 ? 'bg-ink-50/40' : 'bg-white'}`}>
                  <span className="font-semibold text-niter-700">{p.code}</span>
                  <span className="font-medium text-ink-900">{p.name}</span>
                  <span className="text-ink-500">{p.credit}</span>
                  <span className="text-ink-500">{p.duration}</span>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-niter-700 px-8 py-6 text-white">
            <div className="flex items-center gap-4">
              <BookOpen size={30} className="text-gold-300" />
              <div>
                <p className="font-display text-lg font-semibold">Want to study at NITER?</p>
                <p className="text-sm text-ink-200">Applications for the 2026-27 session are open.</p>
              </div>
            </div>
            <Link to="/admissions" className="btn btn-gold">Apply Now <ArrowRight size={15} /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
