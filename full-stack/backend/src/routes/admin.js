// ============================================================================
// Admin API — NSCMS management + transport management + analytics + reports.
// Every route here requires role=admin.
// ============================================================================

import { Router } from 'express';
import { authRequired, requireRole } from '../auth.js';
import { getDb, saveDebounced, nextSeq, now } from '../db.js';
import { ok, err, handleError, nonEmpty, isEmail, isPhone, requireFields } from '../validate.js';
import { engine } from '../transport/engine.js';
import { predictCrowd, predictMaintenance, additionalBusRecommendation, runAnomalyScan } from '../ai/index.js';

export const router = Router();
router.use('/admin', authRequired, requireRole('admin'));

// ============================================================================
// NSCMS — STUDENTS
// ============================================================================
router.get('/admin/students', (req, res) => {
  const db = getDb();
  const q = String(req.query.search || '').toLowerCase();
  let rows = db.students;
  if (q) rows = rows.filter((s) => [s.id, s.name, s.department, s.batch].some((v) => String(v).toLowerCase().includes(q)));
  ok(res, rows);
});

router.post('/admin/students', (req, res) => {
  try {
    const b = req.body || {};
    const missing = requireFields(b, ['id', 'name', 'department', 'batch']);
    if (missing.length) return err(res, 400, `Missing: ${missing.join(', ')}`);
    const db = getDb();
    if (db.students.some((s) => s.id === b.id)) return err(res, 409, 'Duplicate Student ID. Student ID must be unique.');
    if (b.email && !isEmail(b.email)) return err(res, 400, 'Invalid email address.');
    if (b.phone && !isPhone(b.phone)) return err(res, 400, 'Invalid phone number.');
    const student = { id: b.id, name: b.name, department: b.department, batch: b.batch, semester: b.semester || '1-1', theorySection: b.theorySection || 'A', labSection: b.labSection || 'L1', email: b.email || '', phone: b.phone || '', cgpa: Number(b.cgpa) || 0 };
    db.students.push(student);
    saveDebounced();
    ok(res, { student });
  } catch (e) { handleError(res, e); }
});

router.put('/admin/students/:id', (req, res) => {
  const s = getDb().students.find((x) => x.id === req.params.id);
  if (!s) return err(res, 404, 'Student not found');
  const b = req.body || {};
  if (b.email && !isEmail(b.email)) return err(res, 400, 'Invalid email address.');
  if (b.phone && !isPhone(b.phone)) return err(res, 400, 'Invalid phone number.');
  Object.assign(s, { name: b.name ?? s.name, department: b.department ?? s.department, batch: b.batch ?? s.batch, semester: b.semester ?? s.semester, theorySection: b.theorySection ?? s.theorySection, labSection: b.labSection ?? s.labSection, email: b.email ?? s.email, phone: b.phone ?? s.phone, cgpa: b.cgpa ?? s.cgpa });
  saveDebounced();
  ok(res, { student: s });
});

router.delete('/admin/students/:id', (req, res) => {
  const db = getDb();
  const idx = db.students.findIndex((x) => x.id === req.params.id);
  if (idx === -1) return err(res, 404, 'Student not found');
  db.students.splice(idx, 1);
  saveDebounced();
  ok(res, { ok: true });
});

// ============================================================================
// NSCMS — TEACHERS
// ============================================================================
router.get('/admin/teachers', (req, res) => {
  const db = getDb();
  const q = String(req.query.search || '').toLowerCase();
  let rows = db.teachers;
  if (q) rows = rows.filter((t) => [t.id, t.name, t.department, t.designation].some((v) => String(v).toLowerCase().includes(q)));
  ok(res, rows);
});

router.post('/admin/teachers', (req, res) => {
  try {
    const b = req.body || {};
    const missing = requireFields(b, ['id', 'name', 'department', 'designation']);
    if (missing.length) return err(res, 400, `Missing: ${missing.join(', ')}`);
    const db = getDb();
    if (db.teachers.some((t) => t.id === b.id)) return err(res, 409, 'Duplicate Teacher ID.');
    if (!isEmail(b.email)) return err(res, 400, 'Invalid email address.');
    if (!isPhone(b.phone)) return err(res, 400, 'Invalid phone number.');
    if (Number(b.salary) < 0) return err(res, 400, 'Salary cannot be negative.');
    const teacher = { id: b.id, name: b.name, department: b.department, designation: b.designation, email: b.email, phone: b.phone, salary: Number(b.salary) || 0 };
    db.teachers.push(teacher);
    saveDebounced();
    ok(res, { teacher });
  } catch (e) { handleError(res, e); }
});

