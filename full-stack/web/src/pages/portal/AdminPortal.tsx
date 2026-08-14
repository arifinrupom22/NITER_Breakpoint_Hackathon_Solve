import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import type { LiveBus } from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, GraduationCap, Building2, Layers, BookOpen, DoorOpen, CalendarRange,
  Megaphone, LifeBuoy, FileBarChart, Bus, Radar, Map, UserCog, CalendarClock, Route, TrendingUp,
  MessageSquareWarning, Siren, Wrench, ShieldAlert, Plus, Trash2, GripVertical, ChevronUp, ChevronDown, ArrowRight,
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { useTransportState } from '../../lib/useTransport';
import { DashboardShell, TabDef } from '../../components/portal/DashboardShell';
import { CrudSection, FieldDef } from '../../components/portal/CrudSection';
import { DataTable, Column } from '../../components/portal/DataTable';
import { Badge, EmptyState, SectionHeading, Spinner, useToast, Modal } from '../../components/ui';
import { cls, fmtRelative, ocTone, trafficTone } from '../../lib/format';

const TABS: TabDef[] = [
  { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
  { key: 'students', label: 'Students', icon: <GraduationCap size={16} /> },
  { key: 'teachers', label: 'Teachers', icon: <Users size={16} /> },
  { key: 'departments', label: 'Departments', icon: <Building2 size={16} /> },
  { key: 'batches', label: 'Batches', icon: <Layers size={16} /> },
  { key: 'courses', label: 'Courses', icon: <BookOpen size={16} /> },
  { key: 'rooms', label: 'Rooms', icon: <DoorOpen size={16} /> },
  { key: 'routine', label: 'Routine', icon: <CalendarRange size={16} /> },
  { key: 'notices', label: 'Notices', icon: <Megaphone size={16} /> },
  { key: 'helping', label: 'Helping Zone', icon: <LifeBuoy size={16} /> },
  { key: 'reports', label: 'Reports', icon: <FileBarChart size={16} /> },
  { key: 'transport', label: 'Transport Live', icon: <Bus size={16} /> },
  { key: 'tbuses', label: 'Transport Buses', icon: <Radar size={16} /> },
  { key: 'routes', label: 'Routes', icon: <Route size={16} /> },
  { key: 'drivers', label: 'Drivers', icon: <UserCog size={16} /> },
  { key: 'trips', label: 'Trips', icon: <CalendarClock size={16} /> },
  { key: 'analytics', label: 'Analytics', icon: <TrendingUp size={16} /> },
  { key: 'complaints', label: 'Complaints', icon: <MessageSquareWarning size={16} /> },
  { key: 'emergencies', label: 'Emergencies', icon: <Siren size={16} /> },
  { key: 'maintenance', label: 'Maintenance', icon: <Wrench size={16} /> },
  { key: 'anomalies', label: 'Security Alerts', icon: <ShieldAlert size={16} /> },
];

type Overview = { activeTrips: number; todaysTrips: number; totalPassengers: number; onTimeRate: number; revenue: number; payments: number; emergencyActive: number; complaintsPending: number; busUtil: { busId: string; name: string; occupancyPct: number; tripStatus: string; trips: number }[]; crowd: { busId: string; busName: string; predicted: string; predictedPct: number }[] };

export default function AdminPortal() {
  const { user, token } = useAuth();
  const nav = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState('overview');
  const [overview, setOverview] = useState<Overview | null>(null);
  const { state } = useTransportState(token);

  useEffect(() => {
    if (!user || user.role !== 'admin') nav('/portal/admin', { replace: true });
  }, [user, nav]);

  useEffect(() => {
    api.get<Overview>('/api/admin/analytics/overview').then(setOverview).catch(() => {});
  }, [tab]);

  return (
    <DashboardShell title="Admin Portal" subtitle="NSCMS + Transport" tabs={TABS} active={tab} onTab={setTab}>
      {tab === 'overview' && <AdminOverview o={overview} />}
      {tab === 'students' && (
        <CrudSection
          title="Student Management" subtitle="Add, update, delete, search — duplicate Student IDs are rejected automatically."
          url="/api/admin/students" rowId="id"
          columns={[{ key: 'id', label: 'Student ID' }, { key: 'name', label: 'Name' }, { key: 'department', label: 'Dept' }, { key: 'batch', label: 'Batch' }, { key: 'semester', label: 'Semester' }, { key: 'cgpa', label: 'CGPA' }]}
          fields={[
            { key: 'id', label: 'Student ID', required: true, placeholder: '2023010' },
            { key: 'name', label: 'Full Name', required: true },
            { key: 'department', label: 'Department', type: 'select', required: true, options: ['CSE', 'EEE', 'TEX', 'FASHION', 'IPE'] },
            { key: 'batch', label: 'Batch', required: true, placeholder: 'CSE-24' },
            { key: 'semester', label: 'Semester', placeholder: '2-2' },
            { key: 'theorySection', label: 'Theory Section' },
            { key: 'labSection', label: 'Lab Section' },
            { key: 'email', label: 'Email', type: 'email' },
            { key: 'phone', label: 'Phone', type: 'tel', placeholder: '01XXXXXXXXX' },
            { key: 'cgpa', label: 'CGPA', type: 'number' },
          ]}
        />
      )}
      {tab === 'teachers' && (
        <CrudSection
          title="Teacher Management" subtitle="Validates duplicate IDs, empty fields, email, phone and salary."
          url="/api/admin/teachers" rowId="id"
          columns={[{ key: 'id', label: 'Teacher ID' }, { key: 'name', label: 'Name' }, { key: 'department', label: 'Dept' }, { key: 'designation', label: 'Designation' }, { key: 'email', label: 'Email' }, { key: 'salary', label: 'Salary' }]}
          fields={[
            { key: 'id', label: 'Teacher ID', required: true, placeholder: 'T006' },
            { key: 'name', label: 'Full Name', required: true },
            { key: 'department', label: 'Department', type: 'select', required: true, options: ['CSE', 'EEE', 'TEX', 'FASHION', 'IPE'] },
            { key: 'designation', label: 'Designation', type: 'select', required: true, options: ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'] },
            { key: 'email', label: 'Email', type: 'email', required: true },
            { key: 'phone', label: 'Phone', type: 'tel', required: true },
            { key: 'salary', label: 'Salary (BDT)', type: 'number', required: true },
          ]}
        />
      )}
      {tab === 'departments' && <DepartmentsTab />}
      {tab === 'batches' && (
        <CrudSection
          title="Batch Management" subtitle="Batches with department, semester, sections and student count."
          url="/api/admin/batches" rowId="id"
          columns={[{ key: 'id', label: 'Batch ID' }, { key: 'department', label: 'Dept' }, { key: 'semester', label: 'Semester' }, { key: 'theorySection', label: 'Theory' }, { key: 'labSection', label: 'Lab' }, { key: 'totalStudents', label: 'Students' }]}
          fields={[
            { key: 'id', label: 'Batch ID', required: true, placeholder: 'CSE-24' },
            { key: 'department', label: 'Department', type: 'select', required: true, options: ['CSE', 'EEE', 'TEX', 'FASHION', 'IPE'] },
            { key: 'semester', label: 'Semester', placeholder: '2-2' },
            { key: 'theorySection', label: 'Theory Section' },
            { key: 'labSection', label: 'Lab Section' },
            { key: 'totalStudents', label: 'Total Students', type: 'number' },
          ]}
        />
      )}
      {tab === 'courses' && (
        <CrudSection
          title="Course Management" subtitle="Validates duplicate codes, credit values, teacher assignment and type."
          url="/api/admin/courses" rowId="code"
          columns={[{ key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }, { key: 'type', label: 'Type', render: (r) => <Badge tone={r.type === 'Lab' ? 'purple' : 'niter'}>{r.type}</Badge> }, { key: 'credit', label: 'Credit' }, { key: 'semester', label: 'Semester' }, { key: 'teacherId', label: 'Teacher' }]}
          fields={[
            { key: 'code', label: 'Course Code', required: true, placeholder: 'CSE-2104' },
            { key: 'name', label: 'Course Name', required: true },
            { key: 'type', label: 'Type', type: 'select', required: true, options: ['Theory', 'Lab'] },
            { key: 'credit', label: 'Credit', type: 'number', required: true },
            { key: 'department', label: 'Department', type: 'select', required: true, options: ['CSE', 'EEE', 'TEX', 'FASHION', 'IPE'] },
            { key: 'semester', label: 'Semester' },
            { key: 'teacherId', label: 'Assigned Teacher' },
          ]}
        />
      )}
      {tab === 'rooms' && (
        <CrudSection
          title="Room Management" subtitle="Theory rooms and laboratories with status tracking."
          url="/api/admin/rooms" rowId="number"
          columns={[{ key: 'number', label: 'Room' }, { key: 'floor', label: 'Floor' }, { key: 'type', label: 'Type' }, { key: 'capacity', label: 'Capacity' }, { key: 'status', label: 'Status', render: (r) => <Badge tone={r.status === 'Available' ? 'green' : r.status === 'Occupied' ? 'gold' : 'red'}>{r.status}</Badge> }]}
          fields={[
            { key: 'number', label: 'Room Number', required: true },
            { key: 'floor', label: 'Floor', type: 'select', options: ['1st', '2nd', '3rd', '4th', '5th'] },
            { key: 'type', label: 'Room Type', type: 'select', required: true, options: ['Theory Room', 'Computer Lab', 'Electrical Lab', 'Textile Lab'] },
            { key: 'capacity', label: 'Capacity', type: 'number', required: true },
            { key: 'status', label: 'Status', type: 'select', options: ['Available', 'Occupied', 'Maintenance'] },
          ]}
        />
      )}
      {tab === 'routine' && <RoutineTab />}
      {tab === 'notices' && (
        <CrudSection
          title="Notice Management" subtitle="Publish, edit and delete official notices."
          url="/api/admin/notices" rowId="id"
          columns={[{ key: 'date', label: 'Date' }, { key: 'title', label: 'Title' }, { key: 'category', label: 'Category' }, { key: 'badge', label: 'Badge', render: (r) => r.badge ? <Badge tone={r.badge === 'IMPORTANT' ? 'red' : 'green'}>{r.badge}</Badge> : '—' }]}
          fields={[
            { key: 'title', label: 'Title', required: true, colSpan: 2 },
            { key: 'summary', label: 'Summary', required: true, colSpan: 2 },
            { key: 'category', label: 'Category', type: 'select', options: ['Academic', 'Exam', 'Admission', 'Transport', 'Lab', 'General'] },
            { key: 'badge', label: 'Badge', type: 'select', options: ['', 'NEW', 'IMPORTANT'] },
            { key: 'date', label: 'Date', type: 'date' },
          ]}
        />
      )}
      {tab === 'helping' && <HelpingAdmin />}
      {tab === 'reports' && <ReportsTab />}
      {tab === 'transport' && <AdminLiveMap state={state} />}
      {tab === 'tbuses' && <BusesAdmin />}
      {tab === 'routes' && <RoutesAdmin />}
      {tab === 'drivers' && (
        <CrudSection
          title="Driver Management" subtitle="Four demo drivers — each bound to exactly one bus. A driver cannot start an unauthorized bus."
          url="/api/admin/transport/drivers" rowId="id"
          columns={[{ key: 'id', label: 'Driver ID' }, { key: 'name', label: 'Name' }, { key: 'busId', label: 'Assigned Bus' }, { key: 'phone', label: 'Phone' }, { key: 'status', label: 'Status' }]}
          fields={[
            { key: 'id', label: 'Driver ID', required: true, placeholder: 'DRV005' },
            { key: 'name', label: 'Driver Name', required: true },
            { key: 'phone', label: 'Phone', type: 'tel' },
            { key: 'busId', label: 'Assigned Bus', type: 'select', required: true, options: ['BUS-STD-1', 'BUS-STD-2', 'BUS-TCH-1', 'BUS-TCH-2'] },
          ]}
        />
      )}
      {tab === 'trips' && <TripsTab />}
      {tab === 'analytics' && <AnalyticsTab />}
      {tab === 'complaints' && <ComplaintsTab />}
      {tab === 'emergencies' && <EmergenciesTab />}
      {tab === 'maintenance' && <MaintenanceTab />}
      {tab === 'anomalies' && <AnomaliesTab />}
    </DashboardShell>
  );
}

/* ================= Overview ================= */
function AdminOverview({ o }: { o: Overview | null }) {
  if (!o) return <div className="flex justify-center py-20"><Spinner className="h-8 w-8 text-niter-500" /></div>;
  const cards = [
    { l: 'Active Trips', v: o.activeTrips, tone: 'text-emerald-600' },
    { l: "Today's Trips", v: o.todaysTrips, tone: 'text-niter-600' },
    { l: 'Total Passengers', v: o.totalPassengers, tone: 'text-gold-600' },
    { l: 'On-Time Rate', v: `${o.onTimeRate}%`, tone: 'text-violet-600' },
    { l: 'Revenue (demo)', v: `BDT ${o.revenue.toLocaleString()}`, tone: 'text-emerald-600' },
    { l: 'Active Emergencies', v: o.emergencyActive, tone: 'text-red-600' },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <div key={c.l} className="card p-5">
            <p className={cls('font-display text-2xl font-semibold', c.tone)}>{c.v}</p>
            <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-ink-500">{c.l}</p>
          </div>
        ))}
      </div>
      <div className="card p-6">
        <p className="mb-4 text-sm font-bold uppercase tracking-wider text-ink-500">Bus Utilization & AI Crowd Forecast</p>
        <div className="grid gap-4 md:grid-cols-2">
          {o.busUtil.map((b) => {
            const crowd = o.crowd.find((c) => c.busId === b.busId);
            return (
              <div key={b.busId} className="rounded-xl border border-ink-100 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-ink-900">{b.name}</p>
                  <Badge tone={b.tripStatus === 'Active' ? 'green' : 'gray'}>{b.tripStatus}</Badge>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                    <div className={cls('h-full transition-all', b.occupancyPct > 85 ? 'bg-red-500' : b.occupancyPct > 60 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${b.occupancyPct}%` }} />
                  </div>
                  <span className="text-xs font-semibold">{b.occupancyPct}%</span>
                </div>
                <p className="mt-2 text-xs text-ink-500">Trips: {b.trips} · AI crowd: <span className="font-semibold text-ink-700">{crowd?.predicted}</span></p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ================= Departments ================= */
function DepartmentsTab() {
  const [rows, setRows] = useState<{ code: string; name: string; students: number; teachers: number; courses: number; batches: number }[]>([]);
  useEffect(() => {
    api.get<{ code: string; name: string; students: number; teachers: number; courses: number; batches: number }[]>('/api/admin/departments').then(setRows).catch(() => {});
  }, []);
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rows.map((d) => (
        <div key={d.code} className="card card-hover p-5">
          <div className="flex items-center justify-between">
            <p className="font-display text-lg font-semibold text-ink-900">{d.name}</p>
            <Badge>{d.code}</Badge>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2 text-center">
            {[['Students', d.students], ['Teachers', d.teachers], ['Courses', d.courses], ['Batches', d.batches]].map(([l, v]) => (
              <div key={l} className="rounded-lg bg-ink-50/60 py-2">
                <p className="font-bold text-ink-900">{v}</p>
                <p className="text-[9px] uppercase tracking-wide text-ink-400">{l}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================= Routine ================= */
function RoutineTab() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [filters, setFilters] = useState({ department: '', day: '' });
  const load = () => {
    const qs = new URLSearchParams();
    if (filters.department) qs.set('department', filters.department);
    if (filters.day) qs.set('day', filters.day);
    api.get<Record<string, unknown>[]>(`/api/admin/routines?${qs}`).then(setRows).catch(() => {});
  };
  useEffect(load, [filters]);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <select className="input !w-44" value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })}>
          <option value="">All Departments</option>
          {['CSE', 'EEE', 'TEX', 'FASHION', 'IPE'].map((d) => <option key={d}>{d}</option>)}
        </select>
        <select className="input !w-40" value={filters.day} onChange={(e) => setFilters({ ...filters, day: e.target.value })}>
          <option value="">All Days</option>
          {['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'].map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>
      <DataTable
        title="Routine"
        columns={[{ key: 'day', label: 'Day' }, { key: 'startTime', label: 'Start' }, { key: 'endTime', label: 'End' }, { key: 'course', label: 'Course' }, { key: 'batch', label: 'Batch' }, { key: 'room', label: 'Room' }, { key: 'teacherId', label: 'Teacher' }]}
        rows={rows}
      />
      <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">Smart validation prevents room, teacher, batch and lab conflicts — conflicting routines are rejected.</p>
    </div>
  );
}

/* ================= Helping Zone admin ================= */
function HelpingAdmin() {
  const [rows, setRows] = useState<{ id: string; category: string; question: string; studentId: string; status: string; createdAt: string }[]>([]);
  const { toast } = useToast();
  useEffect(() => {
    api.get<{ id: string; category: string; question: string; studentId: string; status: string; createdAt: string }[]>('/api/admin/helping-zone').then(setRows).catch(() => {});
  }, []);
  const setStatus = async (id: string, status: string) => {
    await api.put(`/api/admin/helping-zone/${id}`, { status });
    toast('success', `Status updated to ${status}.`);
    api.get<{ id: string; category: string; question: string; studentId: string; status: string; createdAt: string }[]>('/api/admin/helping-zone').then(setRows).catch(() => {});
  };
  return (
    <div className="space-y-3">
      {rows.length === 0 && <EmptyState title="No helping zone requests" />}
      {rows.map((h) => (
        <div key={h.id} className="card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2"><Badge>{h.category}</Badge><span className="text-xs text-ink-400">{h.id} · {h.studentId} · {h.createdAt.slice(0, 10)}</span></div>
            <div className="flex gap-1.5">
              {['Pending', 'In Progress', 'Resolved', 'Rejected'].map((s) => (
                <button key={s} onClick={() => setStatus(h.id, s)} className={cls('rounded-lg px-2.5 py-1 text-xs font-semibold transition', h.status === s ? 'bg-niter-700 text-white' : 'bg-ink-50 text-ink-500 hover:bg-ink-100')}>{s}</button>
              ))}
            </div>
          </div>
          <p className="mt-2 text-sm font-medium text-ink-900">{h.question}</p>
        </div>
      ))}
    </div>
  );
}

/* ================= Reports ================= */
function ReportsTab() {
  const [kinds, setKinds] = useState<{ kind: string; label: string }[]>([]);
  const [kind, setKind] = useState('students');
  const [report, setReport] = useState<{ label: string; fields: string[]; rows: Record<string, unknown>[]; count: number } | null>(null);
  useEffect(() => {
    api.get<{ kind: string; label: string }[]>('/api/admin/reports').then(setKinds).catch(() => {});
  }, []);
  useEffect(() => {
    api.get<{ label: string; fields: string[]; rows: Record<string, unknown>[]; count: number }>(`/api/admin/reports/${kind}`).then(setReport).catch(() => {});
  }, [kind]);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {kinds.map((k) => (
          <button key={k.kind} onClick={() => setKind(k.kind)} className={cls('rounded-full px-4 py-1.5 text-sm font-medium transition', kind === k.kind ? 'bg-niter-700 text-white' : 'bg-ink-50 text-ink-600 hover:bg-ink-100')}>
            {k.label}
          </button>
        ))}
      </div>
      {report && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink-500">{report.count} records</p>
            <a href={`/api/admin/reports/${kind}/export`} className="btn btn-outline btn-sm">Export CSV</a>
          </div>
          <DataTable
            title={report.label}
            columns={report.fields.map((f) => ({ key: f, label: f }))}
            rows={report.rows}
          />
        </>
      )}
    </div>
  );
}

/* ================= Admin Live Map ================= */
function AdminLiveMap({ state }: { state: ReturnType<typeof useTransportState>['state'] }) {
  const [mapKey, setMapKey] = useState(0);
  const buses = state?.live ?? {};
  const ids = Object.keys(buses);
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <AllBusesMap buses={buses} mapKey={mapKey} />
      </div>
      <div className="space-y-3">
        <p className="text-sm font-bold uppercase tracking-wider text-ink-500">All Buses — Live</p>
        {ids.length === 0 && <EmptyState title="Waiting for live transport data…" />}
        {ids.map((id) => {
          const b = buses[id];
          return (
            <div key={id} className="card p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-ink-900">{b.busName}</p>
                <Badge tone={b.tripStatus === 'Active' ? 'green' : 'gray'}>{b.tripStatus}</Badge>
              </div>
              <p className="text-xs text-ink-500">{b.driverName} · {b.routeName}</p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-ink-50/60 py-1.5"><p className="font-bold text-ink-900">{b.speedKmh ? `${b.speedKmh} km/h` : '—'}</p><p className="text-[9px] uppercase text-ink-400">Speed</p></div>
                <div className="rounded-lg bg-ink-50/60 py-1.5"><p className="font-bold text-ink-900">{b.occupancyPct}%</p><p className="text-[9px] uppercase text-ink-400">Occupancy</p></div>
                <div className="rounded-lg bg-ink-50/60 py-1.5"><p className="font-bold text-ink-900">{b.etaToCampus ?? '—'}m</p><p className="text-[9px] uppercase text-ink-400">ETA</p></div>
              </div>
              <p className="mt-2 text-[10px] text-ink-400">Updated {fmtRelative(b.lastUpdate)}</p>
            </div>
          );
        })}
        <button onClick={() => setMapKey((k) => k + 1)} className="btn btn-outline btn-sm w-full">Re-center Map</button>
      </div>
    </div>
  );
}

function AllBusesMap({ buses, mapKey }: { buses: Record<string, import('../../lib/api').LiveBus>; mapKey: number }) {
  // Lazy dynamic import of a dedicated multi-bus map is unnecessary; reuse LiveMap for the first active bus,
  // but render all four markers by layering a small overlay map.
  const entries = Object.values(buses);
  const active = entries.find((b) => b.tripStatus === 'Active');
  const selected = active ?? entries[0];
  const [routeData, setRouteData] = useState<{ id: string; name: string; stops: { name: string; lat: number; lng: number }[] } | null>(null);
  useEffect(() => {
    if (!selected) return;
    api.get<{ id: string; name: string; stops: { name: string; lat: number; lng: number }[] }[]>(`/api/transport/routes`).then((rs) => setRouteData(rs.find((r) => r.id === selected.routeId) || null)).catch(() => {});
  }, [selected?.routeId]);
  return (
    <div className="h-[560px]" key={mapKey}>
      <MultiBusMap buses={buses} route={routeData} />
    </div>
  );
}

function busIcon2(color: string, active: boolean) {
  const size = active ? 36 : 28;
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 48 48"><g transform="translate(24 24)"><circle r="21" fill="${color}" opacity="0.16"/><rect x="-15" y="-13" width="30" height="24" rx="5" fill="${color}"/><rect x="-11" y="-9" width="8" height="4" rx="2" fill="#fff" opacity="0.85"/><circle cx="-8" cy="15" r="6" fill="#0b1a38" stroke="${color}" stroke-width="2"/><circle cx="8" cy="15" r="6" fill="#0b1a38" stroke="${color}" stroke-width="2"/></g></svg>`;
  return L.divIcon({ html: svg, className: 'bus-marker', iconSize: [size, size], iconAnchor: [size / 2, size / 2 + 2] });
}

function MultiBusMap({ buses, route }: { buses: Record<string, LiveBus>; route: { id: string; name: string; stops: { name: string; lat: number; lng: number }[] } | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const [mapReady, setMapReady] = useState(false);
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { center: [23.83, 90.34], zoom: 11 });
    mapRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);
    setMapReady(true);
    return () => { map.remove(); mapRef.current = null; };
  }, []);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (route) {
      const latlngs = route.stops.map((s) => [s.lat, s.lng] as [number, number]);
      L.polyline(latlngs, { color: '#7c3aed', weight: 3, dashArray: '1 6', opacity: 0.7 }).addTo(map);
      route.stops.forEach((s) => L.circleMarker([s.lat, s.lng], { radius: 4, color: '#7c3aed', fillColor: '#fff', fillOpacity: 1 }).addTo(map));
    }
  }, [route, mapReady]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    Object.values(buses).forEach((b) => {
      if (!b.position) return;
      if (!markersRef.current[b.busId]) {
        const m = L.marker([b.position.lat, b.position.lng], { icon: busIcon2(b.color, b.tripStatus === 'Active') }).addTo(map);
        m.bindPopup(`<strong>${b.busName}</strong><br/>${b.driverName} · ${b.tripStatus}`);
        markersRef.current[b.busId] = m;
      } else {
        markersRef.current[b.busId].setLatLng([b.position.lat, b.position.lng]);
        markersRef.current[b.busId].setIcon(busIcon2(b.color, b.tripStatus === 'Active'));
      }
    });
  }, [buses, mapReady]);
  return <div ref={containerRef} className="h-full w-full rounded-2xl border border-ink-100" />;
}

