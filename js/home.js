/* ============================================================================
   NITER Smart Campus — home page: hero slider + dynamic section rendering.
   ============================================================================ */
(function () {
  'use strict';
  const { $, $$, esc, icon } = window.NITER.ui;
  const D = () => window.NITER_DATA;

  /* ---------------- hero slider ---------------- */
  function initHero() {
    const slides = $$('.hero-slide');
    const dotsWrap = $('#heroDots');
    if (!slides.length) return;
    let cur = 0, timer = null;
    dotsWrap.innerHTML = slides.map((_, i) => `<button data-i="${i}" aria-label="Slide ${i + 1}"></button>`).join('');
    const dots = $$('button', dotsWrap);
    function go(i, dir) {
      const old = slides[cur];
      old.classList.remove('active');
      slides[i].classList.add('active');
      cur = i;
      dots.forEach((d, k) => d.classList.toggle('active', k === cur));
      if (dir) restart();
    }
    function next() { go((cur + 1) % slides.length, true); }
    function prev() { go((cur - 1 + slides.length) % slides.length, true); }
    function restart() { clearInterval(timer); timer = setInterval(next, 6000); }
    $('#heroNext') && $('#heroNext').addEventListener('click', next);
    $('#heroPrev') && $('#heroPrev').addEventListener('click', prev);
    dots.forEach((d) => d.addEventListener('click', () => go(+d.dataset.i, true)));
    go(0);
    document.addEventListener('visibilitychange', () => {
      clearInterval(timer);
      if (!document.hidden) timer = setInterval(next, 6000);
    });
  }

  /* ---------------- notices ---------------- */
  function renderNotices() {
    const grid = $('#noticesGrid');
    if (!grid) return;
    grid.innerHTML = D().notices.map((n) => `
      <article class="notice-card reveal">
        <div class="notice-meta">
          <span class="chip chip-cat">${esc(n.cat)}</span>
          ${n.badge ? `<span class="chip ${n.badge === 'IMPORTANT' ? 'chip-imp' : 'chip-new'}">${n.badge}</span>` : ''}
        </div>
        <span class="notice-date">${icon('i-cal')} ${esc(n.date)}</span>
        <h3>${esc(n.title)}</h3>
        <p>${esc(n.summary)}</p>
        <button class="notice-more" data-notice="${n.id}">Read More ${icon('i-arrow')}</button>
      </article>`).join('');
    $$('[data-notice]', grid).forEach((b) => b.addEventListener('click', () => {
      const n = D().notices.find((x) => x.id === +b.dataset.notice);
      window.NITER.ui.openModal(`
        <span class="chip chip-cat">${esc(n.cat)}</span> <span class="notice-date">${icon('i-cal')} ${esc(n.date)}</span>
        <h3 style="font-size:18px;font-weight:700;margin:10px 0 8px">${esc(n.title)}</h3>
        <p style="color:var(--ink-600);font-size:14px;line-height:1.7">${esc(n.body)}</p>`, { title: 'Notice' });
    }));
  }

  /* ---------------- news + events (home) ---------------- */
  function renderNews() {
    const list = $('#newsList');
    if (!list) return;
    list.innerHTML = D().news.map((n) => `
      <div class="news-item reveal">
        <img src="${esc(n.img)}" alt="" class="news-thumb" />
        <div>
          <span class="news-date">${esc(n.date)}</span><span class="news-tag">${esc(n.tag)}</span>
          <h4>${esc(n.title)}</h4>
          <p>${esc(n.summary)}</p>
        </div>
      </div>`).join('');
  }
  function renderHomeEvents() {
    const list = $('#homeEventsList');
    if (!list) return;
    list.innerHTML = D().events.slice(0, 4).map((e) => `
      <div class="ev-row reveal">
        <div class="ev-date"><strong>${esc(e.day)}</strong><span>${esc(e.mon)}</span></div>
        <div>
          <h4>${esc(e.title)}</h4>
          <p>${icon('i-clock')} ${esc(e.time)} · ${icon('i-pin')} ${esc(e.loc)}</p>
          <p><span class="chip chip-cat">${esc(e.cat)}</span></p>
        </div>
      </div>`).join('');
  }

  /* ---------------- about values + counters ---------------- */
  function renderAbout() {
    const v = $('#aboutValues');
    if (v) v.innerHTML = D().aboutValues.map((x) => `
      <div class="value-chip reveal">
        <span class="q-icon">${icon(x.icon)}</span>
        <span><strong>${esc(x.title)}</strong><span>${esc(x.text)}</span></span>
      </div>`).join('');
    const c = $('#aboutCounters');
    if (c) c.innerHTML = D().counters.map((x) => `
      <div class="counter"><strong class="counter-num" data-target="${x.value}" data-suffix="${esc(x.suffix)}">0</strong><span>${esc(x.label)}</span></div>`).join('');
    window.NITER.ui.initCounters(c);
  }

  /* ---------------- departments ---------------- */
  function renderDepartments() {
    const grid = $('#deptGrid');
    if (!grid) return;
    const palette = ['#2563eb', '#0d9488', '#c9a227', '#7c3aed', '#dc2626'];
    grid.innerHTML = D().departments.map((d, i) => `
      <article class="dept-card reveal">
        <div class="dept-banner" style="background:linear-gradient(135deg, #0b1a38, ${palette[i % palette.length]}cc)">
          <span class="dept-tag">${esc(d.code)}</span>
          <span class="dept-icon">${icon(d.icon)}</span>
        </div>
        <div class="dept-body">
          <h3>${esc(d.name)}</h3>
          <p>${esc(d.desc)}</p>
          <a class="dept-more" href="#/departments">Explore Department ${icon('i-arrow')}</a>
        </div>
      </article>`).join('');
  }

  /* ---------------- campus stats ---------------- */
  function renderStats() {
    const grid = $('#statsGrid');
    if (!grid) return;
    grid.innerHTML = D().stats.map((s) => `
      <div class="stat-card reveal">
        <span class="q-icon">${icon(s.icon)}</span>
        <strong class="counter-num" data-target="${s.value}" data-suffix="${esc(s.suffix)}">0</strong>
        <span>${esc(s.label)}</span>
      </div>`).join('');
    window.NITER.ui.initCounters(grid);
  }

  /* ---------------- upcoming events (full cards) ---------------- */
  function renderUpcoming() {
    const grid = $('#eventsGrid');
    if (!grid) return;
    grid.innerHTML = D().events.map((e) => `
      <article class="event-card reveal">
        <div class="event-top">
          <div class="ev-date"><strong>${esc(e.day)}</strong><span>${esc(e.mon)}</span></div>
          <div><h3>${esc(e.title)}</h3><span class="chip chip-cat">${esc(e.cat)}</span></div>
        </div>
        <div class="ev-extra">${icon('i-clock')} ${esc(e.time)}</div>
        <div class="ev-extra">${icon('i-pin')} ${esc(e.loc)}</div>
        <p class="desc">${esc(e.desc)}</p>
        <div class="event-foot">
          <span class="event-reg ${e.reg === 'Registration Open' ? 'open' : 'soon'}">${esc(e.reg)}</span>
          <button class="btn btn-outline btn-sm" data-event="${e.id}">Details</button>
        </div>
      </article>`).join('');
    $$('[data-event]', grid).forEach((b) => b.addEventListener('click', () => {
      const e = D().events.find((x) => x.id === +b.dataset.event);
      window.NITER.ui.openModal(`<p style="color:var(--ink-600)">${esc(e.desc)}</p><p style="margin-top:10px;color:var(--ink-500)">${icon('i-clock')} ${esc(e.time)} &nbsp; ${icon('i-pin')} ${esc(e.loc)}</p>`, { title: esc(e.title) });
    }));
  }

  /* ---------------- gallery ---------------- */
  function renderGallery() {
    const grid = $('#galleryGrid');
    if (!grid) return;
    grid.innerHTML = D().gallery.map((g, i) => `
      <div class="gallery-item reveal" data-img="${esc(g.img)}" data-title="${esc(g.cat)}">
        <img src="${esc(g.img)}" alt="${esc(g.cat)}" loading="lazy" />
        <div class="gallery-overlay"><strong>${esc(g.cat)}</strong><span>${g.count} moments</span></div>
      </div>`).join('');
    $$('.gallery-item', grid).forEach((el) => el.addEventListener('click', () => {
      window.NITER.ui.openModal(`
        <img src="${esc(el.dataset.img)}" alt="" style="width:100%;border-radius:12px;margin-bottom:12px" />
        <h3 style="font-size:17px;font-weight:700">${esc(el.dataset.title)}</h3>
        <p style="color:var(--ink-500);font-size:13.5px">A glimpse into life at the National Institute of Engineering and Research.</p>`, { title: 'Campus Life', wide: true });
    }));
  }

  /* ---------------- services ---------------- */
  function renderServices() {
    const grid = $('#servicesGrid');
    if (!grid) return;
    grid.innerHTML = D().services.map((s) => `
      <div class="service-card reveal">
        <span class="q-icon">${icon(s.icon)}</span>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.desc)}</p>
      </div>`).join('');
  }

  /* ---------------- boot ---------------- */
  window.NITER.initHome = function () {
    initHero();
    renderNotices(); renderNews(); renderHomeEvents();
    renderAbout(); renderDepartments(); renderStats();
    renderUpcoming(); renderGallery(); renderServices();
    window.NITER.ui.initReveal();
  };
})();
