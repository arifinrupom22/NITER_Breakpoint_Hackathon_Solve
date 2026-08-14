import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, UserRound, BookOpen, CalendarRange, ClipboardCheck, Award, Megaphone, LifeBuoy, DoorOpen,
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { DashboardShell, TabDef } from '../../components/portal/DashboardShell';
import { DataTable, Column } from '../../components/portal/DataTable';
import { Badge, EmptyState, SectionHeading } from '../../components/ui';
import { cls } from '../../lib/format';

const TABS: TabDef[] = [
  { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
  { key: 'profile', label: 'Profile', icon: <UserRound size={16} /> },
  { key: 'courses', label: 'Courses', icon: <BookOpen size={16} /> },
  { key: 'routine', label: 'Routine', icon: <CalendarRange size={16} /> },
  { key: 'attendance', label: 'Attendance', icon: <ClipboardCheck size={16} /> },
  { key: 'results', label: 'Results', icon: <Award size={16} /> },
  { key: 'notices', label: 'Notices', icon: <Megaphone size={16} /> },
  { key: 'helping', label: 'Helping Zone', icon: <LifeBuoy size={16} /> },
  { key: 'rooms', label: 'Room Availability', icon: <DoorOpen size={16} /> },
];

type Student = { id: string; name: string; department: string; batch: string; semester: string; theorySection: string; labSection: string; email: string; phone: string; cgpa: number };
type Course = { code: string; name: string; credit: number; type: string; semester: string; department: string; teacherId: string };
type Routine = { id: string; day: string; startTime: string; endTime: string; course: string; room: string; teacherId: string };
type Att = { course: string; date: string; status: string; totalClasses: number };
type Result = { course: string; marks: number; total: number; grade: string; gradePoint: number };
type Notice = { id: string; title: string; category: string; date: string; badge: string; summary: string };
type HelpItem = { id: string; category: string; question: string; status: string; createdAt: string; replies: { by: string; text: string; at: string }[] };
type Room = { number: string; floor: string; capacity: number; type: string; status: string };

export default function StudentPortal() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState('overview');
  const [profile, setProfile] = useState<Student | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [routine, setRoutine] = useState<Routine[]>([]);
  const [att, setAtt] = useState<{ records: Att[]; percentage: number; statusLabel: string } | null>(null);
  const [results, setResults] = useState<{ courses: Result[]; gpa: number; cgpa: number } | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [help, setHelp] = useState<HelpItem[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [helpForm, setHelpForm] = useState({ category: 'Academic', question: '' });

  useEffect(() => {
    if (!user || user.role !== 'student') nav('/portal/student', { replace: true });
  }, [user, nav]);

  useEffect(() => {
    if (!user || user.role !== 'student') return;
    api.get<Student>('/api/portal/student/profile').then(setProfile).catch(() => {});
    api.get<Course[]>('/api/portal/student/courses').then(setCourses).catch(() => {});
    api.get<Routine[]>('/api/portal/student/routine').then(setRoutine).catch(() => {});
    api.get<{ records: Att[]; percentage: number; statusLabel: string }>('/api/portal/student/attendance').then(setAtt).catch(() => {});
    api.get<{ courses: Result[]; gpa: number; cgpa: number }>('/api/portal/student/results').then(setResults).catch(() => {});
    api.get<Notice[]>('/api/portal/notices').then(setNotices).catch(() => {});
    api.get<HelpItem[]>('/api/portal/helping-zone/mine').then(setHelp).catch(() => {});
    api.get<Room[]>('/api/portal/rooms').then(setRooms).catch(() => {});
  }, [user]);

  const submitHelp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/portal/helping-zone', helpForm);
      setHelpForm({ category: 'Academic', question: '' });
      api.get<HelpItem[]>('/api/portal/helping-zone/mine').then(setHelp).catch(() => {});
    } catch {
      /* handled by toast-less inline */
    }
  };

  const dayOrder = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const routineSorted = [...routine].sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day) || a.startTime.localeCompare(b.startTime));

  return (
    <DashboardShell title="Student Portal" subtitle="NSCMS" tabs={TABS} active={tab} onTab={setTab}>
      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="rounded-2xl bg-gradient-to-r from-niter-800 to-niter-600 p-6 text-white">
            <p className="text-xs uppercase tracking-widest text-niter-200">Welcome back</p>
            <h2 className="mt-1 font-display text-2xl font-semibold">{profile?.name}</h2>
            <p className="mt-1 text-sm text-niter-100">{profile?.id} · {profile?.department} · {profile?.batch} · Sem {profile?.semester}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold">CGPA {profile?.cgpa}</span>
              <span className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold">Attendance {att?.percentage ?? 0}% ({att?.statusLabel})</span>
              <span className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold">{courses.length} Courses</span>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { l: 'Today\'s Classes', v: routine.filter((r) => r.day === new Date().toLocaleDateString('en-GB', { weekday: 'long' })).length },
              { l: 'Current GPA', v: results?.gpa ?? '—' },
              { l: 'Open Requests', v: help.filter((h) => h.status === 'Pending' || h.status === 'In Progress').length },
            ].map((s) => (
              <div key={s.l} className="card p-5 text-center">
                <p className="font-display text-3xl font-semibold text-niter-700">{s.v}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-ink-500">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'profile' && profile && (
        <div className="card max-w-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-niter-700 text-xl font-bold text-white">{profile.name.charAt(0)}</div>
            <div>
              <h3 className="font-display text-xl font-semibold text-ink-900">{profile.name}</h3>
              <p className="text-sm text-ink-500">{profile.id} · {profile.email}</p>
            </div>
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-4">
            {[['Department', profile.department], ['Batch', profile.batch], ['Semester', profile.semester], ['Theory Section', profile.theorySection], ['Lab Section', profile.labSection], ['Phone', profile.phone], ['CGPA', String(profile.cgpa)], ['Transport Card', profile.id === '2023001' ? 'BUS06' : '—']].map(([l, v]) => (
              <div key={l} className="rounded-lg bg-ink-50/60 p-3">
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">{l}</dt>
                <dd className="mt-0.5 font-medium text-ink-900">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {tab === 'courses' && (
        <DataTable
          title="My Courses"
          columns={[
            { key: 'code', label: 'Code' },
            { key: 'name', label: 'Name' },
            { key: 'type', label: 'Type', render: (r) => <Badge tone={r.type === 'Lab' ? 'purple' : 'niter'}>{r.type}</Badge> },
            { key: 'credit', label: 'Credit' },
            { key: 'teacherId', label: 'Teacher' },
          ]}
          rows={courses as unknown as Record<string, any>[]}
          searchKeys={['code', 'name']}
        />
      )}

      {tab === 'routine' && (
        <div className="space-y-4">
          {['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'].map((day) => {
            const cls2 = routineSorted.filter((r) => r.day === day);
            if (cls2.length === 0) return null;
            return (
              <div key={day} className="card p-4">
                <p className="mb-3 text-sm font-bold uppercase tracking-wider text-niter-700">{day}</p>
                <div className="grid gap-2 md:grid-cols-2">
                  {cls2.map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-lg border border-ink-100 bg-ink-50/40 px-4 py-3">
                      <div>
                        <p className="font-semibold text-ink-900">{r.course}</p>
                        <p className="text-xs text-ink-500">{r.startTime} – {r.endTime}</p>
                      </div>
                      <div className="text-right text-xs text-ink-500">
                        <p className="font-medium text-ink-700">Room {r.room}</p>
                        <p>{r.teacherId}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'attendance' && att && (
        <div className="space-y-5">
          <div className="card flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-ink-500">Attendance</p>
              <p className="font-display text-4xl font-semibold text-niter-700">{att.percentage}%</p>
            </div>
            <Badge tone={att.percentage >= 90 ? 'green' : att.percentage >= 80 ? 'niter' : att.percentage >= 75 ? 'gold' : 'red'}>{att.statusLabel}</Badge>
          </div>
          <DataTable
            title="Attendance History"
            columns={[
              { key: 'course', label: 'Course' },
              { key: 'date', label: 'Date' },
              { key: 'status', label: 'Status', render: (r) => <Badge tone={r.status === 'present' ? 'green' : 'red'}>{r.status}</Badge> },
            ]}
            rows={att.records as unknown as Record<string, any>[]}
          />
        </div>
      )}

      {tab === 'results' && results && (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card p-6 text-center"><p className="text-sm font-bold uppercase tracking-wider text-ink-500">GPA</p><p className="font-display text-4xl font-semibold text-niter-700">{results.gpa}</p></div>
            <div className="card p-6 text-center"><p className="text-sm font-bold uppercase tracking-wider text-ink-500">CGPA</p><p className="font-display text-4xl font-semibold text-gold-600">{results.cgpa}</p></div>
          </div>
          <DataTable
            title="Transcript"
            columns={[
              { key: 'course', label: 'Course' },
              { key: 'marks', label: 'Marks', render: (r) => `${r.marks}/${r.total}` },
              { key: 'grade', label: 'Grade', render: (r) => <Badge tone={r.grade.startsWith('A') ? 'green' : r.grade.startsWith('B') ? 'niter' : 'gold'}>{r.grade}</Badge> },
              { key: 'gradePoint', label: 'Grade Point' },
            ]}
            rows={results.courses as unknown as Record<string, any>[]}
          />
        </div>
      )}

      {tab === 'notices' && <DataTable title="Notices" columns={[{ key: 'date', label: 'Date' }, { key: 'title', label: 'Title' }, { key: 'category', label: 'Category' }, { key: 'badge', label: '', render: (r) => r.badge ? <Badge tone={r.badge === 'IMPORTANT' ? 'red' : 'green'}>{r.badge}</Badge> : '—' }]} rows={notices as unknown as Record<string, any>[]} />}

      {tab === 'helping' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card p-6">
            <SectionHeading eyebrow="NITER Student Helping Zone" title="Submit a Request" />
            <form onSubmit={submitHelp} className="space-y-4">
              <div>
                <label className="label">Category</label>
                <select className="input" value={helpForm.category} onChange={(e) => setHelpForm({ ...helpForm, category: e.target.value })}>
                  {['Academic', 'Routine', 'Exam', 'Lab', 'Fee', 'Scholarship', 'Others'].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Question / Problem</label>
                <textarea className="input min-h-28" placeholder="Describe your question or problem…" value={helpForm.question} onChange={(e) => setHelpForm({ ...helpForm, question: e.target.value })} required />
              </div>
              <button className="btn btn-primary">Submit Request</button>
            </form>
          </div>
          <div className="space-y-3">
            <SectionHeading eyebrow="Track Status" title="My Requests" />
            {help.length === 0 && <EmptyState title="No requests yet" hint="Submit your first request through the Helping Zone." />}
            {help.map((h) => (
              <div key={h.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <Badge>{h.category}</Badge>
                  <Badge tone={h.status === 'Resolved' ? 'green' : h.status === 'Rejected' ? 'red' : h.status === 'In Progress' ? 'gold' : 'gray'}>{h.status}</Badge>
                </div>
                <p className="mt-2 text-sm font-medium text-ink-900">{h.question}</p>
                {h.replies.map((r, i) => (
                  <p key={i} className="mt-2 rounded-lg bg-niter-50 p-2.5 text-xs text-ink-600"><span className="font-semibold text-niter-700">Reply ({r.by}):</span> {r.text}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'rooms' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((r) => (
            <div key={r.number} className="card card-hover p-5">
              <div className="flex items-center justify-between">
                <p className="font-display text-xl font-semibold text-ink-900">Room {r.number}</p>
                <Badge tone={r.status === 'Available' ? 'green' : r.status === 'Occupied' ? 'gold' : 'red'}>{r.status}</Badge>
              </div>
              <p className="mt-1 text-sm text-ink-500">{r.type} · {r.floor} Floor · {r.capacity} seats</p>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
