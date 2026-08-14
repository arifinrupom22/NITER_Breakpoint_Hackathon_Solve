// ============================================================================
// NITER Smart Transport — REST API
// /api/transport/... — buses, routes, trips, gps, tracking, boarding, eta,
// occupancy, payments, complaints, lost & found, emergencies, notifications.
// Live endpoints require a transport token (student/teacher/driver/admin).
// ============================================================================

import { Router } from 'express';
import { authRequired, requireRole } from '../auth.js';
import { engine } from '../transport/engine.js';
import { getDb, saveDebounced, nextSeq, now, uid } from '../db.js';
import { err, ok, handleError, nonEmpty } from '../validate.js';

export const router = Router();

// Auth applies to every /transport/* endpoint (live data), not to other APIs.
router.use('/transport', authRequired);

// --- Public transport overview (auth-free) -------------------------------
// Kept outside the auth wrapper so the public website can show bus status.
export const publicRouter = Router();
publicRouter.get('/transport/public', (_req, res) => ok(res, engine.getPublicState()));
publicRouter.get('/transport/schedule', (_req, res) => {
  const db = getDb();
  ok(res, db.schedules);
});

// --- Live state for authorized users --------------------------------------
router.get('/transport/live', (req, res) => {
  const u = req.user;
  let busIds = [];
  if (u.role === 'admin') busIds = getDb().buses.map((b) => b.id);
  else if (u.role === 'driver') busIds = [u.busId];
  else if (u.role === 'transport-student' || u.role === 'transport-teacher') {
    busIds = (u.eligible || []).filter((id) => {
      const bus = getDb().buses.find((b) => b.id === id);
      return bus && ((u.role === 'transport-student' && bus.type === 'Student') || (u.role === 'transport-teacher' && bus.type === 'Teacher'));
    });
  }
  ok(res, { live: engine.getLiveState(busIds) });
});

router.get('/transport/eta', (req, res) => {
  const { busId } = req.query;
  const l = engine.getBus(String(busId));
  if (!l) return err(res, 404, 'Bus not found');
  ok(res, {
    busId,
    etaToCampus: l.etaToCampus,
    etaToNext: l.etaToNext,
    nextStop: l.nextStop,
    traffic: l.traffic.status,
    tripStatus: l.tripStatus,
  });
});

router.get('/transport/occupancy', (req, res) => {
  const { busId } = req.query;
  const l = engine.getBus(String(busId));
  if (!l) return err(res, 404, 'Bus not found');
  const bus = getDb().buses.find((b) => b.id === busId);
  ok(res, {
    busId, busName: bus?.name, capacity: bus?.capacity,
    passengers: l.passengers, pct: l.occupancyPct,
  });
});

router.get('/transport/buses', (req, res) => ok(res, getDb().buses));
router.get('/transport/routes', (req, res) => ok(res, getDb().routes));

// --- Trips -----------------------------------------------------------------
router.post('/transport/trip/start', (req, res) => {
  try {
    const { busId } = req.body || {};
    const u = req.user;
    if (u.role === 'driver' && u.busId !== busId) {
      return err(res, 403, 'You are not authorized to start this bus.');
    }
    const trip = engine.startTrip(busId, { id: u.sub, name: u.name, role: u.role });
    ok(res, { trip, message: `Trip started for ${trip.busName}. GPS sharing active.` });
  } catch (e) { handleError(res, e); }
});

router.post('/transport/trip/end', (req, res) => {
  try {
    const { tripId } = req.body || {};
    const trip = getDb().trips.find((t) => t.tripId === tripId);
    if (!trip) return err(res, 404, 'Trip not found');
    const u = req.user;
    if (u.role === 'driver' && u.busId !== trip.busId) {
      return err(res, 403, 'You are not authorized to end this trip.');
    }
    const ended = engine.endTrip(tripId, { id: u.sub, name: u.name });
    ok(res, { trip: ended, message: `${ended.busName} trip completed and saved.` });
  } catch (e) { handleError(res, e); }
});

// Real GPS reporting from the driver phone.
router.post('/transport/gps', (req, res) => {
  const { busId, lat, lng, speed } = req.body || {};
  const u = req.user;
  if (u.role === 'driver' && u.busId !== busId) return err(res, 403, 'Not your assigned bus.');
  if (typeof lat !== 'number' || typeof lng !== 'number') return err(res, 400, 'Latitude and longitude are required.');
  engine.handleRealGps(busId, { lat, lng, speed });
  ok(res, { ok: true, busId, mode: 'live-gps' });
});

// --- QR boarding -------------------------------------------------------------
router.post('/transport/qr-token', requireRole('transport-student'), (req, res) => {
  const token = uid('qr').replace(/[^a-z0-9]/gi, '');
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minute expiry
  getDb().qrTokens = getDb().qrTokens || [];
  getDb().qrTokens.push({ token, card: req.user.sub, expiresAt });
  saveDebounced();
  ok(res, { token, expiresAt, note: 'QR token expires in 5 minutes.' });
});

