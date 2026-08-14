import { useEffect, useState } from 'react';
import { Users, UserCheck, Building2, BookOpen, FlaskConical, Trophy } from 'lucide-react';
import { api } from '../../lib/api';
import { Stat } from '../../components/ui';

type Stats = { departments: number; students: number; teachers: number; courses: number; labs: number; clubs: number };

export function StatsSection() {
  const [stats, setStats] = useState<Stats>({ departments: 5, students: 5000, teachers: 150, courses: 100, labs: 20, clubs: 12 });

  useEffect(() => {
    api.get<Stats>('/api/portal/stats').then(setStats).catch(() => {});
  }, []);

  const items = [
    { label: 'Total Students', value: stats.students, icon: <Users size={20} /> },
    { label: 'Total Teachers', value: stats.teachers, icon: <UserCheck size={20} /> },
    { label: 'Academic Departments', value: stats.departments, icon: <Building2 size={20} /> },
    { label: 'Active Courses', value: stats.courses, icon: <BookOpen size={20} /> },
    { label: 'Modern Laboratories', value: stats.labs, icon: <FlaskConical size={20} /> },
    { label: 'Campus Clubs', value: stats.clubs, icon: <Trophy size={20} /> },
  ];

  return (
    <section className="relative overflow-hidden bg-ink-950 py-16">
      <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #2563eb 0, transparent 45%), radial-gradient(circle at 80% 70%, #c9a227 0, transparent 40%)' }} />
      <div className="container-x relative">
        <div className="mb-10 text-center">
          <p className="eyebrow justify-center text-gold-300"><span className="h-px w-8 bg-gold-400" /> NITER at a Glance</p>
          <h2 className="h-display !text-white">Campus Statistics</h2>
          <p className="mt-3 text-ink-300">Live figures from the NITER Smart Campus system.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {items.map((s) => (
            <Stat key={s.label} label={s.label} value={s.value} icon={s.icon} />
          ))}
        </div>
      </div>
    </section>
  );
}
