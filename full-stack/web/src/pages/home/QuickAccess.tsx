import { Link } from 'react-router-dom';
import { CalendarDays, ClipboardList, Megaphone, BookOpen, DoorOpen, LifeBuoy, ArrowRight } from 'lucide-react';
import { Reveal } from '../../components/Reveal';

const ITEMS = [
  { icon: CalendarDays, title: 'Academic Calendar', desc: 'Semester schedule, exams and academic deadlines at a glance.', to: '/academics', tone: 'text-niter-600 bg-niter-50' },
  { icon: ClipboardList, title: 'Class Routine', desc: 'View department and batch-wise class routines by day.', to: '/portal/student', tone: 'text-emerald-600 bg-emerald-50' },
  { icon: Megaphone, title: 'Notice Board', desc: 'Official notices, exam schedules and announcements.', to: '/notices', tone: 'text-gold-600 bg-gold-50' },
  { icon: BookOpen, title: 'Course Information', desc: 'Course catalogue with credits, types and assigned teachers.', to: '/academics', tone: 'text-violet-600 bg-violet-50' },
  { icon: DoorOpen, title: 'Room Availability', desc: 'Check theory rooms and lab availability in real time.', to: '/portal/student', tone: 'text-cyan-600 bg-cyan-50' },
  { icon: LifeBuoy, title: 'Student Helping Zone', desc: 'Ask questions, report problems and track support requests.', to: '/portal/student', tone: 'text-rose-600 bg-rose-50' },
];

export function QuickAccess() {
  return (
    <section className="section -mt-12 relative z-20">
      <div className="container-x">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((it, i) => (
            <Reveal key={it.title} delay={i * 70}>
              <Link to={it.to} className="card card-hover group block p-6">
                <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${it.tone} transition-transform group-hover:scale-110`}>
                  <it.icon size={22} />
                </span>
                <h3 className="mt-4 font-semibold text-ink-900">{it.title}</h3>
                <p className="mt-1.5 text-sm text-ink-500">{it.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-niter-700">
                  View More
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
