/* ============================================================================
   NITER Smart Campus — Driver Console (web, phone-framed).
   Mirrors the NITER Transport mobile app flow: login → assigned bus →
   START TRIP → shared simulation moves the bus for every client → END TRIP.
   ============================================================================ */
(function () {
  'use strict';
  const { $, $$, esc, icon, toast } = window.NITER.ui;
  const D = () => window.NITER_DATA;
  const SESSION_KEY = 'niter.driverSession';

  function getDriverSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (e) { return null; } }
  function setDriverSession(d) { localStorage.setItem(SESSION_KEY, JSON.stringify(d)); }

  /* ---------------- login ---------------- */
  function loginHTML() {
    return `
    <section class="page-hero"><div class="container">
      <p class="crumbs">Home / Driver Console</p>
      <h1>NITER Transport — Driver Console</h1>
      <p>Login with your driver account to start and manage your assigned bus trip.</p>
      <div class="tp-badges"><span class="mode-badge">${icon('i-signal')} DEMO SIMULATION</span><span class="tp-badge">${icon('i-phone')} Web version of the NITER Transport app</span></div>
    </div></section>
    <section class="section">
      <div class="container">
        <div class="driver-screen">
          <div class="driver-top">
            <div><h3>NITER Transport</h3><span>Driver Application</span></div>
            <span class="driver-gps">${icon('i-lock')} Secure login</span>
          </div>
          <div class="driver-body">
            <div class="driver-big">
              <span class="q-icon">${icon('i-user')}</span>
              <h4>Driver Login</h4>
              <p>Enter your driver credentials to access your assigned bus.</p>
            </div>
            <div class="login-cred" style="margin-top:14px">Demo drivers (password: <code>driver123</code>)<br/>
              <b>Md. Karim</b> — <code>DRV1</code> · Student Bus 1<br/>
              <b>Abdul Latif</b> — <code>DRV2</code> · Student Bus 2<br/>
              <b>Shafiqul Islam</b> — <code>DRV3</code> · Teacher Bus 1<br/>
              <b>Jahangir Alam</b> — <code>DRV4</code> · Teacher Bus 2</div>
            <form id="driverForm">
              <div class="field"><label class="label">Driver ID</label><input id="dId" class="input" required placeholder="e.g. DRV1" /></div>
              <div class="field"><label class="label">Password</label><input id="dPass" class="input" type="password" required placeholder="••••••••" /></div>
              <button class="btn btn-primary" style="width:100%" type="submit">${icon('i-lock')} Driver Login</button>
            </form>
          </div>
        </div>
        <p class="hint center mt-16">The Driver Console drives the SAME shared bus state as the website map and the admin dashboard.</p>
      </div>
    </section>`;
  }

  function afterLoginPage() {
    $('#driverForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const id = $('#dId').value.trim().toUpperCase();
      const pass = $('#dPass').value.trim();
      const drv = D().drivers.find((x) => x.id === id && x.pass === pass);
      if (!drv) return toast('Invalid driver credentials. Use DRV1–DRV4 with password driver123.', 'error');
      setDriverSession(drv);
      toast(`Welcome, ${drv.name}!`, 'success');
      if (window.NITER.route) window.NITER.route(); else location.hash = '#/driver';
    });
  }

  /* ---------------- dashboard ---------------- */
  function dashHTML(drv) {
    return `
    <section class="page-hero"><div class="container">
      <p class="crumbs">Home / Driver Console / Dashboard</p>
      <h1>Driver Dashboard</h1>
      <p>${esc(drv.name)} · ${esc(drv.id)} · Assigned: ${esc(drv.busName)}</p>
      <div class="tp-badges"><span class="mode-badge">${icon('i-signal')} DEMO SIMULATION</span></div>
    </div></section>
    <section class="section">
      <div class="container">
        <div class="driver-screen">
          <div class="driver-top">
            <div><h3>${esc(drv.busName)}</h3><span>${esc(drv.routeName)}</span></div>
            <div style="display:flex;align-items:center;gap:8px">
              <span class="driver-gps" id="drvGps">${icon('i-signal')} GPS off</span>
              <button class="driver-logout" id="drvLogout" title="Logout" aria-label="Logout driver">${icon('i-logout')}</button>
            </div>
          </div>
          <div class="driver-body">
            <div class="driver-big">
              <span class="q-icon" style="background:linear-gradient(135deg,var(--gold-500),var(--gold-400));color:var(--ink-900)">${icon('i-bus')}</span>
              <h4 id="drvTripTitle">Trip not started</h4>
              <p id="drvTripSub">Tap Start Trip to begin GPS sharing</p>
            </div>
            <div class="driver-actions">
              <button class="btn btn-primary" id="drvStart">${icon('i-play')} Start Trip</button>
              <button class="btn btn-danger" id="drvEnd" disabled>${icon('i-close')} End Trip</button>
            </div>
            <button class="btn btn-outline" style="width:100%;margin-top:10px;border-color:#fecaca;color:var(--red-600)" id="drvSos">${icon('i-siren')} Emergency SOS</button>
            <button class="btn btn-outline" style="width:100%;margin-top:10px;color:var(--red-600)" id="drvLogoutTxt">${icon('i-logout')} Logout</button>
            <div class="driver-stat-grid" id="drvStats"></div>
            <h3 style="font-size:13px;font-weight:700;margin-top:16px;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-400)">Route Progress</h3>
            <ul class="trip-timeline" id="drvStops"></ul>
          </div>
        </div>
        <div class="demo-note mt-16" style="max-width:420px;margin:16px auto 0">${icon('i-signal')}<span>This is a simulated trip — bus movement, ETA, traffic and occupancy update live on the website map and the admin dashboard as the trip runs.</span></div>
      </div>
    </section>`;
  }

  function bindDashboard(drv) {
    const T = window.NITER.transport;
    const busId = drv.busId;
    const route = D().routes.find((r) => r.busId === busId);
    const btnStart = $('#drvStart'), btnEnd = $('#drvEnd');

    function refresh() {
      const b = T.getBus(busId);
      const active = b.tripStatus === 'Active' || b.tripStatus === 'Arrived';
      $('#drvGps').innerHTML = active ? `${icon('i-signal')} GPS ON` : `${icon('i-signal')} GPS off`;
      $('#drvGps').className = 'driver-gps' + (active ? ' mode-badge gps' : '');
      if (active) {
        $('#drvTripTitle').textContent = b.tripId + ' · ' + (b.tripStatus === 'Arrived' ? 'ARRIVED at campus' : 'IN TRANSIT');
        $('#drvTripSub').textContent = `Current stop: ${b.currentStop} → next ${b.nextStop}`;
        btnStart.disabled = true; btnEnd.disabled = false;
      } else {
        $('#drvTripTitle').textContent = 'Trip not started';
        $('#drvTripSub').textContent = 'Tap Start Trip to begin GPS sharing';
        btnStart.disabled = false; btnEnd.disabled = true;
      }
      $('#drvStats').innerHTML = `
        <div class="ds-card"><strong>${b.passengers}</strong><span>Passengers</span></div>
        <div class="ds-card"><strong>${b.occupancyPct}%</strong><span>Occupancy</span></div>
        <div class="ds-card"><strong>${b.speedKmh ? b.speedKmh + ' km/h' : '0'}</strong><span>Speed</span></div>
        <div class="ds-card"><strong>${b.etaToCampus != null ? '~' + b.etaToCampus + 'm' : '—'}</strong><span>ETA Campus</span></div>`;
      const stops = $('#drvStops');
      stops.innerHTML = route.stops.map((s, i) => {
        let cls = '';
        if (i < b.stopIdx) cls = 'done';
        if (i === b.stopIdx && active) cls = 'now';
        if (i === route.stops.length - 1 && b.tripStatus === 'Arrived') cls = 'done';
        return `<li class="${cls}"><span class="dot"></span>${esc(s)}${i === route.stops.length - 1 ? ' · Campus' : ''}</li>`;
      }).join('');
    }

    btnStart.addEventListener('click', () => {
      const r = T.startTrip(busId, drv.name);
      if (r.error) return toast(r.error, 'error');
      refresh();
    });
    btnEnd.addEventListener('click', () => {
      const r = T.endTrip(busId);
      if (r.error) return toast(r.error, 'error');
      refresh();
    });
    $('#drvSos').addEventListener('click', () => {
      T.reportEmergency(busId, 'Emergency SOS');
    });
    const doLogout = () => {
      if (window.__drvRefresh) { window.removeEventListener('niter:transport', window.__drvRefresh); window.__drvRefresh = null; }
      localStorage.removeItem(SESSION_KEY);
      toast('Logged out of Driver Console', 'warn');
      window.NITER.route();
    };
    $('#drvLogout') && $('#drvLogout').addEventListener('click', doLogout);
    $('#drvLogoutTxt') && $('#drvLogoutTxt').addEventListener('click', doLogout);
    refresh();
    if (window.__drvRefresh) window.removeEventListener('niter:transport', window.__drvRefresh);
    window.__drvRefresh = refresh;
    window.addEventListener('niter:transport', window.__drvRefresh);
  }

  /* ---------------- boot ---------------- */
  window.NITER.renderDriverLogin = loginHTML;
  window.NITER.afterDriverLogin = afterLoginPage;
  window.NITER.renderDriverDash = dashHTML;
  window.NITER.bindDriverDash = bindDashboard;
  window.NITER.driverSession = getDriverSession;
})();
