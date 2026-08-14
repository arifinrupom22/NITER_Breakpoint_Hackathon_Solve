import { Link } from 'react-router-dom';
import { LifeBuoy, BookOpenCheck, Users, CalendarCheck, GraduationCap, Briefcase, Sparkles, Building2, ArrowUpRight } from 'lucide-react';
import { Reveal } from '../../components/Reveal';
import { SectionHeading } from '../../components/ui';

const SERVICES = [
  { icon: LifeBuoy, title: 'Student Helping Zone', desc: 'Ask questions, report problems and track your support requests.', to: '/portal/student' },
  { icon: BookOpenCheck, title: 'Academic Support', desc: 'Academic advising, study resources and progress tracking.', to: '/academics' },
  { icon: Users, title: 'Batch Course Coordinator', desc: 'A dedicated CC-1 and CC-2 for every batch.', to: '/departments' },
  { icon: CalendarCheck, title: 'Teacher Meeting Request', desc: 'Request meetings with faculty through the Helping Zone.', to: '/portal/student' },
  { icon: GraduationCap, title: 'Scholarship Information', desc: 'Merit scholarships, financial aid and eligibility guides.', to: '/student-services' },
  { icon: Briefcase, title: 'Career Support', desc: 'Placement preparation, internships and career workshops.', to: '/student-services' },
  { icon: Sparkles, title: 'Club Activities', desc: 'Technical, cultural and sports clubs across campus.', to: '/campus-life' },
  { icon: Building2, title: 'Campus Facilities', desc: 'Library, labs, sports facilities and transport services.', to: '/campus-life' },
];

export function ServicesSection() {
  return (
    <section className="section bg-ink-950 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(circle at 85% 20%, #2563eb 0, transparent 40%)' }} />
      <div className="container-x relative">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="Student Services" title="Everything You Need, in One Place" desc="Support services designed around the student journey — academic, personal and professional." />
          <Link to="/student-services" className="btn btn-gold mb-10">Explore Services <ArrowUpRight size={15} /></Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={i * 55}>
              <Link to={s.to} className="group block h-full rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition-all hover:-translate-y-1 hover:border-gold-400/50 hover:bg-white/10">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/15 text-gold-300 transition-transform group-hover:scale-110">
                  <s.icon size={20} />
                </span>
                <p className="mt-3.5 font-semibold text-white">{s.title}</p>
                <p className="mt-1.5 text-[13px] leading-snug text-ink-300">{s.desc}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
