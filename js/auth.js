/* ============================================================================
   NITER Smart Campus — DEMO FRONTEND AUTHENTICATION
   ----------------------------------------------------------------------------
   Student login uses the Class ID (e.g. CS 2405006) + temporary password
   123456@#. Teacher login uses the short teacher name (e.g. SSH) + temporary
   password 654321@#. Admin: admin / admin123.

   Passwords can be changed per student — the overrides are stored in
   localStorage ("niter.passwords"). This is NOT production-grade security;
   a real deployment must hash passwords and authenticate server-side.
   ============================================================================ */
(function () {
  'use strict';
  const { $, $$, esc, icon, toast, closeModal, openModal } = window.NITER.ui;
  const D = () => window.NITER_DATA;
  const KEY = 'niter.session';
  const PW_KEY = 'niter.passwords';

  function currentUser() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
  }
  function setUser(u) { localStorage.setItem(KEY, JSON.stringify(u)); }
  function logout() {
    localStorage.removeItem(KEY);
    window.location.hash = '#/';
    toast('Logged out successfully');
  }

  /* ---------------- per-student password overrides ---------------- */
  function passOverrides() { try { return JSON.parse(localStorage.getItem(PW_KEY)) || {}; } catch (e) { return {}; } }
  function studentPassword(id) { return passOverrides()[id] || '123456@#'; }
  function setStudentPassword(id, pw) { const o = passOverrides(); o[id] = pw; try { localStorage.setItem(PW_KEY, JSON.stringify(o)); } catch (e) {} }

  /* ---------------- login page ---------------- */
  function loginHTML(role) {
    const meta = {
      student: { title: 'Student Portal', sub: 'Courses, routine, attendance, results, notices & Helping Zone', icon: 'i-grad' },
      teacher: { title: 'Teacher Portal', sub: 'Courses, attendance, marks, routine & student support', icon: 'i-book' },
      admin: { title: 'Admin Portal', sub: 'Academic info, users, courses, rooms, routines & reports', icon: 'i-shield' },
    }[role] || { title: 'Portal', sub: '', icon: 'i-lock' };

    const creds = role === 'student' ? `
      <div class="login-cred">
        <strong style="font-size:13px;display:block;margin-bottom:6px">Demo Credentials</strong>
        <b>Class ID:</b> <code>CS 2405006</code> &nbsp;·&nbsp; <b>Password:</b> <code>123456@#</code>
        <span style="display:block;margin-top:6px;font-size:12px;color:var(--ink-500)">98 students (CSE 2-1, Section A &amp; B) are registered. Use any <b>CS 24050XX</b> Class ID.</span>
      </div>`
      : role === 'teacher' ? `
      <div class="login-cred">
        <strong style="font-size:13px;display:block;margin-bottom:6px">Demo Credentials</strong>
        <b>Teacher ID (short name):</b> <code>SSH</code> &nbsp;·&nbsp; <b>Password:</b> <code>654321@#</code>
        <span style="display:block;margin-top:6px;font-size:12px;color:var(--ink-500)">e.g. <code>JTT</code>, <code>SSH</code>, <code>UKD</code>, <code>MR</code>, <code>SKB</code>, <code>KN</code>, <code>MMR</code>, <code>MAB</code>, <code>MdAM</code>, <code>TA</code>, <code>DMSS</code> — password is the same for all.</span>
      </div>`
      : `<div class="login-cred">Demo admin — <code>admin</code> / <code>admin123</code></div>`;

    const idLabel = role === 'student' ? 'Class ID' : role === 'teacher' ? 'Teacher ID' : 'Username';
    const idPh = role === 'student' ? 'e.g., CS 2405006' : role === 'teacher' ? 'e.g., SSH' : 'admin';

    return `
    <div class="login-wrap">
      <div class="login-card">
        <div class="login-head">
          <span class="q-icon" style="width:44px;height:44px;background:rgb(255 255 255/.14);color:var(--gold-400);margin-bottom:12px">${icon(meta.icon)}</span>
          <h1>${meta.title}</h1>
          <p>${meta.sub}</p>
        </div>
        <div class="login-body">
          ${creds}
          <form id="loginForm" novalidate>
            <div class="field"><label class="label">${idLabel}</label>
              <div class="input-wrap">${icon('i-user')}<input id="lgId" class="input" required autocomplete="username" placeholder="${idPh}" /></div>
            </div>
            <div class="field"><label class="label">Password</label>
              <div class="input-wrap">${icon('i-lock')}<input id="lgPass" class="input" type="password" required autocomplete="current-password" placeholder="••••••••" />
                <button type="button" class="pw-toggle" id="lgToggle" aria-label="Show password">${icon('i-eye')}</button></div>
            </div>
            <div class="login-opt">
              <label class="check"><input type="checkbox" id="lgRemember" /> Remember Me</label>
              <button type="button" class="link-btn" id="lgForgot">Forgot Password?</button>
            </div>
            <button class="btn btn-primary" style="width:100%" type="submit">${icon('i-lock')} Login</button>
          </form>
          <div id="loginError" class="login-error" hidden></div>
          <p class="hint center mt-16"><b>DEMO FRONTEND AUTHENTICATION</b> — not production-grade security.</p>
        </div>
      </div>
    </div>`;
  }

  function afterLogin(role) {
    // password visibility toggle
    const toggle = $('#lgToggle');
    if (toggle) toggle.addEventListener('click', () => {
      const p = $('#lgPass');
      p.type = p.type === 'password' ? 'text' : 'password';
    });

    const forgot = $('#lgForgot');
    if (forgot) forgot.addEventListener('click', () => {
      openModal(`
        <p style="color:var(--ink-500);font-size:13.5px;line-height:1.7">Please contact the <b>NITER ICT / Exam Control Office</b> to reset your password, or use the temporary password
        <code>${role === 'teacher' ? '654321@#' : '123456@#'}</code> shown on this page.</p>`, { title: 'Forgot Password' });
    });

    $('#loginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const errBox = $('#loginError');
      const showErr = (msg) => { errBox.hidden = false; errBox.innerHTML = icon('i-alert') + ' ' + esc(msg); };
      const rawId = $('#lgId').value.trim();
      const id = rawId.toUpperCase().replace(/\s+/g, ' ').trim();
      const pass = $('#lgPass').value.trim();
      let user = null;

      if (role === 'student') {
        const s = D().students.find((x) => x.id.toUpperCase() === id);
        if (!s) { showErr('The Class ID you entered is not registered in the Student Portal. Please check your Class ID and try again.'); return; }
        if (studentPassword(s.id) !== pass) { showErr('The password you entered is incorrect. Please try again or use the password recovery option.'); return; }
        user = { role: 'student', sub: s.id, name: s.name, dept: s.dept, deptName: s.deptName, level: s.level, term: s.term, heldIn: s.heldIn, sec: s.sec, group: s.group, batch: s.batch, program: s.program, cgpa: s.cgpa, card: s.card, phone: s.phone, email: s.email };
      } else if (role === 'teacher') {
        const t = D().teachers.find((x) => x.id.toUpperCase() === id);
        if (!t || t.pass !== pass) { showErr('The Teacher ID or password you entered is incorrect. Please try again.'); return; }
        user = { role: 'teacher', sub: t.id, name: t.name, dept: t.dept, designation: t.designation, phone: t.phone, email: t.email };
      } else {
        const a = D().admin;
        if (id !== a.id.toUpperCase() || pass !== a.pass) { showErr('Invalid admin credentials. Please try again.'); return; }
        user = { role: 'admin', sub: a.id, name: a.name };
      }

      const remember = $('#lgRemember') && $('#lgRemember').checked;
      if (!remember) { /* session cookie-like: keep in memory only for demo */ }
      setUser(user);
      closeModal();
      toast(`Welcome, ${user.name}!`, 'success');
      window.location.hash = role === 'student' ? '#/portal/student' : role === 'teacher' ? '#/portal/teacher' : '#/portal/admin';
    });
  }

  window.NITER.auth = { currentUser, setUser, logout, studentPassword, setStudentPassword };
  window.NITER.renderLogin = loginHTML;
  window.NITER.afterLogin = afterLogin;
})();
