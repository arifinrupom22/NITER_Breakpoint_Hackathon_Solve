import { PageHero } from '../components/PageHero';
import { Reveal } from '../components/Reveal';
import { Link } from 'react-router-dom';
import { FileText, CalendarCheck, ClipboardCheck, Download, ArrowRight } from 'lucide-react';

const STEPS = [
  { icon: FileText, title: 'Submit Application', desc: 'Fill in the online admission form for the 2026-27 session with your SSC/HSC details.' },
  { icon: ClipboardCheck, title: 'Admission Test', desc: 'Appear for the written admission test covering mathematics, physics and English.' },
  { icon: CalendarCheck, title: 'Viva & Result', desc: 'Shortlisted candidates attend the viva-voce. Final merit lists are published on the notice board.' },
  { icon: Download, title: 'Enrollment', desc: 'Confirm your seat by completing payment and document verification at the campus.' },
];

export default function Admissions() {
  return (
    <>
      <PageHero title="Admissions" crumb="Admissions" desc="Applications for the B.Sc. Engineering programs 2026-27 are now open across all five departments." img="/images/gallery-7.svg" />
      <section className="section">
        <div className="container-x">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="h-display">Admission Process 2026-27</h2>
              <div className="mt-8 space-y-5">
                {STEPS.map((s, i) => (
                  <Reveal key={s.title} delay={i * 70}>
                    <div className="card card-hover flex gap-4 p-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-niter-700 text-white">
                        <s.icon size={20} />
                      </div>
                      <div>
                        <p className="flex items-center gap-2 font-semibold text-ink-900">
                          <span className="text-xs font-bold text-niter-500">STEP {i + 1}</span> {s.title}
                        </p>
                        <p className="mt-1 text-sm text-ink-500">{s.desc}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
            <div>
              <div className="rounded-2xl border border-ink-100 bg-ink-950 p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-widest text-gold-300">Key Dates</p>
                <div className="mt-4 space-y-3 text-sm">
                  {[['Application Opens', '15 August 2026'], ['Application Deadline', '30 September 2026'], ['Admission Test', '18 October 2026'], ['Result Publication', '5 November 2026'], ['Classes Begin', 'January 2027']].map(([l, v]) => (
                    <div key={l} className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-ink-300">{l}</span>
                      <span className="font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
                <Link to="/student-services" className="btn btn-gold mt-6 w-full">Apply Online <ArrowRight size={15} /></Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