router.put('/admin/teachers/:id', (req, res) => {
  const t = getDb().teachers.find((x) => x.id === req.params.id);
  if (!t) return err(res, 404, 'Teacher not found');
  const b = req.body || {};
  if (b.email && !isEmail(b.email)) return err(res, 400, 'Invalid email address.');
  if (b.phone && !isPhone(b.phone)) return err(res, 400, 'Invalid phone number.');
  if (Number(b.salary) < 0) return err(res, 400, 'Salary cannot be negative.');
  Object.assign(t, { name: b.name ?? t.name, department: b.department ?? t.department, designation: b.designation ?? t.designation, email: b.email ?? t.email, phone: b.phone ?? t.phone, salary: b.salary ?? t.salary });
  saveDebounced();
  ok(res, { teacher: t });
});

router.delete('/admin/teachers/:id', (req, res) => {
  const db = getDb();
  const idx = db.teachers.findIndex((x) => x.id === req.params.id);
  if (idx === -1) return err(res, 404, 'Teacher not found');
  db.teachers.splice(idx, 1);
  saveDebounced();
  ok(res, { ok: true });
});

// ============================================================================
// NSCMS — DEPARTMENTS / BATCHES / COURSES / ROOMS / ROUTINES / NOTICES
// ============================================================================
router.get('/admin/departments', (_req, res) => {
  const db = getDb();
  const stats = db.departments.map((d) => ({
    ...d,
    students: db.students.filter((s) => s.department === d.id).length,
    teachers: db.teachers.filter((t) => t.department === d.id).length,
    courses: db.courses.filter((c) => c.department === d.id).length,
    batches: db.batches.filter((b) => b.department === d.id).length,
  }));
  ok(res, stats);
});

router.get('/admin/batches', (_req, res) => ok(res, getDb().batches));
router.post('/admin/batches', (req, res) => {
  try {
    const b = req.body || {};
    const missing = requireFields(b, ['id', 'department']);
    if (missing.length) return err(res, 400, `Missing: ${missing.join(', ')}`);
    const db = getDb();
    if (db.batches.some((x) => x.id === b.id)) return err(res, 409, 'Duplicate Batch ID.');
    db.batches.push({ id: b.id, department: b.department, semester: b.semester || '', theorySection: b.theorySection || 'A', labSection: b.labSection || 'L1', totalStudents: Number(b.totalStudents) || 0 });
    saveDebounced();
    ok(res, { ok: true });
  } catch (e) { handleError(res, e); }
});
router.delete('/admin/batches/:id', (req, res) => {
  const db = getDb();
  const i = db.batches.findIndex((x) => x.id === req.params.id);
  if (i === -1) return err(res, 404, 'Batch not found');
  db.batches.splice(i, 1);
  saveDebounced();
  ok(res, { ok: true });
});

router.get('/admin/courses', (_req, res) => ok(res, getDb().courses));
router.post('/admin/courses', (req, res) => {
  try {
    const b = req.body || {};
    const missing = requireFields(b, ['code', 'name', 'credit', 'department', 'type']);
    if (missing.length) return err(res, 400, `Missing: ${missing.join(', ')}`);
    const db = getDb();
    if (db.courses.some((c) => c.code === b.code)) return err(res, 409, 'Duplicate course code.');
    if (Number(b.credit) <= 0) return err(res, 400, 'Invalid credit value.');
    if (!['Theory', 'Lab'].includes(b.type)) return err(res, 400, 'Course type must be Theory or Lab.');
    if (b.type === 'Lab' && !db.rooms.some((r) => r.type.includes('Lab'))) return err(res, 400, 'No laboratory room available.');
    db.courses.push({ code: b.code, name: b.name, credit: Number(b.credit), type: b.type, semester: b.semester || '', department: b.department, teacherId: b.teacherId || '' });
    saveDebounced();
    ok(res, { ok: true });
  } catch (e) { handleError(res, e); }
});
router.put('/admin/courses/:code', (req, res) => {
  const c = getDb().courses.find((x) => x.code === req.params.code);
  if (!c) return err(res, 404, 'Course not found');
  Object.assign(c, req.body);
  saveDebounced();
  ok(res, { course: c });
});
router.delete('/admin/courses/:code', (req, res) => {
  const db = getDb();
  const i = db.courses.findIndex((x) => x.code === req.params.code);
  if (i === -1) return err(res, 404, 'Course not found');
  db.courses.splice(i, 1);
  saveDebounced();
  ok(res, { ok: true });
});

