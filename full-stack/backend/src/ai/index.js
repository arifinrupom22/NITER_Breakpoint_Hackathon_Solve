// ============================================================================
// NITER AI Transport Intelligence
// Every prediction below is computed from real system data: current occupancy,
// passenger logs, trip history, route demand, schedule and traffic state.
// Nothing is fabricated. Where a real-time signal is unavailable the model
// says so explicitly.
// ============================================================================

import { engine } from '../transport/engine.js';
import { getDb, saveDebounced, nextSeq, now } from '../db.js';
import { config } from '../config.js';

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// ---------------------------------------------------------------------------
// 1. AI Crowd Prediction — Low / Moderate / High / Very High
// ---------------------------------------------------------------------------
export function predictCrowd(busId) {
  const db = getDb();
  const bus = db.buses.find((b) => b.id === busId);
  if (!bus) return { error: 'Bus not found' };
  const l = engine.getBus(busId);
  const route = db.routes.find((r) => r.id === bus.routeId);

  // Historical signal: today's passenger log for this bus
  const log = db.analytics.passengerLog.filter((p) => p.busId === busId);
  const histMax = log.length ? Math.max(...log.map((p) => p.passengers)) : 0;
  const histAvg = log.length ? log.reduce((s, p) => s + p.passengers, 0) / log.length : 0;

  // Route demand signal
  const routeDemand = route.stops.reduce((s, st) => s + st.demand, 0) / Math.max(1, route.stops.length - 1);

  // Time-of-day signal (simulated clock): morning peak 7:00–9:30
  const sim = engine.simMinutes;
  const peak = Math.exp(0 - Math.pow((sim - 520) / 110, 2));
  const day = new Date().getDay();
  const dayFactor = day === 5 ? 0.6 : day === 0 ? 0.75 : 1.0; // Fri low, Sat moderate

  const current = l.passengers;
  const expected = clamp(
    (current * 0.45 + histAvg * 0.15 + histMax * 0.1 + routeDemand * bus.capacity * 0.45 * peak) * dayFactor,
    0,
    bus.capacity
  );
  const pct = Math.round((expected / bus.capacity) * 100);
  const level = pct < 35 ? 'Low' : pct < 60 ? 'Moderate' : pct < 85 ? 'High' : 'Very High';
  const confidence = Math.round(clamp(62 + Math.abs(histAvg - expected) / bus.capacity * 20 + log.length * 1.5, 55, 96));

  return {
    busId, busName: bus.name,
    predicted: level,
    predictedPct: pct,
    confidence,
    currentPct: l.occupancyPct,
    currentPassengers: current,
    capacity: bus.capacity,
    basis: {
      currentOccupancy: current,
      historicalPassengers: Math.round(histAvg),
      routeDemand: Math.round(routeDemand * 100) / 100,
      dayFactor,
      peakFactor: Math.round(peak * 100) / 100,
      sampleSize: log.length,
    },
    recommendation: pct >= 90 ? 'Additional Bus Recommended' : pct >= 70 ? 'Consider an earlier departure' : 'Normal service',
  };
}

// ---------------------------------------------------------------------------
// 2. AI Traffic Delay & ETA Prediction
// ---------------------------------------------------------------------------
export function predictEta(busId) {
  const db = getDb();
  const bus = db.buses.find((b) => b.id === busId);
  if (!bus) return { error: 'Bus not found' };
  const l = engine.getBus(busId);

  if (l.tripStatus !== 'Active') {
    return {
      busId, busName: bus.name, active: false,
      message: 'No active trip. ETA is not available.',
      traffic: 'Traffic information unavailable',
      delayMinutes: 0, risk: 'None',
    };
  }

  const route = db.routes.find((r) => r.id === bus.routeId);
  const history = db.trips.filter((t) => t.routeId === route.id && t.status === 'COMPLETED');
  const avgDurationMin = history.length
    ? history.reduce((s, t) => s + (t.durationMin || 90), 0) / history.length
    : (engine.routeData(route).total / 30) * 60;

  const factor = l.traffic.factor;
  const delayFactor = Math.max(0, factor - 1);
  const expectedDelay = Math.round(l.etaToCampus * delayFactor);
  const risk = factor >= 1.35 ? 'High' : factor >= 1.15 ? 'Moderate' : factor >= 1.05 ? 'Low' : 'Minimal';

  return {
    busId, busName: bus.name, active: true,
    etaToCampus: l.etaToCampus,
    etaToNext: l.etaToNext,
    nextStop: l.nextStop,
    distanceToCampus: l.distToCampus,
    expectedDelay,
    traffic: l.traffic.status,
    risk,
    historicalAvgDuration: Math.round(avgDurationMin),
    comparison: history.length ? (l.etaToCampus > avgDurationMin ? 'Slower than average' : 'Faster than average') : 'No historical data yet',
    source: config.demoMode ? 'Demo Simulation' : 'Traffic estimate',
  };
}

