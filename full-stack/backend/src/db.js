// ============================================================================
// Data store — in-memory collections persisted to a JSON file.
// For the hackathon this is the single shared state (website + app + admin all
// read the same state through the realtime hub). The architecture is designed
// so this can be swapped for Firebase/PostgreSQL without touching callers.
// ============================================================================

import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSeed } from './seed.js';
import { config } from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const DB_FILE = join(DATA_DIR, 'db.json');

let db = null;

function defaults() {
  return {
    meta: { seededAt: new Date().toISOString(), schemaVersion: 1, demoMode: config.demoMode, simTimeScale: config.simTimeScale },
    // NSCMS academic data
    students: [],
    teachers: [],
    departments: [],
    batches: [],
    courses: [],
    rooms: [],
    routines: [],
    notices: [],
    news: [],
    events: [],
    helpingZone: [],
    attendance: [],
    results: [],
    // Transport data
    buses: [],
    routes: [],
    drivers: [],
    trips: [],
    gpsLog: [],
    boarding: [],
    payments: [],
    complaints: [],
    lostFound: [],
    emergencies: [],
    maintenance: [],
    anomalies: [],
    notifications: [],
    schedules: [],
    transportSessions: [],
    // Analytics
    analytics: {
      tripsByDay: {},
      passengerLog: [],
      revenueByDay: {},
      onTimeByTrip: {},
    },
    seq: { help: 1, trip: 1, pay: 1, board: 1, notif: 1, complaint: 1, lost: 1, emergency: 1, schedule: 1, anomaly: 1, maint: 1 },
  };
}

function load() {
  if (existsSync(DB_FILE)) {
    try {
      const persisted = JSON.parse(readFileSync(DB_FILE, 'utf8'));
      db = { ...defaults(), ...persisted, meta: { ...defaults().meta, ...(persisted.meta || {}) } };
      return db;
    } catch (err) {
      console.warn('[db] failed to read db.json, reseeding:', err.message);
    }
  }
  db = createSeed();
  save();
  return db;
}

export function save() {
  try {
    mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error('[db] save failed:', err.message);
  }
}

let saveTimer = null;
export function saveDebounced() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 400);
}

export function getDb() {
  if (!db) load();
  return db;
}

export function resetDb() {
  db = createSeed();
  save();
  return db;
}

export function nextSeq(key) {
  const d = getDb();
  d.seq[key] = (d.seq[key] || 0) + 1;
  return `${key.toUpperCase()}-${String(d.seq[key]).padStart(4, '0')}`;
}

export function uid(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function now() {
  return new Date().toISOString();
}

// Persist initial seed synchronously on boot.
getDb();
