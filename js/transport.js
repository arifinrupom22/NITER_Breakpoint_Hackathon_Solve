/* ============================================================================
   NITER Smart Transport — static demo.
   A single shared bus-simulation engine, persisted in localStorage so the
   website, the Driver Console and (in separate tabs) the app all observe the
   SAME bus state — no backend required.

   DEMO SIMULATION — this is frontend simulation, never presented as real GPS.
   ============================================================================ */
(function () {
  'use strict';
  const { $, $$, esc, icon, toast, openModal, closeModal } = window.NITER.ui;
  const D = () => window.NITER_DATA;
  const KEY = 'niter.transport';
  const SESSION_KEY = 'niter.transportSession';
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  const TRAFFIC_STATUS = [
    { max: 1.04, label: 'On Time' },
    { max: 1.14, label: 'Slight Delay' },
    { max: 1.28, label: 'Delayed' },
    { max: 1.42, label: 'Heavy Traffic' },
    { max: 9, label: 'Very Heavy Traffic' },
  ];

  function occLabel(pct) {
    if (pct < 40) return 'Available';
    if (pct < 70) return 'Moderate';
    if (pct < 90) return 'Crowded';
    return 'Full';
  }

  /* ---------------- state ---------------- */
  function defaultState() {
    const buses = {};
    D().buses.forEach((b) => {
      const route = D().routes.find((r) => r.id === b.routeId);
      buses[b.id] = {
        id: b.id, name: b.name, type: b.type, capacity: b.capacity,
        routeId: b.routeId, routeName: route.name, departure: b.departure,
        driverName: b.driverName, driverId: b.driverId,
        tripStatus: 'Inactive', tripId: null, tripStart: null,
        stopIdx: 0, progress: 0.15,
        position: { lat: route.coords[0].lat, lng: route.coords[0].lng, heading: 0 },
        speedKmh: 0, passengers: 0, occupancyPct: 0, occupancyLabel: 'Available',
        currentStop: route.stops[0], nextStop: route.stops[1],
        distToNext: 0, distToCampus: null, etaToNext: null, etaToCampus: null,
        delayMinutes: 0, trafficStatus: 'Traffic information unavailable', trafficFactor: 1,
        lastUpdate: new Date().toLocaleTimeString(),
      };
    });
    return { demoMode: true, version: 2, simMinutes: 390, buses, trips: [], emergency: null };
  }

  let state = null;
  function load() {
    try { state = JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { state = null; }
    if (!state || state.version !== 2) { state = defaultState(); persist(); }
    // merge any missing buses (schema evolution)
    D().buses.forEach((b) => { if (!state.buses[b.id]) state.buses[b.id] = defaultState().buses[b.id]; });
    return state;
  }
  function persist() {
    state.lastUpdate = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* quota */ }
  }
  function emit() {
    window.dispatchEvent(new CustomEvent('niter:transport', { detail: state }));
  }
  load();
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) { load(); emit(); }
  });

  /* ---------------- helpers ---------------- */
  function routeOf(busId) { return D().routes.find((r) => r.busId === busId); }
  function segDist(a, b) {
    const dLat = (b.lat - a.lat) * 111, dLng = (b.lng - a.lng) * 111 * Math.cos(a.lat * Math.PI / 180);
    return Math.sqrt(dLat * dLat + dLng * dLng);
  }
  function bearing(a, b) { return (Math.atan2(b.lng - a.lng, b.lat - a.lat) * 180 / Math.PI + 360) % 360; }
  function lerp(a, b, t) { return { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t }; }

  /* ---------------- public API ---------------- */
  function getState() { return state; }
  function getBus(id) { return state.buses[id]; }

  function startTrip(busId, actor) {
    const b = state.buses[busId];
    const route = routeOf(busId);
    if (!b || !route) return { error: 'Bus not found' };
    if (b.tripStatus === 'Active') return { error: 'Trip already active for this bus.' };
    const tripId = 'TRIP-' + Date.now().toString(36).toUpperCase();
    b.tripStatus = 'Active'; b.tripId = tripId; b.tripStart = Date.now();
    b.stopIdx = 0; b.progress = 0.12;
    b.speedKmh = 0;
    b.passengers = Math.round(b.capacity * 0.52 * rand(0.9, 1.1));
    b.occupancyPct = Math.round((b.passengers / b.capacity) * 100);
    b.occupancyLabel = occLabel(b.occupancyPct);
    b.currentStop = route.stops[0]; b.nextStop = route.stops[1];
    b.delayMinutes = 0; b.trafficStatus = 'On Time'; b.trafficFactor = 1;
    b.lastUpdate = new Date().toLocaleTimeString();
    state.trips.push({ tripId, busId, busName: b.name, routeName: route.name, startedAt: Date.now(), endedAt: null, passengers: b.passengers, status: 'ACTIVE', driver: actor || b.driverName });
    persist(); emit();
    toast(`${b.name} trip started — GPS sharing active`, 'success');
    return { ok: true, tripId, busId };
  }

  function endTrip(busId) {
    const b = state.buses[busId];
    if (!b || (b.tripStatus !== 'Active' && b.tripStatus !== 'Arrived')) return { error: 'No active trip to end.' };
    const trip = state.trips.find((t) => t.tripId === b.tripId);
    if (trip) { trip.endedAt = Date.now(); trip.status = 'COMPLETED'; trip.passengers = b.passengers; }
    const campus = D().campus;
    b.tripStatus = 'Inactive'; b.tripId = null; b.tripStart = null;
    b.position = { lat: campus.lat, lng: campus.lng, heading: 0 };
    b.speedKmh = 0; b.passengers = 0; b.occupancyPct = 0; b.occupancyLabel = 'Available';
    b.etaToCampus = null; b.etaToNext = null; b.trafficStatus = 'Traffic information unavailable';
    b.currentStop = 'NITER Campus'; b.nextStop = '—';
    b.lastUpdate = new Date().toLocaleTimeString();
    persist(); emit();
    toast(`${b.name} trip completed and saved.`, 'success');
    return { ok: true };
  }

  function reportEmergency(busId, type) {
    state.emergency = { busId, type, at: new Date().toLocaleTimeString(), user: 'Driver' };
    persist(); emit();
    toast('EMERGENCY SOS sent — admin has been notified', 'error');
  }
  function clearEmergency() { state.emergency = null; persist(); emit(); }

  /* ---------------- simulation tick ---------------- */
  /* Demo pacing: a trip from departure point to NITER Campus takes about
     DEMO_TRIP_SECONDS of wall-clock time (so the hackathon demo is punchy,
     ~30 s), while ETAs stay realistic in minutes via MIN_PER_SEG. */
  const DEMO_TRIP_SECONDS = 30;
  const MIN_PER_SEG = 7; // simulated minutes per route segment (ETA realism)
  function tick() {
    let changed = false;
    D().buses.forEach((bus) => {
      const b = state.buses[bus.id];
      if (b.tripStatus !== 'Active') return;
      const route = routeOf(bus.id);
      const coords = route.coords;

      // traffic (simulated, labeled)
      b.trafficFactor = clamp(0.9 + 0.22 * Math.sin(state.simMinutes / 14 + b.stopIdx) + rand(-0.06, 0.06), 0.85, 1.45);
      b.trafficStatus = TRAFFIC_STATUS.find((t) => b.trafficFactor <= t.max).label;

      const step = 1 / ((DEMO_TRIP_SECONDS / (coords.length - 1)) * b.trafficFactor);
      b.progress += step;
      b.speedKmh = Math.round(clamp(24 / b.trafficFactor + rand(-2, 3), 6, 60));

      if (b.progress >= 1) {
        if (b.stopIdx < coords.length - 2) {
          b.stopIdx += 1; b.progress = 0;
          b.currentStop = route.stops[b.stopIdx];
          b.nextStop = route.stops[b.stopIdx + 1];
          // boarding / alighting at stops
          const delta = Math.round(b.capacity * 0.06 * rand(-1.2, 1.4));
          b.passengers = clamp(b.passengers + delta, 6, b.capacity);
          b.occupancyPct = Math.round((b.passengers / b.capacity) * 100);
          b.occupancyLabel = occLabel(b.occupancyPct);
        } else {
          // arrived at final stop (campus)
          b.tripStatus = 'Arrived';
          b.position = { lat: coords[coords.length - 1].lat, lng: coords[coords.length - 1].lng, heading: 0 };
          b.speedKmh = 0;
          b.currentStop = route.stops[route.stops.length - 1];
          b.nextStop = '—';
          b.etaToCampus = 0; b.etaToNext = null; b.distToCampus = 0;
          changed = true;
          return;
        }
      }

      const a = coords[b.stopIdx], c = coords[b.stopIdx + 1];
      b.position = lerp(a, c, b.progress);
      b.position.heading = bearing(a, c);
      b.distToNext = Math.round(segDist(b.position, c) * 10) / 10;
      let rest = 0;
      for (let k = b.stopIdx + 1; k < coords.length - 1; k++) rest += segDist(coords[k], coords[k + 1]);
      b.distToCampus = Math.round((segDist(b.position, c) + rest) * 10) / 10;
      const remainSegs = (coords.length - 1 - b.stopIdx) - b.progress;
      b.etaToNext = Math.max(1, Math.round(remainSegs * MIN_PER_SEG * b.trafficFactor));
      b.etaToCampus = Math.max(1, Math.round(((coords.length - 1 - b.stopIdx - b.progress)) * MIN_PER_SEG * b.trafficFactor));
      b.delayMinutes = Math.round(Math.max(0, (b.trafficFactor - 1) * 26));
      b.lastUpdate = new Date().toLocaleTimeString();
      changed = true;
    });
    if (changed) { persist(); emit(); }
  }
  let simTimer = null;
  function runSim() {
    if (simTimer) return;
    simTimer = setInterval(() => { state.simMinutes += 0.5; tick(); }, 1000);
  }
  runSim();

  /* ---------------- live sync hooks (used by js/live.js) ---------------- */
  let localSimOn = true;
  function setLocalSim(on) {
    localSimOn = !!on;
    if (on) runSim();
    else if (simTimer) { clearInterval(simTimer); simTimer = null; }
  }

  // Merge a remote backend payload ({ public, live }) into the local state so
  // the shared NITER backend is the single source of truth when reachable.
  function applyRemote(payload) {
    if (!payload) return;
    const pub = payload.public || {};
    const live = payload.live || {};
    (pub.buses || []).forEach((rb) => {
      const b = state.buses[rb.id];
      if (!b) return;
      b.tripStatus = rb.tripStatus || b.tripStatus;
      b.passengers = rb.passengers ?? b.passengers;
      b.occupancyPct = rb.occupancyPct ?? b.occupancyPct;
      b.occupancyLabel = rb.occupancyLabel || b.occupancyLabel;
      b.currentStop = rb.currentStop || b.currentStop;
      b.nextStop = rb.nextStop || b.nextStop;
      b.etaToCampus = rb.etaToCampus ?? b.etaToCampus;
      b.trafficStatus = rb.trafficStatus || b.trafficStatus;
      b.lastUpdate = rb.lastUpdate || b.lastUpdate;
    });
    Object.keys(live).forEach((id) => {
      const rl = live[id];
      const b = state.buses[id];
      if (!b) return;
      b.tripStatus = rl.tripStatus || b.tripStatus;
      b.tripId = rl.tripId || b.tripId;
      if (rl.position) b.position = { lat: rl.position.lat, lng: rl.position.lng, heading: rl.position.heading || 0 };
      b.speedKmh = rl.speedKmh ?? b.speedKmh;
      b.passengers = rl.passengers ?? b.passengers;
      b.occupancyPct = rl.occupancyPct ?? b.occupancyPct;
      b.occupancyLabel = rl.occupancyLabel || b.occupancyLabel;
      b.currentStop = rl.currentStop || b.currentStop;
      b.nextStop = rl.nextStop || b.nextStop;
      b.distToNext = rl.distToNext ?? b.distToNext;
      b.distToCampus = rl.distToCampus ?? b.distToCampus;
      b.etaToNext = rl.etaToNext ?? b.etaToNext;
      b.etaToCampus = rl.etaToCampus ?? b.etaToCampus;
      b.trafficStatus = rl.trafficNote || rl.trafficStatus || b.trafficStatus;
      b.delayMinutes = rl.delayMinutes ?? b.delayMinutes;
      b.lastUpdate = rl.lastUpdate || b.lastUpdate;
      const route = routeOf(id);
      if (route && rl.currentStop) {
        const idx = route.stops.indexOf(rl.currentStop);
        if (idx >= 0) b.stopIdx = idx;
      }
    });
    emit();
  }

  /* ========================================================================
     PAGE: SMART TRANSPORT (public)
     ======================================================================== */
  function pageHTML() {
    return `
    <section class="tp-hero">
      <div class="container">
        <p class="crumbs" style="color:var(--gold-400)">Home / Smart Transport</p>
        <h1>NITER Smart Transport</h1>
        <p>Smart Mobility for a Connected NITER — track campus buses, view routes, estimate arrival times, and experience secure digital transportation.</p>
        <div class="tp-badges">
          <span class="tp-badge"><span class="pulse-dot"></span> Real-time system</span>
          <span class="tp-badge">${icon('i-qr')} Digital Smart Bus Pass</span>
          <span class="tp-badge">${icon('i-shield')} Authorized access only</span>
          <span class="mode-badge" style="background:var(--gold-500)">${icon('i-signal')} DEMO SIMULATION</span>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="sec-head split">
          <div>
            <p class="eyebrow">${icon('i-bus')} Fleet Overview</p>
            <h2 class="h-display">Our Four Buses</h2>
            <p class="sec-sub">Four buses, four routes, two dedicated student buses and two teacher buses — all synchronized in real time.</p>
          </div>
          <button class="btn btn-gold" id="seeLocationBtn">${icon('i-map')} See Bus Location</button>
        </div>
        <div class="bus-grid" id="tpBusGrid"></div>
      </div>
    </section>

    <section class="section alt">
      <div class="container">
        <div class="sec-head">
          <p class="eyebrow">${icon('i-route')} Routes</p>
          <h2 class="h-display">Bus Routes &amp; Stops</h2>
          <p class="sec-sub">Exact morning-trip routes preserved for the hackathon. Configurable intermediate stops can be adjusted by the transport admin.</p>
        </div>
        <div class="info-grid" id="tpRoutes"></div>
      </div>
    </section>

    <section class="stats-band">
      <div class="container">
        <div class="sec-head light">
          <p class="eyebrow light">${icon('i-signal')} Smart Mobility</p>
          <h2 class="h-display">Live Transport Statistics</h2>
        </div>
        <div class="tp-stats" id="tpStats"></div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="sec-head">
          <p class="eyebrow">${icon('i-star')} Smart Features</p>
          <h2 class="h-display">Why NITER Smart Transport?</h2>
        </div>
        <div class="feature-grid">
          ${[
            ['i-map', 'Live Tracking', 'Real-time bus location, route line and ETA for every trip.'],
            ['i-qr', 'Digital Bus Pass', 'QR-based Smart Bus Pass with automatic boarding, attendance and payment.'],
            ['i-users', 'Smart Attendance', 'Tap In / Tap Out automatically marks class attendance.'],
            ['i-signal', 'AI Crowd Prediction', 'Forecasts Low / Moderate / High / Very High occupancy per route and time.'],
            ['i-clock', 'ETA & Delays', 'Estimated arrival to every stop with traffic status and delay.'],
            ['i-bell', 'Notifications', 'Bus approaching, trip started, delays and emergency alerts.'],
            ['i-siren', 'Emergency SOS', 'One-tap emergency alert with live bus location to the admin.'],
            ['i-shield', 'Secure Access', 'Live tracking only for authorized NITER students, teachers and drivers.'],
          ].map(([ic, t, d]) => `<div class="feature-card"><span class="q-icon" style="background:var(--ink-50);color:var(--niter-600)">${icon(ic)}</span><h4>${t}</h4><p>${d}</p></div>`).join('')}
        </div>
      </div>
    </section>

    <section class="section alt">
      <div class="container">
        <div class="security-note">
          <span class="q-icon">${icon('i-shield')}</span>
          <div>
            <strong style="font-size:15px;display:block;margin-bottom:2px">Live transport tracking is available only to authorized NITER students and teachers.</strong>
            <span style="font-size:13px;color:var(--ink-500)">Verify with your Name and Bus Card No. (students) or Teacher/Transport ID (teachers) to view live bus locations, routes and ETAs. Unauthorized attempts are logged and reported.</span>
          </div>
          <button class="btn btn-primary" id="seeLocationBtn2" style="margin-left:auto">${icon('i-lock')} Verify &amp; Track</button>
        </div>
      </div>
    </section>`;
  }

  function renderBusCards() {
    const grid = $('#tpBusGrid');
    if (!grid) return;
    const now = new Date();
    grid.innerHTML = D().buses.map((bus) => {
      const b = state.buses[bus.id];
      const active = b.tripStatus === 'Active';
      const route = routeOf(bus.id);
      return `
      <article class="bus-card">
        <div class="bus-head">
          <div style="display:flex;gap:10px;align-items:center">
            <span class="q-icon">${icon('i-bus')}</span>
            <div><h3>${esc(bus.name)}</h3><span>${esc(bus.type)} Bus</span></div>
          </div>
          <span class="pill ${active ? 'on' : 'off'}">${active ? icon('i-check') + ' Active' : 'Inactive'}</span>
        </div>
        <div class="bus-body">
          <span class="bus-route">${icon('i-route')} <span><b>${esc(route.name)}</b><br/>${esc(route.stops.join(' → '))}</span></span>
          <div class="bus-meta"><span>${icon('i-clock')} Departs</span><b>${esc(bus.departure)}</b></div>
          <div class="bus-meta"><span>${icon('i-user')} Driver</span><b>${esc(bus.driverName)}</b></div>
          <div class="bus-meta"><span>${icon('i-pin')} Location</span><b>${active ? esc(b.currentStop) : 'At depot'}</b></div>
          ${active ? `
            <div>
              <div class="bus-meta" style="margin-bottom:5px"><span>Occupancy</span><b class="occ-label">${b.occupancyPct}% · ${esc(b.occupancyLabel)}</b></div>
              <div class="occ-bar"><i style="width:${b.occupancyPct}%"></i></div>
            </div>
            <div class="bus-meta"><span>ETA to campus</span><b>${b.etaToCampus != null ? '~' + b.etaToCampus + ' min' : '—'}</b></div>
            <div class="bus-meta"><span>Traffic</span><b>${esc(b.trafficStatus)}</b></div>` : ''}
        </div>
        <div class="bus-foot">
          <span>Updated ${esc(b.lastUpdate || '—')}</span>
          ${active ? `<span class="pulse-dot" title="Live"></span>` : `<span style="color:var(--ink-300)">Not on trip</span>`}
        </div>
      </article>`;
    }).join('');
  }

  function renderRoutes() {
    const grid = $('#tpRoutes');
    if (!grid) return;
    grid.innerHTML = D().routes.map((r) => `
      <div class="info-card">
        <span class="q-icon">${icon(r.configurable ? 'i-edit' : 'i-route')}</span>
        <h4>${esc(r.name)} <span class="chip ${r.configurable ? 'chip-imp' : 'chip-cat'}" style="margin-left:6px">${r.configurable ? 'Configurable' : 'Fixed'}</span></h4>
        <p style="margin-top:6px"><b>${esc((D().buses.find((b) => b.id === r.busId) || {}).name || '')}</b> · departs ${esc(r.departure)}</p>
        <div class="stop-list">${r.stops.map((s) => `<li><span class="dot"></span>${esc(s)}</li>`).join('')}</div>
      </div>`).join('');
  }

  function renderStats() {
    const grid = $('#tpStats');
    if (!grid) return;
    const active = D().buses.filter((b) => state.buses[b.id].tripStatus === 'Active').length;
    const today = state.trips.filter((t) => t.status === 'COMPLETED').length;
    const passengers = D().buses.reduce((s, b) => s + state.buses[b.id].passengers, 0);
    const onTime = 94 + Math.round(Math.sin(state.simMinutes / 20) * 3);
    const items = [
      [active, 'Active Buses'], [today, 'Today\'s Trips'],
      [passengers, 'Current Passengers'], [onTime + '%', 'On-Time Rate'],
    ];
    grid.innerHTML = items.map(([v, l]) => `<div class="tp-stat"><strong>${v}</strong><span>${l}</span></div>`).join('');
  }

  let pageHandler = null, liveHandler = null;
  function afterPage() {
    renderBusCards(); renderRoutes(); renderStats();
    if (pageHandler) window.removeEventListener('niter:transport', pageHandler);
    pageHandler = () => { renderBusCards(); renderStats(); };
    window.addEventListener('niter:transport', pageHandler);
    $('#seeLocationBtn') && $('#seeLocationBtn').addEventListener('click', startVerifyFlow);
    $('#seeLocationBtn2') && $('#seeLocationBtn2').addEventListener('click', startVerifyFlow);
  }

  /* ========================================================================
     VERIFICATION FLOW
     ======================================================================== */
  function getSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (e) { return null; } }
  function setSession(s) { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
  function clearSession() { localStorage.removeItem(SESSION_KEY); }

  function startVerifyFlow() {
    const session = getSession();
    if (session && session.eligible && session.eligible.length) {
      openBusSelect(session);
      return;
    }
    openModal(`
      <div class="demo-note">${icon('i-shield')}<span>Live tracking requires verification. Authorized demo students: <b>Arifin Rupom (BUS06)</b>, <b>Sneha Rahman (BUS26)</b>, <b>Nabila Nawshin (BUS32)</b>. Teachers use their Teacher ID.</span></div>
      <div class="tabs" style="margin-top:14px">
        <button class="tab-btn active" data-tab="student">${icon('i-grad')} Student</button>
        <button class="tab-btn" data-tab="teacher">${icon('i-book')} Teacher</button>
      </div>
      <form id="verifyForm">
        <div class="field"><label class="label">Full Name</label><input id="vName" class="input" required placeholder="e.g. Arifin Rupom" /></div>
        <div class="field" id="vField2"><label class="label">Bus Card No.</label><input id="vCard" class="input" required placeholder="e.g. BUS06" /></div>
        <button class="btn btn-primary" style="width:100%" type="submit">${icon('i-lock')} Verify &amp; Continue</button>
      </form>
      <p class="hint center mt-16">Unauthorized or incorrect credentials will not reveal any bus location.</p>`, { title: 'Verify Identity' });

    let role = 'student';
    $$('.tab-btn').forEach((t) => t.addEventListener('click', () => {
      $$('.tab-btn').forEach((x) => x.classList.remove('active'));
      t.classList.add('active');
      role = t.dataset.tab;
      const f = $('#vField2');
      f.innerHTML = role === 'student'
        ? '<label class="label">Bus Card No.</label><input id="vCard" class="input" required placeholder="e.g. BUS06" />'
        : '<label class="label">Teacher / Transport ID</label><input id="vCard" class="input" required placeholder="e.g. T001" />';
    }));

    $('#verifyForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#vName').value.trim();
      const cred = $('#vCard').value.trim().toUpperCase();
      const nl = name.toLowerCase();
      let session = null;
      if (role === 'student') {
        const s = D().students.find((x) => (x.name.toLowerCase() === nl || (x.aka && x.aka.toLowerCase() === nl)) && (x.card.toUpperCase() === cred || x.id.toUpperCase() === cred));
        if (s) session = { role: 'transport-student', name: s.name, id: s.id, card: s.card, eligible: ['SB1', 'SB2'] };
      } else {
        const t = D().teachers.find((x) => x.name.toLowerCase() === nl && x.id.toUpperCase() === cred);
        if (t) session = { role: 'transport-teacher', name: t.name, id: t.id, eligible: ['TB1', 'TB2'] };
      }
      if (session) {
        setSession(session);
        closeModal();
        toast(`Welcome, ${session.name}!`, 'success');
        openBusSelect(session);
      } else {
        openModal(`
          <div class="center">
            <span class="q-icon" style="width:64px;height:64px;border-radius:16px;background:#fef2f2;color:var(--red-600);margin:0 auto 14px">${icon('i-shield')}</span>
            <h3 style="font-size:17px;font-weight:700;margin-bottom:8px">Access Denied</h3>
            <p style="color:var(--ink-500);font-size:14px;line-height:1.6;max-width:360px;margin:0 auto">Live transport tracking is available only to authorized NITER students and teachers. Please check your details and try again.</p>
            <button class="btn btn-primary mt-16" data-retry>${icon('i-lock')} Try Again</button>
          </div>`, { title: 'Verification Failed' });
        $('#verifyForm') && null;
        const retry = $('[data-retry]');
        retry && retry.addEventListener('click', startVerifyFlow);
      }
    });
  }

  function openBusSelect(session) {
    const roleLabel = session.role === 'transport-student' ? 'Student' : 'Teacher';
    const buses = D().buses.filter((b) => session.eligible.includes(b.id));
    openModal(`
      <p class="sec-sub" style="margin-bottom:14px">Welcome <b>${esc(session.name)}</b> — select a ${roleLabel} bus to track live.</p>
      <div style="display:flex;flex-direction:column;gap:12px">
        ${buses.map((b) => {
          const route = routeOf(b.id);
          const st = state.buses[b.id];
          const active = st.tripStatus === 'Active';
          return `
          <button class="select-bus" data-bus="${b.id}" style="display:flex;justify-content:space-between;align-items:center;gap:12px;text-align:left;border:1px solid var(--ink-100);border-radius:14px;padding:16px;transition:all .2s;background:#fff" onmouseover="this.style.borderColor='#93c5fd';this.style.boxShadow='0 10px 30px -14px rgba(11,26,56,.25)'" onmouseout="this.style.borderColor='var(--ink-100)';this.style.boxShadow='none'">
            <span style="display:flex;gap:12px;align-items:center">
              <span class="q-icon">${icon('i-bus')}</span>
              <span><strong style="font-size:15px">${esc(b.name)}</strong><br/><span style="font-size:12.5px;color:var(--ink-500)">${esc(route.name)} · departs ${esc(b.departure)}</span></span>
            </span>
            <span class="pill ${active ? 'on' : 'off'}">${active ? 'Live' : 'Standby'}</span>
          </button>`;
        }).join('')}
      </div>
      <button class="btn btn-ghost btn-sm mt-16" id="logoutTransport" style="color:var(--red-600)">${icon('i-lock')} Log out &amp; clear verification</button>`, { title: 'Select Bus' });

    $$('.select-bus').forEach((el) => el.addEventListener('click', () => {
      const busId = el.dataset.bus;
      closeModal();
      window.location.hash = `#/transport/live?bus=${busId}`;
    }));
    const lo = $('#logoutTransport');
    lo && lo.addEventListener('click', () => { clearSession(); closeModal(); toast('Verification cleared', 'warn'); });
  }

  /* ========================================================================
     PAGE: LIVE TRACKING
     ======================================================================== */
  function liveHTML(busId) {
    const bus = D().buses.find((b) => b.id === busId) || D().buses[0];
    const route = routeOf(bus.id);
    return `
    <section class="page-hero" style="padding-bottom:56px">
      <div class="container">
        <p class="crumbs">Home / Smart Transport / Live Tracking</p>
        <h1>${esc(bus.name)} — Live</h1>
        <p>${esc(route.name)} · departs ${esc(bus.departure)} · ${esc(bus.driverName)}</p>
        <div class="tp-badges">
          <span class="mode-badge">${icon('i-signal')} DEMO SIMULATION</span>
          <span class="tp-badge" id="liveTripPill"><span class="pulse-dot"></span> Waiting for trip…</span>
        </div>
      </div>
    </section>
    <section class="section">
      <div class="container map-layout">
        <div class="live-panel">
          <h3>${esc(bus.name)} <span class="pill off" id="liveStatus">Standby</span></h3>
          <div class="live-rows" id="liveRows">
            <div class="live-row"><span>${icon('i-route')} Route</span><b>${esc(route.name)}</b></div>
            <div class="live-row"><span>${icon('i-user')} Driver</span><b>${esc(bus.driverName)}</b></div>
            <div class="live-row"><span>${icon('i-pin')} Current Stop</span><b id="liveCur">—</b></div>
            <div class="live-row"><span>${icon('i-target')} Next Stop</span><b id="liveNext">—</b></div>
            <div class="live-row"><span>${icon('i-map')} Dist. to Next</span><b id="liveDNext">—</b></div>
            <div class="live-row"><span>${icon('i-home')} Dist. to Campus</span><b id="liveDCampus">—</b></div>
            <div class="live-row"><span>${icon('i-clock')} ETA to Next</span><b id="liveENext">—</b></div>
            <div class="live-row"><span>${icon('i-grad')} ETA to Campus</span><b id="liveECampus">—</b></div>
            <div class="live-row"><span>${icon('i-signal')} Speed</span><b id="liveSpeed">—</b></div>
            <div class="live-row"><span>${icon('i-alert')} Traffic</span><b id="liveTraffic">—</b></div>
            <div class="live-row"><span>${icon('i-users')} Occupancy</span><b id="liveOcc">—</b></div>
            <div class="live-row"><span>${icon('i-clock')} Updated</span><b id="liveUpd">—</b></div>
          </div>
          <h3 style="margin-top:16px">Route Progress</h3>
          <ul class="stop-list" id="liveStops"></ul>
          <div class="demo-note mt-16">${icon('i-signal')}<span>Traffic status and ETA are simulated for this demo — labeled <b>DEMO SIMULATION</b>.</span></div>
        </div>
        <div>
          <div class="map-box" id="liveMap"></div>
          <div class="tp-badges mt-16" style="justify-content:flex-end">
            <a class="tp-badge" href="#/transport">${icon('i-bus')} All buses</a>
            <button class="tp-badge" id="trackAnother">${icon('i-route')} Track another bus</button>
          </div>
        </div>
      </div>
    </section>`;
  }

  function afterLive(busId) {
    const bus = D().buses.find((b) => b.id === busId) || D().buses[0];
    const route = routeOf(bus.id);
    const b0 = state.buses[bus.id];
    const mapBox = $('#liveMap');
    let mapCtrl = null;

    window.NITER.map.init(mapBox, route, b0, { color: bus.color, showCampus: true }).then((ctrl) => { mapCtrl = ctrl; });

    const refresh = () => {
      const b = state.buses[bus.id];
      const active = b.tripStatus === 'Active';
      $('#liveStatus').textContent = active ? (b.tripStatus === 'Arrived' ? 'Arrived' : 'On Trip') : 'Standby';
      $('#liveStatus').className = `pill ${active ? (b.tripStatus === 'Arrived' ? 'gold' : 'on') : 'off'}`;
      $('#liveTripPill').innerHTML = active
        ? `<span class="pulse-dot"></span> Trip ${b.tripId} · ${esc(b.trafficStatus)}`
        : '<span class="pulse-dot"></span> Waiting for trip…';
      $('#liveCur').textContent = b.currentStop || '—';
      $('#liveNext').textContent = b.nextStop || '—';
      $('#liveDNext').textContent = b.distToNext != null ? b.distToNext + ' km' : '—';
      $('#liveDCampus').textContent = b.distToCampus != null ? b.distToCampus + ' km' : '—';
      $('#liveENext').textContent = b.etaToNext != null ? '~' + b.etaToNext + ' min' : '—';
      $('#liveECampus').textContent = b.etaToCampus != null ? '~' + b.etaToCampus + ' min' : '—';
      $('#liveSpeed').textContent = b.speedKmh ? b.speedKmh + ' km/h' : '—';
      $('#liveTraffic').textContent = b.trafficStatus + (b.delayMinutes > 0 ? ` (${b.delayMinutes} min delay)` : '');
      $('#liveOcc').innerHTML = `${b.occupancyPct}% · ${esc(b.occupancyLabel)}`;
      $('#liveUpd').textContent = b.lastUpdate || '—';

      const stops = $('#liveStops');
      stops.innerHTML = route.stops.map((s, i) => {
        let cls = '';
        if (i < b.stopIdx) cls = 'passed';
        if (i === b.stopIdx && active) cls = 'current';
        return `<li class="${cls}"><span class="dot"></span>${esc(s)}${i === route.stops.length - 1 ? ' <span class="chip chip-cat" style="margin-left:4px">Campus</span>' : ''}</li>`;
      }).join('');

      if (mapCtrl && active) mapCtrl.update(b);
    };
    refresh();
    if (liveHandler) window.removeEventListener('niter:transport', liveHandler);
    liveHandler = refresh;
    window.addEventListener('niter:transport', liveHandler);

    const another = $('#trackAnother');
    another && another.addEventListener('click', () => {
      const session = getSession();
      if (session) openBusSelect(session);
    });
  }

  /* ---------------- boot / api ---------------- */
  window.NITER.transport = {
    getState, getBus, startTrip, endTrip, reportEmergency, clearEmergency,
    getSession, setSession, clearSession, startVerifyFlow,
    setLocalSim, applyRemote,
  };
  window.NITER.renderTransportPage = pageHTML;
  window.NITER.afterTransportPage = afterPage;
  window.NITER.renderTransportLive = liveHTML;
  window.NITER.afterTransportLive = afterLive;
})();