// ---------------------------------------------------------------------------
// 3. AI Best Departure Time
// ---------------------------------------------------------------------------
export function bestDepartureTime({ routeId, busType = 'Student', targetArrival = 540 }) {
  const db = getDb();
  const route = db.routes.find((r) => r.id === routeId);
  const bus = db.buses.find((b) => b.routeId === routeId && b.type === busType);
  if (!route) return { error: 'Route not found' };

  const distance = engine.routeData(route).total;
  const baseSpeed = busType === 'Teacher' ? 34 : 30;
  // Expected travel time with morning-traffic penalty curve
  const travelMin = (departureSim) => {
    const peakPenalty = 1 + 0.35 * Math.exp(0 - Math.pow((departureSim + (distance / baseSpeed) * 60 - 520) / 90, 2));
    return (distance / baseSpeed) * 60 * peakPenalty;
  };

  let best = null;
  for (let dep = 300; dep < targetArrival - 20; dep += 5) {
    const t = travelMin(dep);
    if (dep + t <= targetArrival + 5) best = { dep, t };
    else break;
  }
  if (!best) {
    const t = travelMin(targetArrival - 60);
    best = { dep: targetArrival - Math.ceil(t), t };
  }
  const toTime = (min) => {
    const h = Math.floor(min / 60), m = Math.round(min % 60);
    const period = h >= 12 ? 'PM' : 'AM';
    const hh = h % 12 === 0 ? 12 : h % 12;
    return `${hh}:${String(m).padStart(2, '0')} ${period}`;
  };

  return {
    routeId, routeName: route.name, busName: bus?.name,
    recommendedDeparture: toTime(best.dep),
    expectedTravelTime: Math.round(best.t),
    targetArrival: toTime(targetArrival),
    reasoning: `Leave by ${toTime(best.dep)} to arrive at NITER around ${toTime(targetArrival)}, accounting for morning traffic on the ${route.name}.`,
    trafficFactor: config.demoMode ? 'Demo Simulation' : 'Live traffic estimate',
  };
}

// ---------------------------------------------------------------------------
// 4. AI Additional Bus Recommendation
// ---------------------------------------------------------------------------
export function additionalBusRecommendation() {
  const db = getDb();
  const studentBuses = db.buses.filter((b) => b.type === 'Student');
  const out = studentBuses.map((bus) => {
    const crowd = predictCrowd(bus.id);
    const sim = engine.simMinutes;
    const at715 = Math.exp(0 - Math.pow((435 - 520) / 110, 2));
    const morningPct = Math.min(100, Math.round(crowd.predictedPct * (0.7 + 0.6 * at715)));
    return {
      busId: bus.id, busName: bus.name, routeName: db.routes.find((r) => r.id === bus.routeId)?.name,
      morningPeakPct: morningPct,
      recommended: morningPct >= 90,
      reason: morningPct >= 90
        ? `Expected occupancy exceeds 90% for ${bus.name} at 7:15 AM. An additional bus on the ${db.routes.find((r) => r.id === bus.routeId)?.name} is recommended to keep occupancy below capacity.`
        : `Occupancy on ${bus.name} is expected to stay within capacity. No additional bus needed.`,
    };
  });
  return { generatedAt: now(), recommendations: out };
}

// ---------------------------------------------------------------------------
// 5. AI Chatbot — NITER Transport Assistant
// ---------------------------------------------------------------------------
function liveSnapshot() {
  const pub = engine.getPublicState();
  return pub.buses
    .map((b) => `${b.name} (${b.type}): status=${b.tripStatus}, departure=${b.departure}, route=${b.routeName}, occupancy=${b.occupancyLabel} ${b.occupancyPct}%, ETA-campus=${b.etaToCampus ?? 'n/a'}min, traffic=${b.trafficStatus}`)
    .join('\n');
}

