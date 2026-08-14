/* ============================================================================
   NITER Smart Campus — UI core: helpers, live clock, modals, toasts, nav,
   reveal-on-scroll animations, counters, notifications, back-to-top.
   ============================================================================ */
window.NITER = window.NITER || {};

(function () {
  'use strict';
  const D = () => window.NITER_DATA;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const icon = (name, cls) => `<svg class="ic ${cls || ''}"><use href="#${name}"/></svg>`;

  /* ---------------- live clock ---------------- */
  function startClock() {
    const tEl = $('#live-time'), dEl = $('#live-date');
    if (!tEl) return;
    const pad = (n) => String(n).padStart(2, '0');
    function tick() {
      const n = new Date();
      tEl.textContent = `${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`;
      dEl.textContent = n.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    }
    tick(); setInterval(tick, 1000);
  }

  /* ---------------- toast ---------------- */
  function toast(msg, type) {
    const root = $('#toastRoot');
    if (!root) return;
    const t = document.createElement('div');
    t.className = `toast ${type || ''}`;
    t.innerHTML = `${icon(type === 'success' ? 'i-check' : type === 'error' ? 'i-alert' : 'i-bell')}<span>${esc(msg)}</span>`;
    root.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(8px)'; t.style.transition = 'all .3s'; setTimeout(() => t.remove(), 320); }, 3600);
  }

  /* ---------------- modal ---------------- */
  function openModal(html, opts) {
    const root = $('#modalRoot');
    opts = opts || {};
    root.innerHTML = `
      <div class="modal-backdrop" data-close></div>
      <div class="modal-box ${opts.wide ? 'wide' : ''}" role="dialog" aria-modal="true">
        <div class="modal-head">
          <h3>${opts.title || ''}</h3>
          <button class="modal-close" data-close aria-label="Close">${icon('i-close')}</button>
        </div>
        <div class="modal-body">${html}</div>
      </div>`;
    root.hidden = false;
    root.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', () => { closeModal(); document.removeEventListener('keydown', onKey); }));
    const onKey = (e) => { if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', onKey); } };
    document.addEventListener('keydown', onKey);
    const first = root.querySelector('input,button:not(.modal-close),select');
    if (first) setTimeout(() => first.focus(), 60);
  }
  function closeModal() { const r = $('#modalRoot'); if (r) { r.hidden = true; r.innerHTML = ''; } }

  /* ---------------- reveal on scroll ---------------- */
  function initReveal() {
    const els = $$('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    els.forEach((e) => io.observe(e));
  }

  /* ---------------- animated counters ---------------- */
  function animateCount(el, target, suffix) {
    const dur = 1400, t0 = performance.now();
    function frame(t) {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString() + (suffix || '');
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  function initCounters(root) {
    $$('.counter-num', root).forEach((el) => {
      const target = +el.dataset.target, suffix = el.dataset.suffix || '';
      if (!('IntersectionObserver' in window)) { el.textContent = target.toLocaleString() + suffix; return; }
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) { animateCount(el, target, suffix); io.unobserve(en.target); } });
      }, { threshold: 0.4 });
      io.observe(el);
    });
  }

  /* ---------------- navigation ---------------- */
  function initNav() {
    const menuBtn = $('#menuBtn'), navList = $('#navList');
    if (menuBtn && navList) menuBtn.addEventListener('click', () => navList.classList.toggle('open'));

    const portalBtn = $('#portalBtn'), dd = $('#portalDropdown');
    if (portalBtn) {
      const parent = portalBtn.closest('li');
      portalBtn.addEventListener('click', (e) => { e.stopPropagation(); parent.classList.toggle('open'); });
      document.addEventListener('click', (e) => { if (!parent.contains(e.target)) parent.classList.remove('open'); });
    }
    // close mobile menu on link click
    navList && $$('a', navList).forEach((a) => a.addEventListener('click', () => navList.classList.remove('open')));

    // sticky header shadow on scroll
    const header = $('#siteHeader');
    window.addEventListener('scroll', () => {
      if (header) header.style.boxShadow = window.scrollY > 8 ? '0 1px 0 var(--ink-100), 0 12px 28px -18px rgb(11 26 56 / .45)' : '0 1px 0 var(--ink-100), 0 8px 24px -20px rgb(11 26 56 / .3)';
      const toTop = $('#toTop');
      if (toTop) toTop.style.opacity = window.scrollY > 400 ? '1' : '0';
    });
    const toTop = $('#toTop');
    if (toTop) { toTop.style.opacity = '0'; toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' })); }

    // Topbar quick links + search
    $$('.toplink').forEach((b) => b.addEventListener('click', () => openSearch()));
    $('#topSearchBtn') && $('#topSearchBtn').addEventListener('click', openSearch);
    $('#headerSearchBtn') && $('#headerSearchBtn').addEventListener('click', openSearch);
  }

  /* ---------------- search modal ---------------- */
  function openSearch() {
    const pages = [
      { t: 'Home', p: '#/', d: 'University homepage' },
      { t: 'About NITER', p: '#/about', d: 'Mission, vision, history' },
      { t: 'Academics', p: '#/academics', d: 'Programs, courses, calendar' },
      { t: 'Departments', p: '#/departments', d: 'Five academic departments' },
      { t: 'Admissions', p: '#/admissions', d: 'Admission information' },
      { t: 'Research', p: '#/research', d: 'Research & innovation' },
      { t: 'Notices', p: '#/notices', d: 'Official notice board' },
      { t: 'News & Events', p: '#/news-events', d: 'Latest campus news and events' },
      { t: 'Campus Life', p: '#/campus-life', d: 'Gallery, clubs, culture' },
      { t: 'Student Services', p: '#/student-services', d: 'Support services' },
      { t: 'Smart Transport', p: '#/transport', d: 'Live bus tracking & routes' },
      { t: 'Student Portal', p: '#/login/student', d: 'Courses, routine, results' },
      { t: 'Teacher Portal', p: '#/login/teacher', d: 'Attendance, marks, routine' },
      { t: 'Admin Portal', p: '#/login/admin', d: 'Manage the campus system' },
      { t: 'Driver Console', p: '#/driver', d: 'Start / end bus trips' },
    ];
    openModal(`
      <div class="field">
        <input id="searchInput" class="input" placeholder="Search pages… e.g. transport, notices, routine" />
      </div>
      <div id="searchResults" style="display:flex;flex-direction:column;gap:6px"></div>`, { title: 'Search NITER' });
    const input = $('#searchInput'), results = $('#searchResults');
    function render(q) {
      const f = (q || '').toLowerCase();
      const hits = pages.filter((p) => !f || p.t.toLowerCase().includes(f) || p.d.toLowerCase().includes(f));
      results.innerHTML = hits.map((p) => `
        <a href="${p.p}" style="display:flex;justify-content:space-between;align-items:center;padding:10px 14px;border:1px solid var(--ink-100);border-radius:10px;transition:all .2s" onmouseover="this.style.borderColor='#93c5fd'" onmouseout="this.style.borderColor='var(--ink-100)'">
          <span><strong style="font-size:14px">${esc(p.t)}</strong><br/><span style="font-size:12px;color:var(--ink-500)">${esc(p.d)}</span></span>
          ${icon('i-arrow')}
        </a>`).join('') || '<div class="empty-state">No results found</div>';
    }
    render('');
    input.addEventListener('input', () => render(input.value));
  }

  /* ---------------- notification panel ---------------- */
  function initNotif() {
    const btn = $('#notifBtn'), panel = $('#notifPanel'), close = $('#notifClose');
    if (!btn) return;
    btn.addEventListener('click', (e) => { e.stopPropagation(); panel.hidden = !panel.hidden; });
    close && close.addEventListener('click', () => { panel.hidden = true; });
    document.addEventListener('click', (e) => { if (!panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) panel.hidden = true; });
    const body = $('#notifBody');
    body.innerHTML = D().notifications.map((n) => `
      <div class="notif-item"><strong>${esc(n.title)}</strong><span>${esc(n.body)}</span><span class="n-time">${esc(n.time)}</span></div>`).join('');
  }

  /* ---------------- chatbot ---------------- */
  function initChatbot() {
    const fab = $('#chatFab'), box = $('#chatbot'), close = $('#chatClose'), body = $('#chatBody'), form = $('#chatForm'), text = $('#chatText');
    if (!fab) return;
    fab.addEventListener('click', () => { box.hidden = !box.hidden; if (!box.hidden) { body.scrollTop = body.scrollHeight; text.focus(); } });
    close.addEventListener('click', () => { box.hidden = true; });
    const sugg = ['Where is my bus?', 'When does Student Bus 1 arrive?', 'Today\u2019s bus schedule', 'Which bus should I take?', 'Best time to leave?'];
    const suggBar = document.createElement('div');
    suggBar.className = 'chat-sugg';
    suggBar.innerHTML = sugg.map((s) => `<button type="button">${esc(s)}</button>`).join('');
    box.insertBefore(suggBar, form);
    suggBar.addEventListener('click', (e) => { if (e.target.tagName === 'BUTTON') ask(e.target.textContent); });

    function say(msg, isUser) {
      const d = document.createElement('div');
      d.className = 'chat-msg ' + (isUser ? 'user' : 'bot');
      d.innerHTML = msg;
      body.appendChild(d);
      body.scrollTop = body.scrollHeight;
    }
    function ask(q) {
      say(esc(q), true);
      const D2 = window.NITER_DATA;
      const state = window.NITER.transport ? window.NITER.transport.getState() : null;
      const ql = q.toLowerCase();
      let ans = '';
      if (ql.includes('where') || ql.includes('location') || ql.includes('my bus')) {
        const active = state && state.buses ? Object.values(state.buses).filter((b) => b.tripStatus === 'Active') : [];
        ans = active.length
          ? active.map((b) => `<b>${esc(b.busName)}</b> is on the ${esc(b.routeName)} — near <b>${esc(b.currentStop)}</b>, ETA to campus <b>${b.etaToCampus != null ? b.etaToCampus + ' min' : 'N/A'}</b>.`).join('<br/>')
          : 'No bus trip is currently active. You can <b>start a trip from the Driver Console</b> (see the SMART TRANSPORT page) and the live location will appear here instantly.';
      } else if (ql.includes('schedule') || ql.includes('depart')) {
        ans = D2.buses.map((b) => `<b>${esc(b.name)}</b> — ${esc(b.departure)} · ${esc(b.routeName)}`).join('<br/>');
      } else if (ql.includes('which bus')) {
        ans = 'If you are a student, take <b>Student Bus 1</b> (Khamarbari Route, 6:40 AM) or <b>Student Bus 2</b> (Uttara Route, 6:30 AM). Teachers use <b>Teacher Bus 1</b> (Mirpur, 6:45 AM) or <b>Teacher Bus 2</b> (Shyamoli, 6:45 AM).';
      } else if (ql.includes('crowd') || ql.includes('crowded') || ql.includes('full')) {
        const b = state && state.buses ? Object.values(state.buses).find((x) => x.tripStatus === 'Active') : null;
        ans = b ? `<b>${esc(b.busName)}</b> occupancy: <b>${b.occupancyPct}%</b> (${esc(b.occupancyLabel)}).` : 'No active trip right now. Occupancy updates live once a driver starts a trip.';
      } else if (ql.includes('delay') || ql.includes('late')) {
        const b = state && state.buses ? Object.values(state.buses).find((x) => x.tripStatus === 'Active') : null;
        ans = b ? `<b>${esc(b.busName)}</b>: ${esc(b.trafficStatus)} (${b.delayMinutes > 0 ? '~' + b.delayMinutes + ' min delay' : 'on time'}).` : 'No active trip. When a trip runs, traffic status and delay are shown live.';
      } else if (ql.includes('best time') || ql.includes('leave')) {
        ans = 'For the morning trip, leave your stop about <b>10 minutes before the scheduled departure</b>. AI suggests 6:20–6:35 AM for Student Bus 1 to avoid the Gabtoli rush.';
      } else if (ql.includes('report') || ql.includes('problem') || ql.includes('complain')) {
        ans = 'You can report transport issues from the Student Portal → Helping Zone, or use the Emergency SOS inside the Driver Console for urgent situations.';
      } else if (ql.includes('qr') || ql.includes('pass')) {
        ans = 'Authorized students get a <b>Digital Smart Bus Pass</b> with a QR code (BUS06, BUS26, BUS32). Scan it at boarding for automatic attendance and payment.';
      } else if (ql.includes('hello') || ql.includes('hi')) {
        ans = 'Hello! I am the <b>NITER Transport Assistant</b>. Ask me about bus locations, schedules, delays, crowds, QR passes, or how to report a problem.';
      } else {
        ans = 'I can help with: <b>where my bus is</b>, <b>schedule</b>, <b>which bus to take</b>, <b>crowd levels</b>, <b>delays</b>, <b>best time to leave</b>, <b>QR bus pass</b>, or <b>reporting a problem</b>.';
      }
      setTimeout(() => say(ans), 420);
    }
    form.addEventListener('submit', (e) => { e.preventDefault(); const v = text.value.trim(); if (v) { text.value = ''; ask(v); } });
    say('Hello! I am the <b>NITER Transport Assistant</b>. Ask me anything about the campus buses — schedules, locations, delays or crowds.');
  }

  /* ---------------- public API ---------------- */
  window.NITER.ui = { $, $$, esc, icon, toast, openModal, closeModal, initReveal, initCounters, animateCount };
  window.NITER.initUI = function () { startClock(); initNav(); initNotif(); initChatbot(); };
})();
