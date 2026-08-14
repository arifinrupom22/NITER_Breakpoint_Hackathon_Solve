/* ============================================================================
   NITER Smart Campus — app bootstrap & hash router.
   Routes:
     #/                         home (static sections in index.html)
     #/about #/academics ...    secondary pages (js/pages.js)
     #/transport                Smart Transport (js/transport.js)
     #/transport/live?bus=SB1   live tracking
     #/driver                   driver console (js/driver.js)
     #/login/:role              portal login (js/auth.js)
     #/portal/:role             portal dashboards (js/portals.js)
   ============================================================================ */
(function () {
  'use strict';
  const { $, $$, esc } = window.NITER.ui;
  const D = () => window.NITER_DATA;

  function parseHash() {
    const raw = (location.hash || '#/').replace(/^#/, '');
    const [pathPart, queryPart] = raw.split('?');
    const path = pathPart || '/';
    const params = {};
    (queryPart || '').split('&').forEach((kv) => { const [k, v] = kv.split('='); if (k) params[k] = decodeURIComponent(v || ''); });
    return { path, params };
  }

  const HOME_SECTIONS = ['homeView'];

  function showView(html) {
    const view = $('#view');
    const home = $('#homeView');
    if (html == null) { // home
      home.hidden = false; home.style.display = '';
      view.hidden = true;
      document.body.dataset.page = 'home';
    } else {
      home.hidden = true; home.style.display = 'none';
      view.hidden = false;
      view.innerHTML = html;
      document.body.dataset.page = 'view';
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }

  function setActiveNav(path) {
    $$('#navList a').forEach((a) => {
      const target = (a.dataset.goto || '').replace('#', '') || '/';
      let active = false;
      if (target === '/') active = path === '/' || path === '';
      else if (target === '/transport') active = path.startsWith('/transport');
      else if (target.startsWith('/login') || target.startsWith('/portal')) active = path.startsWith('/portal') || path.startsWith('/login');
      else active = path === target;
      a.classList.toggle('active', active);
    });
  }

  function route() {
    const { path, params } = parseHash();

    if (path === '/' || path === '') { showView(null); setActiveNav('/'); return; }

    if (path === '/transport') { showView(window.NITER.renderTransportPage()); window.NITER.afterTransportPage(); setActiveNav('/transport'); return; }
    if (path === '/transport/live') {
      const busId = params.bus || 'SB1';
      const session = window.NITER.transport.getSession();
      const bus = D().buses.find((b) => b.id === busId);
      if (!bus) { showView(window.NITER.pages.get('x')); return; }
      if (!session || !session.eligible || !session.eligible.includes(busId)) {
        // not verified for this bus → show denial + verify
        showView(`
          <section class="page-hero"><div class="container">
            <p class="crumbs">Home / Smart Transport</p><h1>Access Required</h1>
            <p>Live transport tracking is available only to authorized NITER students and teachers.</p>
          </div></section>
          <section class="section"><div class="container" style="max-width:520px">
            <div class="panel center">
              <span class="q-icon" style="width:64px;height:64px;border-radius:16px;background:#fef2f2;color:var(--red-600);margin:0 auto 14px">${window.NITER.ui.icon('i-shield')}</span>
              <h3 style="font-size:17px;font-weight:700">Unauthorized Access</h3>
              <p style="color:var(--ink-500);font-size:14px;margin:8px 0 18px">Live transport tracking is available only to authorized NITER students and teachers. Verify your identity to continue.</p>
              <button class="btn btn-primary" id="gotoVerify">${window.NITER.ui.icon('i-lock')} Verify Identity</button>
            </div>
          </div></section>`);
        $('#gotoVerify').addEventListener('click', () => window.NITER.transport.startVerifyFlow());
        setActiveNav('/transport');
        return;
      }
      showView(window.NITER.renderTransportLive(busId));
      window.NITER.afterTransportLive(busId);
      setActiveNav('/transport');
      return;
    }
    if (path === '/driver') {
      const drv = window.NITER.driverSession();
      if (drv) { showView(window.NITER.renderDriverDash(drv)); window.NITER.bindDriverDash(drv); }
      else { showView(window.NITER.renderDriverLogin()); window.NITER.afterDriverLogin(); }
      setActiveNav('/transport');
      return;
    }
    const loginMatch = path.match(/^\/login\/(\w+)$/);
    if (loginMatch) {
      const role = loginMatch[1];
      const user = window.NITER.auth.currentUser();
      if (user && user.role === role) { location.hash = role === 'student' ? '#/portal/student' : role === 'teacher' ? '#/portal/teacher' : '#/portal/admin'; return; }
      showView(window.NITER.renderLogin(role));
      window.NITER.afterLogin(role);
      setActiveNav('/portal');
      return;
    }
    const portalMatch = path.match(/^\/portal\/(\w+)$/);
    if (portalMatch) {
      const role = portalMatch[1];
      const user = window.NITER.auth.currentUser();
      if (!user || user.role !== role) { location.hash = '#/login/' + role; return; }
      showView(
        role === 'student' ? window.NITER.renderStudentPortal(user)
        : role === 'teacher' ? window.NITER.renderTeacherPortal(user)
        : window.NITER.renderAdminPortal(user)
      );
      setActiveNav('/portal');
      return;
    }

    // secondary pages
    if (window.NITER.pages && window.NITER.pages.get(path.slice(1))) {
      showView(window.NITER.pages.get(path.slice(1)));
      window.NITER.pages.after(path.slice(1));
      setActiveNav(path);
      return;
    }

    showView(window.NITER.pages.get('nf'));
  }
  window.NITER.route = route; // allow re-render without hashchange (e.g. driver login on same hash)

  /* ---------------- init ---------------- */
  function init() {
    window.NITER.initUI();
    window.NITER.initHome();
    window.addEventListener('hashchange', route);
    // smooth-scroll anchors & data-goto handled natively by hash
    route();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