router.get('/admin/rooms', (_req, res) => ok(res, getDb().rooms));
router.post('/admin/rooms', (req, res) => {
  try {
    const b = req.body || {};
    const missing = requireFields(b, ['number', 'type', 'capacity']);
    if (missing.length) return err(res, 400, `Missing: ${missing.join(', ')}`);
    const db = getDb();
    if (db.rooms.some((r) => r.number === b.number)) return err(res, 409, 'Duplicate room number.');
    db.rooms.push({ id: String(b.number), number: String(b.number), floor: b.floor || '1st', capacity: Number(b.capacity), type: b.type, status: b.status || 'Available' });
    saveDebounced();
    ok(res, { ok: true });
  } catch (e) { handleError(res, e); }
});
router.put('/admin/rooms/:number', (req, res) => {
  const r = getDb().rooms.find((x) => x.number === req.params.number);
  if (!r) return err(res, 404, 'Room not found');
  Object.assign(r, req.body);
  saveDebounced();
  ok(res, { room: r });
});
router.delete('/admin/rooms/:number', (req, res) => {
  const db = getDb();
  const i = db.rooms.findIndex((x) => x.number === req.params.number);
  if (i === -1) return err(res, 404, 'Room not found');
  db.rooms.splice(i, 1);
  saveDebounced();
  ok(res, { ok: true });
});

// --- Routine management with smart conflict validation ----------------------
router.get('/admin/routines', (req, res) => {
  let rows = getDb().routines;
  const f = req.query;
  if (f.department) rows = rows.filter((r) => r.department === f.department);
  if (f.batch) rows = rows.filter((r) => r.batch === f.batch);
  if (f.semester) rows = rows.filter((r) => r.semester === f.semester);
  if (f.day) rows = rows.filter((r) => r.day === f.day);
  ok(res, rows);
});

function routineConflicts(db, candidate) {
  const conflicts = [];
  for (const r of db.routines) {
    if (r.id === candidate.id) continue;
    if (r.day !== candidate.day) continue;
    const overlap = !(candidate.endTime <= r.startTime || candidate.startTime >= r.endTime);
    if (!overlap) continue;
    if (r.room === candidate.room) conflicts.push({ type: 'Same room conflict', detail: `${r.room} already booked ${r.day} ${r.startTime}-${r.endTime} for ${r.course}` });
    if (r.teacherId === candidate.teacherId) conflicts.push({ type: 'Same teacher conflict', detail: `${candidate.teacherId} already teaches ${r.course} ${r.day} ${r.startTime}-${r.endTime}` });
    if (r.batch === candidate.batch) conflicts.push({ type: 'Same batch conflict', detail: `${r.batch} already has ${r.course} ${r.day} ${r.startTime}-${r.endTime}` });
  }
  return conflicts;
}