/* ================= Transport: Buses ================= */
function BusesAdmin() {
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const { toast } = useToast();
  const load = () => api.get<Record<string, any>[]>('/api/admin/transport/buses').then(setRows).catch(() => {});
  useEffect(() => { load(); }, []);
  const setStatus = async (id: string, status: string) => {
    await api.put(`/api/admin/transport/buses/${id}`, { status });
    toast('success', `${id} status → ${status}`);
    load();
  };
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {rows.map((b) => {
          const live = b.live as { tripStatus: string; occupancyPct: number; passengers: number; speedKmh: number; etaToCampus: number | null } | null;
          return (
            <div key={b.id as string} className="card p-5">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-ink-900">{b.name as string}</p>
                <Badge tone={(b.status as string) === 'Active' ? 'green' : (b.status as string) === 'On Trip' ? 'gold' : (b.status as string) === 'Maintenance' ? 'red' : 'gray'}>{b.status as string}</Badge>
              </div>
              <p className="mt-0.5 text-xs text-ink-500">{b.type} · Capacity {b.capacity} · {b.departure}</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-ink-50/60 p-2">Driver: <span className="font-semibold">{b.driverName as string}</span></div>
                <div className="rounded-lg bg-ink-50/60 p-2">Trip: <span className="font-semibold">{live?.tripStatus ?? 'Inactive'}</span></div>
                <div className="rounded-lg bg-ink-50/60 p-2">Occupancy: <span className="font-semibold">{live?.occupancyPct ?? 0}%</span></div>
                <div className="rounded-lg bg-ink-50/60 p-2">ETA: <span className="font-semibold">{live?.etaToCampus ?? '—'}m</span></div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {['Active', 'Inactive', 'On Trip', 'Maintenance'].map((s) => (
                  <button key={s} onClick={() => setStatus(b.id as string, s)} className={cls('rounded-lg px-2.5 py-1 text-xs font-semibold transition', b.status === s ? 'bg-niter-700 text-white' : 'bg-ink-50 text-ink-500 hover:bg-ink-100')}>{s}</button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================= Routes admin (configurable stops) ================= */
type RouteRow = { id: string; name: string; type: string; departure: string; configurable: boolean; stops: { name: string; lat: number; lng: number; demand: number }[] };
function RoutesAdmin() {
  const [routes, setRoutes] = useState<RouteRow[]>([]);
  const [edit, setEdit] = useState<RouteRow | null>(null);
  const { toast } = useToast();
  const load = () => api.get<RouteRow[]>('/api/admin/transport/routes').then(setRoutes).catch(() => {});
  useEffect(() => { load(); }, []);
  const save = async () => {
    if (!edit) return;
    await api.put(`/api/admin/transport/routes/${edit.id}`, { stops: edit.stops, departure: edit.departure });
    toast('success', `${edit.name} updated — stops saved.`);
    setEdit(null);
    load();
  };
  const move = (i: number, dir: -1 | 1) => {
    if (!edit) return;
    const stops = [...edit.stops];
    const j = i + dir;
    if (j < 0 || j >= stops.length) return;
    [stops[i], stops[j]] = [stops[j], stops[i]];
    setEdit({ ...edit, stops });
  };
  return (
    <div className="space-y-4">
      {routes.map((r) => (
        <div key={r.id} className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-semibold text-ink-900">{r.name} <span className="text-xs font-normal text-ink-400">({r.id})</span></p>
              <p className="text-xs text-ink-500">{r.type} · Departs {r.departure} {r.configurable && <Badge tone="gold">Stops Configurable</Badge>}</p>
            </div>
            <button onClick={() => setEdit({ ...r, stops: r.stops.map((s) => ({ ...s })) })} className="btn btn-outline btn-sm">Edit Stops</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {r.stops.map((s, i) => (
              <span key={i} className={cls('rounded-lg px-2.5 py-1 text-xs font-semibold', i === 0 ? 'bg-niter-700 text-white' : i === r.stops.length - 1 ? 'bg-gold-500 text-ink-900' : 'bg-ink-50 text-ink-600')}>{s.name}</span>
            ))}
          </div>
        </div>
      ))}

      {edit && (
        <Modal open onClose={() => setEdit(null)} title={`Edit ${edit.name}`} wide>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="label mb-0">Departure:</label>
              <input className="input !w-36" value={edit.departure} onChange={(e) => setEdit({ ...edit, departure: e.target.value })} />
            </div>
            {edit.stops.map((s, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-ink-100 p-2">
                <span className="flex items-center gap-1 text-ink-400"><GripVertical size={14} /><span className="w-6 text-center text-xs font-bold">{i + 1}</span></span>
                <input className="input flex-1" value={s.name} onChange={(e) => { const stops = [...edit.stops]; stops[i] = { ...s, name: e.target.value }; setEdit({ ...edit, stops }); }} />
                <input type="number" step="0.0001" className="input !w-28" value={s.lat} onChange={(e) => { const stops = [...edit.stops]; stops[i] = { ...s, lat: Number(e.target.value) }; setEdit({ ...edit, stops }); }} />
                <input type="number" step="0.0001" className="input !w-28" value={s.lng} onChange={(e) => { const stops = [...edit.stops]; stops[i] = { ...s, lng: Number(e.target.value) }; setEdit({ ...edit, stops }); }} />
                <button onClick={() => move(i, -1)} disabled={i === 0} className="rounded-lg border border-ink-100 p-1.5 text-ink-500 disabled:opacity-30"><ChevronUp size={14} /></button>
                <button onClick={() => move(i, 1)} disabled={i === edit.stops.length - 1} className="rounded-lg border border-ink-100 p-1.5 text-ink-500 disabled:opacity-30"><ChevronDown size={14} /></button>
                <button onClick={() => setEdit({ ...edit, stops: edit.stops.filter((_, j) => j !== i) })} disabled={edit.stops.length <= 2} className="rounded-lg border border-red-100 p-1.5 text-red-500 disabled:opacity-30"><Trash2 size={14} /></button>
              </div>
            ))}
            <button
              onClick={() => setEdit({ ...edit, stops: [...edit.stops, { name: 'New Stop', lat: edit.stops[edit.stops.length - 1].lat, lng: edit.stops[edit.stops.length - 1].lng, demand: 0.3 }] })}
              className="btn btn-outline btn-sm w-full"><Plus size={14} /> Add Stop</button>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEdit(null)} className="btn btn-ghost">Cancel</button>
              <button onClick={save} className="btn btn-primary">Save Route</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ================= Trips ================= */
function TripsTab() {
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  useEffect(() => {
    api.get<Record<string, any>[]>('/api/admin/transport/trips').then(setRows).catch(() => {});
  }, []);
  return <DataTable title="Trip History" columns={[{ key: 'tripId', label: 'Trip ID' }, { key: 'busName', label: 'Bus' }, { key: 'routeName', label: 'Route' }, { key: 'driverName', label: 'Driver' }, { key: 'startedAt', label: 'Started', render: (r) => new Date(r.startedAt as string).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) }, { key: 'status', label: 'Status', render: (r) => <Badge tone={r.status === 'COMPLETED' ? 'green' : 'gold'}>{r.status}</Badge> }, { key: 'passengers', label: 'Passengers' }, { key: 'distanceKm', label: 'KM' }, { key: 'onTime', label: 'On Time', render: (r) => <Badge tone={r.onTime ? 'green' : 'red'}>{String(r.onTime)}</Badge> }]} rows={rows} />;
}

/* ================= Analytics ================= */
function AnalyticsTab() {
  const [trips, setTrips] = useState<{ tripsByDay: Record<string, number>; byBus: Record<string, number>; passengersByBus: Record<string, number>; total: number } | null>(null);
  const [revenue, setRevenue] = useState<{ byMethod: Record<string, number>; byDay: Record<string, number>; total: number; count: number } | null>(null);
  useEffect(() => {
    api.get<{ tripsByDay: Record<string, number>; byBus: Record<string, number>; passengersByBus: Record<string, number>; total: number }>('/api/admin/analytics/trips').then(setTrips).catch(() => {});
    api.get<{ byMethod: Record<string, number>; byDay: Record<string, number>; total: number; count: number }>('/api/admin/analytics/revenue').then(setRevenue).catch(() => {});
  }, []);
  const bars = (data: Record<string, number>, color = '#2563eb') => {
    const entries = Object.entries(data);
    const max = Math.max(1, ...entries.map(([, v]) => v));
    return (
      <div className="flex h-40 items-end gap-2">
        {entries.length === 0 && <p className="text-sm text-ink-400">No data yet — start a trip!</p>}
        {entries.map(([k, v]) => (
          <div key={k} className="group flex flex-1 flex-col items-center gap-1">
            <span className="text-[10px] font-semibold text-ink-600">{v}</span>
            <div className="w-full rounded-t-md transition-all group-hover:opacity-80" style={{ height: `${(v / max) * 100}%`, background: color, minHeight: 4 }} />
            <span className="w-full truncate text-center text-[9px] text-ink-400">{k.slice(-10)}</span>
          </div>
        ))}
      </div>
    );
  };
  return (
    <div className="space-y-5">
      <div className="card p-6">
        <p className="mb-4 text-sm font-bold uppercase tracking-wider text-ink-500">Trips by Day</p>
        {bars(trips?.tripsByDay ?? {})}
        <p className="mt-4 text-xs text-ink-400">Trips per bus: {Object.entries(trips?.byBus ?? {}).map(([k, v]) => `${k}: ${v}`).join(' · ')}</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="card p-6">
          <p className="mb-4 text-sm font-bold uppercase tracking-wider text-ink-500">Revenue by Day (demo)</p>
          {bars(revenue?.byDay ?? {}, '#c9a227')}
        </div>
        <div className="card p-6">
          <p className="mb-4 text-sm font-bold uppercase tracking-wider text-ink-500">Payment Methods</p>
          {bars(revenue?.byMethod ?? {}, '#0d9488')}
          <p className="mt-4 text-sm text-ink-500">Total (demo): <span className="font-semibold text-ink-900">BDT {revenue?.total.toLocaleString() ?? 0}</span> · {revenue?.count ?? 0} transactions</p>
        </div>
      </div>
    </div>
  );
}

/* ================= Complaints / Emergencies / Maintenance / Anomalies ================= */
function ComplaintsTab() {
  const [rows, setRows] = useState<{ id: string; category: string; description: string; userName: string; status: string; reply: string }[]>([]);
  const { toast } = useToast();
  const load = () => api.get<{ id: string; category: string; description: string; userName: string; status: string; reply: string }[]>('/api/admin/transport/complaints').then(setRows).catch(() => {});
  useEffect(() => { load(); }, []);
  const update = async (id: string, body: Record<string, string>) => {
    await api.put(`/api/admin/transport/complaints/${id}`, body);
    toast('success', 'Complaint updated.');
    load();
  };
  return (
    <div className="space-y-3">
      {rows.length === 0 && <EmptyState title="No complaints" />}
      {rows.map((c) => (
        <div key={c.id} className="card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2"><Badge>{c.category}</Badge><span className="text-xs text-ink-400">{c.id} · {c.userName}</span></div>
            <select className="input !w-36 !py-1.5 text-xs" value={c.status} onChange={(e) => update(c.id, { status: e.target.value })}>
              {['Pending', 'In Progress', 'Resolved'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <p className="mt-2 text-sm text-ink-800">{c.description}</p>
          {c.reply && <p className="mt-2 rounded-lg bg-niter-50 p-2.5 text-xs text-ink-600"><span className="font-semibold">Reply:</span> {c.reply}</p>}
          <div className="mt-2 flex gap-2">
            <input id={`comp-${c.id}`} className="input flex-1 !py-2 text-xs" placeholder="Reply to student…" />
            <button onClick={() => { const el = document.getElementById(`comp-${c.id}`) as HTMLInputElement; update(c.id, { reply: el.value }); el.value = ''; }} className="btn btn-primary btn-sm">Reply</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmergenciesTab() {
  const [rows, setRows] = useState<{ id: string; userName: string; busName: string; type: string; note: string; status: string; at: string }[]>([]);
  const { toast } = useToast();
  const load = () => api.get<{ id: string; userName: string; busName: string; type: string; note: string; status: string; at: string }[]>('/api/admin/transport/emergencies').then(setRows).catch(() => {});
  useEffect(() => { load(); }, []);
  const resolve = async (id: string) => {
    await api.put(`/api/admin/transport/emergencies/${id}`, { status: 'Resolved' });
    toast('success', 'Emergency marked resolved.');
    load();
  };
  return (
    <div className="space-y-3">
      {rows.length === 0 && <EmptyState title="No active emergencies — all clear 🎉" />}
      {rows.map((e) => (
        <div key={e.id} className="card border-l-4 border-l-red-500 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 font-semibold text-ink-900"><Siren size={16} className="text-red-500" /> {e.type} — {e.userName}</p>
            <Badge tone={e.status === 'Active' ? 'red' : 'green'}>{e.status}</Badge>
          </div>
          <p className="mt-1 text-sm text-ink-600">{e.busName || 'No bus'} · {e.note || 'No note'} · {new Date(e.at).toLocaleTimeString('en-GB')}</p>
          {e.status === 'Active' && <button onClick={() => resolve(e.id)} className="btn btn-danger btn-sm mt-2">Resolve</button>}
        </div>
      ))}
    </div>
  );
}

function MaintenanceTab() {
  const [rows, setRows] = useState<{ bus: { id: string; name: string }; prediction: { status: string; reason: string; mileageKm: number; tripCount: number; daysSinceService: number }; records: { id: string; date: string; issue: string; status: string }[] }[]>([]);
  useEffect(() => {
    api.get<{ bus: { id: string; name: string }; prediction: { status: string; reason: string; mileageKm: number; tripCount: number; daysSinceService: number }; records: { id: string; date: string; issue: string; status: string }[] }[]>('/api/admin/transport/maintenance').then(setRows).catch(() => {});
  }, []);
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {rows.map((r) => (
        <div key={r.bus.id} className="card p-5">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-ink-900">{r.bus.name}</p>
            <Badge tone={r.prediction.status === 'Healthy' ? 'green' : r.prediction.status === 'Maintenance Due Soon' ? 'gold' : 'red'}>{r.prediction.status}</Badge>
          </div>
          <p className="mt-2 text-sm text-ink-600">{r.prediction.reason}</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg bg-ink-50/60 py-1.5"><p className="font-bold text-ink-900">{r.prediction.mileageKm} km</p><p className="text-[9px] uppercase text-ink-400">Mileage</p></div>
            <div className="rounded-lg bg-ink-50/60 py-1.5"><p className="font-bold text-ink-900">{r.prediction.tripCount}</p><p className="text-[9px] uppercase text-ink-400">Trips</p></div>
            <div className="rounded-lg bg-ink-50/60 py-1.5"><p className="font-bold text-ink-900">{r.prediction.daysSinceService}d</p><p className="text-[9px] uppercase text-ink-400">Since Service</p></div>
          </div>
          {r.records.length > 0 && <p className="mt-3 text-[11px] text-ink-400">Last service: {r.records[0].date} — {r.records[0].issue}</p>}
        </div>
      ))}
    </div>
  );
}

function AnomaliesTab() {
  const [rows, setRows] = useState<{ id: string; type: string; detail: string; severity: string; at: string; reviewed: boolean }[]>([]);
  const { toast } = useToast();
  const load = () => api.get<{ id: string; type: string; detail: string; severity: string; at: string; reviewed: boolean }[]>('/api/admin/transport/anomalies').then(setRows).catch(() => {});
  useEffect(() => { load(); }, []);
  const scan = async () => {
    await api.post('/api/admin/transport/anomalies/scan');
    toast('info', 'Anomaly scan complete.');
    load();
  };
  const review = async (id: string) => {
    await api.put(`/api/admin/transport/anomalies/${id}`, {});
    load();
  };
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-500">AI anomaly detection flags suspicious QR scans, unauthorized access and GPS behavior — for admin review, never automatic punishment.</p>
        <button onClick={scan} className="btn btn-outline btn-sm"><ShieldAlert size={13} /> Run Scan</button>
      </div>
      {rows.length === 0 && <EmptyState title="No anomalies detected" />}
      {rows.map((a) => (
        <div key={a.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            <Badge tone={a.severity === 'High' ? 'red' : a.severity === 'Medium' ? 'gold' : 'gray'}>{a.severity}</Badge>
            <div>
              <p className="text-sm font-semibold text-ink-900">{a.type}</p>
              <p className="text-xs text-ink-500">{a.detail} · {new Date(a.at).toLocaleString('en-GB')}</p>
            </div>
          </div>
          <button onClick={() => review(a.id)} disabled={a.reviewed} className="btn btn-outline btn-sm disabled:opacity-40">{a.reviewed ? 'Reviewed' : 'Mark Reviewed'}</button>
        </div>
      ))}
    </div>
  );
}
