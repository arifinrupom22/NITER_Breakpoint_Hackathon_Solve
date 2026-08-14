// ============================================================================
// NSCMS — NITER Smart Campus Management System academic API.
// Student / Teacher portal endpoints.
// ============================================================================

import { Router } from 'express';
import { authRequired, requireRole } from '../auth.js';
import { getDb, saveDebounced, nextSeq, now } from '../db.js';
import { ok, err, handleError, nonEmpty, requireFields } from '../validate.js';

// Public data used by the university website (no authentication required).
export const publicRouter = Router();
publicRouter.get('/portal/notices', (_req, res) => ok(res, getDb().notices.slice().sort((a, b) => new Date(b.date) - new Date(a.date))));
publicRouter.get('/portal/news', (_req, res) => ok(res, getDb().news));
publicRouter.get('/portal/events', (_req, res) => ok(res, getDb().events));
publicRouter.get('/portal/departments', (_req, res) => ok(res, getDb().departments));
publicRouter.get('/portal/stats', (_req, res) => {
  const db = getDb();
  ok(res, {
    departments: db.departments.length,
    students: db.students.length,
    teachers: db.teachers.length,
    courses: db.courses.length,
    labs: db.rooms.filter((r) => r.type.includes('Lab')).length,
    clubs: 12,
  });
});

// ----------------------------- Authenticated portal -------------------------
export const router = Router();
router.use('/portal', authRequired);

router.get('/portal/me', (req, res) => ok(res, { user: req.user }));

// ----------------------------- Shared ---------------------------------------
router.get('/portal/rooms', (_req, res) => ok(res, getDb().rooms));
router.get('/portal/rooms/available', (_req, res) => ok(res, getDb().rooms.filter((r) => r.status === 'Available')));

// ----------------------------- Student --------------------------------------
router.get('/portal/student/profile', requireRole('student'), (req, res) => {
  const s = getDb().students.find((x) => x.id === req.user.sub);
  if (!s) return err(res, 404, 'Student not found');
  ok(res, s);
});

router.get('/portal/student/courses', requireRole('student'), (req, res) => {
  const s = getDb().students.find((x) => x.id === req.user.sub);
  ok(res, getDb().courses.filter((c) => c.department === s?.department && c.semester === s?.semester));
});

router.get('/portal/student/routine', requireRole('student'), (req, res) => {
  const s = getDb().students.find((x) => x.id === req.user.sub);
  ok(res, getDb().routines.filter((r) => r.batch === s?.batch));
});

router.get('/portal/student/attendance', requireRole('student'), (req, res) => {
  const s = getDb().students.find((x) => x.id === req.user.sub);
  const rows = getDb().attendance.filter((a) => a.records && a.records[s.id] !== undefined);
  const summary = rows.map((a) => {
    const present = a.records[s.id] === 'present';
    return { course: a.course, date: a.date, status: present ? 'present' : 'absent', totalClasses: a.totalClasses };
  });
  const presentCount = summary.filter((x) => x.status === 'present').length;
  const total = Math.max(summary.length, 1);
  const pct = Math.round((presentCount / total) * 100);
  const label = pct >= 90 ? 'Excellent' : pct >= 80 ? 'Good' : pct >= 75 ? 'Warning' : 'Short Attendance';
  ok(res, { records: summary.reverse(), percentage: pct, statusLabel: label });
});

router.get('/portal/student/results', requireRole('student'), (req, res) => {
  const s = getDb().students.find((x) => x.id === req.user.sub);
  const rows = getDb().results.filter((r) => r.studentId === s?.id);
  const totalGp = rows.reduce((sum, r) => sum + r.gradePoint, 0);
  const gpa = rows.length ? Math.round((totalGp / rows.length) * 100) / 100 : 0;
  ok(res, { courses: rows, gpa, cgpa: s?.cgpa || gpa });
});

// ----------------------------- Teacher --------------------------------------
router.get('/portal/teacher/profile', requireRole('teacher'), (req, res) => {
  const t = getDb().teachers.find((x) => x.id === req.user.sub);
  if (!t) return err(res, 404, 'Teacher not found');
  ok(res, t);
});

router.get('/portal/teacher/courses', requireRole('teacher'), (req, res) => {
  ok(res, getDb().courses.filter((c) => c.teacherId === req.user.sub));
});

router.get('/portal/teacher/routine', requireRole('teacher'), (req, res) => {
  ok(res, getDb().routines.filter((r) => r.teacherId === req.user.sub));
});

router.get('/portal/teacher/batches', requireRole('teacher'), (req, res) => {
  const db = getDb();
  const courseIds = db.courses.filter((c) => c.teacherId === req.user.sub).map((c) => c.code);
  ok(res, db.batches);
});

