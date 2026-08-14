/* ============================================================================
   NITER Smart Campus — static demo data.
   All data lives here in plain JS so the site works directly from index.html
   with no backend, no fetch(), and no server. (Demo-only, not production.)
   ============================================================================ */
window.NITER_DATA = (function () {
  'use strict';

  /* ========================================================================
     STUDENT DATABASE — CSE 2-1 (Level 2, Term 1) · Section A & B · 98 students
     Class ID format: CS 24050XX. Group: A1 (01-25), A2 (26-49), B1 (50-76),
     B2 (77-98). Bus Card = BUS + last two digits of the Class ID.
     ======================================================================== */
  var SEC_A_NAMES = [
    'REFA TASFIA', 'UMMEY FAHMIDA OISHY', 'JUNAEED AHMED', 'MD. RAFIUL ISLAM', 'ARAFAT RAHMAN',
    'ARIFIN RUPOM', 'BIPROJIT SAHA', 'ADIBA ASHRAFI FARIHA', 'SADMAN FUAD RAFI', 'MUHAMMAD DIDARUL ISLAM',
    'BIJOY KARMOKER', 'IFAT ARA ADIBA', 'TASLIMA HAQUE AUPEE', 'SABBIR HOSSEN', 'FARIA HOSSAIN DEEBA',
    'SANJIDA ISLAM', 'MD. JAHIDUR RAHMAN', 'ASIFUL MAULA ABIR', 'MD. HADIUZZAMAN', 'FARHAN FAHAD KHANDAKER',
    'YEASIN RAHMAN PRINCE', 'MD. SURAIM SARKER', 'MD. MINHAJULISLAM RIFAT', 'FAHMID AL ZABRI ARIYAN', 'PROTIVA DATTA',
    'MST. SAIFA BINTA SNEHA', 'MD. AHSAN HABIB', 'NABILA HOSSAIN', 'MD. ABID HASAN', 'MD. SAMIUL ISLAM RAFI',
    'JAWADUL WASI DHRUBA', 'NABILA NAWSHIN', 'SHAHARIAR SHARFUDDIN SOHAN', 'ZOHRA BINTE ZOHA', 'MD. RAUFUL HAQUE',
    'MAISHA GAZI', 'MD. ABIR HOSSAN', 'MAHI IBNE ALIF ISLAM', 'SIAM AHMED', 'ABU FARHAN MD. KAIF SHARKER',
    'PRINCE MAHIR BIN SALAHUDDIN', 'MST. SUMAIYA', 'MD. MEHENUR RAHMAN KOYES', 'SWOPNILE SARKAR', 'MD. ZOHAIMOZZAMAN ANIK',
    'NAWRIN BULBUL', 'MD. WAHIDUZZAMAN ANTOR', 'SOUMIK SIKDER', 'JANNATUL FARDOUSE TANU'
  ];
  var SEC_B_NAMES = [
    'NASIR AHAMED EFTY', 'MD. MIFTAUR RAHMAN SHOWDHO', 'MUHAMMAD SHAHRIAR EBRAHIM', 'PROTIC PRAPPO DURJOY', 'MD. AZIZUR RAHMAN SHIHAB',
    'NUSRAT ALAM MIM', 'MALIHA MONOWARA', 'MARJANA SULTANA AURTHEE', 'MD. OMAR FARUK MIHIR', 'TASNIM TABASSUM',
    'AZMUSSAKIB SHARIL', 'MD. ARIF SHAHRIAR DEEP', 'TANJIM HOSSAIN MOUNO', 'ZISAN ZAMAN', 'MD. KAMRUL HASAN RIFAT',
    'ROHAN PARVEJ', 'MD. TAHSIN MAHTAB', 'RIDWAN NAFI DRUBA', 'ABID HOSSAIN', 'KANIJ FATAMA OISHEE',
    'NAZAT AL HASAN', 'MD. NIYAMUL HASAN', 'TALHA JUBAIR SADMAN', 'FARDINA LABONNO', 'MIRAZUL ISLAM',
    'MD. AZIZUL ISLAM', 'AISHWARYA SINHA', 'MD. SHAMIM ISLAM', 'MD. SAIF HAWLADER', 'ZIAD MAHMUD',
    'SHAHRIAR KABIR SHOROT', 'MOINUL ISLAM NABIN', 'SANCHAYAN SEN GUPTA', 'MD. READ ALI', 'SABYASACHI SAHA',
    'MD. UMAYED', 'MIR ABU KASHEM FARIG', 'MST. SAMIYA ALAM', 'SEJUTI SAHA', 'ABDUL KAIUM',
    'NIRJHOR BANIK', 'MOHAMMAD RAFIUL ISLAM', 'FARIA HAYAT KHAN', 'MD. WALID EHSAN', 'SAJJADUR RAHAMAN',
    'SUPTA SARKER', 'JANNATUL HUSNA', 'IMTIAZ AHMAD RATUL', 'SOMAYA AKTER EKRA'
  ];

  function hashStr(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0); }

  function groupOf(no) { var last2 = no % 100; if (last2 <= 25) return 'A1'; if (last2 <= 49) return 'A2'; if (last2 <= 76) return 'B1'; return 'B2'; }
  function secOf(no) { return (no % 100) <= 49 ? 'A' : 'B'; }
  function pad2(n) { return String(n).padStart(2, '0'); }
  function makeStudent(no, name, index) {
    var last2 = pad2(no % 100);
    var id = 'CS 24050' + last2;
    var slug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return {
      id: id, name: name,
      dept: 'CSE', deptName: 'Computer Science & Engineering',
      level: '2', term: '1', heldIn: '2024-2025 Level 2 Term 1 April-September 2026',
      sec: secOf(no), group: groupOf(no), batch: '5', program: 'B.Sc. in Computer Science & Engineering',
      pass: '123456@#', card: 'BUS' + last2,
      email: slug + last2 + '@niter.edu.bd',
      phone: index === 5 ? '01744730296' : '01744' + pad2(index + 1) + String((hashStr(id) % 1000)).padStart(3, '0'),
      cgpa: (2.8 + (hashStr(id + 'cg') % 12) / 10).toFixed(2),
      aka: name === 'MST. SAIFA BINTA SNEHA' ? 'Sneha Rahman' : null,
    };
  }
  var students = [];
  SEC_A_NAMES.forEach(function (n, i) { students.push(makeStudent(2405001 + i, n, i)); });
  SEC_B_NAMES.forEach(function (n, i) { students.push(makeStudent(2405050 + i, n, i + 49)); });

  /* ========================================================================
     TEACHERS — short name (used as Teacher Portal ID) + full name & contact.
     Temporary password for all: 654321@#
     ======================================================================== */
  var teachers = [
    { id: 'JTT', tid: 'T001', name: 'Jarin Tasnim Tamanna', dept: 'CSE', designation: 'Lecturer', phone: '01798614562', email: 'jtasnim@niter.edu.bd', pass: '654321@#' },
    { id: 'SSH', tid: 'T002', name: 'Shakila Shafiq', dept: 'CSE', designation: 'Lecturer', phone: '01991677002', email: 'sshafiq@niter.edu.bd', pass: '654321@#' },
    { id: 'UKD', tid: 'T003', name: 'Utpol Kanti Das', dept: 'CSE', designation: 'Lecturer', phone: '01859222633', email: 'ukdas@niter.edu.bd', pass: '654321@#' },
    { id: 'MAB', tid: 'T004', name: 'Md. Abul Basar', dept: 'CSE', designation: 'Assistant Professor', phone: '01758443472', email: 'mohammad.basar26@gmail.com', pass: '654321@#' },
    { id: 'MdAM', tid: 'T005', name: 'Md. Alam Miah', dept: 'CSE', designation: 'Lecturer', phone: '01706446160', email: 'mdalammiah2001@gmail.com', pass: '654321@#' },
    { id: 'TA', tid: 'T006', name: 'Tanvir Ahmed', dept: 'CSE', designation: 'Lecturer', phone: '01816299924', email: 'tanvir@niter.edu.bd', pass: '654321@#' },
    { id: 'MR', tid: 'T007', name: 'Muaz Rahman', dept: 'EEE', designation: 'Lecturer', phone: '01908189430', email: 'muaz@niter.edu.bd', pass: '654321@#' },
    { id: 'DMSS', tid: 'T008', name: 'Dr. Mohammed Shahriar Sabuktagin', dept: 'EEE', designation: 'Assistant Professor', phone: '01908455906', email: 'aireza@niter.edu.bd', pass: '654321@#' },
    { id: 'SKB', tid: 'T009', name: 'Shemanta Kumar Biswas', dept: 'Mathematics', designation: 'Lecturer', phone: '01729909606', email: 'simantabiswasku@gmail.com', pass: '654321@#' },
    { id: 'KN', tid: 'T010', name: 'Kamrun Nahar', dept: 'Social Science', designation: 'Lecturer', phone: '+8801521200063', email: 'knahar@niter.edu.bd', pass: '654321@#' },
    { id: 'MMR', tid: 'T011', name: 'Md. Musfikur Rahman', dept: 'EEE', designation: 'Lecturer', phone: '01737184118', email: 'musfikur@niter.edu.bd', pass: '654321@#' },
  ];

  /* ========================================================================
     COURSES — CSE 2-1 · Level 2 Term 1 · held in April-September 2026
     ======================================================================== */
  var courses = [
    { code: 'CSE-2101', name: 'Data Structures and Algorithms', credit: 3.00, type: 'Theory', semester: '2-1', year: 2, term: 1, dept: 'CSE', teacher: 'JTT' },
    { code: 'CSE-2102', name: 'Object Oriented Programming', credit: 3.00, type: 'Theory', semester: '2-1', year: 2, term: 1, dept: 'CSE', teacher: 'SSH' },
    { code: 'CSE-2103', name: 'Digital Electronics and Pulse Technique', credit: 3.00, type: 'Theory', semester: '2-1', year: 2, term: 1, dept: 'CSE', teacher: 'UKD' },
    { code: 'CSE-2111', name: 'Data Structures and Algorithms Lab', credit: 1.50, type: 'Lab', semester: '2-1', year: 2, term: 1, dept: 'CSE', teacher: 'MAB', teachersByGroup: { A1: 'MAB', A2: 'MdAM', B1: 'JTT', B2: 'MdAM' } },
    { code: 'CSE-2112', name: 'Object Oriented Programming Lab', credit: 1.50, type: 'Lab', semester: '2-1', year: 2, term: 1, dept: 'CSE', teacher: 'SSH', teachersByGroup: { A1: 'SSH', A2: 'TA', B1: 'MdAM', B2: 'SSH' } },
    { code: 'CSE-2113', name: 'Digital Electronics and Pulse Technique Lab', credit: 1.50, type: 'Lab', semester: '2-1', year: 2, term: 1, dept: 'CSE', teacher: 'UKD', teachersByGroup: { A1: 'UKD', A2: 'MdAM', B1: 'MdAM', B2: 'MdAM' } },
    { code: 'EEE-2104', name: 'Electronic Devices and Circuits', credit: 3.00, type: 'Theory', semester: '2-1', year: 2, term: 1, dept: 'EEE', teacher: 'MR' },
    { code: 'EEE-2114', name: 'Electronic Devices and Circuits Lab', credit: 0.75, type: 'Lab', semester: '2-1', year: 2, term: 1, dept: 'EEE', teacher: 'DMSS', teachersByGroup: { A1: 'DMSS', A2: 'DMSS', B1: 'MR', B2: 'MMR' } },
    { code: 'MATH-2105', name: 'Linear Algebra', credit: 3.00, type: 'Theory', semester: '2-1', year: 2, term: 1, dept: 'Mathematics', teacher: 'SKB' },
    { code: 'SS-2106', name: 'Bangladesh Studies', credit: 2.00, type: 'Theory', semester: '2-1', year: 2, term: 1, dept: 'Social Science', teacher: 'KN' },
  ];

  /* ========================================================================
     CLASS ROUTINE — Section A / B theory + A1, A2, B1, B2 lab groups.
     ======================================================================== */
  function R(code, day, room, start, end, section) {
    var c = courses.find(function (x) { return x.code === code; });
    return { code: code, title: c.name, teacher: c.teacher, day: day, room: room, start: start, end: end, kind: c.type, section: section, group: null };
  }
  function LAB(code, day, room, start, end, teacher) {
    var c = courses.find(function (x) { return x.code === code; });
    return { code: code, title: c.name, teacher: teacher, day: day, room: room, start: start, end: end, kind: 'Lab', section: null, group: null };
  }

  var THEORY_A = [
    R('CSE-2101', 'Sun', '210', '10:30 AM', '11:45 AM', 'A'), R('CSE-2101', 'Tue', '119', '8:00 AM', '9:15 AM', 'A'),
    R('CSE-2102', 'Sun', '204', '11:45 AM', '1:00 PM', 'A'), R('CSE-2102', 'Tue', '204', '9:15 AM', '10:30 AM', 'A'),
    R('CSE-2103', 'Wed', '120', '10:30 AM', '11:45 AM', 'A'), R('CSE-2103', 'Thu', '120', '11:45 AM', '1:00 PM', 'A'),
    R('EEE-2104', 'Wed', '210', '11:45 AM', '1:00 PM', 'A'), R('EEE-2104', 'Thu', '210', '10:30 AM', '11:45 AM', 'A'),
    R('MATH-2105', 'Sun', '210', '9:15 AM', '10:30 AM', 'A'), R('MATH-2105', 'Mon', '210', '9:15 AM', '10:30 AM', 'A'),
    R('SS-2106', 'Sun', '119', '8:00 AM', '9:15 AM', 'A'), R('SS-2106', 'Mon', '119', '8:00 AM', '9:15 AM', 'A'),
  ];
  var THEORY_B = [
    R('CSE-2101', 'Sun', '120', '11:45 AM', '1:00 PM', 'B'), R('CSE-2101', 'Tue', '120', '9:15 AM', '10:30 AM', 'B'),
    R('CSE-2102', 'Sun', '204', '10:30 AM', '11:45 AM', 'B'), R('CSE-2102', 'Tue', '204', '8:00 AM', '9:15 AM', 'B'),
    R('CSE-2103', 'Wed', '120', '11:45 AM', '1:00 PM', 'B'), R('CSE-2103', 'Thu', '120', '10:30 AM', '11:45 AM', 'B'),
    R('EEE-2104', 'Wed', '210', '10:30 AM', '11:45 AM', 'B'), R('EEE-2104', 'Thu', '210', '11:45 AM', '1:00 PM', 'B'),
    R('MATH-2105', 'Sun', '210', '8:00 AM', '9:15 AM', 'B'), R('MATH-2105', 'Mon', '210', '8:00 AM', '9:15 AM', 'B'),
    R('SS-2106', 'Sun', '119', '9:15 AM', '10:30 AM', 'B'), R('SS-2106', 'Mon', '119', '9:15 AM', '10:30 AM', 'B'),
  ];
  var LABS_A1 = [
    LAB('CSE-2111', 'Sun', 'AD-111', '1:30 PM', '4:00 PM', 'MAB'),
    LAB('CSE-2112', 'Mon', 'AC-202', '10:30 AM', '1:00 PM', 'SSH'),
    LAB('CSE-2113', 'Tue', 'AC-205', '10:30 AM', '1:00 PM', 'UKD'),
    LAB('EEE-2114', 'Wed', 'AC-126', '1:30 PM', '4:00 PM', 'DMSS'),
  ];
  var LABS_A2 = [
    LAB('CSE-2111', 'Sun', 'AC-205', '1:30 PM', '4:00 PM', 'MdAM'),
    LAB('CSE-2112', 'Tue', 'AC-217', '10:30 AM', '1:00 PM', 'TA'),
    LAB('CSE-2113', 'Mon', 'AC-205', '10:30 AM', '1:00 PM', 'MdAM'),
    LAB('EEE-2114', 'Wed', 'AC-126', '1:30 PM', '4:00 PM', 'DMSS'),
  ];
  var LABS_B1 = [
    LAB('CSE-2111', 'Tue', 'AC-202', '10:30 AM', '1:00 PM', 'JTT'),
    LAB('CSE-2112', 'Thu', 'AC-131', '1:30 PM', '4:00 PM', 'MdAM'),
    LAB('CSE-2113', 'Wed', 'AC-205', '8:00 AM', '10:30 AM', 'MdAM'),
    LAB('EEE-2114', 'Sun', 'AC-126', '1:30 PM', '4:00 PM', 'MR'),
  ];
  var LABS_B2 = [
    LAB('CSE-2111', 'Tue', 'AD-111', '10:30 AM', '1:00 PM', 'MdAM'),
    LAB('CSE-2112', 'Wed', 'AD-111', '8:00 AM', '10:30 AM', 'SSH'),
    LAB('CSE-2113', 'Thu', 'AC-205', '8:00 AM', '10:30 AM', 'MdAM'),
    LAB('EEE-2114', 'Sun', 'AC-126', '1:30 PM', '4:00 PM', 'MMR'),
  ];
  var routineGroups = {
    A1: THEORY_A.concat(LABS_A1),
    A2: THEORY_A.concat(LABS_A2),
    B1: THEORY_B.concat(LABS_B1),
    B2: THEORY_B.concat(LABS_B2),
  };
  // label each entry with its group so the teacher portal can group students
  Object.keys(routineGroups).forEach(function (g) {
    routineGroups[g].forEach(function (e) { e.group = g; });
  });

  /* ========================================================================
     ATTENDANCE — per student per course { total, present }.
     Arifin Rupom (CS 2405006) uses the exact values from the demo dashboard.
     Other students: deterministic variation seeded per student+course.
     ======================================================================== */
  var ATT_SEED = {
    'CSE-2101': { total: 13, present: 13 }, 'CSE-2102': { total: 15, present: 14 },
    'CSE-2103': { total: 19, present: 17 }, 'CSE-2111': { total: 9, present: 9 },
    'CSE-2112': { total: 10, present: 9 }, 'CSE-2113': { total: 11, present: 11 },
    'EEE-2104': { total: 15, present: 15 }, 'EEE-2114': { total: 0, present: 0 },
    'MATH-2105': { total: 11, present: 11 }, 'SS-2106': { total: 11, present: 10 },
  };
  var attendance = {};
  Object.keys(ATT_SEED).forEach(function (code) {
    attendance[code] = {};
    students.forEach(function (s) {
      if (s.id === 'CS 2405006') { attendance[code][s.id] = { total: ATT_SEED[code].total, present: ATT_SEED[code].present }; return; }
      var h = hashStr(s.id + '|' + code);
      var total = ATT_SEED[code].total === 0 ? 0 : 12 + (h % 8);
      var skip = (h >> 4) % 5; // 0..4 missed classes
      var present = total === 0 ? 0 : Math.max(0, total - (skip <= 2 ? skip : 0));
      attendance[code][s.id] = { total: total, present: present };
    });
  });

  /* ========================================================================
     RESULTS — teacher portion (two assessments, out of 30 each, averaged) +
     DU final exam (out of 70, simulated). Total out of 100.
     ======================================================================== */
  function gradeOf(t) {
    if (t >= 80) return ['A+', 4.0]; if (t >= 75) return ['A', 4.0];
    if (t >= 70) return ['A-', 3.75]; if (t >= 65) return ['B+', 3.5];
    if (t >= 60) return ['B', 3.0]; if (t >= 55) return ['B-', 2.75];
    if (t >= 50) return ['C+', 2.5]; if (t >= 45) return ['C', 2.25];
    return ['F', 0];
  }
  var results = {};
  courses.forEach(function (c) {
    results[c.code] = {};
    students.forEach(function (s) {
      var h = hashStr(s.id + '|res|' + c.code);
      var a1 = 17 + (h % 13);          // out of 30
      var a2 = 16 + ((h >> 4) % 13);   // out of 30
      var du = 45 + ((h >> 8) % 25);   // out of 70 (simulated DU final)
      var teacher30 = Math.round((a1 + a2) / 2);
      var total = Math.min(100, teacher30 + du);
      var g = gradeOf(total);
      results[c.code][s.id] = { a1: a1, a2: a2, teacher: teacher30, du: du, total: total, grade: g[0], gp: g[1] };
    });
  });

  /* ========================================================================
     BILLS — identical installment structure for every student (demo).
     ======================================================================== */
  function makeBills() {
    var base = [
      { term: 'Level 1 Term 1', ref: 24100900123, bill: 50500, date: '09-Oct-24', type: 'Admission/Tuition Fee', paid: 50500, payDate: '', collDate: '09-Oct-24', remark: '' },
      { term: 'Level 1 Term 1', ref: 24100900124, bill: 29100, date: '09-Oct-24', type: 'Installment Fee (2)', paid: 29100, payDate: '10-03-2025', collDate: '06-Apr-25', remark: 'Installment 2 late fine for 1 month' },
      { term: 'Level 1 Term 1', ref: 25042100011, bill: 4600, date: '21-Apr-25', type: 'Exam Fee', paid: 4600, payDate: '', collDate: '22-Apr-25', remark: '' },
      { term: 'Level 1 Term 2', ref: 25080400005, bill: 29200, date: '04-Aug-25', type: 'Installment Fee (3)', paid: 29200, payDate: '20-08-2025', collDate: '16-Oct-25', remark: 'Installment 3 late fine for 2 month' },
      { term: 'Level 1 Term 2', ref: 25102100309, bill: 29300, date: '21-Oct-25', type: 'Installment Fee (4)', paid: 29300, payDate: '10-11-2025', collDate: '10-Jan-26', remark: 'Installment 4 late fine for 3 month' },
      { term: 'Level 1 Term 2', ref: 26020100007, bill: 4600, date: '01-Feb-26', type: 'Exam Fee', paid: 4600, payDate: '', collDate: '03-Feb-26', remark: '' },
      { term: 'Level 2 Term 1', ref: 26042300004, bill: 29200, date: '23-Apr-26', type: 'Installment Fee (5)', paid: 29200, payDate: '10-05-2026', collDate: '28-Jun-26', remark: 'Installment 5 late fine for 2 month' },
      { term: 'Level 2 Term 1', ref: 26072100014, bill: 29100, date: '21-Jul-26', type: 'Installment Fee (6)', paid: 0, payDate: '10-08-2026', collDate: '', remark: 'Installment 6 late fine for 1 month', due: true },
      { term: 'Level 2 Term 1', ref: 26080900019, bill: 4600, date: '09-Aug-26', type: 'Exam Fee', paid: 4600, payDate: '', collDate: '10-Aug-26', remark: '' },
    ];
    var byStudent = {};
    students.forEach(function (s, idx) {
      byStudent[s.id] = base.map(function (r) {
        var row = Object.assign({}, r);
        row.ref = (r.ref + idx * 17) % 100000000000;
        return row;
      });
    });
    return byStudent;
  }
  var bills = makeBills();

  /* ========================================================================
     ACADEMIC CALENDAR — 4 years × 2 semesters (official NITER structure).
     ======================================================================== */
  var academicCalendar = [
    {
      year: 1, label: '1st Year', session: '2024-2025',
      semesters: [
        { n: 1, label: '1st Semester', heldIn: '2024-2025 Level 1 Term 1 April-September 2025', items: [
          { date: '06 Apr 2025', title: 'Semester Start', cat: 'Academic', note: 'Academic session 2024-2025 begins.' },
          { date: '10 Apr 2025', title: 'Registration Period', cat: 'Registration', note: 'Course registration for Level 1 Term 1 (online + offline).' },
          { date: '14 Apr 2025', title: 'Class Commencement', cat: 'Academic', note: 'Regular theory and laboratory classes begin.' },
          { date: '30 Apr 2025', title: 'Course Drop / Add Deadline', cat: 'Deadline', note: 'Last date to add or drop courses.' },
          { date: '02 Jun 2025', title: 'Midterm Examination', cat: 'Examination', note: 'Midterm exams across all departments.' },
          { date: '15 Jun 2025', title: 'Midterm Result Publication', cat: 'Result', note: 'Midterm results published on the portal.' },
          { date: '10 Aug 2025', title: 'Final Examination', cat: 'Examination', note: 'Term final examinations begin.' },
          { date: '05 Sep 2025', title: 'Result Publication', cat: 'Result', note: 'Final results and GPA published.' },
          { date: '15 Sep 2025', title: 'Semester Break', cat: 'Holiday', note: 'Short break before the next term.' },
        ] },
        { n: 2, label: '2nd Semester', heldIn: '2024-2025 Level 1 Term 2 October 2025-March 2026', items: [
          { date: '06 Oct 2025', title: 'Semester Start', cat: 'Academic', note: 'Level 1 Term 2 begins.' },
          { date: '12 Oct 2025', title: 'Registration Period', cat: 'Registration', note: 'Course registration for Level 1 Term 2.' },
          { date: '16 Oct 2025', title: 'Class Commencement', cat: 'Academic', note: 'Regular classes begin.' },
          { date: '20 Dec 2025', title: 'Midterm Examination', cat: 'Examination', note: 'Midterm exams begin.' },
          { date: '01 Jan 2026', title: 'New Year Holiday', cat: 'Holiday', note: 'Public holiday — classes suspended.' },
          { date: '28 Jan 2026', title: 'Final Examination', cat: 'Examination', note: 'Term final examinations begin.' },
          { date: '25 Feb 2026', title: 'Result Publication', cat: 'Result', note: 'Final results and GPA published.' },
          { date: '05 Mar 2026', title: 'Semester Break', cat: 'Holiday', note: 'Break before the new academic year.' },
        ] },
      ],
    },
    {
      year: 2, label: '2nd Year', session: '2024-2025',
      semesters: [
        { n: 1, label: '1st Semester', heldIn: '2024-2025 Level 2 Term 1 April-September 2026', items: [
          { date: '05 Apr 2026', title: 'Semester Start', cat: 'Academic', note: 'Level 2 Term 1 begins (held in April-September 2026).' },
          { date: '10 Apr 2026', title: 'Registration Period', cat: 'Registration', note: 'Course registration for Level 2 Term 1.' },
          { date: '13 Apr 2026', title: 'Class Commencement', cat: 'Academic', note: 'Regular theory and lab classes begin.' },
          { date: '01 May 2026', title: 'May Day Holiday', cat: 'Holiday', note: 'Public holiday — classes suspended.' },
          { date: '05 Jul 2026', title: 'Midterm Examination', cat: 'Examination', note: 'Midterm exams across all departments.' },
          { date: '18 Jul 2026', title: 'Midterm Result Publication', cat: 'Result', note: 'Midterm results published on the portal.' },
          { date: '25 Aug 2026', title: 'Final Examination', cat: 'Examination', note: 'Term final examinations begin.' },
          { date: '18 Sep 2026', title: 'Result Publication', cat: 'Result', note: 'Final results and GPA published.' },
          { date: '28 Sep 2026', title: 'Semester Break', cat: 'Holiday', note: 'Short break before the next term.' },
        ] },
        { n: 2, label: '2nd Semester', heldIn: '2024-2025 Level 2 Term 2 October 2026-March 2027', items: [
          { date: '05 Oct 2026', title: 'Semester Start', cat: 'Academic', note: 'Level 2 Term 2 begins.' },
          { date: '11 Oct 2026', title: 'Registration Period', cat: 'Registration', note: 'Course registration for Level 2 Term 2.' },
          { date: '15 Oct 2026', title: 'Class Commencement', cat: 'Academic', note: 'Regular classes begin.' },
          { date: '21 Dec 2026', title: 'Midterm Examination', cat: 'Examination', note: 'Midterm exams begin.' },
          { date: '02 Feb 2027', title: 'Final Examination', cat: 'Examination', note: 'Term final examinations begin.' },
          { date: '05 Mar 2027', title: 'Result Publication', cat: 'Result', note: 'Final results and GPA published.' },
        ] },
      ],
    },
    {
      year: 3, label: '3rd Year', session: '2025-2026',
      semesters: [
        { n: 1, label: '1st Semester', heldIn: '2025-2026 Level 3 Term 1 April-September 2026', items: [
          { date: '06 Apr 2026', title: 'Semester Start', cat: 'Academic', note: 'Level 3 Term 1 begins.' },
          { date: '12 Apr 2026', title: 'Registration Period', cat: 'Registration', note: 'Course registration for Level 3 Term 1.' },
          { date: '16 Apr 2026', title: 'Class Commencement', cat: 'Academic', note: 'Regular classes begin.' },
          { date: '06 Jul 2026', title: 'Midterm Examination', cat: 'Examination', note: 'Midterm exams begin.' },
          { date: '24 Aug 2026', title: 'Final Examination', cat: 'Examination', note: 'Term final examinations begin.' },
          { date: '17 Sep 2026', title: 'Result Publication', cat: 'Result', note: 'Final results and GPA published.' },
        ] },
        { n: 2, label: '2nd Semester', heldIn: '2025-2026 Level 3 Term 2 October 2026-March 2027', items: [
          { date: '05 Oct 2026', title: 'Semester Start', cat: 'Academic', note: 'Level 3 Term 2 begins.' },
          { date: '11 Oct 2026', title: 'Registration Period', cat: 'Registration', note: 'Course registration for Level 3 Term 2.' },
          { date: '15 Oct 2026', title: 'Class Commencement', cat: 'Academic', note: 'Regular classes begin.' },
          { date: '21 Dec 2026', title: 'Midterm Examination', cat: 'Examination', note: 'Midterm exams begin.' },
          { date: '02 Feb 2027', title: 'Final Examination', cat: 'Examination', note: 'Term final examinations begin.' },
          { date: '05 Mar 2027', title: 'Result Publication', cat: 'Result', note: 'Final results and GPA published.' },
        ] },
      ],
    },
    {
      year: 4, label: '4th Year', session: '2026-2027',
      semesters: [
        { n: 1, label: '1st Semester', heldIn: '2026-2027 Level 4 Term 1 April-September 2027', items: [
          { date: '06 Apr 2027', title: 'Semester Start', cat: 'Academic', note: 'Level 4 Term 1 begins.' },
          { date: '12 Apr 2027', title: 'Registration Period', cat: 'Registration', note: 'Course registration for Level 4 Term 1.' },
          { date: '16 Apr 2027', title: 'Class Commencement', cat: 'Academic', note: 'Regular classes begin.' },
          { date: '06 Jul 2027', title: 'Midterm Examination', cat: 'Examination', note: 'Midterm exams begin.' },
          { date: '25 Aug 2027', title: 'Final Examination', cat: 'Examination', note: 'Term final examinations begin.' },
          { date: '18 Sep 2027', title: 'Result Publication', cat: 'Result', note: 'Final results and GPA published.' },
        ] },
        { n: 2, label: '2nd Semester', heldIn: '2026-2027 Level 4 Term 2 October 2027-March 2028', items: [
          { date: '05 Oct 2027', title: 'Semester Start', cat: 'Academic', note: 'Level 4 Term 2 (final semester) begins.' },
          { date: '11 Oct 2027', title: 'Registration Period', cat: 'Registration', note: 'Course registration + thesis/project enrolment.' },
          { date: '15 Oct 2027', title: 'Class Commencement', cat: 'Academic', note: 'Regular classes begin.' },
          { date: '20 Dec 2027', title: 'Midterm Examination', cat: 'Examination', note: 'Midterm exams begin.' },
          { date: '25 Jan 2028', title: 'Thesis / Project Submission', cat: 'Deadline', note: 'Final year thesis and project submission.' },
          { date: '05 Feb 2028', title: 'Final Examination', cat: 'Examination', note: 'Term final examinations begin.' },
          { date: '10 Mar 2028', title: 'Result Publication & Convocation', cat: 'Result', note: 'Final results and convocation ceremony.' },
        ] },
      ],
    },
  ];

  /* ========================================================================
     ROOMS — theory rooms + laboratories (with building for the availability page)
     ======================================================================== */
  var rooms = [
    { no: '119', floor: '1', building: 'Main Building', capacity: 50, type: 'Theory Room', category: 'Theory Room', status: 'Available' },
    { no: '120', floor: '1', building: 'Main Building', capacity: 50, type: 'Theory Room', category: 'Theory Room', status: 'Available' },
    { no: '204', floor: '2', building: 'Main Building', capacity: 55, type: 'Theory Room', category: 'Theory Room', status: 'Available' },
    { no: '210', floor: '2', building: 'Main Building', capacity: 60, type: 'Theory Room', category: 'Theory Room', status: 'Available' },
    { no: '301', floor: '3', building: 'Academic Building C', capacity: 40, type: 'Computer Lab', category: 'Laboratory', status: 'Available' },
    { no: '401', floor: '4', building: 'Academic Building D', capacity: 30, type: 'Electrical Lab', category: 'Laboratory', status: 'Available' },
    { no: '501', floor: '5', building: 'Textile Building', capacity: 30, type: 'Textile Lab', category: 'Laboratory', status: 'Available' },
    { no: 'AD-111', floor: '1', building: 'Academic Block D', capacity: 30, type: 'Computer Lab', category: 'Laboratory', status: 'Available' },
    { no: 'AC-126', floor: '1', building: 'Academic Block C', capacity: 30, type: 'Computer Lab', category: 'Laboratory', status: 'Available' },
    { no: 'AC-131', floor: '1', building: 'Academic Block C', capacity: 30, type: 'Computer Lab', category: 'Laboratory', status: 'Available' },
    { no: 'AC-202', floor: '2', building: 'Academic Block C', capacity: 32, type: 'Computer Lab', category: 'Laboratory', status: 'Available' },
    { no: 'AC-205', floor: '2', building: 'Academic Block C', capacity: 32, type: 'Computer Lab', category: 'Laboratory', status: 'Available' },
    { no: 'AC-217', floor: '2', building: 'Academic Block C', capacity: 32, type: 'Computer Lab', category: 'Laboratory', status: 'Available' },
  ];

  /* ========================================================================
     HELPING ZONE CATEGORIES — academic/class issues go to teachers,
     campus issues go to the admin.
     ======================================================================== */
  var helpTargets = {
    'Academic': 'teacher', 'Routine': 'teacher', 'Exam': 'teacher', 'Lab': 'teacher',
    'Fee': 'admin', 'Scholarship': 'admin', 'Campus': 'admin', 'Transport': 'admin', 'Others': 'admin',
  };

  /* ========================================================================
     RETURN THE FULL DATA OBJECT
     ======================================================================== */
  return {
    /* ---------------- notices (expanded) ---------------- */
    notices: [
      { id: 1, date: '12 Aug 2026', cat: 'Examination', badge: 'IMPORTANT', title: 'Mid-term Examination Schedule for Spring 2026 has been published', summary: 'Mid-term examinations for all departments will begin on 20 August 2026. Students are advised to collect their admit cards from the respective batch coordinators.', body: 'Mid-term examinations for all departments will begin on 20 August 2026 and continue for two weeks. Students must collect their admit cards from their batch coordinators before 18 August. No student will be allowed to sit for the examination without a valid admit card and student ID.', attachment: 'midterm-schedule-spring-2026.pdf' },
      { id: 2, date: '10 Aug 2026', cat: 'Academic', badge: 'NEW', title: 'Level 2 Term 1 classes resume after mid-term break', summary: 'Regular classes for CSE 2-1 resume from Monday with the usual routine.', body: 'Regular theory and laboratory classes for all departments resume from Monday as per the published class routine. Lab groups must follow their assigned group-wise schedule.', attachment: '' },
      { id: 3, date: '4 Aug 2026', cat: 'Transport', badge: 'NEW', title: 'NITER Smart Transport digital bus pass is now live', summary: 'Authorized students can now use their digital Smart Bus Pass with QR boarding on Student Bus 1 and Student Bus 2.', body: 'The NITER Smart Transport system is now operational. Authorized students can use their digital Smart Bus Pass for secure QR boarding on Student Bus 1 and Student Bus 2.', attachment: 'smart-transport-guide.pdf' },
      { id: 4, date: '2 Aug 2026', cat: 'Admission', badge: 'NEW', title: 'Admissions Open — B.Sc. Engineering Program 2026-27', summary: 'Online application for the 2026-27 academic session is open for CSE, EEE, Textile, Fashion and IPE departments.', body: 'Online application for the 2026-27 academic session is now open for all five departments.', attachment: 'admission-prospectus-2026-27.pdf' },
      { id: 5, date: '28 Jul 2026', cat: 'Academic', badge: '', title: 'Orientation program for newly admitted students', summary: 'The orientation program for freshmen of the 2026-27 session will be held in the NITER auditorium.', body: 'The orientation program for freshmen of the 2026-27 session will be held in the NITER auditorium on the first week of the new session. Parents and guardians are welcome to attend.', attachment: '' },
      { id: 6, date: '25 Jul 2026', cat: 'Scholarship', badge: 'NEW', title: 'Merit scholarship application for 2026', summary: 'Applications are invited for merit and financial-aid scholarships for the 2026 academic year.', body: 'Applications are invited for merit and financial-aid scholarships. Eligible students must submit the scholarship form along with academic transcripts and income certificates to the accounts office by 25 August 2026.', attachment: 'scholarship-application-form-2026.pdf' },
      { id: 7, date: '22 Jul 2026', cat: 'Administrative', badge: 'IMPORTANT', title: 'Laboratory safety guidelines — mandatory reading', summary: 'All students using the computer, electrical and textile laboratories must follow the updated safety guidelines.', body: 'All students using the computer, electrical and textile laboratories must follow the updated safety guidelines. Wearing proper equipment and following the lab instructions is mandatory.', attachment: 'lab-safety-guidelines.pdf' },
      { id: 8, date: '20 Jul 2026', cat: 'Academic', badge: '', title: 'Class suspension due to national holiday', summary: 'All classes and administrative activities will remain suspended on the upcoming national holiday.', body: 'All classes and administrative activities will remain suspended on the upcoming national holiday. Classes will resume as per the regular schedule the following day.', attachment: '' },
      { id: 9, date: '15 Jul 2026', cat: 'Events', badge: '', title: 'NITER Tech Fest 2026 — volunteer registration open', summary: 'Students can register as volunteers for the NITER Tech Fest 2026 scheduled for September.', body: 'Students can register as volunteers for the NITER Tech Fest 2026 scheduled for September. Volunteers will receive certificates and priority passes to all events.', attachment: 'techfest-volunteer-form.pdf' },
      { id: 10, date: '10 Jul 2026', cat: 'General', badge: '', title: 'Campus Wi-Fi maintenance on Saturday', summary: 'Campus Wi-Fi will be unavailable from 2:00 PM to 6:00 PM on Saturday for network upgrades.', body: 'Campus Wi-Fi will be unavailable from 2:00 PM to 6:00 PM on Saturday for network upgrades. Online services of the Smart Campus portal remain accessible from outside the campus.', attachment: '' },
      { id: 11, date: '5 Jul 2026', cat: 'Examination', badge: '', title: 'Make-up examination application notice', summary: 'Students who missed the previous term final due to valid reasons may apply for a make-up examination.', body: 'Students who missed the previous term final due to valid reasons may apply for a make-up examination within two weeks of result publication.', attachment: 'makeup-exam-application.pdf' },
      { id: 12, date: '28 Jun 2026', cat: 'Administrative', badge: '', title: 'Updated academic calendar for the 2026-27 session', summary: 'The 2026-27 academic calendar has been published. Classes begin 6 April 2027 for Level 1.', body: 'The 2026-27 academic calendar has been published. Classes begin 6 April 2027 for Level 1. View the complete calendar from the Academic Calendar page.', attachment: 'academic-calendar-2026-27.pdf' },
    ],

    /* ---------------- news ---------------- */
    news: [
      { id: 1, date: '1 Aug 2026', tag: 'Achievement', title: 'NITER students win the National AI Hackathon 2026', summary: 'Team NITER took first place with an AI-driven smart transport optimization solution. The team will represent Bangladesh in the regional finals.', img: 'assets/images/news-1.jpg' },
      { id: 2, date: '18 Jul 2026', tag: 'Campus', title: 'New textile innovation lab inaugurated at NITER campus', summary: 'The state-of-the-art textile innovation lab will support research in sustainable fabrics and smart textiles.', img: 'assets/images/news-2.jpg' },
      { id: 3, date: '5 Jul 2026', tag: 'Research', title: 'Research collaboration agreement signed with leading industry partners', summary: 'NITER signed memorandums of understanding with textile and technology industries for joint research and internship programs.', img: 'assets/images/news-3.jpg' },
    ],

    /* ---------------- events ---------------- */
    events: [
      { id: 1, day: '12', mon: 'SEPT', title: 'NITER Tech Fest 2026', time: '10:00 AM – 6:00 PM', loc: 'NITER Main Campus', cat: 'Tech Festival', reg: 'Registration Open', desc: 'A full day of competitions, tech showcases, workshops and exhibitions across all departments.' },
      { id: 2, day: '25', mon: 'AUG', title: 'Career Development Workshop', time: '2:00 PM – 5:00 PM', loc: 'Seminar Hall 1', cat: 'Career', reg: 'Registration Open', desc: 'CV writing, interview skills and industry readiness sessions led by corporate professionals.' },
      { id: 3, day: '30', mon: 'AUG', title: 'Textile Innovation Seminar', time: '11:00 AM – 1:00 PM', loc: 'Auditorium', cat: 'Seminar', reg: 'Registration Open', desc: 'Industry experts discuss smart textiles, sustainability and the future of textile manufacturing.' },
      { id: 4, day: '5', mon: 'SEPT', title: 'Inter-Department Programming Contest', time: '9:00 AM – 5:00 PM', loc: 'Computer Lab 301', cat: 'Competition', reg: 'Registration Open', desc: 'Teams from all five departments compete in an algorithmic programming challenge.' },
      { id: 5, day: '20', mon: 'SEPT', title: 'Research and Project Exhibition', time: '10:00 AM – 4:00 PM', loc: 'NITER Field', cat: 'Exhibition', reg: 'Registration Soon', desc: 'Final year projects, research posters and prototypes showcased to faculty and industry judges.' },
    ],

    /* ---------------- departments ---------------- */
    departments: [
      { code: 'CSE', name: 'Computer Science & Engineering', desc: 'Advancing software, computing, artificial intelligence, and digital innovation.', icon: 'i-code', image: 'assets/images/dept-1.jpg' },
      { code: 'EEE', name: 'Electrical & Electronic Engineering', desc: 'Developing future engineers in electronics, power, communication, and automation.', icon: 'i-flash', image: 'assets/images/dept-2.jpg' },
      { code: 'TEX', name: 'Textile Engineering', desc: 'Leading education and innovation in textile technology and manufacturing.', icon: 'i-thread', image: 'assets/images/dept-3.jpg' },
      { code: 'Fashion', name: 'Fashion Design & Apparel Engineering', desc: 'Combining creativity, technology, design, and apparel engineering.', icon: 'i-stitch', image: 'assets/images/dept-4.jpg' },
      { code: 'IPE', name: 'Industrial & Production Engineering', desc: 'Improving industrial systems, productivity, quality, and operations.', icon: 'i-gear', image: 'assets/images/dept-5.jpg' },
    ],

    /* ---------------- stats ---------------- */
    stats: [
      { label: 'Total Students', value: 5000, suffix: '+', icon: 'i-users' },
      { label: 'Total Teachers', value: 150, suffix: '+', icon: 'i-user' },
      { label: 'Academic Departments', value: 5, suffix: '', icon: 'i-layers' },
      { label: 'Active Courses', value: 100, suffix: '+', icon: 'i-book' },
      { label: 'Modern Laboratories', value: 20, suffix: '+', icon: 'i-lab' },
      { label: 'Campus Clubs', value: 12, suffix: '', icon: 'i-star' },
    ],

    /* ---------------- about values + counters ---------------- */
    aboutValues: [
      { icon: 'i-target', title: 'Mission', text: 'To provide quality engineering education that builds skilled, ethical and innovative professionals.' },
      { icon: 'i-eye', title: 'Vision', text: 'To be a leading institution in textile and engineering education and research in the region.' },
      { icon: 'i-grad', title: 'Academic Excellence', text: 'Rigorous curricula, dedicated faculty and continuous outcome-based improvement.' },
      { icon: 'i-flash', title: 'Innovation', text: 'A culture of creativity, problem solving and technology-driven learning.' },
      { icon: 'i-lab', title: 'Research', text: 'Modern laboratories and funded projects advancing textile and technology research.' },
      { icon: 'i-users', title: 'Industry Collaboration', text: 'Strong ties with industry for internships, joint research and graduate outcomes.' },
    ],
    counters: [
      { value: 5, suffix: '', label: 'Departments' },
      { value: 5000, suffix: '+', label: 'Students' },
      { value: 150, suffix: '+', label: 'Faculty' },
      { value: 100, suffix: '+', label: 'Courses' },
      { value: 20, suffix: '+', label: 'Labs' },
    ],

    /* ---------------- gallery (fixed images) ----------------
       Cover images live in assets/images and are named after each gallery
       category so real campus photos can be dropped in with the same names. */
    gallery: [
      { cat: 'Campus Courtyard', count: 8, img: 'assets/images/Campus Courtyard.jpg' },
      { cat: 'Campus Green & Buildings', count: 12, img: 'assets/images/Campus Green & Buildings.jpg' },
      { cat: 'Main Gate — NITER', count: 6, img: 'assets/images/Main Gate — NITER.jpg' },
      { cat: 'NITER Cafe & Dining', count: 10, img: 'assets/images/NITER Cafe & Dining.jpg' },
      { cat: 'Library & Study Zones', count: 9, img: 'assets/images/Library & Study Zones.jpg' },
      { cat: 'Sports Ground', count: 7, img: 'assets/images/Sports Ground.jpg' },
      { cat: 'Campus Events', count: 11, img: 'assets/images/Campus Events.jpg' },
      { cat: 'Campus Life', count: 14, img: 'assets/images/Campus Life.jpg' },
    ],

    /* ---------------- services ---------------- */
    services: [
      { icon: 'i-heart', title: 'Student Helping Zone', desc: 'Ask questions, report problems and track your support requests.' },
      { icon: 'i-book', title: 'Academic Support', desc: 'Academic advising, study resources and progress tracking.' },
      { icon: 'i-users', title: 'Batch Course Coordinator', desc: 'A dedicated CC-1 and CC-2 for every batch.' },
      { icon: 'i-cal', title: 'Teacher Meeting Request', desc: 'Request meetings with faculty through the Helping Zone.' },
      { icon: 'i-grad', title: 'Scholarship Information', desc: 'Merit scholarships, financial aid and eligibility guides.' },
      { icon: 'i-target', title: 'Career Support', desc: 'Placement preparation, internships and career workshops.' },
      { icon: 'i-star', title: 'Club Activities', desc: 'Technical, cultural and sports clubs across campus.' },
      { icon: 'i-home', title: 'Campus Facilities', desc: 'Library, labs, sports facilities and transport services.' },
    ],

    /* ========================================================================
       SMART TRANSPORT
       ======================================================================== */
    campus: { name: 'NITER Campus', lat: 23.847, lng: 90.276 },

    buses: [
      { id: 'SB1', name: 'Student Bus 1', type: 'Student', capacity: 50, departure: '6:40 AM', routeId: 'r1', driverId: 'DRV1', driverName: 'Md. Karim', color: '#2563eb' },
      { id: 'SB2', name: 'Student Bus 2', type: 'Student', capacity: 50, departure: '6:30 AM', routeId: 'r2', driverId: 'DRV2', driverName: 'Abdul Latif', color: '#7c3aed' },
      { id: 'TB1', name: 'Teacher Bus 1', type: 'Teacher', capacity: 40, departure: '6:45 AM', routeId: 'r3', driverId: 'DRV3', driverName: 'Shafiqul Islam', color: '#0d9488' },
      { id: 'TB2', name: 'Teacher Bus 2', type: 'Teacher', capacity: 40, departure: '6:45 AM', routeId: 'r4', driverId: 'DRV4', driverName: 'Jahangir Alam', color: '#c9a227' },
    ],

    routes: [
      {
        id: 'r1', name: 'Khamarbari Route', busId: 'SB1', departure: '6:40 AM', configurable: false,
        stops: ['Khamarbari', 'Asadgate', 'Shyamoli', 'Kallyanpur', 'Technical', 'Gabtoli', 'Savar', 'NITER Campus'],
        coords: [
          { lat: 23.7895, lng: 90.3985 }, { lat: 23.7780, lng: 90.3900 },
          { lat: 23.7745, lng: 90.3710 }, { lat: 23.7650, lng: 90.3620 },
          { lat: 23.7820, lng: 90.3525 }, { lat: 23.7805, lng: 90.3495 },
          { lat: 23.8583, lng: 90.2667 }, { lat: 23.8470, lng: 90.2760 },
        ],
      },
      {
        id: 'r2', name: 'Uttara Route', busId: 'SB2', departure: '6:30 AM', configurable: true,
        stops: ['Uttara', 'Airport (configurable)', 'Khilkhet (configurable)', 'Banani (configurable)', 'Savar (configurable)', 'NITER Campus'],
        coords: [
          { lat: 23.8759, lng: 90.3795 }, { lat: 23.8567, lng: 90.4056 },
          { lat: 23.8320, lng: 90.4050 }, { lat: 23.7940, lng: 90.4050 },
          { lat: 23.8583, lng: 90.2667 }, { lat: 23.8470, lng: 90.2760 },
        ],
      },
      {
        id: 'r3', name: 'Mirpur Route', busId: 'TB1', departure: '6:45 AM', configurable: false,
        stops: ['Mirpur', 'Technical', 'Gabtoli', 'Savar', 'NITER Campus'],
        coords: [
          { lat: 23.8070, lng: 90.3640 }, { lat: 23.7820, lng: 90.3525 },
          { lat: 23.7805, lng: 90.3495 }, { lat: 23.8583, lng: 90.2667 },
          { lat: 23.8470, lng: 90.2760 },
        ],
      },
      {
        id: 'r4', name: 'Shyamoli Route', busId: 'TB2', departure: '6:45 AM', configurable: true,
        stops: ['Shyamoli', 'Kallyanpur (configurable)', 'Gabtoli (configurable)', 'Savar (configurable)', 'NITER Campus'],
        coords: [
          { lat: 23.7745, lng: 90.3710 }, { lat: 23.7650, lng: 90.3620 },
          { lat: 23.7805, lng: 90.3495 }, { lat: 23.8583, lng: 90.2667 },
          { lat: 23.8470, lng: 90.2760 },
        ],
      },
    ],

    /* ---------------- demo accounts ---------------- */
    students: students,
    teachers: teachers,
    admin: { id: 'admin', name: 'System Administrator', pass: 'admin123', role: 'admin' },
    drivers: [
      { id: 'DRV1', name: 'Md. Karim', busId: 'SB1', busName: 'Student Bus 1', routeName: 'Khamarbari Route', pass: 'driver123' },
      { id: 'DRV2', name: 'Abdul Latif', busId: 'SB2', busName: 'Student Bus 2', routeName: 'Uttara Route', pass: 'driver123' },
      { id: 'DRV3', name: 'Shafiqul Islam', busId: 'TB1', busName: 'Teacher Bus 1', routeName: 'Mirpur Route', pass: 'driver123' },
      { id: 'DRV4', name: 'Jahangir Alam', busId: 'TB2', busName: 'Teacher Bus 2', routeName: 'Shyamoli Route', pass: 'driver123' },
    ],

    /* ---------------- NSCMS academic data ---------------- */
    courses: courses,
    routineGroups: routineGroups,
    rooms: rooms,
    attendance: attendance,
    results: results,
    bills: bills,
    helpTargets: helpTargets,
    academicCalendar: academicCalendar,

    helpingZone: [
      { id: 1, student: 'CS 2405006', name: 'Arifin Rupom', cat: 'Academic', q: 'When will the mid-term result be published?', target: 'teacher', status: 'In Progress', reply: '', date: '3 Aug 2026' },
      { id: 2, student: 'CS 2405026', name: 'MST. SAIFA BINTA SNEHA', cat: 'Routine', q: 'Is there any class on Thursday for CSE-23?', target: 'teacher', status: 'Resolved', reply: 'No, Thursday is a holiday for CSE-23 this semester.', date: '1 Aug 2026' },
      { id: 3, student: 'CS 2405032', name: 'Nabila Nawshin', cat: 'Scholarship', q: 'What documents are needed for the merit scholarship application?', target: 'admin', status: 'Pending', reply: '', date: '5 Aug 2026' },
    ],

    notifications: [
      { title: 'Student Bus 1 trip started', body: 'Khamarbari Route · 6:40 AM departure', time: '6:40 AM' },
      { title: 'Mid-term examination schedule published', body: 'Exams begin 20 August 2026', time: '5 Aug' },
      { title: 'Digital Smart Bus Pass is live', body: 'QR boarding available on student buses', time: '4 Aug' },
      { title: 'Admissions open for 2026-27', body: 'Apply for CSE, EEE, TEX, Fashion, IPE', time: '2 Aug' },
    ],
  };
})();
