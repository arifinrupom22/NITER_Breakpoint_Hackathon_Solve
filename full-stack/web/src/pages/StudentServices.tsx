import { PageHero } from '../components/PageHero';
import { Reveal } from '../components/Reveal';
import { Link } from 'react-router-dom';
import { LifeBuoy, BookOpenCheck, Users, CalendarCheck, GraduationCap, Briefcase, Sparkles, Building2, ArrowRight } from 'lucide-react';

const SERVICES = [
  { icon: LifeBuoy, t: 'Student Helping Zone', d: 'Submit questions, report problems, request teacher meetings and track status.', to: '/portal/student' },
  { icon: BookOpenCheck, t: 'Academic Support', d: 'Academic advising, study resources and progress tracking.', to: '/academics' },
  { icon: Users, t: 'Batch Course Coordinator', d: 'Every batch has dedicated CC-1 and CC-2 coordinators for guidance.', to: '/departments' },
  { icon: CalendarCheck, t: 'Teacher Meeting Request', d: 'Request one-on-one meetings with faculty through the portal.', to: '/portal/student' },
  { icon: GraduationCap, t: 'Scholarship Information', d: 'Merit scholarships, financial aid and eligibility guidelines.', to: '/portal/student' },
  { icon: Briefcase, t: 'Career Support', d: 'Placement preparation, internships and industry workshops.', to: '/portal/student' },
  { icon: Sparkles, t: 'Club Activities', d: 'Join technical, cultural and sports clubs across campus.', to: '/campus-life' },
  { icon: Building2, t: 'Campus Facilities', d: 'Library, labs, sports and transport services for everyone.', to: '/campus-life' },
];

export default function StudentServices() {
  return (
    <>
      <PageHero title="Student Services" crumb="Student Services" desc="Support services designed around the student journey — academic, personal and professional." img="/images/gallery-4.svg" />
      <section className="section">
        <div className="container-x">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((s, i) => (
              <Reveal key={s.t} delay={i * 55}>
                <Link to={s.to} className="card card-hover group block h-full p-6">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-niter-50 text-niter-600 transition-transform group-hover:scale-110"><s.icon size={22} /></span>
                  <h3 className="mt-4 font-semibold text-ink-900">{s.t}</h3>
                  <p className="mt-1.5 text-sm text-ink-500">{s.d}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-niter-600">Learn More <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" /></span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