router.get('/portal/attendance/classes', requireRole('teacher'), (req, res) => {
  ok(res, getDb().attendance.filter((a) => a.course === req.query.course));
});

router.post('/portal/attendance/save', requireRole('teacher'), (req, res) => {
  try {
    const { course, batch, date, records } = req.body || {};
    const missing = requireFields({ course, batch, date }, ['course', 'batch', 'date']);
    if (missing.length) return err(res, 400, `Missing: ${missing.join(', ')}`);
    if (!records || typeof records !== 'object') return err(res, 400, 'Attendance records required');
    const db = getDb();
    const existing = db.attendance.find((a) => a.course === course && a.batch === batch && a.date === date);
    const totalClasses = (existing?.totalClasses || 0) + 1;
    if (existing) {
      Object.assign(existing.records, records);
      existing.totalClasses = totalClasses;
    } else {
      db.attendance.push({ id: nextSeq('at'), course, batch, date, records, totalClasses });
    }
    saveDebounced();
    ok(res, { message: 'Attendance saved.', totalClasses });
  } catch (e) { handleError(res, e); }
});

router.get('/portal/marks/list', requireRole('teacher'), (req, res) => {
  ok(res, getDb().results.filter((r) => r.course === req.query.course));
});

router.post('/portal/marks/save', requireRole('teacher'), (req, res) => {
  try {
    const { course, studentId, marks, total = 100 } = req.body || {};
    if (!nonEmpty(course) || !nonEmpty(studentId) || typeof marks !== 'number') {
      return err(res, 400, 'Course, student and marks are required.');
    }
    const db = getDb();
    const pct = marks / total;
    const grade = pct >= 0.8 ? (pct >= 0.9 ? 'A+' : 'A') : pct >= 0.75 ? 'A-' : pct >= 0.65 ? 'B+' : pct >= 0.6 ? 'B' : pct >= 0.5 ? 'C' : pct >= 0.4 ? 'D' : 'F';
    const gradePoint = grade === 'A+' ? 4 : grade === 'A' ? 3.75 : grade === 'A-' ? 3.5 : grade === 'B+' ? 3.25 : grade === 'B' ? 3 : grade === 'C' ? 2.25 : grade === 'D' ? 2 : 0;
    const existing = db.results.find((r) => r.course === course && r.studentId === studentId);
    if (existing) {
      Object.assign(existing, { marks, total, grade, gradePoint });
    } else {
      db.results.push({ id: nextSeq('rs'), course, studentId, marks, total, grade, gradePoint });
    }
    // update student CGPA estimate
    const s = db.students.find((x) => x.id === studentId);
    if (s) {
      const mine = db.results.filter((r) => r.studentId === studentId);
      s.cgpa = Math.round((mine.reduce((sum, r) => sum + r.gradePoint, 0) / Math.max(1, mine.length)) * 100) / 100;
    }
    saveDebounced();
    ok(res, { message: `Marks saved for ${studentId} (${grade}).` });
  } catch (e) { handleError(res, e); }
});

// ----------------------------- Helping Zone ----------------------------------
router.post('/portal/helping-zone', (req, res) => {
  try {
    const { category, question } = req.body || {};
    if (!nonEmpty(category) || !nonEmpty(question)) return err(res, 400, 'Category and question are required.');
    const db = getDb();
    const item = {
      id: `HZ-${String(db.seq.help).padStart(4, '0')}`,
      category, question, studentId: req.user.sub, studentName: req.user.name,
      status: 'Pending', createdAt: now(), replies: [],
    };
    db.seq.help += 1;
    db.helpingZone.push(item);
    saveDebounced();
    ok(res, { item });
  } catch (e) { handleError(res, e); }
});

router.get('/portal/helping-zone/mine', (req, res) => {
  ok(res, getDb().helpingZone.filter((h) => h.studentId === req.user.sub).reverse());
});

router.get('/portal/helping-zone/open', requireRole('teacher'), (req, res) => {
  ok(res, getDb().helpingZone.filter((h) => h.status !== 'Resolved' && h.status !== 'Rejected').reverse());
});

router.post('/portal/helping-zone/:id/reply', requireRole('teacher'), (req, res) => {
  const item = getDb().helpingZone.find((h) => h.id === req.params.id);
  if (!item) return err(res, 404, 'Request not found');
  if (!nonEmpty(req.body?.text)) return err(res, 400, 'Reply text required');
  item.replies.push({ by: req.user.sub, text: req.body.text, at: now() });
  item.status = 'In Progress';
  saveDebounced();
  ok(res, { item });
});

// ----------------------------- Requests from students -------------------------
router.get('/portal/student/helping-zone', requireRole('student'), (req, res) => {
  ok(res, getDb().helpingZone.filter((h) => h.studentId === req.user.sub).reverse());
});