router.post('/admin/routines', (req, res) => {
  try {
    const b = req.body || {};
    const missing = requireFields(b, ['department', 'batch', 'course', 'teacherId', 'room', 'day', 'startTime', 'endTime']);
    if (missing.length) return err(res, 400, `Missing: ${missing.join(', ')}`);
    if (b.startTime >= b.endTime) return err(res, 400, 'Invalid time range: start must be before end.');
    const db = getDb();
    const course = db.courses.find((c) => c.code === b.course);
    if (!course) return err(res, 400, 'Unknown course.');
    if (course.type === 'Lab' && !db.rooms.find((r) => r.number === b.room && r.type.includes('Lab'))) {
      return err(res, 400, 'Invalid laboratory assignment: this room is not a lab.');
    }
    const candidate = { ...b, id: `RT-${String(db.routines.length + 1).padStart(3, '0')}` };
    const conflicts = routineConflicts(db, candidate);
    if (conflicts.length) return err(res, 409, `Routine conflicts: ${conflicts.map((c) => `${c.type} (${c.detail})`).join('; ')}`);
    db.routines.push(candidate);
    saveDebounced();
    ok(res, { routine: candidate });
  } catch (e) { handleError(res, e); }
});
router.put('/admin/routines/:id', (req, res) => {
  const db = getDb();
  const r = db.routines.find((x) => x.id === req.params.id);
  if (!r) return err(res, 404, 'Routine not found');
  const candidate = { ...r, ...req.body, id: r.id };
  if (candidate.startTime >= candidate.endTime) return err(res, 400, 'Invalid time range.');
  const conflicts = routineConflicts(db, candidate);
  if (conflicts.length) return err(res, 409, `Routine conflicts: ${conflicts.map((c) => c.detail).join('; ')}`);
  Object.assign(r, req.body);
  saveDebounced();
  ok(res, { routine: r });
});
router.delete('/admin/routines/:id', (req, res) => {
  const db = getDb();
  const i = db.routines.findIndex((x) => x.id === req.params.id);
  if (i === -1) return err(res, 404, 'Routine not found');
  db.routines.splice(i, 1);
  saveDebounced();
  ok(res, { ok: true });
});

// --- Notices ----------------------------------------------------------------
router.get('/admin/notices', (_req, res) => ok(res, getDb().notices.slice().sort((a, b) => new Date(b.date) - new Date(a.date))));
router.post('/admin/notices', (req, res) => {
  try {
    const b = req.body || {};
    const missing = requireFields(b, ['title', 'summary']);
    if (missing.length) return err(res, 400, `Missing: ${missing.join(', ')}`);
    const db = getDb();
    db.notices.unshift({ id: nextSeq('notice'), title: b.title, summary: b.summary, category: b.category || 'General', date: b.date || new Date().toISOString().slice(0, 10), badge: b.badge || '' });
    saveDebounced();
    ok(res, { ok: true });
  } catch (e) { handleError(res, e); }
});
router.put('/admin/notices/:id', (req, res) => {
  const n = getDb().notices.find((x) => x.id === req.params.id);
  if (!n) return err(res, 404, 'Notice not found');
  Object.assign(n, req.body);
  saveDebounced();
  ok(res, { notice: n });
});
router.delete('/admin/notices/:id', (req, res) => {
  const db = getDb();
  const i = db.notices.findIndex((x) => x.id === req.params.id);
  if (i === -1) return err(res, 404, 'Notice not found');
  db.notices.splice(i, 1);
  saveDebounced();
  ok(res, { ok: true });
});

// --- Helping Zone (admin) -----------------------------------------------------
router.get('/admin/helping-zone', (_req, res) => ok(res, getDb().helpingZone.slice().reverse()));
router.put('/admin/helping-zone/:id', (req, res) => {
  const h = getDb().helpingZone.find((x) => x.id === req.params.id);
  if (!h) return err(res, 404, 'Request not found');
  h.status = req.body.status || h.status;
  saveDebounced();
  ok(res, { item: h });
});

router.get('/admin/attendance', (_req, res) => ok(res, getDb().attendance.slice().reverse()));
router.get('/admin/results', (_req, res) => ok(res, getDb().results.slice().reverse()));

// ============================================================================
// TRANSPORT MANAGEMENT
// ============================================================================
router.get('/admin/transport/buses', (_req, res) => {
  const db = getDb();
  ok(res, db.buses.map((b) => {
    const l = engine.getBus(b.id);
    return { ...b, driverName: db.drivers.find((d) => d.id === b.driverId)?.name, live: l ? { tripStatus: l.tripStatus, passengers: l.passengers, occupancyPct: l.occupancyPct, speedKmh: l.speedKmh, etaToCampus: l.etaToCampus, position: l.position, lastUpdate: l.lastUpdate } : null };
  }));
});

