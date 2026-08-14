// ============================================================================
// NITER Smart Transport — central configuration & domain constants
// The single source of truth for buses, routes, drivers, transport users and
// demo credentials. Everything else (simulator, API, AI, app, website) reads
// from here so there is never a second copy of the data.
// ============================================================================

import 'dotenv/config';

export const config = {
  port: Number(process.env.NITER_PORT || 3001),
  jwtSecret: process.env.JWT_SECRET || 'niter-demo-secret-change-me-in-production-9f2c1a',
  tokenTtl: '12h',
  demoMode: process.env.DEMO_MODE !== 'false',
  simTimeScale: Number(process.env.SIM_TIME_SCALE || 12), // simulated minutes per real minute
  ai: {
    apiKey: process.env.AI_API_KEY || '',
    baseUrl: process.env.AI_BASE_URL || 'https://openrouter.ai/api/v1/chat/completions',
    model: process.env.AI_MODEL || 'openai/gpt-4o-mini',
  },
  niter: {
    name: 'National Institute of Textile Engineering and Research',
    shortName: 'NITER',
    campus: 'Nayarhat, Savar, Dhaka, Bangladesh',
    campusLocation: { lat: 23.847, lng: 90.276 },
    email: 'info@niter.edu.bd',
    phone: '+880 2-7791094',
  },
};