router.post('/transport/boarding', (req, res) => {
  try {
    const { card, qrToken, busId, tapType = 'IN' } = req.body || {};
    let resolvedCard = card;
    if (qrToken) {
      const db = getDb();
      const t = (db.qrTokens || []).find((x) => x.token === qrToken);
      if (!t || t.expiresAt < Date.now()) {
        engine._flagAnomaly('Repeated Invalid QR Scans', 'Expired or invalid QR token used for boarding', 'Medium');
        return err(res, 401, 'QR code expired. Please refresh your Smart Bus Pass and scan again.');
      }
      resolvedCard = t.card;
    }
    if (!resolvedCard || !busId) return err(res, 400, 'Card and bus are required.');
    const result = engine.processBoarding({ card: resolvedCard, busId, tapType });
    ok(res, result);
  } catch (e) { handleError(res, e); }
});

// --- Emergency SOS -----------------------------------------------------------
router.post('/transport/emergency', (req, res) => {
  try {
    const { busId, type = 'General', note = '' } = req.body || {};
    const db = getDb();
    const u = req.user;
    const l = engine.getBus(busId);
    const item = {
      id: nextSeq('emergency'), userId: u.sub, userName: u.name, role: u.role,
      busId, busName: db.buses.find((b) => b.id === busId)?.name,
      location: l ? { lat: l.position.lat, lng: l.position.lng } : null,
      type, note, status: 'Active', at: now(),
    };
    db.emergencies.push(item);
    engine._notify('emergency:new', item);
    saveDebounced();
    ok(res, { emergency: item, message: 'Emergency reported. The transport admin has been notified.' });
  } catch (e) { handleError(res, e); }
});

// --- Complaints ---------------------------------------------------------------
router.post('/transport/complaints', (req, res) => {
  try {
    const { category, description, busId } = req.body || {};
    if (!nonEmpty(category) || !nonEmpty(description)) return err(res, 400, 'Category and description are required.');
    const db = getDb();
    const item = {
      id: nextSeq('complaint'), userId: req.user.sub, userName: req.user.name, role: req.user.role,
      category, description, busId, status: 'Pending', reply: '', createdAt: now(), updatedAt: now(),
    };
    db.complaints.push(item);
    saveDebounced();
    ok(res, { complaint: item });
  } catch (e) { handleError(res, e); }
});

// --- Lost & Found -------------------------------------------------------------
router.post('/transport/lost-found', (req, res) => {
  try {
    const { kind, description, busId } = req.body || {};
    if (!['lost', 'found'].includes(kind) || !nonEmpty(description)) return err(res, 400, 'Kind (lost/found) and description are required.');
    const db = getDb();
    const item = {
      id: nextSeq('lost'), kind, description, busId,
      date: new Date().toISOString().slice(0, 10),
      reportedBy: req.user.name, status: 'Pending', createdAt: now(),
    };
    db.lostFound.push(item);
    saveDebounced();
    ok(res, { item });
  } catch (e) { handleError(res, e); }
});

// --- My history ---------------------------------------------------------------
router.get('/transport/my-history', (req, res) => {
  const db = getDb();
  const u = req.user;
  const mine = db.boarding.filter((b) => b.studentId === u.sub || b.studentName === u.name);
  const payments = db.payments.filter((p) => p.userId === u.sub || p.userName === u.name);
  ok(res, { boardings: mine.slice(-30).reverse(), payments: payments.slice(-30).reverse() });
});

router.get('/transport/notifications', (req, res) => {
  const db = getDb();
  const u = req.user;
  const scoped = db.notifications.filter((n) => n.audience === 'all' || n.audience === `student:${u.sub}` || (u.role === 'admin' && n.audience === 'admin'));
  ok(res, scoped.slice(-50).reverse());
});

router.get('/transport/emergencies', requireRole('admin'), (_req, res) => ok(res, getDb().emergencies.slice().reverse()));
router.put('/transport/emergencies/:id', requireRole('admin'), (req, res) => {
  const item = getDb().emergencies.find((e) => e.id === req.params.id);
  if (!item) return err(res, 404, 'Emergency not found');
  item.status = req.body.status || 'Resolved';
  item.resolvedAt = now();
  saveDebounced();
  ok(res, { item });
});

router.get('/transport/complaints', requireRole('admin'), (_req, res) => ok(res, getDb().complaints.slice().reverse()));
router.put('/transport/complaints/:id', requireRole('admin'), (req, res) => {
  const db = getDb();
  const item = db.complaints.find((c) => c.id === req.params.id);
  if (!item) return err(res, 404, 'Complaint not found');
  item.status = req.body.status || item.status;
  item.reply = req.body.reply ?? item.reply;
  item.updatedAt = now();
  saveDebounced();
  ok(res, { item });
});

router.get('/transport/lost-found', requireRole('admin'), (_req, res) => ok(res, getDb().lostFound.slice().reverse()));
router.put('/transport/lost-found/:id', requireRole('admin'), (req, res) => {
  const item = getDb().lostFound.find((l) => l.id === req.params.id);
  if (!item) return err(res, 404, 'Item not found');
  item.status = req.body.status || item.status;
  saveDebounced();
  ok(res, { item });
});

router.get('/transport/payments', (req, res) => {
  const db = getDb();
  const u = req.user;
  const all = db.payments.filter((p) => u.role === 'admin' || p.userId === u.sub || p.userName === u.name);
  ok(res, all.slice(-100).reverse());
});