router.put('/admin/transport/buses/:id', (req, res) => {
  const b = getDb().buses.find((x) => x.id === req.params.id);
  if (!b) return err(res, 404, 'Bus not found');
  Object.assign(b, req.body);
  saveDebounced();
  ok(res, { bus: b });
});

router.get('/admin/transport/routes', (_req, res) => ok(res, getDb().routes));

// Route management: add/remove/reorder stops, set departure, assign bus/driver.
router.put('/admin/transport/routes/:id', (req, res) => {
  try {
    const db = getDb();
    const route = db.routes.find((r) => r.id === req.params.id);
    if (!route) return err(res, 404, 'Route not found');
    const b = req.body || {};
    if (b.stops) {
      if (!Array.isArray(b.stops) || b.stops.length < 2) return err(res, 400, 'A route needs at least two stops.');
      for (const s of b.stops) {
        if (!nonEmpty(s.name) || typeof s.lat !== 'number' || typeof s.lng !== 'number') return err(res, 400, 'Each stop needs a name, lat and lng.');
      }
      route.stops = b.stops.map((s, i) => ({ name: s.name, lat: s.lat, lng: s.lng, demand: Number(s.demand ?? 0.3) }));
    }
    if (b.departure) route.departure = b.departure;
    if (b.name) route.name = b.name;
    saveDebounced();
    ok(res, { route });
  } catch (e) { handleError(res, e); }
});

router.get('/admin/transport/drivers', (_req, res) => ok(res, getDb().drivers));
router.post('/admin/transport/drivers', (req, res) => {
  try {
    const b = req.body || {};
    const missing = requireFields(b, ['id', 'name', 'busId']);
    if (missing.length) return err(res, 400, `Missing: ${missing.join(', ')}`);
    const db = getDb();
    if (db.drivers.some((d) => d.id === b.id)) return err(res, 409, 'Duplicate Driver ID.');
    db.drivers.push({ id: b.id, name: b.name, phone: b.phone || '', busId: b.busId, status: 'Available' });
    saveDebounced();
    ok(res, { ok: true });
  } catch (e) { handleError(res, e); }
});
router.put('/admin/transport/drivers/:id', (req, res) => {
  const d = getDb().drivers.find((x) => x.id === req.params.id);
  if (!d) return err(res, 404, 'Driver not found');
  Object.assign(d, req.body);
  saveDebounced();
  ok(res, { driver: d });
});
router.delete('/admin/transport/drivers/:id', (req, res) => {
  const db = getDb();
  const i = db.drivers.findIndex((x) => x.id === req.params.id);
  if (i === -1) return err(res, 404, 'Driver not found');
  db.drivers.splice(i, 1);
  saveDebounced();
  ok(res, { ok: true });
});

router.get('/admin/transport/schedules', (_req, res) => ok(res, getDb().schedules));
router.post('/admin/transport/schedules', (req, res) => {
  try {
    const b = req.body || {};
    const missing = requireFields(b, ['name', 'type', 'busId', 'routeId', 'departure']);
    if (missing.length) return err(res, 400, `Missing: ${missing.join(', ')}`);
    const db = getDb();
    db.schedules.push({ id: nextSeq('schedule'), name: b.name, type: b.type, busId: b.busId, routeId: b.routeId, departure: b.departure });
    saveDebounced();
    ok(res, { ok: true });
  } catch (e) { handleError(res, e); }
});
router.delete('/admin/transport/schedules/:id', (req, res) => {
  const db = getDb();
  const i = db.schedules.findIndex((x) => x.id === req.params.id);
  if (i === -1) return err(res, 404, 'Schedule not found');
  db.schedules.splice(i, 1);
  saveDebounced();
  ok(res, { ok: true });
});

