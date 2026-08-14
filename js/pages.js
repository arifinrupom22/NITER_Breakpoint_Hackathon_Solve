/* ============================================================================
   NITER Smart Campus — secondary pages (About, Academics, Departments,
   Admissions, Research, Notices, News & Events, Campus Life, Student Services).
   Each page is a pure function returning HTML injected into #view.
   ============================================================================ */
(function () {
  'use strict';
  const { $, $$, esc, icon, openModal } = window.NITER.ui;
  const D = () => window.NITER_DATA;

  const shell = (crumbs, title, sub, body) => `
    <section class="page-hero">
      <div class="container">
        <p class="crumbs">${crumbs}</p>
        <h1>${title}</h1>
        <p>${sub}</p>
      </div>
    </section>
    <section class="section"><div class="container">${body}</div></section>`;

  const PAGES = {

    about: () => shell('Home / About NITER', 'About NITER', 'The National Institute of Textile Engineering and Research is committed to excellence in engineering education, research, innovation, and the development of skilled professionals for the textile and technology sectors.', `
      <div class="prose">
        <p>The National Institute of Textile Engineering and Research (NITER) stands at the crossroads of tradition and technology — training engineers who lead in textiles, computing, electronics, fashion and industrial systems. Established as a centre of engineering excellence, NITER blends rigorous academics with hands-on laboratory work, research and strong industry partnerships.</p>
      </div>
      <div class="about-values" id="pvAboutValues"></div>
      <div class="counters" id="pvCounters" style="margin-top:28px"></div>`),

    academics: () => shell('Home / Academics', 'Academics', 'B.Sc. engineering programs, a modern course catalogue and a structured academic calendar across five departments.', `
      <div class="info-grid">
        <div class="info-card"><span class="q-icon">${icon('i-grad')}</span><h4>Undergraduate Programs</h4><p>Four-year B.Sc. Engineering programs in CSE, EEE, Textile, Fashion &amp; IPE with outcome-based curricula.</p></div>
        <div class="info-card"><span class="q-icon">${icon('i-cal')}</span><h4>Academic Calendar</h4><p>Two semesters per year with a structured calendar of classes, exams, labs and holidays.</p></div>
        <div class="info-card"><span class="q-icon">${icon('i-file')}</span><h4>Class Routine</h4><p>Department and batch-wise routines with theory sections, lab sections and room allocation.</p></div>
      </div>
      <h3 style="font-size:19px;font-weight:700;margin:28px 0 12px">Sample Course Catalogue (CSE-23 · Semester 2-2)</h3>
      <div class="table-wrap"><table class="table">
        <thead><tr><th>Code</th><th>Course</th><th>Credit</th><th>Type</th><th>Dept</th></tr></thead>
        <tbody>${D().courses.map((c) => `<tr><td><b>${esc(c.code)}</b></td><td>${esc(c.name)}</td><td>${c.credit}</td><td><span class="chip chip-cat">${esc(c.type)}</span></td><td>${esc(c.dept)}</td></tr>`).join('')}</tbody>
      </table></div>
      <h3 style="font-size:19px;font-weight:700;margin:28px 0 12px">Sample Weekly Routine (CSE 2-1 · Group A1)</h3>
      <div class="table-wrap"><table class="table">
        <thead><tr><th>Day</th><th>Course</th><th>Teacher</th><th>Room</th><th>Time</th><th>Section</th></tr></thead>
        <tbody>${(D().routineGroups.A1 || []).map((r) => `<tr><td>${esc(r.day)}</td><td><b>${esc(r.code)}</b></td><td>${esc((D().teachers.find((t) => t.id === r.teacher) || {}).name || r.teacher)}</td><td>${esc(r.room)}</td><td>${esc(r.start)} – ${esc(r.end)}</td><td>${esc(r.kind === 'Lab' ? r.group : r.section)}</td></tr>`).join('')}</tbody>
      </table></div>`),

    departments: () => shell('Home / Departments', 'Academic Departments', 'Five departments, one mission — engineering excellence, innovation and industry-ready graduates.', `
      <div class="dept-grid" style="grid-template-columns:repeat(2,1fr)">
        ${D().departments.map((d) => `
          <article class="dept-card">
            <div class="dept-banner"><span class="dept-tag">${esc(d.code)}</span><span class="dept-icon">${icon(d.icon)}</span></div>
            <div class="dept-body">
              <h3>${esc(d.name)}</h3><p>${esc(d.desc)}</p>
              <a class="dept-more" href="#/academics">View Programs ${icon('i-arrow')}</a>
            </div>
          </article>`).join('')}
      </div>`),

    admissions: () => shell('Home / Admissions', 'Admissions 2026-27', 'Online application for the 2026-27 academic session is open for all five departments.', `
      <div class="prose"><p>Admission to NITER is competitive and merit-based. The following steps guide every applicant from application to enrollment.</p></div>
      <ol class="flow-list" style="margin:20px 0 30px">
        <li><span><strong>Apply Online</strong><span>Submit the online application form and upload required documents before the deadline.</span></span></li>
        <li><span><strong>Admission Test</strong><span>Appear for the written admission test covering Mathematics, Physics and English.</span></span></li>
        <li><span><strong>Viva &amp; Verification</strong><span>Shortlisted candidates attend an oral examination with document verification.</span></span></li>
        <li><span><strong>Merit List &amp; Enrollment</strong><span>Selected candidates complete fee payment and enroll to secure their seat.</span></span></li>
      </ol>
      <div class="info-grid">
        <div class="info-card"><span class="q-icon">${icon('i-file')}</span><h4>Eligibility</h4><p>HSC / A-Level with Mathematics and Physics. Minimum GPA requirements apply per department.</p></div>
        <div class="info-card"><span class="q-icon">${icon('i-cal')}</span><h4>Important Dates</h4><p>Application opens 2 Aug 2026. Written test and viva scheduled in September 2026.</p></div>
        <div class="info-card"><span class="q-icon">${icon('i-mail')}</span><h4>Contact Admissions</h4><p>admissions@niter.edu.bd · +880 2-7791094 · Nayarhat, Savar</p></div>
      </div>
      <div class="center mt-32"><a class="btn btn-primary" href="#/login/student">Apply for 2026-27 ${icon('i-arrow')}</a></div>`),

    research: () => shell('Home / Research', 'Research & Innovation', 'Modern laboratories and funded projects advancing textile and technology research.', `
      <div class="info-grid">
        <div class="info-card"><span class="q-icon">${icon('i-lab')}</span><h4>Smart Textiles</h4><p>Research into conductive fabrics, wearables and sustainable textile materials.</p></div>
        <div class="info-card"><span class="q-icon">${icon('i-flash')}</span><h4>AI &amp; Computing</h4><p>Machine learning applied to transport, manufacturing and campus intelligence.</p></div>
        <div class="info-card"><span class="q-icon">${icon('i-gear')}</span><h4>Industrial Systems</h4><p>Process optimization, quality engineering and production automation.</p></div>
        <div class="info-card"><span class="q-icon">${icon('i-users')}</span><h4>Industry Collaboration</h4><p>Joint research and internship MoUs with leading textile and technology partners.</p></div>
      </div>
      <h3 style="font-size:19px;font-weight:700;margin:28px 0 12px">Modern Laboratories</h3>
      <div class="info-grid">
        ${D().rooms.filter((r) => r.type.includes('Lab')).map((r) => `<div class="info-card"><span class="q-icon">${icon('i-flask')}</span><h4>${esc(r.no)} — ${esc(r.type)}</h4><p>Floor ${esc(r.floor)} · Capacity ${r.capacity} · <span class="pill ${r.status === 'Available' ? 'on' : r.status === 'Maintenance' ? 'warn' : 'off'}">${esc(r.status)}</span></p></div>`).join('')}
      </div>`),

    notices: () => shell('Home / Notices', 'Notice Board', 'Official notices, exam schedules and announcements from NITER administration.', `
      <div class="toolbar wrap">
        <input id="noticeSearch" class="input" style="max-width:360px" placeholder="Search notices by title or keyword…" />
        <select id="noticeCat" class="select" style="max-width:190px">
          <option value="">All Categories</option>
          ${['Academic', 'Examination', 'Administrative', 'Scholarship', 'Events', 'General', 'Transport', 'Admission', 'Lab'].map((c) => `<option>${c}</option>`).join('')}
        </select>
        <select id="noticeSort" class="select" style="max-width:170px">
          <option value="new">Newest First</option>
          <option value="old">Oldest First</option>
          <option value="az">Title A–Z</option>
        </select>
        <button class="btn btn-outline btn-sm" id="noticeDl">${icon('i-dl')} Export Notices</button>
      </div>
      <div class="notices-grid" id="allNotices"></div>
      <div class="center mt-24"><button class="btn btn-outline btn-sm" id="noticeMore">Load More ${icon('i-chev')}</button></div>`),

    'news-events': () => shell('Home / News &amp; Events', 'News & Events', 'The latest from the NITER campus community.', `
      <div class="news-events-grid">
        <div><h3 class="col-head">LATEST NEWS</h3><div id="allNews"></div></div>
        <div><h3 class="col-head">ALL EVENTS</h3><div id="allEvents"></div></div>
      </div>`),

    'campus-life': () => shell('Home / Campus Life', 'Life at NITER', 'A vibrant campus — academics, clubs, culture and sport.', `
      <div class="gallery-grid" id="lifeGallery"></div>
      <div class="info-grid mt-32">
        <div class="info-card"><span class="q-icon">${icon('i-star')}</span><h4>Student Clubs</h4><p>Programming, robotics, cultural and debate clubs with 10+ active societies.</p></div>
        <div class="info-card"><span class="q-icon">${icon('i-play')}</span><h4>Cultural Programs</h4><p>Annual festivals, cultural nights and creative showcases.</p></div>
        <div class="info-card"><span class="q-icon">${icon('i-target')}</span><h4>Sports</h4><p>Inter-department tournaments in cricket, football, badminton and table tennis.</p></div>
      </div>`),

    'student-services': () => shell('Home / Student Services', 'Student Services', 'Support services designed around the student journey — academic, personal and professional.', `
      <div class="services-grid" style="grid-template-columns:repeat(3,1fr)">
        ${D().services.map((s) => `
          <div class="service-card"><span class="q-icon">${icon(s.icon)}</span><h3>${esc(s.title)}</h3><p>${esc(s.desc)}</p></div>`).join('')}
      </div>
      <div class="demo-note mt-32">${icon('i-heart')}<span>Students can raise questions, request teacher meetings and track their support tickets inside the <b>Student Portal → Helping Zone</b>.</span></div>`),

    /* ====================================================================
       QUICK ACCESS PAGES
       ==================================================================== */
    'academic-calendar': () => `
      <section class="page-hero"><div class="container">
        <p class="crumbs">Home / Academic Calendar</p>
        <h1>Academic Calendar</h1>
        <p>Semester schedules, exam dates, holidays, and important academic deadlines for all four academic years.</p>
      </div></section>
      <section class="section"><div class="container">
        <button class="btn btn-outline btn-sm" id="calBackTop">${icon('i-arrow')} Back</button>
        <h3 style="font-size:19px;font-weight:700;margin:22px 0 12px">Select Academic Year</h3>
        <div class="cal-years" id="calYears"></div>
        <div id="calSem"></div>
        <div id="calDetail"></div>
      </div></section>`,

    'class-routine': () => `
      <section class="page-hero"><div class="container">
        <p class="crumbs">Home / Class Routine</p>
        <h1>Class Routine</h1>
        <p>Daily and weekly class schedules for every department, batch, and section.</p>
      </div></section>
      <section class="section"><div class="container" style="max-width:760px">
        <div class="access-gate">
          <span class="q-icon" style="width:72px;height:72px;border-radius:18px;background:var(--ink-50);color:var(--niter-600);margin:0 auto 16px">${icon('i-file')}</span>
          <h2>Class Routine is available inside the Student Portal</h2>
          <p>Please log in to the Student Portal to view your personalized class routine. Your routine will be displayed based on your department, batch, semester, and section.</p>
          <a class="btn btn-primary" href="#/login/student">Go to Student Portal ${icon('i-arrow')}</a>
        </div>
      </div></section>`,

    courses: () => `
      <section class="page-hero"><div class="container">
        <p class="crumbs">Home / Course Information</p>
        <h1>Course Information</h1>
        <p>Course catalog with credits, types, and assigned faculty for each program.</p>
      </div></section>
      <section class="section"><div class="container">
        <div id="courseRoot"></div>
      </div></section>`,

    rooms: () => `
      <section class="page-hero"><div class="container">
        <p class="crumbs">Home / Room Availability</p>
        <h1>Room Availability</h1>
        <p>Find vacant theory rooms and laboratories to make classroom rescheduling easier.</p>
      </div></section>
      <section class="section"><div class="container">
        <div class="panel">
          <h3>Check Availability</h3>
          <div class="form-row">
            <div class="field"><label class="label">Day</label><select id="roomDay" class="select">${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => `<option>${d}</option>`).join('')}</select></div>
            <div class="field"><label class="label">Time Slot</label><select id="roomTime" class="select">
              <option>8:00 AM - 9:15 AM</option><option>9:15 AM - 10:30 AM</option><option>10:30 AM - 11:45 AM</option><option>11:45 AM - 1:00 PM</option><option>1:30 PM - 4:00 PM</option><option>4:00 PM - 6:00 PM</option>
            </select></div>
            <div class="field"><label class="label">Room Type</label><select id="roomType" class="select"><option value="">All Types</option><option>Theory Room</option><option>Laboratory</option></select></div>
            <div class="field"><label class="label">Search</label><input id="roomSearch" class="input" placeholder="Room no / building…" /></div>
          </div>
        </div>
        <div class="room-stats" id="roomStats"></div>
        <div class="table-wrap"><table class="table">
          <thead><tr><th>Room</th><th>Type</th><th>Building</th><th>Capacity</th><th>Status</th><th>Class / Course</th><th>Time</th></tr></thead>
          <tbody id="roomBody"></tbody>
        </table></div>
      </div></section>`,

    'helping-zone': () => `
      <section class="page-hero"><div class="container">
        <p class="crumbs">Home / Student Helping Zone</p>
        <h1>Student Helping Zone</h1>
        <p>Submit academic questions, requests, and get support from faculty.</p>
      </div></section>
      <section class="section"><div class="container" style="max-width:760px">
        <div class="access-gate">
          <span class="q-icon" style="width:72px;height:72px;border-radius:18px;background:var(--ink-50);color:var(--niter-600);margin:0 auto 16px">${icon('i-heart')}</span>
          <h2>The Helping Zone is available inside the NITER Portal</h2>
          <p>Please log in to the NITER Portal to access the Student Helping Zone. After logging in, you can submit academic questions, request assistance, and receive support from faculty members and relevant departments.</p>
          <a class="btn btn-primary" href="#/login/student">Log in to NITER Portal ${icon('i-arrow')}</a>
        </div>
      </div></section>`,
  };

  let noticePage = 1;
  const NOTICE_PER_PAGE = 6;
  function renderNoticesPage() {
    const box = $('#allNotices');
    if (!box) return;
    noticePage = 1;
    const state = { q: '', cat: '', sort: 'new', shown: NOTICE_PER_PAGE };
    const filtered = () => {
      let list = D().notices.filter((n) => {
        const q = state.q.toLowerCase();
        const matchQ = !q || n.title.toLowerCase().includes(q) || n.summary.toLowerCase().includes(q) || n.body.toLowerCase().includes(q);
        const matchC = !state.cat || n.cat === state.cat;
        return matchQ && matchC;
      });
      if (state.sort === 'new') list = list.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
      else if (state.sort === 'old') list = list.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
      else list = list.slice().sort((a, b) => a.title.localeCompare(b.title));
      return list;
    };
    const draw = () => {
      const list = filtered();
      const slice = list.slice(0, state.shown);
      box.innerHTML = slice.map((n) => `
          <article class="notice-card reveal in">
            <div class="notice-meta"><span class="chip chip-cat">${esc(n.cat)}</span>${n.badge ? `<span class="chip ${n.badge === 'IMPORTANT' ? 'chip-imp' : 'chip-new'}">${n.badge}</span>` : ''}</div>
            <span class="notice-date">${icon('i-cal')} ${esc(n.date)}</span>
            <h3>${esc(n.title)}</h3><p>${esc(n.summary)}</p>
            <div class="notice-actions">
              <button class="notice-more" data-id="${n.id}">View Details ${icon('i-arrow')}</button>
              ${n.attachment ? `<button class="notice-dl" data-dl="${n.id}">${icon('i-dl')} ${esc(n.attachment)}</button>` : ''}
            </div>
          </article>`).join('') || '<div class="empty-state">No notices match your search.</div>';
      const more = $('#noticeMore');
      if (more) more.hidden = state.shown >= list.length;
      $$('[data-id]', box).forEach((b) => b.addEventListener('click', () => {
        const n = D().notices.find((x) => x.id === +b.dataset.id);
        openModal(`<span class="chip chip-cat">${esc(n.cat)}</span> <span class="notice-date">${icon('i-cal')} ${esc(n.date)}</span><h3 style="font-size:18px;margin:10px 0 8px">${esc(n.title)}</h3><p style="color:var(--ink-600);font-size:14px;line-height:1.7">${esc(n.body)}</p>`, { title: 'Notice' });
      }));
      $$('[data-dl]', box).forEach((b) => b.addEventListener('click', () => {
        const n = D().notices.find((x) => x.id === +b.dataset.dl);
        const blob = new Blob([`NITER NOTICE\n============\nTitle: ${n.title}\nCategory: ${n.cat}\nDate: ${n.date}\n\n${n.body}\n\n-- NITER Smart Campus Management System`], { type: 'text/plain' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = n.attachment || ('notice-' + n.id + '.txt');
        a.click();
      }));
    };
    draw();
    const input = $('#noticeSearch');
    if (input) input.addEventListener('input', () => { state.q = input.value; state.shown = NOTICE_PER_PAGE; draw(); });
    const cat = $('#noticeCat');
    if (cat) cat.addEventListener('change', () => { state.cat = cat.value; state.shown = NOTICE_PER_PAGE; draw(); });
    const sort = $('#noticeSort');
    if (sort) sort.addEventListener('change', () => { state.sort = sort.value; draw(); });
    const more = $('#noticeMore');
    if (more) more.addEventListener('click', () => { state.shown += NOTICE_PER_PAGE; draw(); });
    const dl = $('#noticeDl');
    if (dl) dl.addEventListener('click', () => {
      const text = filtered().map((n) => `[${n.cat}] ${n.date} — ${n.title}\n${n.summary}\n`).join('\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' })); a.download = 'niter-notices.txt';
      a.click();
    });
  }

  function renderNewsEventsPage() {
    const news = $('#allNews');
    if (news) news.innerHTML = D().news.map((n) => `
      <div class="news-item"><img src="${esc(n.img)}" alt="" class="news-thumb" /><div>
        <span class="news-date">${esc(n.date)}</span><span class="news-tag">${esc(n.tag)}</span>
        <h4>${esc(n.title)}</h4><p>${esc(n.summary)}</p></div></div>`).join('');
    const ev = $('#allEvents');
    if (ev) ev.innerHTML = D().events.map((e) => `
      <div class="ev-row"><div class="ev-date"><strong>${esc(e.day)}</strong><span>${esc(e.mon)}</span></div>
        <div><h4>${esc(e.title)}</h4><p>${icon('i-clock')} ${esc(e.time)} · ${icon('i-pin')} ${esc(e.loc)}</p><p><span class="chip chip-cat">${esc(e.cat)}</span></p></div></div>`).join('');
  }

  function renderAboutPage() {
    const v = $('#pvAboutValues');
    if (v) v.innerHTML = D().aboutValues.map((x) => `
      <div class="value-chip"><span class="q-icon">${icon(x.icon)}</span><span><strong>${esc(x.title)}</strong><span>${esc(x.text)}</span></span></div>`).join('');
    const c = $('#pvCounters');
    if (c) c.innerHTML = D().counters.map((x) => `
      <div class="counter"><strong class="counter-num" data-target="${x.value}" data-suffix="${esc(x.suffix)}">0</strong><span>${esc(x.label)}</span></div>`).join('');
    window.NITER.ui.initCounters(c);
  }

  function renderCampusLifePage() {
    const grid = $('#lifeGallery');
    if (!grid) return;
    grid.innerHTML = D().gallery.map((g) => `
      <div class="gallery-item"><img src="${esc(g.img)}" alt="${esc(g.cat)}" loading="lazy" />
        <div class="gallery-overlay"><strong>${esc(g.cat)}</strong><span>${g.count} moments</span></div></div>`).join('');
    $$('.gallery-item', grid).forEach((el) => el.addEventListener('click', () => {
      openModal(`<img src="${esc(el.querySelector('img').src)}" alt="" style="width:100%;border-radius:12px" />`, { title: 'Campus Life', wide: true });
    }));
  }

  /* ====================================================================
     ACADEMIC CALENDAR
     ==================================================================== */
  const calState = { year: null, sem: null };
  function renderAcademicCalendarPage() {
    const back = $('#calBackTop');
    if (back) back.addEventListener('click', () => { if (history.length > 1) history.back(); else window.location.hash = '#/'; });
    drawCalYears(); drawCalSems(); drawCalDetail();
  }
  function drawCalYears() {
    const box = $('#calYears'); if (!box) return;
    box.innerHTML = D().academicCalendar.map((y) => `
      <button class="cal-year ${calState.year === y.year ? 'active' : ''}" data-y="${y.year}">
        <strong>${esc(y.label)}</strong><span>Session ${esc(y.session)}</span>
      </button>`).join('');
    $$('.cal-year', box).forEach((b) => b.addEventListener('click', () => { calState.year = +b.dataset.y; calState.sem = null; drawCalYears(); drawCalSems(); drawCalDetail(); }));
  }
  function drawCalSems() {
    const box = $('#calSem'); if (!box) return;
    const y = D().academicCalendar.find((x) => x.year === calState.year);
    if (!y) { box.innerHTML = ''; return; }
    box.innerHTML = `
      <p class="crumbs" style="margin:20px 0 8px">Home / Academic Calendar / ${esc(y.label)}</p>
      <h3 style="font-size:17px;font-weight:700;margin-bottom:10px">Select Semester</h3>
      <div class="cal-sems">${y.semesters.map((s) => `
        <button class="cal-sem ${calState.sem === s.n ? 'active' : ''}" data-s="${s.n}">
          <span class="q-icon">${icon('i-cal')}</span><strong>${esc(s.label)}</strong><span>${esc(s.heldIn)}</span>
        </button>`).join('')}</div>`;
    $$('.cal-sem', box).forEach((b) => b.addEventListener('click', () => { calState.sem = +b.dataset.s; drawCalSems(); drawCalDetail(); }));
  }
  function drawCalDetail() {
    const box = $('#calDetail'); if (!box) return;
    const y = D().academicCalendar.find((x) => x.year === calState.year);
    const s = y && y.semesters.find((x) => x.n === calState.sem);
    if (!s) { box.innerHTML = ''; return; }
    const parts = String(s.items[0].date).split(' ');
    box.innerHTML = `
      <p class="crumbs" style="margin:20px 0 8px">Home / Academic Calendar / ${esc(y.label)} / ${esc(s.label)}</p>
      <div class="panel">
        <h3>${esc(y.label)} — ${esc(s.label)} <span class="chip chip-cat" style="margin-left:6px">${esc(s.heldIn)}</span></h3>
        <div class="cal-timeline">${s.items.map((it) => `
          <div class="cal-item">
            <div class="cal-date"><strong>${esc(String(it.date).split(' ')[0])}</strong><span>${esc(String(it.date).split(' ').slice(1).join(' '))}</span></div>
            <div class="cal-body"><span class="chip chip-cat">${esc(it.cat)}</span><h4>${esc(it.title)}</h4><p>${esc(it.note)}</p></div>
          </div>`).join('')}</div>
      </div>
      <button class="btn btn-outline btn-sm mt-16" id="calBackSem">${icon('i-arrow')} Back to Semesters</button>`;
    const backSem = $('#calBackSem');
    if (backSem) backSem.addEventListener('click', () => { calState.sem = null; drawCalSems(); drawCalDetail(); });
    void parts;
  }

  /* ====================================================================
     COURSE INFORMATION
     ==================================================================== */
  function renderCoursesPage() {
    const root = $('#courseRoot'); if (!root) return;
    let dept = null;
    const draw = () => {
      if (!dept) {
        root.innerHTML = `
          <p class="crumbs">Home / Course Information</p>
          <h3 style="font-size:19px;font-weight:700;margin:4px 0 14px">Select a Department</h3>
          <div class="dept-grid" style="grid-template-columns:repeat(2,1fr)">
            ${D().departments.map((d) => `
              <article class="dept-card">
                <div class="dept-banner"><span class="dept-tag">${esc(d.code)}</span><span class="dept-icon">${icon(d.icon)}</span></div>
                <div class="dept-body">
                  <h3>${esc(d.name)}</h3><p>${esc(d.desc)}</p>
                  <button class="dept-more" data-dept="${esc(d.code)}">View Courses ${icon('i-arrow')}</button>
                </div>
              </article>`).join('')}
          </div>`;
        $$('[data-dept]', root).forEach((b) => b.addEventListener('click', () => { dept = b.dataset.dept; draw(); }));
        return;
      }
      const d = D().departments.find((x) => x.code === dept);
      const list = D().courses.filter((c) => c.dept === dept);
      root.innerHTML = `
        <p class="crumbs">Home / Course Information / ${esc(d ? d.name : dept)}</p>
        <button class="btn btn-outline btn-sm" id="courseBack">${icon('i-arrow')} All Departments</button>
        <h3 style="font-size:19px;font-weight:700;margin:16px 0 6px">${esc(d ? d.name : dept)} — Courses</h3>
        <div class="form-row" style="max-width:640px">
          <div class="field"><label class="label">Academic Year</label><select id="cfYear" class="select"><option>2nd Year (2024-2025)</option></select></div>
          <div class="field"><label class="label">Semester</label><select id="cfSem" class="select"><option>Level 2 Term 1</option></select></div>
          <div class="field"><label class="label">Course Type</label><select id="cfType" class="select"><option>All</option><option>Theory</option><option>Lab</option></select></div>
        </div>
        <div class="table-wrap"><table class="table">
          <thead><tr><th>Course Code</th><th>Course Title</th><th>Credit</th><th>Course Type</th><th>Semester</th><th>Assigned Faculty</th></tr></thead>
          <tbody id="courseBody"></tbody>
        </table></div>`;
      const drawRows = () => {
        const t = $('#cfType').value;
        const body = $('#courseBody');
        body.innerHTML = list.filter((c) => t === 'All' || c.type === t).map((c) => {
          const tc = D().teachers.find((x) => x.id === c.teacher);
          return `<tr><td><b>${esc(c.code)}</b></td><td>${esc(c.name)}</td><td>${c.credit}</td><td><span class="chip chip-cat">${esc(c.type)}</span></td><td>Level 2 · Term 1</td><td>${esc(tc ? tc.name : '—')}</td></tr>`;
        }).join('') || '<tr><td colspan="6"><div class="empty-state">No courses published for this department yet.</div></td></tr>';
      };
      drawRows();
      $('#cfType').addEventListener('change', drawRows);
      $('#courseBack').addEventListener('click', () => { dept = null; draw(); });
    };
    draw();
  }

  /* ====================================================================
     ROOM AVAILABILITY (derived from the class routine database)
     ==================================================================== */
  function teacherName(id) { const t = D().teachers.find((x) => x.id === id); return t ? t.name : id; }
  function renderRoomsPage() {
    const body = $('#roomBody'); if (!body) return;
    const draw = () => {
      const day = $('#roomDay').value;
      const time = $('#roomTime').value;
      const slotStart = time.split(' - ')[0];
      const type = $('#roomType').value;
      const q = ($('#roomSearch').value || '').toLowerCase();
      const occupied = new Map();
      Object.keys(D().routineGroups).forEach((g) => {
        D().routineGroups[g].forEach((e) => {
          if (e.day !== day || e.start !== slotStart) return;
          if (!occupied.has(e.room)) occupied.set(e.room, { code: e.code, title: e.title, teacher: e.teacher, time: e.start + ' - ' + e.end });
        });
      });
      const rows = D().rooms.filter((r) => {
        if (type && r.category !== type) return false;
        if (q && !(r.no.toLowerCase().includes(q) || r.building.toLowerCase().includes(q) || r.type.toLowerCase().includes(q))) return false;
        return true;
      }).map((r) => {
        const occ = occupied.get(r.no);
        const free = !occ;
        return `<tr>
          <td><b>${esc(r.no)}</b></td><td>${esc(r.type)}</td><td>${esc(r.building)}</td><td>${r.capacity}</td>
          <td><span class="pill ${free ? 'on' : 'danger'}">${free ? 'Available' : 'Occupied'}</span></td>
          <td>${occ ? `<b>${esc(occ.code)}</b> — ${esc(occ.title)}<br/><span style="font-size:11px;color:var(--ink-500)">${esc(teacherName(occ.teacher))}</span>` : '<span style="color:var(--ink-300)">Free period</span>'}</td>
          <td>${occ ? esc(occ.time) : esc(time)}</td>
        </tr>`;
      }).join('');
      body.innerHTML = rows || '<tr><td colspan="7"><div class="empty-state">No rooms match your filters.</div></td></tr>';
      const stats = $('#roomStats');
      if (stats) {
        const freeCount = D().rooms.filter((r) => !occupied.has(r.no)).length;
        stats.innerHTML = `
          <div class="tp-stat"><strong>${freeCount}</strong><span>Available Rooms</span></div>
          <div class="tp-stat"><strong>${D().rooms.length - freeCount}</strong><span>Occupied Rooms</span></div>
          <div class="tp-stat"><strong>${esc(day)}</strong><span>Day</span></div>
          <div class="tp-stat"><strong>${esc(time)}</strong><span>Selected Time</span></div>`;
      }
    };
    draw();
    ['roomDay', 'roomTime', 'roomType', 'roomSearch'].forEach((id) => {
      const el = $('#' + id);
      if (el) el.addEventListener(id === 'roomSearch' ? 'input' : 'change', draw);
    });
  }

  /* ---------------- boot ---------------- */
  window.NITER.pages = {
    get(name) {
      if (PAGES[name]) return PAGES[name]();
      return shell('Home', 'Page Not Found', 'The page you requested does not exist.', '<div class="empty-state">Please use the navigation above.</div>');
    },
    after(name) {
      if (name === 'notices') renderNoticesPage();
      if (name === 'news-events') renderNewsEventsPage();
      if (name === 'about') renderAboutPage();
      if (name === 'campus-life') renderCampusLifePage();
      if (name === 'academic-calendar') renderAcademicCalendarPage();
      if (name === 'courses') renderCoursesPage();
      if (name === 'rooms') renderRoomsPage();
      window.NITER.ui.initReveal();
    },
  };
})();