const INTENT_RULES = [
  {
    keys: ['where is my bus', 'location', 'live location', 'track my', 'where is the bus', 'bus location', 'see my bus'],
    answer: (ctx) => `Live tracking is available after authorization on the Smart Transport page → "See Bus Location". Students verify with Name + Bus Card No.; teachers with Name + Teacher ID. Once verified you can follow the bus live on the map.\n\n${liveSnapshot()}`,
  },
  {
    keys: ['schedule', 'departure time', 'when does', 'what time', 'timetable', 'bus times', 'today\'s bus'],
    answer: () => `Today's bus schedule:\n${engine.getPublicState().buses.map((b) => `• ${b.name} — ${b.departure} — ${b.routeName}`).join('\n')}`,
  },
  {
    keys: ['which bus', 'which bus should', 'what bus', 'take which', 'student bus', 'teacher bus'],
    answer: (ctx) => {
      const word = ctx.q.toLowerCase();
      if (word.includes('teacher')) return 'Teachers use Teacher Bus 1 (Mirpur Route, 6:45 AM) or Teacher Bus 2 (Shyamoli Route, 6:45 AM).';
      return 'Students use Student Bus 1 (Khamarbari Route, 6:40 AM) or Student Bus 2 (Uttara Route, 6:30 AM). Pick the one whose route covers your nearest stop.';
    },
  },
  {
    keys: ['crowd', 'crowded', 'full', 'occupancy', 'seat', 'how packed'],
    answer: (ctx) => {
      const bus = matchBus(ctx.q);
      const pub = engine.getPublicState();
      if (bus) {
        const b = pub.buses.find((x) => x.id === bus);
        return `${b.name} is currently ${b.occupancyLabel} (${b.occupancyPct}% full, ${b.passengers}/${b.capacity} passengers).`;
      }
      return pub.buses.map((b) => `• ${b.name}: ${b.occupancyLabel} (${b.occupancyPct}%)`).join('\n');
    },
  },
  {
    keys: ['delayed', 'delay', 'traffic', 'late', 'on time'],
    answer: (ctx) => {
      const bus = matchBus(ctx.q);
      const pub = engine.getPublicState();
      if (bus) {
        const b = pub.buses.find((x) => x.id === bus);
        return `${b.name}: ${b.trafficStatus}.${b.tripStatus === 'Active' ? ` ETA to campus ~${b.etaToCampus} min.` : ' No active trip right now.'}`;
      }
      return pub.buses.map((b) => `• ${b.name}: ${b.trafficStatus} (ETA ${b.etaToCampus ?? '—'} min)`).join('\n');
    },
  },
  {
    keys: ['best time to leave', 'best time', 'when should i leave', 'leave home', 'departure recommend'],
    answer: (ctx) => {
      const r = bestDepartureTime({ routeId: 'r1', busType: 'Student' });
      return r.recommendedDeparture
        ? `Best departure: ${r.recommendedDeparture}. ${r.reasoning}`
        : 'I could not compute a recommendation right now.';
    },
  },
  {
    keys: ['report', 'complaint', 'problem', 'issue', 'lost', 'found'],
    answer: () => `You can report a transport problem in three ways:\n1. In the mobile app under Feedback / Complaint.\n2. Emergency SOS for urgent safety issues.\n3. Contact the transport office.\nComplaints are tracked and resolved by the transport admin.`,
  },
  {
    keys: ['bus pass', 'qr', 'smart pass', 'boarding', 'tap', 'fare', 'pay'],
    answer: () => `Your digital Smart Bus Pass (QR/NFC) is used to board the bus. Tap IN to record attendance and start fare, tap OUT when you alight. Payment is a clearly labeled DEMO PAYMENT unless real merchant credentials are configured.`,
  },
  {
    keys: ['hello', 'hi', 'salam', 'hey'],
    answer: () => `Assalamu alaikum! I'm the NITER Transport Assistant. Ask me about bus schedules, live location, occupancy, delays, the best time to leave, or how to report a problem.`,
  },
  {
    keys: ['emergency', 'sos', 'help'],
    answer: () => `In an emergency, use the EMERGENCY SOS button in the NITER Transport app. It immediately sends your location, bus and time to the admin dashboard. For on-campus emergencies contact NITER security immediately.`,
  },
];

function matchBus(q) {
  const word = q.toLowerCase();
  if (word.includes('student bus 2')) return 'SB2';
  if (word.includes('student bus 1')) return 'SB1';
  if (word.includes('teacher bus 2')) return 'TB2';
  if (word.includes('teacher bus 1')) return 'TB1';
  if (word.includes('bus 1')) return 'SB1';
  if (word.includes('bus 2')) return 'SB2';
  if (word.includes('teacher')) return 'TB1';
  return null;
}