router.get('/admin/transport/trips', (_req, res) => ok(res, getDb().trips.slice().reverse()));
router.get('/admin/transport/gps-log', (req, res) => ok(res, getDb().gpsLog.slice(-(Number(req.query.limit) || 200))));
router.get('/admin/transport/boardings', (_req, res) => ok(res, getDb().boarding.slice().reverse().slice(0, 100)));
router.get('/admin/transport/payments', (_req, res) => ok(res, getDb().payments.slice().reverse()));
router.get('/admin/transport/maintenance', (_req, res) => {
  const db = getDb();
  ok(res, db.buses.map((b) => ({ bus: b, prediction: predictMaintenance(b.id), records: db.maintenance.filter((m) => m.busId === b.id).reverse() })));
});
router.put('/admin/transport/maintenance/:id', (req, res) => {
  const m = getDb().maintenance.find((x) => x.id === req.params.id);
  if (!m) return err(res, 404, 'Maintenance record not found');
  Object.assign(m, req.body, { updatedAt: now() });
  saveDebounced();
  ok(res, { maintenance: m });
});
router.post('/admin/transport/maintenance', (req, res) => {
  try {
    const b = req.body || {};
    const missing = requireFields(b, ['busId', 'issue']);
    if (missing.length) return err(res, 400, `Missing: ${missing.join(', ')}`);
    const db = getDb();
    db.maintenance.push({ id: nextSeq('maint'), busId: b.busId, date: new Date().toISOString().slice(0, 10), mileage: Number(b.mileage) || 0, issue: b.issue, status: b.status || 'Healthy' });
    saveDebounced();
    ok(res, { ok: true });
  } catch (e) { handleError(res, e); }
});

router.get('/admin/transport/anomalies', (_req, res) => ok(res, getDb().anomalies.slice().reverse()));
router.post('/admin/transport/anomalies/scan', (_req, res) => ok(res, runAnomalyScan()));
router.put('/admin/transport/anomalies/:id', (req, res) => {
  const a = getDb().anomalies.find((x) => x.id === req.params.id);
  if (!a) return err(res, 404, 'Anomaly not found');
  a.reviewed = true;
  a.reviewedAt = now();
  saveDebounced();
  ok(res, { anomaly: a });
});

// Demo helper — place a bus mid-route for a smooth presentation.
router.post('/admin/transport/demo/place', (req, res) => {
  const { busId, progressKm, passengers } = req.body || {};
  const l = engine.getBus(busId);
  if (!l) return err(res, 404, 'Bus not found');
  const route = getDb().routes.find((r) => r.id === getDb().buses.find((b) => b.id === busId)?.routeId);
  l.progressKm = Number(progressKm) || 0;
  l.position = engine.pointAt(route, l.progressKm);
  l.passengers = Number(passengers) ?? l.passengers;
  l.occupancyPct = Math.round((l.passengers / getDb().buses.find((b) => b.id === busId).capacity) * 100);
  l.tripStatus = 'Active';
  l.lastUpdate = now();
  ok(res, { ok: true });
});

// ============================================================================
// ANALYTICS & REPORTS
// ============================================================================
router.get('/admin/analytics/overview', (_req, res) => {
  const db = getDb();
  const activeTrips = db.trips.filter((t) => t.status === 'ACTIVE').length;
  const today = new Date().toISOString().slice(0, 10);
  const todaysTrips = db.trips.filter((t) => t.startedAt.slice(0, 10) === today);
  const totalPassengers = db.trips.filter((t) => t.status === 'COMPLETED').reduce((s, t) => s + (t.passengers || 0), 0);
  const onTimeCount = db.trips.filter((t) => t.status === 'COMPLETED' && t.onTime).length;
  const completed = db.trips.filter((t) => t.status === 'COMPLETED').length;
  const revenue = db.payments.reduce((s, p) => s + (p.amount || 0), 0);
  const busUtil = db.buses.map((b) => {
    const l = engine.getBus(b.id);
    return { busId: b.id, name: b.name, occupancyPct: l.occupancyPct, tripStatus: l.tripStatus, trips: db.trips.filter((t) => t.busId === b.id).length };
  });
  const crowd = db.buses.map((b) => ({ busId: b.id, name: b.name, ...predictCrowd(b.id) }));
  ok(res, {
    activeTrips, todaysTrips: todaysTrips.length, totalPassengers,
    onTimeRate: completed ? Math.round((onTimeCount / completed) * 100) : 0,
    revenue: Math.round(revenue), payments: db.payments.length,
    busUtil, crowd, emergencyActive: db.emergencies.filter((e) => e.status === 'Active').length,
    complaintsPending: db.complaints.filter((c) => c.status === 'Pending').length,
  });
});

