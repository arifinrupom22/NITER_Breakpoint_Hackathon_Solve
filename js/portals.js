/* ============================================================================
   NITER Smart Campus — Portal dashboards (Student / Teacher / Admin).
   Data is seeded from js/data.js and persisted to localStorage so CRUD
   survives reloads. Fully offline — no backend.
   ============================================================================ */
(function () {
  'use strict';
  const { $, $$, esc, icon, toast, openModal, closeModal } = window.NITER.ui;
  const D = () => window.NITER_DATA;

  /* ---------------- localStorage-backed collections ---------------- */
  function col(key, seed) {
    let data = null;
    try { data = JSON.parse(localStorage.getItem(key)); } catch (e) { data = null; }
    if (data == null) { data = JSON.parse(JSON.stringify(seed == null ? [] : seed)); save(); }
    function save() { try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) {} }
    return {
      all: () => data,
      add(item) { data.unshift(item); save(); return item; },
      update(id, patch) { const i = data.findIndex((x) => x.id === id); if (i >= 0) { data[i] = Object.assign({}, data[i], patch); save(); return data[i]; } return null; },
      remove(id) { data = data.filter((x) => x.id !== id); save(); },
      save,
    };
  }
  const studentsCol = col('niter2.students', D().students);
  const teachersCol = col('niter2.teachers', D().teachers);
  const coursesCol = col('niter2.courses', D().courses);
  const roomsCol = col('niter2.rooms', D().rooms);
  const noticesCol = col('niter2.notices', D().notices);
  const helpCol = col('niter2.help', D().helpingZone);
  const tripsCol = col('niter2.trips', []);
  const attendanceStore = col('niter2.attendance', D().attendance);
  const resultsStore = col('niter2.results', D().results);
  const profileStore = col('niter2.profiles', {});

  /* Attendance percentage must never exceed 100 — clamp any legacy data. */
  Object.keys(attendanceStore.all()).forEach(function (code) {
    Object.keys(attendanceStore.all()[code] || {}).forEach(function (sid) {
      const r = attendanceStore.all()[code][sid];
      if (r && r.present > r.total) r.present = r.total;
    });
  });
  attendanceStore.save();

  const attPct = (rec) => (rec && rec.total > 0 ? Math.min(100, (rec.present / rec.total) * 100) : null);
  const attStatus = (p) => (p == null ? ['—', 'off'] : p >= 75 ? ['Collegiate', 'on'] : p >= 60 ? ['Non-Collegiate', 'warn'] : ['Deficit', 'danger']);

  /* ---------------- student profile editing ---------------- */
  const profVal = (prof, key, fallback) => {
    const v = prof ? prof[key] : null;
    return (v != null && v !== '' ? v : fallback);
  };
  const profileEditForm = (user) => {
    const prof = profileStore.all()[user.sub] || {};
    const v = (k, fb) => esc(profVal(prof, k, fb == null ? '' : fb));
    const F = (id, label, val, type, ph) => `<div class="field"><label class="label">${label}</label><input id="${id}" class="input" type="${type || 'text'}" value="${val}" placeholder="${ph || ''}" /></div>`;
    const S = (id, label, val, opts) => `<div class="field"><label class="label">${label}</label><select id="${id}" class="select">${opts.map((o) => `<option ${o === val ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></div>`;
    const row = (cells) => `<div class="form-row">${cells}</div>`;
    const addr = (p, g) => row(F(p + 'Apt', 'Apartment No', v(g + 'Apt')), F(p + 'House', 'House No', v(g + 'House'))) +
      row(F(p + 'Road', 'Road No', v(g + 'Road')), F(p + 'Code', 'Post Code', v(g + 'Code'))) +
      row(F(p + 'Office', 'Post Office', v(g + 'Office')), F(p + 'Station', 'Police Station', v(g + 'Station'))) +
      row(F(p + 'District', 'District', v(g + 'District')), F(p + 'Country', 'Country', v(g + 'Country'))) +
      F(p + 'Details', 'Address Details', v(g + 'Details'));
    const edu = (ex, g) => row(F(g + 'Group', ex + ' — Group / Major', v(g + 'Group')), F(g + 'Inst', ex + ' — Institution', v(g + 'Inst'))) +
      row(S(g + 'Board', ex + ' — Board', v(g + 'Board'), ['Dhaka', 'Comilla', 'Rajshahi', 'Chittagong', 'Barishal', 'Sylhet', 'Jessore', 'Dinajpur', 'Mymensingh']), F(g + 'Result', ex + ' — Result (GPA)', v(g + 'Result'))) +
      row(F(g + 'Dur', ex + ' — Duration', v(g + 'Dur')), F(g + 'Year', ex + ' — Year of Passing', v(g + 'Year'))) +
      F(g + 'Session', ex + ' — Session', v(g + 'Session'));
    return `
      <div class="panel">
        <h3>${icon('i-edit')} Edit Profile — ${esc(user.name)}</h3>
        <div class="form-row">
          <div class="field"><label class="label">Student ID (auto)</label><input class="input" type="text" value="${esc(user.sub)}" disabled /></div>
          ${F('pName', 'Student Name', v('name', user.name))}
        </div>
        <div class="form-row">
          ${S('pGender', 'Gender', v('gender'), ['Male', 'Female', 'Other'])}
          ${S('pMarital', 'Marital Status', v('marital'), ['Single', 'Married'])}
        </div>
        <div class="form-row">
          ${S('pBlood', 'Blood Group', v('blood'), ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])}
          ${S('pReligion', 'Religion', v('religion', 'Islam'), ['Islam', 'Hinduism', 'Christianity', 'Buddhism', 'Others'])}
        </div>
        <div class="form-row">
          ${F('pJob', 'Parents Job', v('job'))}
          ${S('pQuota', 'Quota', v('quota'), ['General', 'SC', 'ST', 'OBC', 'Others'])}
        </div>
        <div class="form-row">
          ${F('pPhone', 'Phone', v('phone', user.phone))}
          ${F('pSms', 'SMS Number', v('sms', user.phone))}
        </div>
        <div class="form-row">
          ${F('pEmail', 'Email', v('email', user.email))}
          ${F('pNat', 'Nationality', v('nationality', 'Bangladeshi'))}
        </div>
        <div class="form-row">
          ${F('pFather', 'Father Name', v('fatherName'))}
          ${F('pFatherPhone', 'Father Phone', v('fatherPhone'))}
        </div>
        <div class="form-row">
          ${F('pMother', 'Mother Name', v('motherName'))}
          ${F('pMotherPhone', 'Mother Phone', v('motherPhone'))}
        </div>
        <div class="form-row">
          ${F('pGuardian', 'Guardian Name', v('guardianName'))}
          ${F('pGuardianPhone', 'Guardian Phone', v('guardianPhone'))}
        </div>
        <div class="form-row">
          ${F('pGuardianEmail', 'Guardian Email', v('guardianEmail'))}
          ${S('pHall', 'Hall Info', v('hall'), ['Select', 'Hall A', 'Hall B', 'Hall C', 'Outside / Day Scholar'])}
        </div>
        <div class="form-row">
          ${F('pBankNo', 'Bank Account No', v('bankNo'))}
          ${F('pBankName', 'Bank Name', v('bankName'))}
        </div>
        <div class="form-row">
          ${F('pBranch', 'Branch Name', v('branch'))}
          ${F('pRouting', 'Routing No', v('routing'))}
        </div>
        <div class="form-row">
          ${F('pNid', 'National Id Card Number', v('nid'))}
          ${F('pBirth', 'Birth Registration', v('birthReg'))}
        </div>
      </div>
      <div class="panel">
        <h3>Permanent Address</h3>
        ${addr('pP', 'perm')}
      </div>
      <div class="panel">
        <h3>Present Address</h3>
        <label style="display:inline-flex;gap:8px;align-items:center;margin-bottom:14px;font-size:13.5px"><input type="checkbox" id="pSame" ${v('sameAsPermanent') === 'on' ? 'checked' : ''} /> Same As Permanent Address</label>
        <div id="presAddr">${addr('pS', 'pres')}</div>
      </div>
      <div class="panel">
        <h3>Education (SSC / HSC / Equivalent)</h3>
        ${edu('SSC', 'ssc')}
        ${edu('HSC', 'hsc')}
      </div>
      <div class="flex wrap gap-12">
        <button class="btn btn-primary btn-sm" id="profileSave">${icon('i-check')} Save Profile</button>
        <button class="btn btn-outline btn-sm" id="profileCancel">${icon('i-close')} Cancel</button>
      </div>`;
  };
  const attCode = (p) => (p == null ? '' : p >= 75 ? 'C' : p >= 60 ? 'NC' : 'D');
  const gradeOf = (t) => (t >= 80 ? ['A+', 4.0] : t >= 75 ? ['A', 4.0] : t >= 70 ? ['A-', 3.75] : t >= 65 ? ['B+', 3.5] : t >= 60 ? ['B', 3.0] : t >= 55 ? ['B-', 2.75] : t >= 50 ? ['C+', 2.5] : t >= 45 ? ['C', 2.25] : ['F', 0]);

  const avatar = (name) => `<span class="dash-ava">${esc((name || '?').split(' ').map((w) => w[0]).slice(0, 2).join(''))}</span>`;

  const teacherOf = (tid) => teachersCol.all().find((t) => t.id === tid);
  const teacherLabel = (tid) => { const t = teacherOf(tid); return t ? `${t.id}_${t.name}` : tid; };

  function dashShell(user, tabs, active, render) {
    return `
    <div class="dash-shell">
      <aside class="dash-side">
        <div class="dash-user">
          ${avatar(user.name)}
          <span><strong>${esc(user.name)}</strong><span>${esc(user.role === 'student' ? 'CSE · Level 2 Term 1 · Sec ' + user.sec + ' · Group ' + user.group : user.role === 'teacher' ? user.designation + ' · ' + user.dept : 'System Administrator')}</span></span>
        </div>
        <nav class="dash-nav">
          ${tabs.map((t) => `<button data-tab="${t.id}" class="${t.id === active ? 'active' : ''}">${icon(t.icon)} ${t.label}</button>`).join('')}
          <button class="dash-logout" id="dashLogout">${icon('i-lock')} Logout</button>
        </nav>
      </aside>
      <main class="dash-main">
        <div class="dash-head">
          <span>${esc(user.sub)} / Logout</span>
          <b>User Role : ${user.role === 'student' ? 'Student' : user.role === 'teacher' ? 'Teacher' : 'Admin'}</b>
        </div>
        <div id="dashBody"></div>
      </main>
    </div>`;
  }

  function bindDash(container, tabs, active, render, setup) {
    const body = $('#dashBody');
    const draw = (id) => {
      $$('.dash-nav button[data-tab]').forEach((b) => b.classList.toggle('active', b.dataset.tab === id));
      body.innerHTML = render(id);
      if (setup) setup(id);
    };
    $$('.dash-nav button[data-tab]').forEach((b) => b.addEventListener('click', () => draw(b.dataset.tab)));
    $('#dashLogout') && $('#dashLogout').addEventListener('click', () => window.NITER.auth.logout());
    draw(active);
  }

  /* ---------------- printable PDF export (print → Save as PDF) ---------------- */
  const PDF_CSS = `body{font-family:Georgia,'Times New Roman',serif;color:#111;margin:32px;line-height:1.5}
    h1{font-size:20px;margin:0 0 2px} h2{font-size:15px;margin:18px 0 8px;border-bottom:2px solid #0b1a38;padding-bottom:4px}
    .sub{font-size:12px;color:#444;margin-bottom:16px}
    table{width:100%;border-collapse:collapse;font-size:11.5px;margin:10px 0}
    th,td{border:1px solid #999;padding:5px 7px;text-align:left} th{background:#eef2f8}
    .brand{display:flex;align-items:center;gap:10px;border-bottom:3px solid #0b1a38;padding-bottom:10px;margin-bottom:16px}
    .brand img{width:46px;height:46px;border-radius:8px}
    .brand b{font-size:16px;display:block} .brand span{font-size:11px;color:#555}
    .sum{display:flex;gap:24px;font-size:12px;margin:8px 0 12px} .sum b{display:block;font-size:16px}
    .foot{margin-top:24px;font-size:11px;color:#666;border-top:1px solid #ccc;padding-top:8px}`;

  function exportPDF(title, bodyHtml) {
    const w = window.open('', '_blank', 'width=920,height=720');
    if (!w) { toast('Popup blocked — please allow popups to download PDFs', 'error'); return; }
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
      <style>${PDF_CSS}</style></head><body>
      <div class="brand">
        <img src="photos/niter_logo.jpg" alt="NITER" />
        <div><b>National Institute of Engineering and Research</b><span>Nayarhat, Savar, Dhaka · Smart Campus Management System</span></div>
      </div>
      <h1>${esc(title)}</h1>
      <div class="sub">Generated ${esc(new Date().toLocaleString())} · NITER Smart Campus</div>
      ${bodyHtml}
      <div class="foot">© 2026 NITER Smart Campus Management System. All Rights Reserved.</div>
      <script>window.addEventListener('load', function(){ window.focus(); setTimeout(function(){ window.print(); }, 250); });<\/script>
      </body></html>`);
    w.document.close();
  }

  /* ---------------- mini QR-ish code for Smart Pass (demo) ---------------- */
  function fakeQR(seed) {
    let h = 2166136261;
    for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
    const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967295; };
    const n = 21, cells = [];
    for (let y = 0; y < n; y++) { for (let x = 0; x < n; x++) { cells.push(rnd() > 0.5 ? 1 : 0); } }
    const eye = (ox, oy) => { for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) { const on = x === 0 || x === 6 || y === 0 || y === 6 || (x > 1 && x < 5 && y > 1 && y < 5); cells[oy * n + ox + y * n + x] = on ? 1 : 0; } };
    eye(0, 0); eye(n - 7, 0); eye(0, n - 7);
    let svg = `<svg viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges">`;
    cells.forEach((v, i) => { if (v) { const x = i % n, y = (i / n) | 0; svg += `<rect x="${x}" y="${y}" width="1" height="1" fill="#0b1a38"/>`; } });
    return svg + '</svg>';
  }

  /* ========================================================================
     STUDENT PORTAL
     ======================================================================== */
  const studentTabs = [
    { id: 'overview', label: 'Overview', icon: 'i-home' },
    { id: 'routine', label: 'Class Routine', icon: 'i-cal' },
    { id: 'attendance', label: 'Attendance', icon: 'i-check' },
    { id: 'bill', label: 'Bill', icon: 'i-card' },
    { id: 'results', label: 'Evaluation', icon: 'i-grad' },
    { id: 'profile', label: 'Student Profile View', icon: 'i-user' },
    { id: 'password', label: 'Change Password', icon: 'i-lock' },
    { id: 'pass', label: 'Smart Bus Pass', icon: 'i-qr' },
    { id: 'help', label: 'Helping Zone', icon: 'i-heart' },
  ];

  function studentRoutineRows(user) {
    return (D().routineGroups[user.group] || []);
  }

  function studentDashboard(user) {
    const att = attendanceStore.all();
    const res = resultsStore.all();
    const routine = studentRoutineRows(user);

    const render = (tab) => {
      if (tab === 'overview') {
        const myAtt = routine.map((r) => r.code).filter((c, i, a) => a.indexOf(c) === i).map((c) => attPct((att[c] || {})[user.sub])).filter((p) => p != null);
        const avg = myAtt.length ? Math.round(myAtt.reduce((a, b) => a + b, 0) / myAtt.length) : 0;
        const st = attStatus(avg);
        const courseCount = routine.map((r) => r.code).filter((c, i, a) => a.indexOf(c) === i).length;
        return `
          <h2>Welcome back, ${esc(user.name.split(' ').map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' '))}!</h2>
          <div class="dash-cards">
            <div class="mini-card"><span class="q-icon">${icon('i-book')}</span><strong>${courseCount}</strong><span>Courses</span></div>
            <div class="mini-card"><span class="q-icon">${icon('i-check')}</span><strong>${avg}%</strong><span>Attendance</span></div>
            <div class="mini-card"><span class="q-icon">${icon('i-grad')}</span><strong>${user.cgpa}</strong><span>CGPA</span></div>
            <div class="mini-card"><span class="q-icon">${icon('i-qr')}</span><strong>${esc(user.card)}</strong><span>Bus Card</span></div>
          </div>
          <div class="panel">
            <h3>Profile Summary</h3>
            <div class="info-grid" style="grid-template-columns:repeat(3,1fr)">
              <div class="info-card"><h4>Student Name</h4><p>${esc(user.name)}</p></div>
              <div class="info-card"><h4>Class ID</h4><p>${esc(user.sub)}</p></div>
              <div class="info-card"><h4>Department</h4><p>${esc(user.deptName || user.dept)}</p></div>
              <div class="info-card"><h4>Level and Term</h4><p>Level ${esc(user.level)} · Term ${esc(user.term)}</p></div>
              <div class="info-card"><h4>Section / Group</h4><p>Section ${esc(user.sec)} · Group ${esc(user.group)}</p></div>
              <div class="info-card"><h4>Attendance Status</h4><p><span class="pill ${st[1]}">${st[0]}</span></p></div>
            </div>
          </div>
          <div class="panel">
            <h3>Quick Links</h3>
            <div class="flex wrap gap-12">
              <button class="btn btn-primary btn-sm" data-goto="#/portal/student" data-qt="routine">${icon('i-cal')} Class Routine</button>
              <button class="btn btn-outline btn-sm" data-goto="#/portal/student" data-qt="attendance">${icon('i-check')} Attendance</button>
              <button class="btn btn-outline btn-sm" data-goto="#/portal/student" data-qt="bill">${icon('i-card')} Bill</button>
              <a class="btn btn-outline btn-sm" href="#/transport/live?bus=SB1">${icon('i-bus')} Track Student Bus 1</a>
            </div>
          </div>`;
      }

      if (tab === 'routine') {
        const heldIn = '2024-2025 Level 2 Term 1 April-September 2026';
        const rows = routine.map((r, i) => {
          const t = teacherOf(r.teacher);
          const secLabel = r.kind === 'Lab' ? r.group : r.section;
          return `<tr>
            <td>${i === 0 || routine[i - 1].code !== r.code ? `<b>${esc(r.code)}</b>` : ''}</td>
            <td>${i === 0 || routine[i - 1].code !== r.code ? esc(r.title) : ''}</td>
            <td>${esc(teacherLabel(r.teacher))}<br/><span style="font-size:11px;color:var(--ink-500)">${esc(t ? t.phone : '')} · ${esc(t ? t.email : '')}</span></td>
            <td>${esc(r.day)}</td><td>${esc(r.room)}</td>
            <td>${esc(r.start)} - ${esc(r.end)}</td><td>${esc(secLabel)}</td></tr>`;
        }).join('');
        return `
          <div class="dash-tool">
            <div><h2>Student Class Routine</h2><p class="hint">Student ID ${esc(user.sub)} · Name: ${esc(user.name)} · Level ${esc(user.level)} · Term ${esc(user.term)}</p></div>
            <button class="btn btn-outline btn-sm" id="pdfRoutine">${icon('i-dl')} Download Routine (PDF)</button>
          </div>
          <div class="panel">
            <div class="field" style="max-width:420px"><label class="label">Choose Semester &amp; Held In</label>
              <select class="select" id="heldInSel"><option>${esc(heldIn)}</option></select></div>
            <div class="table-wrap"><table class="table">
              <thead><tr><th>Course</th><th>Course Title</th><th>Teacher</th><th>Day</th><th>Room</th><th>Time Slot</th><th>Section</th></tr></thead>
              <tbody>${rows}</tbody>
            </table></div>
          </div>`;
      }

      if (tab === 'attendance') {
        const codes = routine.map((r) => r.code).filter((c, i, a) => a.indexOf(c) === i);
        const rows = codes.map((code, si) => {
          const c = coursesCol.all().find((x) => x.code === code);
          const entries = routine.filter((r) => r.code === code);
          const rec = (att[code] || {})[user.sub] || { total: 0, present: 0 };
          const pct = attPct(rec);
          const st = attStatus(pct);
          const secLabel = c.type === 'Lab' ? (entries[0] ? entries[0].group : user.group) : user.sec;
          const sch = (e) => e ? `<div class="sch-cell">Day : ${esc(e.day)}<br/>Time : ${esc(e.start)} - ${esc(e.end)}<br/>Room : ${esc(e.room)}<br/>Teacher : ${esc(e.teacher)}</div>` : `<div class="sch-cell" style="color:var(--ink-300)">Day : <br/>Time : <br/>Room : <br/>Teacher :</div>`;
          return `<tr>
            <td>${si + 1}</td>
            <td><b>Course Code : ${esc(code)}</b><br/>Title : ${esc(c ? c.name : '')}<br/>Credit : ${c ? c.credit.toFixed(2) : ''}<br/>Section : ${esc(secLabel)}</td>
            <td>${sch(entries[0])}</td><td>${sch(entries[1])}</td>
            <td>Total Class : ${rec.total}<br/>Attendance Percentage : ${pct == null ? '0.00' : pct.toFixed(2)}<br/>Attendance Status : ${st[0]}<br/>Status Code : ${attCode(pct)}</td>
          </tr>`;
        }).join('');
        return `
          <div class="dash-tool">
            <div><h2>Student Class Attendance Dashboard</h2><p class="hint">Student ID ${esc(user.sub)} · ${esc('2024-2025 Level 2 Term 1 April-September 2026')}</p></div>
            <button class="btn btn-outline btn-sm" id="pdfAtt">${icon('i-dl')} Download Attendance (PDF)</button>
          </div>
          <div class="table-wrap"><table class="table">
            <thead><tr><th>SL</th><th>Course Information</th><th>Schedule One</th><th>Schedule Two</th><th>Attendance Information</th></tr></thead>
            <tbody>${rows}</tbody>
          </table></div>`;
      }

      if (tab === 'bill') {
        const rows = (D().bills[user.sub] || []).map((b, i) => {
          const paid = b.paid > 0;
          return `<tr>
            <td>${esc(b.term)}</td><td>${b.ref}</td><td>${b.bill.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td><td>${esc(b.date)}</td>
            <td>${b.paid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td><td>${esc(b.type)}</td>
            <td>${esc(b.payDate || '')}</td><td>${esc(b.collDate || '')}</td><td>${esc(b.remark)}</td>
            <td><span class="pill ${paid ? 'on' : 'danger'}">${paid ? 'Paid' : 'Due'}</span></td>
            <td>${paid ? `<button class="btn btn-ghost btn-sm" data-slip="${i}">Slip</button>` : `<button class="btn btn-outline btn-sm" data-payreq="${i}">Request</button>`}</td>
            <td><button class="btn btn-ghost btn-sm" data-bview="${i}">View</button></td>
          </tr>`;
        }).join('');
        const totals = (D().bills[user.sub] || []).reduce((acc, b) => ({ bill: acc.bill + b.bill, paid: acc.paid + b.paid }), { bill: 0, paid: 0 });
        return `
          <div class="dash-tool">
            <div><h2>Bill Payment History</h2><p class="hint">Student ID ${esc(user.sub)}</p></div>
            <button class="btn btn-outline btn-sm" id="pdfBill">${icon('i-dl')} Download Bill (PDF)</button>
          </div>
          <div class="panel">
            <p class="hint">Student Name : <b>${esc(user.name)}</b> &nbsp;·&nbsp; Program : ${esc(user.program)} &nbsp;·&nbsp; Batch : ${esc(user.batch)} &nbsp;·&nbsp; Phone : ${esc(user.phone)} &nbsp;·&nbsp; Email : ${esc(user.email)}</p>
            <div class="dash-cards" style="grid-template-columns:repeat(3,1fr)">
              <div class="mini-card"><strong>${totals.bill.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong><span>Total Bill</span></div>
              <div class="mini-card"><strong>${totals.paid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong><span>Total Payment</span></div>
              <div class="mini-card"><strong style="color:var(--red-600)">${(totals.bill - totals.paid).toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong><span>Balance</span></div>
            </div>
            <div class="table-wrap"><table class="table">
              <thead><tr><th>Level/Term</th><th>Reference No</th><th>Bill</th><th>Billing Date</th><th>Payment</th><th>Bill Type</th><th>Last Payment Date</th><th>Collection Date</th><th>Remarks</th><th>Bill Status</th><th>Slip</th><th>Bill View</th></tr></thead>
              <tbody>${rows}
                <tr class="totals"><td colspan="2"><b>Total</b></td><td><b>${totals.bill.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b></td><td></td><td><b>${totals.paid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b></td><td colspan="7"></td></tr>
              </tbody>
            </table></div>
          </div>`;
      }

      if (tab === 'results') {
        const codes = routine.map((r) => r.code).filter((c, i, a) => a.indexOf(c) === i);
        let rows = '', totalGp = 0, n = 0;
        codes.forEach((code, si) => {
          const c = coursesCol.all().find((x) => x.code === code);
          const r = (res[code] || {})[user.sub];
          if (!r) return;
          totalGp += r.gp; n++;
          rows += `<tr><td>${si + 1}</td><td><b>${esc(code)}</b></td><td>${esc(c ? c.name : '')}</td><td>${r.a1}</td><td>${r.a2}</td><td>${r.teacher}</td><td>${r.du}</td><td><b>${r.total}</b></td><td><span class="pill gold">${r.grade} · ${r.gp.toFixed(2)}</span></td></tr>`;
        });
        return `
          <div class="dash-tool">
            <div><h2>Semester Evaluation (Level ${esc(user.level)} · Term ${esc(user.term)})</h2><p class="hint">${esc('2024-2025 Level 2 Term 1 April-September 2026')}</p></div>
            <button class="btn btn-outline btn-sm" id="pdfRes">${icon('i-dl')} Download Result (PDF)</button>
          </div>
          <div class="table-wrap"><table class="table">
            <thead><tr><th>SL</th><th>Code</th><th>Course</th><th>Assessment 1<br/>(30)</th><th>Assessment 2<br/>(30)</th><th>Teacher Total<br/>(30)</th><th>DU Final<br/>(70)</th><th>Total<br/>(100)</th><th>Grade</th></tr></thead>
            <tbody>${rows}</tbody>
          </table></div>
          <div class="dash-cards mt-16" style="grid-template-columns:repeat(2,1fr)">
            <div class="mini-card"><span class="q-icon">${icon('i-grad')}</span><strong>${(totalGp / Math.max(1, n)).toFixed(2)}</strong><span>GPA (this semester)</span></div>
            <div class="mini-card"><span class="q-icon">${icon('i-star')}</span><strong>${user.cgpa}</strong><span>CGPA</span></div>
          </div>
          <p class="hint mt-16">Teacher assessment marks (2 × 30, averaged to 30) are sent to the DU exam center and combined with the DU final examination (70 marks) for the total.</p>`;
      }

      if (tab === 'profile') {
        const prof = profileStore.all()[user.sub] || {};
        const pv = (k, fb) => profVal(prof, k, fb);
        const eduCell = (ex, g) => {
          const d = ex === 'SSC' ? ['Science', '—', 'Dhaka', '5.0', '2 years', '2020', '2019-2020'] : ['Science', '—', 'Dhaka', '5.0', '2 years', '2022', '2021-2022'];
          return `<tr><td>${ex}</td><td>${esc(pv(g + 'Group', d[0]))}</td><td>${esc(pv(g + 'Inst', d[1]))}</td><td>${esc(pv(g + 'Board', d[2]))}</td><td>${esc(pv(g + 'Result', d[3]))}</td><td>${esc(pv(g + 'Dur', d[4]))}</td><td>${esc(pv(g + 'Year', d[5]))}</td><td>${esc(pv(g + 'Session', d[6]))}</td></tr>`;
        };
        return `
          <div class="dash-tool">
            <div><h2>Student Profile View</h2><p class="hint">Student ID ${esc(user.sub)}</p></div>
            <button class="btn btn-outline btn-sm" id="editProfile">${icon('i-edit')} Edit Profile</button>
          </div>
          <div id="profileArea">
          <div class="panel">
            <h3>Student Info</h3>
            <div class="field" style="max-width:320px"><label class="label">Photo (less than 200KB)</label>
              <input class="input" type="file" accept="image/*" /></div>
            <div class="profile-grid">
              <div class="p-cell"><span>Student ID</span><b>${esc(user.sub)}</b></div>
              <div class="p-cell"><span>Student Name</span><b>${esc(pv('name', user.name))}</b></div>
              <div class="p-cell"><span>Registration No</span><b>${esc(pv('regNo', '—'))}</b></div>
              <div class="p-cell"><span>Department</span><b>${esc(user.deptName || user.dept)}</b></div>
              <div class="p-cell"><span>Program</span><b>${esc(user.dept)}</b></div>
              <div class="p-cell"><span>DOB</span><b>—</b></div>
              <div class="p-cell"><span>Gender</span><b>${esc(pv('gender', '—'))}</b></div>
              <div class="p-cell"><span>Marital Status</span><b>${esc(pv('marital', '—'))}</b></div>
              <div class="p-cell"><span>Blood Group</span><b>${esc(pv('blood', '—'))}</b></div>
              <div class="p-cell"><span>Religion</span><b>${esc(pv('religion', 'Islam'))}</b></div>
              <div class="p-cell"><span>Phone</span><b>${esc(pv('phone', user.phone))}</b></div>
              <div class="p-cell"><span>SMS Number</span><b>${esc(pv('sms', user.phone))}</b></div>
              <div class="p-cell"><span>Email</span><b>${esc(pv('email', user.email))}</b></div>
              <div class="p-cell"><span>Nationality</span><b>${esc(pv('nationality', 'Bangladeshi'))}</b></div>
              <div class="p-cell"><span>Father Name</span><b>${esc(pv('fatherName', user.sub === 'CS 2405006' ? 'Md. Anisur Rahman' : '—'))}</b></div>
              <div class="p-cell"><span>Mother Name</span><b>${esc(pv('motherName', user.sub === 'CS 2405006' ? 'Jinat Rehana' : '—'))}</b></div>
              <div class="p-cell"><span>Guardian Name</span><b>${esc(pv('guardianName', '—'))}</b></div>
              <div class="p-cell"><span>Hall Info</span><b>${esc(pv('hall', '—'))}</b></div>
            </div>
          </div>
          <div class="panel">
            <h3>Education (SSC / HSC / Equivalent)</h3>
            <div class="table-wrap"><table class="table">
              <thead><tr><th>Examination</th><th>Group</th><th>Institution</th><th>Board</th><th>Result</th><th>Duration</th><th>Year of Passing</th><th>Session</th></tr></thead>
              <tbody>
                ${eduCell('SSC', 'ssc')}
                ${eduCell('HSC', 'hsc')}
              </tbody>
            </table></div>
          </div>
          </div>`;
      }

      if (tab === 'password') {
        return `
          <div class="panel" style="max-width:520px">
            <h3>${icon('i-lock')} Account Settings — Change Password</h3>
            <p class="hint">Your temporary password should be changed after your first login.</p>
            <form id="pwForm" novalidate>
              <div class="field"><label class="label">Current Password</label><input id="pwCur" class="input" type="password" required placeholder="••••••••" /></div>
              <div class="field"><label class="label">New Password</label><input id="pwNew" class="input" type="password" required placeholder="8+ chars, upper, lower, number, special" /></div>
              <div class="field"><label class="label">Confirm New Password</label><input id="pwNew2" class="input" type="password" required placeholder="Repeat new password" /></div>
              <div id="pwMsg" class="login-error" hidden></div>
              <button class="btn btn-primary" type="submit">${icon('i-check')} Update Password</button>
            </form>
          </div>`;
      }

      if (tab === 'pass') {
        return `
          <h2>Digital Smart Bus Pass</h2>
          <div class="pass-card">
            <div class="pass-top"><strong>NITER SMART BUS PASS</strong><span class="mode-badge" style="font-size:9px">DEMO QR</span></div>
            <div class="pass-qr">${fakeQR(user.sub + user.card)}</div>
            <div class="pass-id">${avatar(user.name)}<div><b style="font-size:16px">${esc(user.name)}</b><br/><span style="font-size:12px;color:rgb(255 255 255/.65)">${esc(user.sub)} · Section ${esc(user.sec)} · Group ${esc(user.group)}</span></div></div>
            <div class="pass-rows">
              <div><span>Department</span><b>${esc(user.deptName || user.dept)}</b></div>
              <div><span>Level &amp; Term</span><b>Level ${esc(user.level)} · Term ${esc(user.term)}</b></div>
              <div><span>Bus Card No.</span><b>${esc(user.card)}</b></div>
              <div><span>Eligibility</span><b>Student Bus 1 &amp; 2</b></div>
            </div>
            <div class="pass-valid"><span>Valid until 31 Dec 2026</span><span>Tap In / Tap Out ready</span></div>
          </div>
          <p class="hint center mt-16">Bus Card = BUS + last two digits of your Class ID (e.g. ${esc(user.sub)} → ${esc(user.card)}). Scan at boarding for automatic attendance, occupancy update and fare calculation.</p>`;
      }

      if (tab === 'help') {
        const mine = helpCol.all().filter((h) => h.student === user.sub);
        const cats = ['Academic', 'Routine', 'Exam', 'Lab', 'Fee', 'Scholarship', 'Campus', 'Transport', 'Others'];
        return `
          <h2>NITER Student Helping Zone</h2>
          <div class="panel">
            <h3>Submit a Request</h3>
            <form id="helpForm">
              <div class="form-row">
                <div class="field"><label class="label">Category</label>
                  <select id="helpCat" class="select">${cats.map((c) => `<option>${c}</option>`).join('')}</select></div>
                <div class="field"><label class="label">Your Question</label>
                  <input id="helpQ" class="input" required placeholder="Type your question…" /></div>
              </div>
              <p class="hint" id="helpTargetHint">Academic / class-related requests go to <b>teachers</b>; campus, fee and scholarship requests go to the <b>admin</b>.</p>
              <button class="btn btn-primary btn-sm" type="submit">${icon('i-send')} Submit</button>
            </form>
          </div>
          <div class="table-wrap"><table class="table">
            <thead><tr><th>#</th><th>Category</th><th>Question</th><th>Sent To</th><th>Status</th><th>Reply</th></tr></thead>
            <tbody>${mine.map((h) => `<tr><td>${h.id}</td><td>${esc(h.cat)}</td><td>${esc(h.q)}</td><td>${esc(h.target === 'admin' ? 'Admin' : 'Teacher')}</td><td><span class="pill ${h.status === 'Resolved' ? 'on' : h.status === 'In Progress' ? 'active' : h.status === 'Rejected' ? 'danger' : 'warn'}">${esc(h.status)}</span></td><td>${esc(h.reply || '—')}</td></tr>`).join('') || '<tr><td colspan="6"><div class="empty-state">No requests yet.</div></td></tr>'}</tbody>
          </table></div>`;
      }
      return '';
    };

    const html = dashShell(user, studentTabs, 'overview', render);

    const setup = (tab) => {
      if (tab === 'overview') {
        $$('[data-qt]').forEach((b) => b.addEventListener('click', () => bindDash($('#view'), studentTabs, b.dataset.qt, render, setup)));
      }
      if (tab === 'routine') {
        const b = $('#pdfRoutine');
        if (b) b.addEventListener('click', () => {
          const rows = routine.map((r) => `<tr><td>${esc(r.code)}</td><td>${esc(r.title)}</td><td>${esc(teacherLabel(r.teacher))}</td><td>${esc(r.day)}</td><td>${esc(r.room)}</td><td>${esc(r.start)} - ${esc(r.end)}</td><td>${r.kind === 'Lab' ? esc(r.group) : esc(r.section)}</td></tr>`).join('');
          exportPDF('Student Class Routine — ' + user.name, `
            <h2>Student Class Routine Report</h2>
            <p>Name : <b>${esc(user.name)}</b> &nbsp;·&nbsp; Student Id : <b>${esc(user.sub)}</b> &nbsp;·&nbsp; Held In : 2024-2025 Level 2 Term 1 April-September 2026</p>
            <table><thead><tr><th>Course</th><th>Course Title</th><th>Teacher</th><th>Day</th><th>Room</th><th>Time Slot</th><th>Section</th></tr></thead><tbody>${rows}</tbody></table>`);
        });
      }
      if (tab === 'attendance') {
        const b = $('#pdfAtt');
        if (b) b.addEventListener('click', () => {
          const codes = routine.map((r) => r.code).filter((c, i, a) => a.indexOf(c) === i);
          const rows = codes.map((code, si) => {
            const c = coursesCol.all().find((x) => x.code === code);
            const rec = (att[code] || {})[user.sub] || { total: 0, present: 0 };
            const pct = attPct(rec);
            const st = attStatus(pct);
            return `<tr><td>${si + 1}</td><td><b>${esc(code)}</b><br/>${esc(c ? c.name : '')}<br/>Credit : ${c ? c.credit.toFixed(2) : ''}</td><td>${rec.total}</td><td>${pct == null ? '0.00' : pct.toFixed(2)}</td><td>${st[0]} (${attCode(pct)})</td></tr>`;
          }).join('');
          exportPDF('Student Class Attendance — ' + user.name, `
            <h2>Student Class Attendance Dashboard</h2>
            <p>Student ID : <b>${esc(user.sub)}</b> · Held In : 2024-2025 Level 2 Term 1 April-September 2026</p>
            <table><thead><tr><th>SL</th><th>Course Information</th><th>Total Class</th><th>Percentage</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`);
        });
      }
      if (tab === 'bill') {
        const rows = D().bills[user.sub] || [];
        $$('[data-slip]').forEach((b) => {
          b.addEventListener('click', () => {
            const r = rows[+b.dataset.slip];
            openModal(`<p class="hint">Reference No <b>${r.ref}</b> · ${esc(r.type)}</p><p style="font-size:24px;font-weight:700">${r.bill.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p><p>Paid on ${esc(r.collDate || r.payDate || '—')}</p>`, { title: 'Payment Slip' });
          });
        });
        $$('[data-bview]').forEach((b) => {
          b.addEventListener('click', () => {
            const r = rows[+b.dataset.bview];
            openModal(`<p class="hint">${esc(r.term)}</p><p><b>${esc(r.type)}</b></p><p>Bill: ${r.bill.toLocaleString('en-US', { minimumFractionDigits: 2 })} · Paid: ${r.paid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p><p style="font-size:13px;color:var(--ink-500)">Billing date: ${esc(r.date)} · ${r.remark ? 'Remark: ' + esc(r.remark) : ''}</p>`, { title: 'Bill View' });
          });
        });
        $$('[data-payreq]').forEach((b) => {
          b.addEventListener('click', () => {
            toast('Payment request submitted to the Accounts Office', 'success');
            openModal(`<p>Your request for the <b>${esc(rows[+b.dataset.payreq].type)}</b> has been forwarded to the Accounts Office. Please collect your receipt after payment.</p>`, { title: 'Payment Request' });
          });
        });
        const pb = $('#pdfBill');
        if (pb) pb.addEventListener('click', () => {
          const rowsHtml = rows.map((r) => `<tr><td>${esc(r.term)}</td><td>${r.ref}</td><td>${r.bill.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td><td>${esc(r.date)}</td><td>${r.paid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td><td>${esc(r.type)}</td><td>${esc(r.payDate || '')}</td><td>${esc(r.collDate || '')}</td><td>${r.paid ? 'Paid' : 'Due'}</td></tr>`).join('');
          const tot = rows.reduce((a, b) => ({ bill: a.bill + b.bill, paid: a.paid + b.paid }), { bill: 0, paid: 0 });
          exportPDF('Bill Payment History — ' + user.name, `
            <h2>Bill Payment History</h2>
            <p>Student Name : <b>${esc(user.name)}</b> · Class ID : <b>${esc(user.sub)}</b> · Program : ${esc(user.program)} · Batch : ${esc(user.batch)}</p>
            <div class="sum"><div>Total Bill <b>${tot.bill.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b></div><div>Total Payment <b>${tot.paid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</b></div><div>Balance <b>${(tot.bill - tot.paid).toLocaleString('en-US', { minimumFractionDigits: 2 })}</b></div></div>
            <table><thead><tr><th>Level/Term</th><th>Reference No</th><th>Bill</th><th>Billing Date</th><th>Payment</th><th>Bill Type</th><th>Last Payment Date</th><th>Collection Date</th><th>Status</th></tr></thead><tbody>${rowsHtml}</tbody></table>`);
        });
      }
      if (tab === 'results') {
        const b = $('#pdfRes');
        if (b) b.addEventListener('click', () => {
          const codes = routine.map((r) => r.code).filter((c, i, a) => a.indexOf(c) === i);
          const rowsHtml = codes.map((code, si) => {
            const c = coursesCol.all().find((x) => x.code === code);
            const r = (res[code] || {})[user.sub];
            if (!r) return '';
            return `<tr><td>${si + 1}</td><td><b>${esc(code)}</b></td><td>${esc(c ? c.name : '')}</td><td>${r.credit || ''}</td><td>${r.a1}</td><td>${r.a2}</td><td>${r.teacher}</td><td>${r.du}</td><td><b>${r.total}</b></td><td>${r.grade} (${r.gp.toFixed(2)})</td></tr>`;
          }).join('');
          const codes2 = codes.filter((c) => (res[c] || {})[user.sub]);
          const gpa = codes2.reduce((s, c) => s + (res[c][user.sub].gp || 0), 0) / Math.max(1, codes2.length);
          exportPDF('Semester Result — ' + user.name, `
            <h2>Semester Result (Level 2 · Term 1)</h2>
            <p>Name : <b>${esc(user.name)}</b> · Student Id : <b>${esc(user.sub)}</b> · Held In : 2024-2025 Level 2 Term 1 April-September 2026</p>
            <table><thead><tr><th>SL</th><th>Code</th><th>Course</th><th>Credit</th><th>Assess. 1 (30)</th><th>Assess. 2 (30)</th><th>Teacher (30)</th><th>DU Final (70)</th><th>Total</th><th>Grade</th></tr></thead><tbody>${rowsHtml}</tbody></table>
            <div class="sum"><div>GPA <b>${gpa.toFixed(2)}</b></div><div>CGPA <b>${user.cgpa}</b></div></div>`);
        });
      }
      if (tab === 'password') {
        const form = $('#pwForm');
        if (form) form.addEventListener('submit', (e) => {
          e.preventDefault();
          const msg = $('#pwMsg');
          const cur = $('#pwCur').value;
          const nw = $('#pwNew').value;
          const nw2 = $('#pwNew2').value;
          const show = (m, ok) => { msg.hidden = false; msg.className = 'login-error' + (ok ? ' ok' : ''); msg.innerHTML = (ok ? icon('i-check') + ' ' : icon('i-alert') + ' ') + esc(m); };
          if (window.NITER.auth.studentPassword(user.sub) !== cur) { show('Your current password is incorrect.'); return; }
          if (nw !== nw2) { show('New password and confirmation do not match.'); return; }
          if (nw.length < 8 || !/[A-Z]/.test(nw) || !/[a-z]/.test(nw) || !/[0-9]/.test(nw) || !/[^A-Za-z0-9]/.test(nw)) { show('New password must be at least 8 characters and include one uppercase letter, one lowercase letter, one number and one special character.'); return; }
          window.NITER.auth.setStudentPassword(user.sub, nw);
          show('Your password has been updated successfully. Please use your new password the next time you log in.', true);
          $('#pwCur').value = ''; $('#pwNew').value = ''; $('#pwNew2').value = '';
        });
      }
      if (tab === 'profile') {
        const btn = $('#editProfile');
        if (!btn) return;
        btn.addEventListener('click', () => {
          const area = $('#profileArea');
          if (!area) return;
          area.innerHTML = profileEditForm(user);
          const redraw = () => { const nb = $$('.dash-nav button[data-tab]').find((b) => b.dataset.tab === 'profile'); if (nb) nb.click(); };
          const MAP = {
            pName: 'name', pGender: 'gender', pMarital: 'marital', pBlood: 'blood', pReligion: 'religion',
            pJob: 'job', pQuota: 'quota', pPhone: 'phone', pSms: 'sms', pEmail: 'email', pNat: 'nationality',
            pFather: 'fatherName', pFatherPhone: 'fatherPhone', pMother: 'motherName', pMotherPhone: 'motherPhone',
            pGuardian: 'guardianName', pGuardianPhone: 'guardianPhone', pGuardianEmail: 'guardianEmail',
            pHall: 'hall', pBankNo: 'bankNo', pBankName: 'bankName', pBranch: 'branch', pRouting: 'routing',
            pNid: 'nid', pBirth: 'birthReg',
            pPApt: 'permApt', pPHouse: 'permHouse', pPRoad: 'permRoad', pPCode: 'permCode', pPOffice: 'permOffice',
            pPStation: 'permStation', pPDistrict: 'permDistrict', pPCountry: 'permCountry', pPDetails: 'permDetails',
            pSApt: 'presApt', pSHouse: 'presHouse', pSRoad: 'presRoad', pSCode: 'presCode', pSOffice: 'presOffice',
            pSStation: 'presStation', pSDistrict: 'presDistrict', pSCountry: 'presCountry', pSDetails: 'presDetails',
            sscGroup: 'sscGroup', sscInst: 'sscInst', sscBoard: 'sscBoard', sscResult: 'sscResult', sscDur: 'sscDur',
            sscYear: 'sscYear', sscSession: 'sscSession',
            hscGroup: 'hscGroup', hscInst: 'hscInst', hscBoard: 'hscBoard', hscResult: 'hscResult', hscDur: 'hscDur',
            hscYear: 'hscYear', hscSession: 'hscSession',
          };
          const same = $('#pSame');
          if (same) {
            same.addEventListener('change', () => { $('#presAddr').style.display = same.checked ? 'none' : ''; });
            $('#presAddr').style.display = same.checked ? 'none' : '';
          }
          const cancel = $('#profileCancel');
          if (cancel) cancel.addEventListener('click', redraw);
          const save = $('#profileSave');
          if (save) save.addEventListener('click', () => {
            const prof = {};
            Object.keys(MAP).forEach((id) => { const el = $('#' + id); if (el) prof[MAP[id]] = el.value.trim(); });
            if (same && same.checked) {
              ['Apt', 'House', 'Road', 'Code', 'Office', 'Station', 'District', 'Country', 'Details'].forEach((k) => { prof['pres' + k] = prof['perm' + k] || ''; });
              prof.sameAsPermanent = 'on';
            }
            profileStore.all()[user.sub] = prof;
            profileStore.save();
            toast('Profile updated successfully', 'success');
            redraw();
          });
        });
      }
      if (tab === 'help') {
        const cat = $('#helpCat');
        if (cat) cat.addEventListener('change', () => {
          const t = D().helpTargets[cat.value];
          $('#helpTargetHint').innerHTML = t === 'admin'
            ? 'Campus / fee / scholarship requests go to the <b>admin</b>.'
            : 'Academic / class-related requests go to <b>teachers</b>.';
        });
        const form = $('#helpForm');
        if (form) form.addEventListener('submit', (e) => {
          e.preventDefault();
          const catVal = $('#helpCat').value;
          helpCol.add({ id: Date.now() % 100000, student: user.sub, name: user.name, cat: catVal, target: D().helpTargets[catVal] || 'teacher', q: $('#helpQ').value, status: 'Pending', reply: '', date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) });
          toast('Request submitted — status: Pending', 'success');
          bindDash($('#view'), studentTabs, 'help', render, setup);
        });
      }
    };
    setTimeout(() => bindDash($('#view'), studentTabs, 'overview', render, setup), 0);
    return html;
  }

  /* ========================================================================
     TEACHER PORTAL
     ======================================================================== */
  const teacherTabs = [
    { id: 'overview', label: 'Overview', icon: 'i-home' },
    { id: 'courses', label: 'My Courses', icon: 'i-book' },
    { id: 'attendance', label: 'Mark Attendance', icon: 'i-check' },
    { id: 'marks', label: 'Enter Marks', icon: 'i-grad' },
    { id: 'help', label: 'Helping Zone', icon: 'i-heart' },
  ];

  function teacherCourses(user) {
    return coursesCol.all().filter((c) => c.teacher === user.sub || (c.teachersByGroup && Object.values(c.teachersByGroup).indexOf(user.sub) >= 0));
  }
  function teacherGroupsFor(course, user) {
    if (course.type === 'Lab' && course.teachersByGroup) {
      return Object.keys(course.teachersByGroup).filter((g) => course.teachersByGroup[g] === user.sub);
    }
    return ['A', 'B'];
  }

  function teacherDashboard(user) {
    const myCourses = teacherCourses(user);
    const render = (tab) => {
      if (tab === 'overview') return `
        <h2>Welcome, ${esc(user.name)}</h2>
        <div class="dash-cards">
          <div class="mini-card"><span class="q-icon">${icon('i-book')}</span><strong>${myCourses.length}</strong><span>Courses</span></div>
          <div class="mini-card"><span class="q-icon">${icon('i-users')}</span><strong>${studentsCol.all().length}</strong><span>Students (CSE 2-1)</span></div>
          <div class="mini-card"><span class="q-icon">${icon('i-heart')}</span><strong>${helpCol.all().filter((h) => h.target === 'teacher' && h.status !== 'Resolved').length}</strong><span>Open Requests</span></div>
          <div class="mini-card"><span class="q-icon">${icon('i-bus')}</span><strong>2</strong><span>Teacher Buses</span></div>
        </div>
        <div class="panel">
          <h3>Assigned Courses (Level 2 · Term 1)</h3>
          <div class="table-wrap"><table class="table">
            <thead><tr><th>Code</th><th>Course</th><th>Credit</th><th>Type</th><th>Section / Group</th></tr></thead>
            <tbody>${myCourses.map((c) => `<tr><td><b>${esc(c.code)}</b></td><td>${esc(c.name)}</td><td>${c.credit}</td><td><span class="chip chip-cat">${esc(c.type)}</span></td><td>${esc(teacherGroupsFor(c, user).join(', '))}</td></tr>`).join('') || '<tr><td colspan="5"><div class="empty-state">No courses assigned</div></td></tr>'}</tbody>
          </table></div>
        </div>
        <div class="panel"><h3>Transport</h3><p style="font-size:13.5px;color:var(--ink-500)">Teachers can track <b>Teacher Bus 1</b> (Mirpur, 6:45 AM) and <b>Teacher Bus 2</b> (Shyamoli, 6:45 AM).</p>
          <a class="btn btn-outline btn-sm mt-16" href="#/transport">${icon('i-bus')} Open Smart Transport</a></div>`;

      if (tab === 'courses') return `
        <h2>My Courses</h2>
        <p class="hint">Level 2 · Term 1 (2024-2025) — theory classes are section-wise, laboratory classes are group-wise.</p>
        <div class="table-wrap"><table class="table">
          <thead><tr><th>Code</th><th>Course</th><th>Credit</th><th>Type</th><th>Section / Group</th></tr></thead>
          <tbody>${myCourses.map((c) => `<tr><td><b>${esc(c.code)}</b></td><td>${esc(c.name)}</td><td>${c.credit}</td><td><span class="chip chip-cat">${esc(c.type)}</span></td><td>${esc(teacherGroupsFor(c, user).join(', '))}</td></tr>`).join('')}</tbody>
        </table></div>`;

      if (tab === 'attendance') {
        const sel = myCourses.map((c) => `<option value="${esc(c.code)}">${esc(c.code)} — ${esc(c.name)}</option>`).join('');
        return `
          <h2>Mark Attendance</h2>
          <div class="panel">
            <div class="form-row">
              <div class="field"><label class="label">Level &amp; Semester</label>
                <select id="attHeldIn" class="select"><option>Level 2 Term 1 (April-September 2026)</option></select></div>
              <div class="field"><label class="label">Course</label><select id="attCourse" class="select">${sel || '<option>No courses</option>'}</select></div>
              <div class="field"><label class="label">Section / Group</label><select id="attScope" class="select"></select></div>
              <div class="field"><label class="label">Date</label><input id="attDate" class="input" type="date" value="${new Date().toISOString().slice(0, 10)}" /></div>
            </div>
            <div class="flex wrap gap-12" style="margin:10px 0">
              <button class="btn btn-outline btn-sm" id="attAllPresent">${icon('i-check')} All Present</button>
              <button class="btn btn-outline btn-sm" id="attAllAbsent">${icon('i-close')} All Absent</button>
            </div>
            <div id="attList"></div>
            <button class="btn btn-primary btn-sm mt-16" id="attSave">${icon('i-check')} Save Attendance</button>
          </div>`;
      }

      if (tab === 'marks') return `
        <h2>Enter Marks (Assessment Examination — 30 marks)</h2>
        <div class="panel">
          <p class="hint">Two assessment examinations per semester (30 marks each). After submission the marks are sent to the <b>DU exam center</b> and combined with the DU final examination (70 marks).</p>
          <div class="form-row">
            <div class="field"><label class="label">Course</label><select id="markCourse" class="select">${myCourses.map((c) => `<option value="${esc(c.code)}">${esc(c.code)} — ${esc(c.name)}</option>`).join('') || '<option>No courses</option>'}</select></div>
            <div class="field"><label class="label">Section / Group</label><select id="markScope" class="select"></select></div>
          </div>
          <div id="markList"></div>
          <button class="btn btn-primary btn-sm mt-16" id="markSave">${icon('i-send')} Submit Marks to DU Exam Center</button>
        </div>`;

      if (tab === 'help') return `
        <h2>Student Helping Zone — Academic Requests</h2>
        <div class="table-wrap"><table class="table">
          <thead><tr><th>#</th><th>Student</th><th>Category</th><th>Question</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>${helpCol.all().filter((h) => h.target === 'teacher').map((h) => `
            <tr><td>${h.id}</td><td>${esc(h.name)}</td><td>${esc(h.cat)}</td><td>${esc(h.q)}</td>
            <td><span class="pill ${h.status === 'Resolved' ? 'on' : h.status === 'In Progress' ? 'active' : 'warn'}">${esc(h.status)}</span></td>
            <td><button class="btn btn-outline btn-sm" data-reply="${h.id}">Reply</button></td></tr>`).join('') || '<tr><td colspan="6"><div class="empty-state">No teacher requests yet.</div></td></tr>'}</tbody>
        </table></div>`;
      return '';
    };

    const html = dashShell(user, teacherTabs, 'overview', render);
    const setup = (tab) => {
      if (tab === 'attendance') {
        const attCourse = $('#attCourse'), attScope = $('#attScope'), attList = $('#attList');
        if (!attCourse) return;
        const fillScope = () => {
          const code = attCourse.value;
          const c = coursesCol.all().find((x) => x.code === code);
          const scopes = teacherGroupsFor(c, user);
          attScope.innerHTML = scopes.map((s) => `<option value="${s}">${s}</option>`).join('');
        };
        const drawAtt = () => {
          const code = attCourse.value;
          const scope = attScope.value;
          const c = coursesCol.all().find((x) => x.code === code);
          const isTheory = c.type === 'Theory';
          const list = studentsCol.all().filter((s) => (isTheory ? s.sec === scope : s.group === scope));
          attList.innerHTML = `
            <p class="hint">${esc(c.code)} — ${esc(c.name)} · ${isTheory ? 'Section ' + esc(scope) : 'Group ' + esc(scope)} · ${list.length} students</p>
            <div class="table-wrap"><table class="table">
              <thead><tr><th>#</th><th>Student</th><th>Class ID</th><th>Present?</th></tr></thead>
              <tbody>${list.map((s, i) => `<tr><td>${i + 1}</td><td>${esc(s.name)}</td><td>${esc(s.id)}</td><td><label style="display:inline-flex;gap:6px;align-items:center"><input type="checkbox" class="att-box" data-id="${esc(s.id)}" checked /> Present</label></td></tr>`).join('')}</tbody>
            </table></div>`;
          $('#attAllPresent').onclick = () => $$('.att-box').forEach((b) => { b.checked = true; });
          $('#attAllAbsent').onclick = () => $$('.att-box').forEach((b) => { b.checked = false; });
        };
        fillScope(); drawAtt();
        attCourse.addEventListener('change', () => { fillScope(); drawAtt(); });
        attScope.addEventListener('change', drawAtt);
        $('#attSave').addEventListener('click', () => {
          const code = attCourse.value;
          const store = attendanceStore.all();
          store[code] = store[code] || {};
          let marked = 0, present = 0;
          $$('.att-box').forEach((b) => {
            const id = b.dataset.id;
            store[code][id] = store[code][id] || { total: 0, present: 0 };
            store[code][id].total += 1;
            if (b.checked) { store[code][id].present += 1; present++; }
            marked++;
          });
          attendanceStore.save();
          toast(`Attendance saved for ${code} (${present}/${marked} present) — student percentages updated`, 'success');
        });
      }
      if (tab === 'marks') {
        const markCourse = $('#markCourse'), markScope = $('#markScope'), markList = $('#markList');
        if (!markCourse) return;
        const fillScope = () => {
          const code = markCourse.value;
          const c = coursesCol.all().find((x) => x.code === code);
          markScope.innerHTML = teacherGroupsFor(c, user).map((s) => `<option value="${s}">${s}</option>`).join('');
        };
        const drawMarks = () => {
          const code = markCourse.value;
          const scope = markScope.value;
          const c = coursesCol.all().find((x) => x.code === code);
          const isTheory = c.type === 'Theory';
          const list = studentsCol.all().filter((s) => (isTheory ? s.sec === scope : s.group === scope));
          const store = resultsStore.all();
          store[code] = store[code] || {};
          markList.innerHTML = `
            <p class="hint">${esc(c.name)} · ${isTheory ? 'Section ' + esc(scope) : 'Group ' + esc(scope)} · ${list.length} students</p>
            <div class="table-wrap"><table class="table">
              <thead><tr><th>#</th><th>Student</th><th>Class ID</th><th>Assessment 1 (30)</th><th>Assessment 2 (30)</th></tr></thead>
              <tbody>${list.map((s, i) => {
                const r = store[code][s.id] || { a1: 0, a2: 0 };
                return `<tr><td>${i + 1}</td><td>${esc(s.name)}</td><td>${esc(s.id)}</td>
                <td><input class="input" style="max-width:80px" type="number" min="0" max="30" value="${r.a1}" data-mk="a1" data-id="${esc(s.id)}" /></td>
                <td><input class="input" style="max-width:80px" type="number" min="0" max="30" value="${r.a2}" data-mk="a2" data-id="${esc(s.id)}" /></td></tr>`;
              }).join('')}</tbody>
            </table></div>`;
        };
        fillScope(); drawMarks();
        markCourse.addEventListener('change', () => { fillScope(); drawMarks(); });
        markScope.addEventListener('change', drawMarks);
        $('#markSave').addEventListener('click', () => {
          const code = markCourse.value;
          const store = resultsStore.all();
          store[code] = store[code] || {};
          const inputs = $$('[data-mk]');
          const ids = Array.from(new Set(inputs.map((i) => i.dataset.id)));
          let bad = false;
          ids.forEach((id) => {
            const a1v = $('[data-mk="a1"][data-id="' + id + '"]');
            const a2v = $('[data-mk="a2"][data-id="' + id + '"]');
            const a1 = Math.max(0, Math.min(30, +a1v.value || 0));
            const a2 = Math.max(0, Math.min(30, +a2v.value || 0));
            const teacher30 = Math.round((a1 + a2) / 2);
            const du = 45 + ((hashId(id) + code.length * 7) % 25);
            const total = Math.min(100, teacher30 + du);
            const g = gradeOf(total);
            store[code][id] = { a1, a2, teacher: teacher30, du, total, grade: g[0], gp: g[1] };
          });
          resultsStore.save();
          toast(`Marks submitted for ${code} — sent to the DU exam center. Student results are now updated.`, 'success');
        });
      }
      if (tab === 'help') {
        $$('[data-reply]').forEach((b) => b.addEventListener('click', () => {
          const h = helpCol.all().find((x) => x.id === +b.dataset.reply);
          openModal(`
            <p style="color:var(--ink-500);font-size:13px">${esc(h.student)} · ${esc(h.cat)}</p>
            <p style="font-weight:600;margin:6px 0 12px">${esc(h.q)}</p>
            <div class="field"><label class="label">Reply</label><textarea id="replyText" class="input" rows="3">${esc(h.reply || '')}</textarea></div>
            <div class="field"><label class="label">Status</label>
              <select id="replyStatus" class="select">${['Pending', 'In Progress', 'Resolved', 'Rejected'].map((s) => `<option ${h.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
            <button class="btn btn-primary btn-sm" id="replySend">${icon('i-send')} Update</button>`, { title: 'Reply to Request' });
          $('#replySend').addEventListener('click', () => {
            helpCol.update(h.id, { reply: $('#replyText').value, status: $('#replyStatus').value });
            closeModal();
            toast('Helping Zone request updated', 'success');
          });
        }));
      }
    };
    setTimeout(() => bindDash($('#view'), teacherTabs, 'overview', render, setup), 0);
    return html;
  }

  function hashId(id) { let h = 2166136261; for (let i = 0; i < id.length; i++) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0); }

  /* ========================================================================
     ADMIN PORTAL
     ======================================================================== */
  const adminTabs = [
    { id: 'overview', label: 'Overview', icon: 'i-home' },
    { id: 'students', label: 'Students', icon: 'i-users' },
    { id: 'teachers', label: 'Teachers', icon: 'i-user' },
    { id: 'courses', label: 'Courses', icon: 'i-book' },
    { id: 'rooms', label: 'Rooms', icon: 'i-home' },
    { id: 'notices', label: 'Notices', icon: 'i-bell' },
    { id: 'help', label: 'Helping Zone', icon: 'i-heart' },
    { id: 'reports', label: 'Reports', icon: 'i-file' },
    { id: 'transport', label: 'Transport Admin', icon: 'i-bus' },
  ];

  function adminDashboard(user) {
    const render = (tab) => {
      if (tab === 'overview') {
        const st = window.NITER.transport.getState();
        const activeBuses = D().buses.filter((b) => st.buses[b.id].tripStatus === 'Active').length;
        return `
          <h2>Admin Overview</h2>
          <div class="dash-cards">
            <div class="mini-card"><span class="q-icon">${icon('i-users')}</span><strong>${studentsCol.all().length}</strong><span>Students</span></div>
            <div class="mini-card"><span class="q-icon">${icon('i-user')}</span><strong>${teachersCol.all().length}</strong><span>Teachers</span></div>
            <div class="mini-card"><span class="q-icon">${icon('i-book')}</span><strong>${coursesCol.all().length}</strong><span>Courses</span></div>
            <div class="mini-card"><span class="q-icon">${icon('i-bus')}</span><strong>${activeBuses}/4</strong><span>Buses Active</span></div>
          </div>
          <div class="dash-cards" style="grid-template-columns:repeat(3,1fr)">
            <div class="mini-card"><span class="q-icon">${icon('i-home')}</span><strong>${roomsCol.all().filter((r) => r.status === 'Available').length}/${roomsCol.all().length}</strong><span>Rooms Free</span></div>
            <div class="mini-card"><span class="q-icon">${icon('i-heart')}</span><strong>${helpCol.all().filter((h) => h.status === 'Pending').length}</strong><span>Pending Help</span></div>
            <div class="mini-card"><span class="q-icon">${icon('i-file')}</span><strong>${st.trips.filter((t) => t.status === 'COMPLETED').length}</strong><span>Trips Today</span></div>
          </div>
          <div class="panel">
            <h3>Quick Actions</h3>
            <div class="flex wrap gap-12">
              <a class="btn btn-primary btn-sm" href="#/academic-calendar">${icon('i-cal')} Academic Calendar</a>
              <a class="btn btn-outline btn-sm" href="#/rooms">${icon('i-home')} Room Availability</a>
              <a class="btn btn-outline btn-sm" href="#/transport">${icon('i-bus')} Smart Transport</a>
              <a class="btn btn-outline btn-sm" href="#/driver">${icon('i-route')} Driver Console</a>
              <button class="btn btn-outline btn-sm" onclick="window.print()">${icon('i-print')} Print Reports</button>
            </div>
          </div>`;
      }
      if (tab === 'students') return `
        <h2>Student Management</h2>
        <div class="toolbar">
          <input id="stuSearch" class="input" placeholder="Search by name or Class ID…" />
          <span class="hint">${studentsCol.all().length} students · CSE 2-1 · Section A &amp; B</span>
        </div>
        <div class="table-wrap"><table class="table">
          <thead><tr><th>Class ID</th><th>Name</th><th>Sec</th><th>Group</th><th>Bus Card</th><th>CGPA</th><th></th></tr></thead>
          <tbody id="stuBody"></tbody>
        </table></div>`;
      if (tab === 'teachers') return `
        <h2>Teacher Management</h2>
        <div class="toolbar"><span class="hint">Teacher ID = short name used for portal login (e.g. JTT, SSH, UKD).</span></div>
        <div class="table-wrap"><table class="table">
          <thead><tr><th>ID</th><th>Name</th><th>Designation</th><th>Dept</th><th>Phone</th></tr></thead>
          <tbody>${teachersCol.all().map((t) => `<tr><td><b>${esc(t.id)}</b></td><td>${esc(t.name)}</td><td>${esc(t.designation || '—')}</td><td>${esc(t.dept)}</td><td>${esc(t.phone || '—')}</td></tr>`).join('')}</tbody>
        </table></div>`;
      if (tab === 'courses') return `
        <h2>Course Management — CSE 2-1 (Level 2 Term 1)</h2>
        <div class="table-wrap"><table class="table">
          <thead><tr><th>Code</th><th>Course</th><th>Credit</th><th>Type</th><th>Dept</th><th>Teacher</th></tr></thead>
          <tbody>${coursesCol.all().map((c) => `<tr><td><b>${esc(c.code)}</b></td><td>${esc(c.name)}</td><td>${c.credit}</td><td><span class="chip chip-cat">${esc(c.type)}</span></td><td>${esc(c.dept)}</td><td>${esc(teacherLabel(c.teacher))}</td></tr>`).join('')}</tbody>
        </table></div>`;
      if (tab === 'rooms') return `
        <h2>Room Management</h2>
        <div class="table-wrap"><table class="table">
          <thead><tr><th>Room</th><th>Building</th><th>Floor</th><th>Capacity</th><th>Type</th><th>Status</th></tr></thead>
          <tbody>${roomsCol.all().map((r) => `<tr><td><b>${esc(r.no)}</b></td><td>${esc(r.building || '—')}</td><td>${esc(r.floor)}</td><td>${r.capacity}</td><td>${esc(r.type)}</td><td><span class="pill ${r.status === 'Available' ? 'on' : r.status === 'Occupied' ? 'active' : 'warn'}">${esc(r.status)}</span></td></tr>`).join('')}</tbody>
        </table></div>`;
      if (tab === 'notices') return `
        <h2>Notice Management</h2>
        <div class="panel">
          <h3>Publish Notice</h3>
          <form id="noticeForm">
            <div class="form-row">
              <div class="field"><label class="label">Title</label><input id="nTitle" class="input" required placeholder="Notice title…" /></div>
              <div class="field"><label class="label">Category</label><select id="nCat" class="select">${['Academic', 'Examination', 'Administrative', 'Scholarship', 'Events', 'General', 'Transport'].map((c) => `<option>${c}</option>`).join('')}</select></div>
            </div>
            <div class="field"><label class="label">Summary</label><textarea id="nSum" class="input" rows="2" required></textarea></div>
            <button class="btn btn-primary btn-sm" type="submit">${icon('i-plus')} Publish</button>
          </form>
        </div>
        <div class="table-wrap"><table class="table">
          <thead><tr><th>Date</th><th>Title</th><th>Category</th><th></th></tr></thead>
          <tbody>${noticesCol.all().map((n) => `<tr><td>${esc(n.date)}</td><td><b>${esc(n.title)}</b></td><td><span class="chip chip-cat">${esc(n.cat)}</span></td><td><button class="btn btn-danger btn-sm" data-del="${n.id}">${icon('i-trash')}</button></td></tr>`).join('')}</tbody>
        </table></div>`;
      if (tab === 'help') return `
        <h2>Helping Zone — All Requests</h2>
        <div class="table-wrap"><table class="table">
          <thead><tr><th>#</th><th>Student</th><th>Category</th><th>Question</th><th>Sent To</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>${helpCol.all().map((h) => `<tr><td>${h.id}</td><td>${esc(h.name)}</td><td>${esc(h.cat)}</td><td>${esc(h.q)}</td><td>${esc(h.target === 'admin' ? 'Admin' : 'Teacher')}</td><td><span class="pill ${h.status === 'Resolved' ? 'on' : h.status === 'In Progress' ? 'active' : h.status === 'Rejected' ? 'danger' : 'warn'}">${esc(h.status)}</span></td><td><button class="btn btn-outline btn-sm" data-hrep="${h.id}">Manage</button></td></tr>`).join('')}</tbody>
        </table></div>`;
      if (tab === 'reports') {
        const st = window.NITER.transport.getState();
        return `
          <h2>Reports &amp; Analytics</h2>
          <div class="dash-cards" style="grid-template-columns:repeat(3,1fr)">
            <div class="mini-card"><span class="q-icon">${icon('i-users')}</span><strong>${studentsCol.all().length}</strong><span>Total Students</span></div>
            <div class="mini-card"><span class="q-icon">${icon('i-book')}</span><strong>${coursesCol.all().length}</strong><span>Total Courses</span></div>
            <div class="mini-card"><span class="q-icon">${icon('i-bus')}</span><strong>${st.trips.length}</strong><span>Trips Logged</span></div>
          </div>
          <div class="panel">
            <h3>Attendance Report (CSE 2-1)</h3>
            <div class="table-wrap"><table class="table">
              <thead><tr><th>Course</th><th>${coursesCol.all().map((c) => esc(c.code)).join('</th><th>')}</th></tr></thead>
              <tbody>${studentsCol.all().slice(0, 12).map((s) => `<tr><td>${esc(s.id)}</td>${coursesCol.all().map((c) => { const r = (attendanceStore.all()[c.code] || {})[s.id]; const p = attPct(r); return `<td>${p == null ? '—' : Math.round(p) + '%'}</td>`; }).join('')}</tr>`).join('')}</tbody>
            </table></div>
            <button class="btn btn-outline btn-sm mt-16" onclick="window.print()">${icon('i-print')} Print Report</button>
          </div>
          <div class="panel">
            <h3>Transport Trips</h3>
            <div class="table-wrap"><table class="table">
              <thead><tr><th>Trip ID</th><th>Bus</th><th>Route</th><th>Status</th><th>Passengers</th></tr></thead>
              <tbody>${st.trips.slice(-10).reverse().map((t) => `<tr><td>${esc(t.tripId)}</td><td>${esc(t.busName)}</td><td>${esc(t.routeName)}</td><td><span class="pill ${t.status === 'COMPLETED' ? 'on' : 'active'}">${esc(t.status)}</span></td><td>${t.passengers}</td></tr>`).join('') || '<tr><td colspan="5"><div class="empty-state">No trips yet — start one from the Driver Console.</div></td></tr>'}</tbody>
            </table></div>
            <button class="btn btn-outline btn-sm mt-16" onclick="window.print()">${icon('i-print')} Print Report</button>
          </div>`;
      }
      if (tab === 'transport') {
        const st = window.NITER.transport.getState();
        return `
          <h2>Transport Admin — All Buses</h2>
          <div class="panel">
            <h3>Live Fleet Status</h3>
            <div class="table-wrap"><table class="table">
              <thead><tr><th>Bus</th><th>Driver</th><th>Route</th><th>Status</th><th>Occupancy</th><th>ETA</th><th>Traffic</th></tr></thead>
              <tbody>${D().buses.map((b) => {
                const s = st.buses[b.id];
                return `<tr><td><b>${esc(b.name)}</b></td><td>${esc(b.driverName)}</td><td>${esc(s.routeName)}</td>
                <td><span class="pill ${s.tripStatus === 'Active' ? 'on' : s.tripStatus === 'Arrived' ? 'gold' : 'off'}">${s.tripStatus}</span></td>
                <td>${s.occupancyPct}%</td><td>${s.etaToCampus != null ? '~' + s.etaToCampus + ' min' : '—'}</td><td>${esc(s.trafficStatus)}</td></tr>`;
              }).join('')}</tbody>
            </table></div>
          </div>
          ${st.emergency ? `
          <div class="panel" style="border-color:var(--red-500)">
            <h3 style="color:var(--red-600)">${icon('i-siren')} Active Emergency</h3>
            <p style="font-size:14px">${esc(st.emergency.busId)} · ${esc(st.emergency.type)} · reported ${esc(st.emergency.at)}</p>
            <button class="btn btn-danger btn-sm mt-16" id="clearEmg">${icon('i-check')} Mark Resolved</button>
          </div>` : '<div class="panel"><h3>Emergencies</h3><p style="font-size:13.5px;color:var(--ink-500)">No active emergencies. Drivers can trigger SOS from the Driver Console.</p></div>'}
          <div class="panel">
            <h3>Trip History</h3>
            <div class="table-wrap"><table class="table">
              <thead><tr><th>Trip</th><th>Bus</th><th>Route</th><th>Status</th><th>Passengers</th></tr></thead>
              <tbody>${st.trips.slice(-8).reverse().map((t) => `<tr><td>${esc(t.tripId)}</td><td>${esc(t.busName)}</td><td>${esc(t.routeName)}</td><td><span class="pill ${t.status === 'COMPLETED' ? 'on' : 'active'}">${esc(t.status)}</span></td><td>${t.passengers}</td></tr>`).join('') || '<tr><td colspan="5"><div class="empty-state">No trips yet.</div></td></tr>'}</tbody>
            </table></div>
          </div>`;
      }
      return '';
    };

    const html = dashShell(user, adminTabs, 'overview', render);
    const setup = (tab) => {
      if (tab === 'students') {
        const drawStudents = (q) => {
          const f = (q || '').toLowerCase();
          const body = $('#stuBody');
          if (!body) return;
          body.innerHTML = studentsCol.all().filter((s) => !f || s.name.toLowerCase().includes(f) || s.id.toLowerCase().includes(f))
            .map((s) => `<tr><td>${esc(s.id)}</td><td><b>${esc(s.name)}</b></td><td>${esc(s.sec)}</td><td>${esc(s.group)}</td><td><span class="chip chip-cat">${esc(s.card || '—')}</span></td><td>${s.cgpa}</td><td><button class="btn btn-danger btn-sm" data-sdel="${esc(s.id)}">${icon('i-trash')}</button></td></tr>`).join('');
          $$('[data-sdel]').forEach((b) => b.addEventListener('click', () => { studentsCol.remove(b.dataset.sdel); drawStudents($('#stuSearch').value); toast('Student removed'); }));
        };
        drawStudents('');
        const stuSearch = $('#stuSearch');
        if (stuSearch) stuSearch.addEventListener('input', () => drawStudents(stuSearch.value));
      }
      if (tab === 'notices') {
        const noticeForm = $('#noticeForm');
        if (noticeForm) noticeForm.addEventListener('submit', (e) => {
          e.preventDefault();
          noticesCol.add({ id: Date.now() % 100000, date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }), cat: $('#nCat').value, badge: 'NEW', title: $('#nTitle').value.trim(), summary: $('#nSum').value.trim(), body: $('#nSum').value.trim(), attachment: '' });
          toast('Notice published', 'success');
          bindDash($('#view'), adminTabs, 'notices', render, setup);
        });
        $$('[data-del]').forEach((b) => b.addEventListener('click', () => { noticesCol.remove(+b.dataset.del); bindDash($('#view'), adminTabs, 'notices', render, setup); }));
      }
      if (tab === 'help') {
        $$('[data-hrep]').forEach((b) => b.addEventListener('click', () => {
          const h = helpCol.all().find((x) => x.id === +b.dataset.hrep);
          openModal(`
            <p style="font-weight:600">${esc(h.q)}</p>
            <div class="field mt-16"><label class="label">Status</label><select id="hs" class="select">${['Pending', 'In Progress', 'Resolved', 'Rejected'].map((s) => `<option ${h.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div>
            <button class="btn btn-primary btn-sm" id="hsSave">Update</button>`, { title: 'Manage Request' });
          $('#hsSave').addEventListener('click', () => { helpCol.update(h.id, { status: $('#hs').value }); closeModal(); toast('Status updated'); });
        }));
      }
      if (tab === 'transport') {
        const clearEmg = $('#clearEmg');
        if (clearEmg) clearEmg.addEventListener('click', () => { window.NITER.transport.clearEmergency(); bindDash($('#view'), adminTabs, 'transport', render, setup); });
      }
    };
    setTimeout(() => bindDash($('#view'), adminTabs, 'overview', render, setup), 0);
    return html;
  }

  /* ---------------- boot ---------------- */
  window.NITER.renderStudentPortal = studentDashboard;
  window.NITER.renderTeacherPortal = teacherDashboard;
  window.NITER.renderAdminPortal = adminDashboard;
  window.NITER.portals = { bindDash, dashShell, exportPDF };
})();
