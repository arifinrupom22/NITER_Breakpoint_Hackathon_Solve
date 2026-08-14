// ============================================================================
// Authentication & authorization — JWT based with role-based access control.
// Roles: admin | student | teacher | driver | transport-student | transport-teacher
// ============================================================================

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Router } from 'express';
import { config, createRateLimiter } from './config.js';
import { getDb, saveDebounced, nextSeq, now } from './db.js';

const authLimiter = createRateLimiter({ windowMs: 60_000, max: 40 });

export function signToken(payload) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.tokenTtl });
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

export function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }
    next();
  };
}

export const router = Router();

// ---------------------------------------------------------------------------
// NSCMS portal login — admin / student / teacher
// ---------------------------------------------------------------------------
router.post('/login', authLimiter, (req, res) => {
  const { username, password, role } = req.body || {};
  const db = getDb();
  const normalized = String(role || '').toLowerCase();

  if (normalized === 'admin') {
    const admin = db.admins.find((a) => a.username === username);
    if (admin && admin.password === password) {
      const token = signToken({ sub: admin.id, role: 'admin', name: admin.name, kind: 'nscms' });
      return res.json({ token, user: { id: admin.id, name: admin.name, role: 'admin' } });
    }
  } else if (normalized === 'student') {
    const student = db.students.find((s) => s.id === username);
    if (student && student.password && bcrypt.compareSync(password, student.password)) {
      const token = signToken({ sub: student.id, role: 'student', name: student.name, kind: 'nscms', department: student.department, batch: student.batch });
      return res.json({ token, user: { id: student.id, name: student.name, role: 'student', department: student.department, batch: student.batch, email: student.email, phone: student.phone, semester: student.semester, theorySection: student.theorySection, labSection: student.labSection, cgpa: student.cgpa } });
    }
  } else if (normalized === 'teacher') {
    const teacher = db.teachers.find((t) => t.id === username);
    if (teacher && teacher.password && bcrypt.compareSync(password, teacher.password)) {
      const token = signToken({ sub: teacher.id, role: 'teacher', name: teacher.name, kind: 'nscms', department: teacher.department });
      return res.json({ token, user: { id: teacher.id, name: teacher.name, role: 'teacher', department: teacher.department, designation: teacher.designation, email: teacher.email } });
    }
  }
  return res.status(401).json({ error: 'Invalid credentials. Please check your username and password.' });
});

// ---------------------------------------------------------------------------
// Smart Transport verification — students use Name + Bus Card No.,
// teachers use Name + Teacher/Transport ID. Never returns live locations on
// failure and does not reveal which records exist.
// ---------------------------------------------------------------------------
router.post('/transport/verify', authLimiter, (req, res) => {
  const { name, card } = req.body || {};
  const db = getDb();
  const cleanName = String(name || '').trim().toLowerCase();
  const cleanCard = String(card || '').trim().toUpperCase();

  if (!cleanName || !cleanCard) {
    return res.status(400).json({ error: 'Please provide your name and Bus Card / Teacher ID.' });
  }

  const student = db.transportStudents.find(
    (s) => s.name.toLowerCase() === cleanName && s.card.toUpperCase() === cleanCard
  );
  if (student) {
    const token = signToken({ sub: student.card, role: 'transport-student', name: student.name, kind: 'transport', eligible: student.eligibleBuses });
    return res.json({ token, user: { role: 'transport-student', name: student.name, card: student.card, studentId: student.studentId, department: student.department, batch: student.batch, eligibleBuses: student.eligibleBuses } });
  }

  const teacher = db.transportTeachers.find(
    (t) => t.name.toLowerCase() === cleanName && t.card.toUpperCase() === cleanCard
  );
  if (teacher) {
    const token = signToken({ sub: teacher.card, role: 'transport-teacher', name: teacher.name, kind: 'transport', eligible: teacher.eligibleBuses });
    return res.json({ token, user: { role: 'transport-teacher', name: teacher.name, card: teacher.card, teacherId: teacher.teacherId, department: teacher.department, eligibleBuses: teacher.eligibleBuses } });
  }

  // Record the failed attempt for anomaly detection (never auto-punish).
  db.anomalies.push({
    id: nextSeq('anomaly'),
    type: 'Unauthorized Access Attempt',
    detail: `Verification failed for "${name}" with identifier "${card}"`,
    at: now(),
    severity: 'Low',
    reviewed: false,
  });
  saveDebounced();
  return res.status(401).json({
    error: 'Live transport tracking is available only to authorized NITER students and teachers.',
  });
});

// ---------------------------------------------------------------------------
// Driver login — four demo drivers, each bound to exactly one bus.
// ---------------------------------------------------------------------------
router.post('/transport/driver-login', authLimiter, (req, res) => {
  const { driverId, password } = req.body || {};
  const db = getDb();
  const driver = db.drivers.find((d) => d.id === String(driverId || '').trim().toUpperCase());
  if (driver && password === 'driver123') {
    const token = signToken({ sub: driver.id, role: 'driver', name: driver.name, kind: 'transport', busId: driver.busId });
    return res.json({ token, user: { id: driver.id, name: driver.name, role: 'driver', busId: driver.busId, phone: driver.phone } });
  }
  return res.status(401).json({ error: 'Invalid driver ID or password.' });
});

// Seed hashed passwords for NSCMS students/teachers so login works via bcrypt.
export function ensureSeededPasswords(db) {
  let changed = false;
  for (const s of db.students) {
    if (!s.password) { s.password = bcrypt.hashSync('student123', 10); changed = true; }
  }
  for (const t of db.teachers) {
    if (!t.password) { t.password = bcrypt.hashSync('teacher123', 10); changed = true; }
  }
  if (changed) saveDebounced();
}