router.get('/admin/analytics/trips', (_req, res) => {
  const db = getDb();
  const completed = db.trips.filter((t) => t.status === 'COMPLETED');
  const byBus = {};
  for (const t of completed) byBus[t.busName] = (byBus[t.busName] || 0) + 1;
  const passengersByBus = {};
  for (const t of completed) passengersByBus[t.busName] = (passengersByBus[t.busName] || 0) + (t.passengers || 0);
  ok(res, { tripsByDay: db.analytics.tripsByDay, byBus, passengersByBus, total: completed.length });
});

router.get('/admin/analytics/revenue', (_req, res) => {
  const db = getDb();
  const byMethod = {};
  for (const p of db.payments) byMethod[p.method] = (byMethod[p.method] || 0) + p.amount;
  const byDay = {};
  for (const p of db.payments) {
    const d = p.at.slice(0, 10);
    byDay[d] = (byDay[d] || 0) + p.amount;
  }
  ok(res, { byMethod, byDay, total: db.payments.reduce((s, p) => s + p.amount, 0), count: db.payments.length });
});

// --- Reports ---------------------------------------------------------------
const REPORT_DEFS = {
  students: { label: 'Student Report', fields: ['id', 'name', 'department', 'batch', 'semester', 'theorySection', 'labSection', 'email', 'phone', 'cgpa'], rows: (db) => db.students },
  teachers: { label: 'Teacher Report', fields: ['id', 'name', 'department', 'designation', 'email', 'phone', 'salary'], rows: (db) => db.teachers },
  departments: { label: 'Department Report', fields: ['code', 'name', 'students', 'teachers', 'courses', 'batches'], rows: (db) => db.departments.map((d) => ({ code: d.code, name: d.name, students: db.students.filter((s) => s.department === d.id).length, teachers: db.teachers.filter((t) => t.department === d.id).length, courses: db.courses.filter((c) => c.department === d.id).length, batches: db.batches.filter((b) => b.department === d.id).length })) },
  courses: { label: 'Course Report', fields: ['code', 'name', 'credit', 'type', 'semester', 'department', 'teacherId'], rows: (db) => db.courses },
  attendance: { label: 'Attendance Report', fields: ['course', 'batch', 'date', 'totalClasses', 'present'], rows: (db) => db.attendance.map((a) => ({ course: a.course, batch: a.batch, date: a.date, totalClasses: a.totalClasses, present: Object.values(a.records).filter((v) => v === 'present').length })) },
  results: { label: 'Result Report', fields: ['course', 'studentId', 'marks', 'total', 'grade', 'gradePoint'], rows: (db) => db.results },
  rooms: { label: 'Room Usage Report', fields: ['number', 'floor', 'capacity', 'type', 'status'], rows: (db) => db.rooms },
  routine: { label: 'Routine Report', fields: ['day', 'startTime', 'endTime', 'course', 'batch', 'room', 'teacherId'], rows: (db) => db.routines },
  helping: { label: 'Helping Zone Report', fields: ['id', 'category', 'question', 'studentId', 'status', 'createdAt'], rows: (db) => db.helpingZone },
  transport: { label: 'Transport Report', fields: ['tripId', 'busName', 'routeName', 'startedAt', 'status', 'passengers', 'distanceKm', 'onTime'], rows: (db) => db.trips },
};

router.get('/admin/reports', (_req, res) => ok(res, Object.entries(REPORT_DEFS).map(([kind, d]) => ({ kind, label: d.label }))));

router.get('/admin/reports/:kind', (req, res) => {
  const def = REPORT_DEFS[req.params.kind];
  if (!def) return err(res, 404, 'Unknown report');
  const db = getDb();
  let rows = def.rows(db);
  const q = String(req.query.search || '').toLowerCase();
  if (q) rows = rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
  ok(res, { label: def.label, fields: def.fields, rows, count: rows.length });
});

router.get('/admin/reports/:kind/export', (req, res) => {
  const def = REPORT_DEFS[req.params.kind];
  if (!def) return err(res, 404, 'Unknown report');
  const rows = def.rows(getDb());
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [def.fields.join(','), ...rows.map((r) => def.fields.map((f) => esc(r[f])).join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${req.params.kind}-report.csv"`);
  res.send(csv);
});