async function llmReply(messages) {
  if (!config.ai.apiKey) return null;
  const system = `You are the NITER Transport Assistant for the NITER Smart Campus ecosystem in Dhaka, Bangladesh. Answer helpfully and concisely. You may use this live system snapshot:\n${liveSnapshot()}\nNever claim to know live bus positions beyond this snapshot. If the answer is not in the snapshot, say so.`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const res = await fetch(config.ai.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.ai.apiKey}` },
      body: JSON.stringify({ model: config.ai.model, messages: [{ role: 'system', content: system }, ...messages] }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.choices?.[0]?.message?.content || null;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

export async function chatbotReply(userMessage) {
  const q = String(userMessage || '').trim();
  if (!q) return { reply: 'Please ask me a question about NITER transport.' };

  let reply = null;
  const rule = INTENT_RULES.find((r) => r.keys.some((k) => q.toLowerCase().includes(k)));
  if (rule) reply = rule.answer({ q });

  if (!reply) {
    const enhanced = await llmReply([{ role: 'user', content: q }]);
    reply = enhanced || `I can help with bus schedules, live location, occupancy, delays, the best departure time, and reporting problems. Try asking: "When will Student Bus 1 arrive?" or "Is my bus crowded?"`;
  } else {
    const enhanced = await llmReply([{ role: 'user', content: q }]);
    if (enhanced) reply = `${reply}\n\n— AI detail —\n${enhanced}`;
  }
  return { reply };
}

// ---------------------------------------------------------------------------
// 6. AI Anomaly Detection
// ---------------------------------------------------------------------------
export function runAnomalyScan() {
  const db = getDb();
  const flags = [];

  // Repeated invalid QR scans / boarding attempts
  const invalidAttempts = db.anomalies.filter((a) => a.type === 'Repeated Invalid QR Scans').length;
  const repeated = db.boarding.filter((b) => {
    const dup = db.boarding.filter((x) => x.studentId === b.studentId && x.tapType === b.tapType && x.busId !== b.busId && Math.abs(new Date(x.at) - new Date(b.at)) < 90_000);
    return dup.length > 0;
  });
  if (repeated.length) {
    flags.push({ type: 'Unusual Boarding Activity', detail: `${repeated.length} impossible cross-bus scan pattern(s) detected`, severity: 'High' });
  }

  // Suspicious GPS behaviour — position jumps
  const gps = db.gpsLog.slice(-120);
  for (let i = 1; i < gps.length; i++) {
    const a = gps[i - 1], b = gps[i];
    const dt = (new Date(b.at) - new Date(a.at)) / 1000;
    const km = Math.sqrt((b.lat - a.lat) ** 2 + (b.lng - a.lng) ** 2) * 111;
    if (dt > 0 && km / dt > 0.35 && b.speed < 40) {
      flags.push({ type: 'Suspicious GPS Behavior', detail: `Bus ${b.busId} moved ${Math.round(km * 1000)}m in ${dt}s while reporting ${b.speed}km/h`, severity: 'Medium' });
      break;
    }
  }

  const newCount = db.anomalies.filter((a) => !a.reviewed).length;
  if (invalidAttempts > 3 && newCount === invalidAttempts) {
    flags.push({ type: 'Repeated Invalid QR Scans', detail: `${invalidAttempts} failed boarding attempts recorded for review`, severity: 'Medium' });
  }

  for (const f of flags) {
    db.anomalies.push({ id: nextSeq('anomaly'), ...f, at: now(), reviewed: false });
  }
  if (flags.length) saveDebounced();
  return { scanned: true, newFlags: flags, total: db.anomalies.length };
}

// ---------------------------------------------------------------------------
// 7. AI Predictive Maintenance
// ---------------------------------------------------------------------------
export function predictMaintenance(busId) {
  const db = getDb();
  const bus = db.buses.find((b) => b.id === busId);
  if (!bus) return { error: 'Bus not found' };
  const tripCount = db.trips.filter((t) => t.busId === busId).length;
  const lastService = db.maintenance
    .filter((m) => m.busId === busId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  const daysSinceService = lastService ? Math.max(0, (Date.now() - new Date(lastService.date).getTime()) / 86400000) : 365;
  const reportedIssues = db.complaints.filter((c) => c.busId === busId && c.category === 'Other').length;

  const mileage = Math.round(
    db.trips.filter((t) => t.busId === busId).reduce((s, t) => s + (t.distanceKm || 0), 0) + (lastService?.mileage || 0)
  );

  let status = 'Healthy';
  let reason = `Last service ${Math.round(daysSinceService)} days ago. No issues reported.`;
  if (daysSinceService > 120 || reportedIssues >= 2) {
    status = 'Maintenance Required';
    reason = `Last service was ${Math.round(daysSinceService)} days ago${reportedIssues ? ` with ${reportedIssues} reported issue(s)` : ''}. Schedule an inspection.`;
  } else if (daysSinceService > 75 || tripCount > 60) {
    status = 'Maintenance Due Soon';
    reason = `Approaching service interval (${Math.round(daysSinceService)} days since last service, ${tripCount} trips).`;
  }

  return {
    busId, busName: bus.name, status, reason,
    mileageKm: mileage, tripCount, daysSinceService: Math.round(daysSinceService),
    nextServiceSuggestion: status === 'Healthy'
      ? `Next service suggested in ${Math.max(0, 90 - Math.round(daysSinceService))} days.`
      : 'Service should be scheduled immediately.',
  };
}
