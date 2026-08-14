// ============================================================================
// Transport Engine — the single live state for every bus.
// The website, the mobile app and the admin dashboard all consume this one
// engine through the realtime hub. There is exactly ONE source of truth.
// ============================================================================

import { getDb, saveDebounced, nextSeq, now, uid } from '../db.js';

const EARTH_R = 6371;
export const haversineKm = (a, b) => {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.sqrt(h));
};

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const rand = (lo, hi) => lo + Math.random() * (hi - lo);

export function occupancyLabel(pct) {
  if (pct < 40) return { label: 'Available', tone: 'green' };
  if (pct < 70) return { label: 'Moderate', tone: 'amber' };
  if (pct < 90) return { label: 'Crowded', tone: 'orange' };
  return { label: 'Full', tone: 'red' };
}

export function trafficStatusFor(factor) {
  if (factor >= 1.35) return 'Very Heavy Traffic';
  if (factor >= 1.18) return 'Heavy Traffic';
  if (factor >= 1.08) return 'Delayed';
  if (factor >= 1.02) return 'Slight Delay';
  return 'On Time';
}

class TransportEngine {
  constructor() {
    this.db = getDb();
    this.live = {}; // busId -> live bus state
    this.simMinutes = 420; // simulated clock, 7:00 AM at boot (demo)
    this.tickMs = 1000;
    this._routeCache = new Map();
    this._onChange = null;
    this._init();
  }

  setOnChange(fn) {
    this._onChange = fn;
  }

  // Precompute polyline metadata for a route.
  routeData(route) {
    if (this._routeCache.has(route.id)) return this._routeCache.get(route.id);
    const stops = route.stops;
    const segDist = [];
    let total = 0;
    for (let i = 0; i < stops.length - 1; i++) {
      const d = haversineKm(stops[i], stops[i + 1]);
      segDist.push(d);
      total += d;
    }
    const data = { stops, segDist, total, cum: (() => { const c = [0]; for (const d of segDist) c.push(c[c.length - 1] + d); return c; })() };
    this._routeCache.set(route.id, data);
    return data;
  }