// ---------------------------------------------------------------------------
// Routes. Stop objects carry { name, lat, lng, demand } where `demand` is the
// relative boarding demand weight used by the occupancy simulation.
// Routes flagged `configurable` have intermediate stops editable by the
// transport administrator (Student Bus 2 / Teacher Bus 2 per requirements).
// IDs + coordinates are kept identical to the website (js/data.js) and the
// mobile app (seed_data.dart) so live payloads line up everywhere.
// ---------------------------------------------------------------------------
export const ROUTES = [
  {
    id: 'r1',
    name: 'Khamarbari Route',
    type: 'Student',
    departure: '6:40 AM',
    configurable: false,
    stops: [
      { name: 'Khamarbari', lat: 23.7895, lng: 90.3985, demand: 0.3 },
      { name: 'Asadgate', lat: 23.7780, lng: 90.3900, demand: 0.28 },
      { name: 'Shyamoli', lat: 23.7745, lng: 90.3710, demand: 0.42 },
      { name: 'Kallyanpur', lat: 23.7650, lng: 90.3620, demand: 0.38 },
      { name: 'Technical', lat: 23.7820, lng: 90.3525, demand: 0.35 },
      { name: 'Gabtoli', lat: 23.7805, lng: 90.3495, demand: 0.5 },
      { name: 'Savar', lat: 23.8583, lng: 90.2667, demand: 0.62 },
      { name: 'NITER Campus', lat: 23.8470, lng: 90.2760, demand: 0 },
    ],
  },
  {
    id: 'r2',
    name: 'Uttara Route',
    type: 'Student',
    departure: '6:30 AM',
    configurable: true,
    stops: [
      { name: 'Uttara', lat: 23.8759, lng: 90.3795, demand: 0.45 },
      { name: 'Airport (configurable)', lat: 23.8567, lng: 90.4056, demand: 0.4 },
      { name: 'Khilkhet (configurable)', lat: 23.8320, lng: 90.4050, demand: 0.35 },
      { name: 'Banani (configurable)', lat: 23.7940, lng: 90.4050, demand: 0.5 },
      { name: 'Savar (configurable)', lat: 23.8583, lng: 90.2667, demand: 0.62 },
      { name: 'NITER Campus', lat: 23.8470, lng: 90.2760, demand: 0 },
    ],
  },
  {
    id: 'r3',
    name: 'Mirpur Route',
    type: 'Teacher',
    departure: '6:45 AM',
    configurable: false,
    stops: [
      { name: 'Mirpur', lat: 23.8070, lng: 90.3640, demand: 0.5 },
      { name: 'Technical', lat: 23.7820, lng: 90.3525, demand: 0.35 },
      { name: 'Gabtoli', lat: 23.7805, lng: 90.3495, demand: 0.5 },
      { name: 'Savar', lat: 23.8583, lng: 90.2667, demand: 0.62 },
      { name: 'NITER Campus', lat: 23.8470, lng: 90.2760, demand: 0 },
    ],
  },
  {
    id: 'r4',
    name: 'Shyamoli Route',
    type: 'Teacher',
    departure: '6:45 AM',
    configurable: true,
    stops: [
      { name: 'Shyamoli', lat: 23.7745, lng: 90.3710, demand: 0.45 },
      { name: 'Kallyanpur (configurable)', lat: 23.7650, lng: 90.3620, demand: 0.4 },
      { name: 'Gabtoli (configurable)', lat: 23.7805, lng: 90.3495, demand: 0.5 },
      { name: 'Savar (configurable)', lat: 23.8583, lng: 90.2667, demand: 0.62 },
      { name: 'NITER Campus', lat: 23.8470, lng: 90.2760, demand: 0 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Buses — the four NITER buses. Type is Student or Teacher and is preserved
// everywhere (access rules, UI, QR eligibility).
// ---------------------------------------------------------------------------
export const BUSES = [
  { id: 'SB1', name: 'Student Bus 1', type: 'Student', capacity: 50, routeId: 'r1', driverId: 'DRV1', departure: '6:40 AM', color: '#2563eb' },
  { id: 'SB2', name: 'Student Bus 2', type: 'Student', capacity: 50, routeId: 'r2', driverId: 'DRV2', departure: '6:30 AM', color: '#0891b2' },
  { id: 'TB1', name: 'Teacher Bus 1', type: 'Teacher', capacity: 40, routeId: 'r3', driverId: 'DRV3', departure: '6:45 AM', color: '#7c3aed' },
  { id: 'TB2', name: 'Teacher Bus 2', type: 'Teacher', capacity: 40, routeId: 'r4', driverId: 'DRV4', departure: '6:45 AM', color: '#0d9488' },
];

// ---------------------------------------------------------------------------
// Drivers — four demo driver accounts. Each driver is bound to exactly one bus.
// ---------------------------------------------------------------------------
export const DRIVERS = [
  { id: 'DRV1', name: 'Md. Karim', phone: '01711-000001', busId: 'SB1', password: 'driver123' },
  { id: 'DRV2', name: 'Abdul Latif', phone: '01711-000002', busId: 'SB2', password: 'driver123' },
  { id: 'DRV3', name: 'Shafiqul Islam', phone: '01711-000003', busId: 'TB1', password: 'driver123' },
  { id: 'DRV4', name: 'Jahangir Alam', phone: '01711-000004', busId: 'TB2', password: 'driver123' },
];

// ---------------------------------------------------------------------------
// Authorized transport users.
// Students verify with Name + Bus Card No.; teachers with Name + Teacher/Transport ID.
// ---------------------------------------------------------------------------
export const TRANSPORT_STUDENTS = [
  { name: 'Arifin Rupom', card: 'BUS06', studentId: 'CS 2405006', department: 'CSE', batch: 'CSE-23', eligibleBuses: ['SB1', 'SB2'] },
  { name: 'Sneha Rahman', card: 'BUS26', studentId: 'CS 2405026', department: 'CSE', batch: 'CSE-23', eligibleBuses: ['SB1', 'SB2'] },
  { name: 'Nabila Nawshin', card: 'BUS32', studentId: 'CS 2405032', department: 'CSE', batch: 'CSE-23', eligibleBuses: ['SB1', 'SB2'] },
];

export const TRANSPORT_TEACHERS = [
  { name: 'Dr. Rahman', card: 'T001', teacherId: 'T001', department: 'CSE', eligibleBuses: ['TB1', 'TB2'] },
  { name: 'Prof. Ahmed', card: 'T002', teacherId: 'T002', department: 'EEE', eligibleBuses: ['TB1', 'TB2'] },
  { name: 'Ms. Sultana', card: 'T003', teacherId: 'T003', department: 'TEX', eligibleBuses: ['TB1', 'TB2'] },
];

// NSCMS demo credentials
export const NSCMS_ADMINS = [{ id: 'ADM001', username: 'admin', password: 'admin123', name: 'System Administrator', role: 'admin' }];

export const TRANSPORT_FEATURES = [
  'Live Tracking', 'Digital Bus Pass', 'Smart Attendance', 'AI Crowd Prediction',
  'Real-time ETA', 'Notifications', 'Emergency SOS', 'Route Optimization',
];

export const HELPER = {
  routeById: (id) => ROUTES.find((r) => r.id === id),
  busById: (id) => BUSES.find((b) => b.id === id),
  driverById: (id) => DRIVERS.find((d) => d.id === id),
};

// Simple in-memory rate limiting (per IP, sliding window) for auth endpoints.
export function createRateLimiter({ windowMs = 60_000, max = 30 } = {}) {
  const hits = new Map();
  return function rateLimit(req, res, next) {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
    if (arr.length >= max) {
      return res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
    }
    arr.push(now);
    hits.set(key, arr);
    next();
  };
}
