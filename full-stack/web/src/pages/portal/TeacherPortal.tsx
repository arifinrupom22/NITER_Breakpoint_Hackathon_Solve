import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, UserRound, BookOpen, CalendarRange, ClipboardCheck, Award, LifeBuoy, DoorOpen,
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { DashboardShell, TabDef } from '../../components/portal/DashboardShell';
import { DataTable } from '../../components/portal/DataTable';
import { Badge, EmptyState, SectionHeading, Spinner, useToast } from '../../components/ui';

const TABS: TabDef[] = [
  { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
  { key: 'profile', label: 'Profile', icon: <UserRound size={16} /> },
  { key: 'courses', label: 'My Courses', icon: <BookOpen size={16} /> },
  { key: 'routine', label: 'Routine', icon: <CalendarRange size={16} /> },
  { key: 'attendance', label: 'Mark Attendance', icon: <ClipboardCheck size={16} /> },
  { key: 'marks', label: 'Marks', icon: <Award size={16} /> },
  { key: 'helping', label: 'Student Questions', icon: <LifeBuoy size={16} /> },
  { key: 'rooms', label: 'Room Availability', icon: <DoorOpen size={16} /> },
];

type Teacher = { id: string; name: string; department: string; designation: string; email: string; phone: string; salary: number };
type Course = { code: string; name: string; credit: number; type: string; semester: string; department: string; teacherId: string };
type Routine = { id: string; day: string; startTime: string; endTime: string; course: string; room: string; teacherId: string; batch: string };
type HelpItem = { id: string; category: string; question: string; studentId: string; status: string; createdAt: string; replies: { by: string; text: string; at: string }[] };
type Student = { id: string; name: string; batch: string; department: string };

export default function TeacherPortal() {
  const { user } = useAuth();
  const nav = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState('overview');
  const [profile, setProfile] = useState<Teacher | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [routine, setRoutine] = useState<Routine[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [help, setHelp] = useState<HelpItem[]>([]);
  const [rooms, setRooms] = useState<{ number: string; type: string; status: string; capacity: number }[]>([]);
  const [attend, setAttend] = useState({ course: '', date: new Date().toISOString().slice(0, 10), marks: {} as Record<string, string> });
  const [marksForm, setMarksForm] = useState({ course: '', studentId: '', marks: '' });
  const [marksList, setMarksList] = useState<{ course: string; studentId: string; marks: number; grade: string }[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'teacher') nav('/portal/teacher', { replace: true });
  }, [user, nav]);

  useEffect(() => {
    if (!user || user.role !== 'teacher') return;
    api.get<Teacher>('/api/portal/teacher/profile').then(setProfile).catch(() => {});
    api.get<Course[]>('/api/portal/teacher/courses').then(setCourses).catch(() => {});
    api.get<Routine[]>('/api/portal/teacher/routine').then(setRoutine).catch(() => {});
    api.get<Student[]>('/api/admin/students').then(setStudents).catch(() => {});
    api.get<HelpItem[]>('/api/portal/helping-zone/open').then(setHelp).catch(() => {});
    api.get<{ number: string; type: string; status: string; capacity: number }[]>('/api/portal/rooms').then(setRooms).catch(() => {});
  }, [user]);

  const saveAttendance = async () => {
    if (!attend.course) return toast('error', 'Select a course first.');
    setBusy(true);
    try {
      await api.post('/api/portal/attendance/save', { course: attend.course, batch: 'CSE-23', date: attend.date, records: attend.marks });
      toast('success', 'Attendance saved.');
      setAttend({ ...attend, marks: {} });
    } catch (e) {
      toast('error', 'Could not save attendance.');
    }
    setBusy(false);
  };

  const saveMarks = async () => {
    setBusy(true);
    try {
      const res = await api.post<{ message: string }>('/api/portal/marks/save', { course: marksForm.course, studentId: marksForm.studentId, marks: Number(marksForm.marks) });
      toast('success', res.message);
      setMarksForm({ ...marksForm, marks: '' });
      if (marksForm.course) api.get<{ course: string; studentId: string; marks: number; grade: string }[]>(`/api/portal/marks/list?course=${marksForm.course}`).then(setMarksList).catch(() => {});
    } catch (e) {
      toast('error', 'Could not save marks.');
    }
    setBusy(false);
  };

  const reply = async (id: string, text: string) => {
    if (!text.trim()) return;
    try {
      await api.post(`/api/portal/helping-zone/${id}/reply`, { text });
      toast('success', 'Reply sent.');
      api.get<HelpItem[]>('/api/portal/helping-zone/open').then(setHelp).catch(() => {});
    } catch {
      toast('error', 'Could not send reply.');
    }
  };

  const myBatchStudents = students;

  return (
    <DashboardShell title="Teacher Portal" subtitle="NSCMS" tabs={TABS} active={tab} onTab={setTab}>
      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-600 p-6 text-white">
            <p className="text-xs uppercase tracking-widest text-emerald-200">Welcome back</p>
            <h2 className="mt-1 font-display text-2xl font-semibold">{profile?.name}</h2>
            <p className="mt-1 text-sm text-emerald-100">{profile?.id} · {profile?.designation} · {profile?.department}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <span className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold">{courses.length} Courses</span>
              <span className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold">{help.length} Open Questions</span>
              <span className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold">{routine.length} Weekly Slots</span>
            </div>
          </div>
          <DataTable
            title="Assigned Courses"
            columns={[{ key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }, { key: 'type', label: 'Type', render: (r) => <Badge tone={r.type === 'Lab' ? 'purple' : 'green'}>{r.type}</Badge> }, { key: 'semester', label: 'Semester' }]}
            rows={courses as unknown as Record<string, any>[]}
          />
        </div>
      )}

      {tab === 'profile' && profile && (
        <div className="card max-w-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-700 text-xl font-bold text-white">{profile.name.charAt(0)}</div>
            <div>
              <h3 className="font-display text-xl font-semibold text-ink-900">{profile.name}</h3>
              <p className="text-sm text-ink-500">{profile.designation} · {profile.department}</p>
            </div>
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-4">
            {[['Teacher ID', profile.id], ['Department', profile.department], ['Email', profile.email], ['Phone', profile.phone], ['Salary', `BDT ${profile.salary.toLocaleString()}`]].map(([l, v]) => (
              <div key={l} className="rounded-lg bg-ink-50/60 p-3">
                <dt className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">{l}</dt>
                <dd className="mt-0.5 font-medium text-ink-900">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {tab === 'courses' && (
        <DataTable title="My Courses" columns={[{ key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }, { key: 'type', label: 'Type' }, { key: 'credit', label: 'Credit' }, { key: 'semester', label: 'Semester' }]} rows={courses as unknown as Record<string, any>[]} />
      )}

      {tab === 'routine' && (
        <DataTable title="Weekly Routine" columns={[{ key: 'day', label: 'Day' }, { key: 'startTime', label: 'Start' }, { key: 'endTime', label: 'End' }, { key: 'course', label: 'Course' }, { key: 'batch', label: 'Batch' }, { key: 'room', label: 'Room' }]} rows={routine as unknown as Record<string, any>[]} />
      )}

      {tab === 'attendance' && (
        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <div className="card h-fit p-6">
            <SectionHeading eyebrow="Attendance" title="Mark Attendance" />
            <div className="space-y-4">
              <div>
                <label className="label">Course</label>
                <select className="input" value={attend.course} onChange={(e) => setAttend({ ...attend, course: e.target.value, marks: {} })}>
                  <option value="">Select course…</option>
                  {courses.map((c) => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Date</label>
                <input type="date" className="input" value={attend.date} onChange={(e) => setAttend({ ...attend, date: e.target.value })} />
              </div>
              <button onClick={saveAttendance} disabled={busy} className="btn btn-primary w-full">{busy ? <Spinner /> : 'Save Attendance'}</button>
            </div>
          </div>
          <div className="card overflow-hidden">
            <p className="border-b border-ink-100 px-5 py-3 text-sm font-bold uppercase tracking-wider text-ink-500">Student List — {myBatchStudents.length} students</p>
            <div className="max-h-[560px] overflow-y-auto">
              {myBatchStudents.map((s) => (
                <div key={s.id} className="flex items-center justify-between border-b border-ink-50 px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink-900">{s.name}</p>
                    <p className="text-xs text-ink-400">{s.id} · {s.batch}</p>
                  </div>
                  <div className="flex gap-2">
                    {['present', 'absent'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setAttend({ ...attend, marks: { ...attend.marks, [s.id]: st } })}
                        className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${attend.marks[s.id] === st ? (st === 'present' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white') : 'bg-ink-50 text-ink-500 hover:bg-ink-100'}`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'marks' && (
        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <div className="card h-fit p-6">
            <SectionHeading eyebrow="Results" title="Enter Marks" />
            <div className="space-y-4">
              <div>
                <label className="label">Course</label>
                <select className="input" value={marksForm.course} onChange={(e) => {
                  setMarksForm({ ...marksForm, course: e.target.value });
                  api.get<{ course: string; studentId: string; marks: number; grade: string }[]>(`/api/portal/marks/list?course=${e.target.value}`).then(setMarksList).catch(() => {});
                }}>
                  <option value="">Select course…</option>
                  {courses.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Student</label>
                <select className="input" value={marksForm.studentId} onChange={(e) => setMarksForm({ ...marksForm, studentId: e.target.value })}>
                  <option value="">Select student…</option>
                  {myBatchStudents.map((s) => <option key={s.id} value={s.id}>{s.id} — {s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Marks (out of 100)</label>
                <input type="number" min="0" max="100" className="input" value={marksForm.marks} onChange={(e) => setMarksForm({ ...marksForm, marks: e.target.value })} />
              </div>
              <button onClick={saveMarks} disabled={busy} className="btn btn-primary w-full">{busy ? <Spinner /> : 'Save Marks'}</button>
            </div>
          </div>
          <DataTable title="Marks" columns={[{ key: 'studentId', label: 'Student' }, { key: 'marks', label: 'Marks' }, { key: 'grade', label: 'Grade', render: (r) => <Badge tone={r.grade.startsWith('A') ? 'green' : 'niter'}>{r.grade}</Badge> }]} rows={marksList as unknown as Record<string, any>[]} />
        </div>
      )}

      {tab === 'helping' && (
        <div className="space-y-4">
          <SectionHeading eyebrow="NITER Student Helping Zone" title="Student Questions" />
          {help.length === 0 && <EmptyState title="No open questions" hint="Student questions will appear here for you to answer." />}
          {help.map((h) => (
            <div key={h.id} className="card p-5">
              <div className="flex items-center justify-between">
                <Badge>{h.category}</Badge>
                <Badge tone={h.status === 'Resolved' ? 'green' : 'gold'}>{h.status}</Badge>
              </div>
              <p className="mt-2 font-medium text-ink-900">{h.question}</p>
              <p className="mt-0.5 text-xs text-ink-400">by {h.studentId} · {h.createdAt.slice(0, 10)}</p>
              {h.replies.map((r, i) => (
                <p key={i} className="mt-2 rounded-lg bg-niter-50 p-2.5 text-xs text-ink-600"><span className="font-semibold">Reply:</span> {r.text}</p>
              ))}
              <div className="mt-3 flex gap-2">
                <input id={`reply-${h.id}`} className="input flex-1" placeholder="Type your reply…" />
                <button onClick={() => {
                  const el = document.getElementById(`reply-${h.id}`) as HTMLInputElement;
                  reply(h.id, el.value);
                  el.value = '';
                }} className="btn btn-primary btn-sm">Reply</button>
              </div>
            </div>
          ))}
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
              <p className="mt-1 text-sm text-ink-500">{r.type} · {r.capacity} seats</p>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