  // Interpolate position + heading at `km` along the route polyline.
  pointAt(route, km) {
    const data = this.routeData(route);
    const k = clamp(km, 0, data.total);
    for (let i = 0; i < data.segDist.length; i++) {
      if (k <= data.cum[i + 1]) {
        const seg = data.segDist[i];
        const t = seg === 0 ? 0 : (k - data.cum[i]) / seg;
        const a = data.stops[i];
        const b = data.stops[i + 1];
        const heading = (Math.atan2(b.lng - a.lng, b.lat - a.lat) * 180) / Math.PI;
        return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t, heading: (heading + 360) % 360 };
      }
    }
    const last = data.stops[data.stops.length - 1];
    return { lat: last.lat, lng: last.lng, heading: 0 };
  }

  nextStopInfo(route, km) {
    const data = this.routeData(route);
    const idx = data.stops.findIndex((_, i) => i > 0 && km < data.cum[i]);
    const stopIdx = idx === -1 ? data.stops.length - 1 : idx;
    const stop = data.stops[stopIdx];
    const dist = Math.max(0, data.cum[stopIdx] - km);
    return { stop, stopIdx, dist };
  }

  _init() {
    for (const bus of this.db.buses) {
      const route = this.db.routes.find((r) => r.id === bus.routeId);
      const origin = route.stops[0];
      this.live[bus.id] = {
        busId: bus.id,
        tripId: null,
        tripStatus: 'Inactive', // Inactive | Active | Arrived
        mode: this.db.meta.demoMode ? 'demo-simulation' : 'simulation',
        position: { lat: origin.lat, lng: origin.lng, heading: 0 },
        progressKm: 0,
        speedKmh: 0,
        passengers: 0,
        occupancyPct: 0,
        currentStop: route.stops[0].name,
        nextStop: route.stops[1]?.name || route.stops[0].name,
        distToNext: haversineKm(route.stops[0], route.stops[1]) || 0,
        distToCampus: this.routeData(route).total,
        etaToNext: null,
        etaToCampus: null,
        traffic: { status: 'Traffic information unavailable', factor: 1 },
        delayMinutes: 0,
        driverId: bus.driverId,
        lastUpdate: now(),
        phase: Math.random() * 10,
      };
    }
  }

  getBus(busId) {
    return this.live[busId];
  }

  // -------------------------------------------------------------------------
  // Public state — no coordinates. Used by the public website.
  // -------------------------------------------------------------------------
  getPublicState() {
    return {
      demoMode: this.db.meta.demoMode,
      simTime: this.simMinutes,
      buses: this.db.buses.map((b) => {
        const l = this.live[b.id];
        const route = this.db.routes.find((r) => r.id === b.routeId);
        const driver = this.db.drivers.find((d) => d.id === b.driverId);
        const oc = occupancyLabel(l.occupancyPct);
        return {
          id: b.id, name: b.name, type: b.type, capacity: b.capacity, color: b.color,
          status: b.status, departure: b.departure,
          routeName: route?.name, routeId: route?.id,
          driverName: driver?.name,
          tripStatus: l.tripStatus, passengers: l.passengers, occupancyPct: l.occupancyPct,
          occupancyLabel: oc.label, occupancyTone: oc.tone,
          currentStop: l.currentStop, nextStop: l.nextStop,
          etaToCampus: l.etaToCampus, trafficStatus: l.traffic.status,
          lastUpdate: l.lastUpdate,
        };
      }),
      routes: this.db.routes.map((r) => ({
        id: r.id, name: r.name, type: r.type, departure: r.departure, configurable: r.configurable,
        stops: r.stops.map((s) => s.name),
      })),
    };
  }

  // -------------------------------------------------------------------------
  // Live state (coordinates) — only sent to authorized roles for eligible buses.
  // -------------------------------------------------------------------------
  getLiveState(busIds) {
    const out = {};
    for (const id of busIds) {
      const l = this.live[id];
      if (!l) continue;
      const bus = this.db.buses.find((b) => b.id === id);
      const route = this.db.routes.find((r) => r.id === bus.routeId);
      const driver = this.db.drivers.find((d) => d.id === bus.driverId);
      const oc = occupancyLabel(l.occupancyPct);
      out[id] = {
        ...l,
        position: { ...l.position },
        busName: bus.name, busType: bus.type, capacity: bus.capacity, color: bus.color,
        routeName: route.name, departure: bus.departure,
        driverName: driver?.name,
        occupancyLabel: oc.label, occupancyTone: oc.tone,
        trafficNote: l.tripStatus === 'Inactive' ? 'Traffic information unavailable' : (this.db.meta.demoMode ? 'Demo Simulation' : l.traffic.status),
        lastUpdate: l.lastUpdate,
      };
    }
    return out;
  }

  // -------------------------------------------------------------------------
  // Trip lifecycle
  // -------------------------------------------------------------------------
  startTrip(busId, actor) {
    const bus = this.db.buses.find((b) => b.id === busId);
    if (!bus) throw Object.assign(new Error('Bus not found'), { status: 404 });
    const route = this.db.routes.find((r) => r.id === bus.routeId);
    const l = this.live[busId];
    if (l.tripStatus === 'Active') throw Object.assign(new Error(`Trip already active for ${bus.name}`), { status: 409 });

    const tripId = nextSeq('trip');
    const trip = {
      tripId, busId, busName: bus.name, routeId: route.id, routeName: route.name,
      driverId: actor.id, driverName: actor.name,
      startedAt: now(), startedSimMinutes: this.simMinutes,
      endedAt: null, status: 'ACTIVE',
      passengers: 0, distanceKm: 0, onTime: true,
    };
    this.db.trips.push(trip);

    // Initial boarding at origin stop.
    const initial = Math.round(bus.capacity * route.stops[0].demand * rand(0.8, 1.05));
    l.tripId = tripId;
    l.tripStatus = 'Active';
    l.progressKm = 0;
    l.passengers = initial;
    l.occupancyPct = Math.round((initial / bus.capacity) * 100);
    l.position = this.pointAt(route, 0);
    l.mode = this.db.meta.demoMode ? 'demo-simulation' : 'simulation';
    l.lastUpdate = now();
    l.lastStopIndex = 0;
    l.speedKmh = Math.round((bus.type === 'Teacher' ? 34 : 30) / l.traffic.factor * 10) / 10;
    bus.status = 'On Trip';
    this._computeEta(busId);

    this._notify('trip:start', { tripId, busId: bus.id, busName: bus.name, routeName: route.name, driverName: actor.name });
    this._pushNotification({ audience: 'all', title: `${bus.name} trip started`, body: `${bus.name} (${route.name}) has departed at ${bus.departure}. Live tracking is now active.` });
    saveDebounced();
    return trip;
  }

  endTrip(tripId, actor) {
    const trip = this.db.trips.find((t) => t.tripId === tripId);
    if (!trip) throw Object.assign(new Error('Trip not found'), { status: 404 });
    if (trip.status !== 'ACTIVE') throw Object.assign(new Error('Trip is not active'), { status: 409 });

    const l = this.live[trip.busId];
    const bus = this.db.buses.find((b) => b.id === trip.busId);
    const route = this.db.routes.find((r) => r.id === trip.routeId);

    trip.status = 'COMPLETED';
    trip.endedAt = now();
    trip.passengers = l.passengers;
    trip.distanceKm = Math.round(this.routeData(route).total * 10) / 10;
    trip.onTime = l.traffic.factor < 1.08;

    l.tripId = null;
    l.tripStatus = 'Inactive';
    l.passengers = 0;
    l.occupancyPct = 0;
    l.speedKmh = 0;
    l.etaToCampus = null;
    l.etaToNext = null;
    l.traffic = { status: 'Traffic information unavailable', factor: 1 };
    l.position = { lat: route.stops[route.stops.length - 1].lat, lng: route.stops[route.stops.length - 1].lng, heading: 0 };
    l.lastUpdate = now();
    if (bus) bus.status = 'Active';

    // Analytics
    const day = new Date().toISOString().slice(0, 10);
    this.db.analytics.tripsByDay[day] = (this.db.analytics.tripsByDay[day] || 0) + 1;
    this.db.analytics.onTimeByTrip[trip.tripId] = trip.onTime;

    this._notify('trip:end', { tripId, busId: trip.busId, busName: trip.busName, onTime: trip.onTime, distanceKm: trip.distanceKm, passengers: trip.passengers });
    this._pushNotification({ audience: 'all', title: `${trip.busName} trip completed`, body: `${trip.busName} completed the ${trip.routeName} in ${Math.round(this.routeData(route).total / 30 * 60)} minutes (estimated).` });
    saveDebounced();
    return trip;
  }

  // -------------------------------------------------------------------------
  // Real GPS mode — driver phone reports actual coordinates.
  // -------------------------------------------------------------------------
  handleRealGps(busId, { lat, lng, speed }) {
    const l = this.live[busId];
    if (!l) return false;
    if (l.tripStatus !== 'Active') return false;
    l.mode = 'live-gps';
    l.position = { lat: Number(lat), lng: Number(lng), heading: l.position.heading };
    l.speedKmh = clamp(Number(speed) || 0, 0, 120);
    l.lastUpdate = now();
    this.db.gpsLog.push({ busId, tripId: l.tripId, lat: Number(lat), lng: Number(lng), speed: l.speedKmh, at: now() });
    if (this.db.gpsLog.length > 4000) this.db.gpsLog.splice(0, 2000);
    this._refreshEtaForBus(busId);
    return true;
  }

  _refreshEtaForBus(busId) {
    const l = this.live[busId];
    const bus = this.db.buses.find((b) => b.id === busId);
    if (!bus || l.tripStatus !== 'Active') return;
    const route = this.db.routes.find((r) => r.id === bus.routeId);
    const data = this.routeData(route);
    const pos = l.position;
    // nearest point on route to the reported GPS position
    let best = { km: data.total, d: Infinity };
    for (let i = 0; i < data.stops.length; i++) {
      const d = haversineKm(pos, data.stops[i]);
      if (d < best.d) best = { km: data.cum[i], d };
    }
    l.progressKm = best.km;
    this._computeEta(busId);
  }

  // -------------------------------------------------------------------------
  // Boarding — QR/NFC tap: verify identity, bus eligibility, active trip,
  // record boarding, update attendance, occupancy, fare, transaction.
  // -------------------------------------------------------------------------
  processBoarding({ card, busId, tapType = 'IN' }) {
    const db = this.db;
    const student = db.transportStudents.find((s) => s.card.toUpperCase() === String(card).toUpperCase());
    if (!student) {
      this._flagAnomaly('Repeated Invalid QR Scans', `Unknown card ${card} used for boarding`, 'Medium');
      throw Object.assign(new Error('Card not recognized. Live boarding is available only to authorized NITER students.'), { status: 401 });
    }
    if (!student.eligibleBuses.includes(busId)) {
      this._flagAnomaly('Unauthorized Access', `${student.name} (${card}) tried to board ${busId}`, 'Medium');
      throw Object.assign(new Error('This card is not eligible for the selected bus.'), { status: 403 });
    }
    const bus = db.buses.find((b) => b.id === busId);
    const l = this.live[busId];
    if (!bus) throw Object.assign(new Error('Bus not found'), { status: 404 });
    if (l.tripStatus !== 'Active') throw Object.assign(new Error('No active trip for this bus right now.'), { status: 409 });
    const route = db.routes.find((r) => r.id === bus.routeId);
    const trip = db.trips.find((t) => t.tripId === l.tripId);

    // Fraud: impossible repeated scans within 60s
    const recent = db.boarding.filter((b) => b.studentId === student.studentId && b.tapType === 'IN' && Date.now() - new Date(b.at).getTime() < 60_000);
    if (recent.length > 0) {
      this._flagAnomaly('Impossible Repeated Scans', `${student.name} tapped IN twice within 60 seconds`, 'High');
      throw Object.assign(new Error('Boarding already recorded. Please wait before scanning again.'), { status: 409 });
    }

    if (tapType === 'IN') {
      if (l.occupancyPct >= 90) throw Object.assign(new Error('Bus is full. Please take the next available bus.'), { status: 409 });
      l.passengers += 1;
      l.occupancyPct = Math.round((l.passengers / bus.capacity) * 100);
      const km = l.progressKm;
      const fare = Math.round(15 + km * 1.5);
      const boardingId = nextSeq('board');
      const boarding = {
        boardingId, studentId: student.studentId, studentName: student.name, card: student.card,
        busId, busName: bus.name, tripId: l.tripId, tapType, at: now(), lat: l.position.lat, lng: l.position.lng,
      };
      db.boarding.push(boarding);
      const payment = {
        paymentId: nextSeq('pay'), userId: student.studentId, userName: student.name,
        busId, busName: bus.name, amount: fare, method: 'Campus Balance',
        status: 'DEMO PAYMENT — simulated transaction, no real charge', at: now(),
      };
      db.payments.push(payment);
      // Smart attendance record
      db.attendance.push({
        id: uid('at'), course: 'TRANSPORT', batch: student.batch, date: new Date().toISOString().slice(0, 10),
        records: { [student.studentId]: 'present' }, totalClasses: 1, source: 'smart-bus-boarding',
      });
      // Historical passenger log for AI crowd prediction
      db.analytics.passengerLog.push({ busId, tripId: l.tripId, passengers: l.passengers, at: now(), simMinutes: this.simMinutes });
      trip.passengers = l.passengers;
      this._pushNotification({ audience: `student:${student.studentId}`, title: 'Boarding confirmed', body: `You boarded ${bus.name}. Fare ${fare} BDT (demo). Smart attendance recorded.` });
      saveDebounced();
      return { boarding, payment, occupancy: { passengers: l.passengers, pct: l.occupancyPct } };
    }
    // TAP OUT
    l.passengers = Math.max(0, l.passengers - 1);
    l.occupancyPct = Math.round((l.passengers / bus.capacity) * 100);
    db.boarding.push({
      boardingId: nextSeq('board'), studentId: student.studentId, studentName: student.name, card: student.card,
      busId, busName: bus.name, tripId: l.tripId, tapType, at: now(), lat: l.position.lat, lng: l.position.lng,
    });
    saveDebounced();
    return { occupancy: { passengers: l.passengers, pct: l.occupancyPct } };
  }

  // -------------------------------------------------------------------------
  // Simulation tick
  // -------------------------------------------------------------------------
  tick(dtRealSec) {
    this.simMinutes += (dtRealSec * this.db.meta.simTimeScale) / 60;
    const sim = this.simMinutes;

    for (const bus of this.db.buses) {
      const l = this.live[bus.id];
      if (l.tripStatus !== 'Active') continue;
      const route = this.db.routes.find((r) => r.id === bus.routeId);
      const data = this.routeData(route);

      // Traffic model (simulated, labeled): time-of-day + phase + noise
      const rush = 1 + 0.22 * Math.exp(0 - Math.pow((sim - 500) / 90, 2)); // peak ~8:20 AM
      const factor = clamp(0.78 + 0.16 * Math.sin(sim / 9 + l.phase) + (rush - 1) + rand(-0.08, 0.08), 0.6, 1.45);
      l.traffic = { status: trafficStatusFor(factor), factor };

      const nominalSpeed = bus.type === 'Teacher' ? 34 : 30;
      const speed = (nominalSpeed / factor) * rand(0.94, 1.06);
      l.speedKmh = Math.round(speed * 10) / 10;

      l.progressKm += (speed * dtRealSec * this.db.meta.simTimeScale) / 3600;
      if (l.progressKm >= data.total) {
        l.progressKm = data.total;
        l.position = this.pointAt(route, data.total);
        l.speedKmh = 0;
        l.tripStatus = 'Arrived';
        l.currentStop = data.stops[data.stops.length - 1].name;
        l.nextStop = null;
        l.distToNext = 0;
        l.distToCampus = 0;
        l.etaToCampus = 0;
        l.passengers = 0;
        l.occupancyPct = 0;
        l.lastUpdate = now();
        this._pushNotification({ audience: 'all', title: `${bus.name} arrived at NITER Campus`, body: `${bus.name} has reached the campus.` });
        continue;
      }

      l.position = this.pointAt(route, l.progressKm);
      const { stop, stopIdx, dist } = this.nextStopInfo(route, l.progressKm);
      l.currentStop = data.stops[Math.max(0, stopIdx - 1)].name;
      l.nextStop = stop.name;
      l.distToNext = Math.round(dist * 100) / 100;
      l.distToCampus = Math.round((data.total - l.progressKm) * 100) / 100;
      l.etaToNext = Math.round((dist / speed) * 60);
      l.etaToCampus = Math.round(((data.total - l.progressKm) / speed) * 60);

      // Boarding at newly reached stops
      if (stopIdx > 0 && l.lastStopIndex !== stopIdx && l.passengers < bus.capacity) {
        const stopD = stop.demand;
        const hourFactor = clamp(1.3 - Math.abs(sim - 470) / 140, 0.6, 1.3);
        const board = Math.round(bus.capacity * stopD * hourFactor * rand(0.85, 1.2));
        l.passengers = clamp(l.passengers + board, 0, bus.capacity);
        l.occupancyPct = Math.round((l.passengers / bus.capacity) * 100);
        l.lastStopIndex = stopIdx;
        this.db.analytics.passengerLog.push({ busId: bus.id, tripId: l.tripId, passengers: l.passengers, at: now(), simMinutes: sim });
      }
      l.lastUpdate = now();
    }
    this._emit();
  }

  _computeEta(busId) {
    const l = this.live[busId];
    if (!l || l.tripStatus !== 'Active') return;
    const bus = this.db.buses.find((b) => b.id === busId);
    const route = this.db.routes.find((r) => r.id === bus.routeId);
    const data = this.routeData(route);
    const { stop, stopIdx, dist } = this.nextStopInfo(route, l.progressKm);
    l.currentStop = data.stops[Math.max(0, stopIdx - 1)].name;
    l.nextStop = stop.name;
    l.distToNext = Math.round(dist * 100) / 100;
    l.distToCampus = Math.round((data.total - l.progressKm) * 100) / 100;
    const speed = Math.max(l.speedKmh, 20);
    l.etaToNext = Math.round((dist / speed) * 60);
    l.etaToCampus = Math.round(((data.total - l.progressKm) / speed) * 60);
  }

  _flagAnomaly(type, detail, severity) {
    this.db.anomalies.push({ id: nextSeq('anomaly'), type, detail, severity, at: now(), reviewed: false });
    this._notify('anomaly:new', { type, detail, severity });
  }

  _pushNotification({ audience, title, body }) {
    const notif = { id: nextSeq('notif'), audience, title, body, read: false, at: now() };
    this.db.notifications.push(notif);
    if (this.db.notifications.length > 200) this.db.notifications.splice(0, 50);
    this._notify('notification:new', notif);
  }

  _notify(event, payload) {
    if (this._onChange) this._onChange(event, payload);
  }

  _emit() {
    if (this._onChange) this._onChange('transport:state', null);
  }
}

export const engine = new TransportEngine();
