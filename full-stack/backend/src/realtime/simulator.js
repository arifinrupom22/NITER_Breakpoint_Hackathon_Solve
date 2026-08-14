// ============================================================================
// Demo simulation loop — advances the transport engine on a compressed clock.
// This is what moves the buses when no physical device GPS is available.
// Clearly labeled DEMO SIMULATION everywhere it surfaces.
// ============================================================================

import { engine } from '../transport/engine.js';
import { getDb } from '../db.js';

let lastTick = Date.now();
let interval = null;

export function startSimulator({ intervalMs = 1000 } = {}) {
  if (interval) clearInterval(interval);
  lastTick = Date.now();
  interval = setInterval(() => {
    const nowT = Date.now();
    const dt = Math.min((nowT - lastTick) / 1000, 5);
    lastTick = nowT;
    engine.tick(dt);
  }, intervalMs);
  return interval;
}

export function stopSimulator() {
  if (interval) clearInterval(interval);
  interval = null;
}

// A web page can request that all buses be moved to a demo-ready state
// (e.g., Student Bus 1 mid-route) for a smooth presentation.
export function placeDemoBus(busId, progressKm, passengers) {
  const db = getDb();
  const bus = db.buses.find((b) => b.id === busId);
  if (!bus) return null;
  const route = db.routes.find((r) => r.id === bus.routeId);
  const l = engine.getBus(busId);
  if (!l) return null;
  l.progressKm = progressKm;
  l.position = engine.pointAt(route, progressKm);
  l.passengers = passengers;
  l.occupancyPct = Math.round((passengers / bus.capacity) * 100);
  l.tripStatus = 'Active';
  l.lastUpdate = new Date().toISOString();
  return l;
}
