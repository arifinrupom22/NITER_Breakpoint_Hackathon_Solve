// ============================================================================
// Seed data — NSCMS academic system + transport data.
// ============================================================================

import { BUSES, ROUTES, DRIVERS, TRANSPORT_STUDENTS, TRANSPORT_TEACHERS, NSCMS_ADMINS, config } from './config.js';

export function createSeed() {
  const departments = [
    { id: 'CSE', name: 'Computer Science & Engineering', code: 'CSE', color: '#2563eb' },
    { id: 'EEE', name: 'Electrical & Electronic Engineering', code: 'EEE', color: '#059669' },
    { id: 'TEX', name: 'Textile Engineering', code: 'TEX', color: '#d97706' },
    { id: 'FASHION', name: 'Fashion Design & Apparel Engineering', code: 'Fashion', color: '#db2777' },
    { id: 'IPE', name: 'Industrial & Production Engineering', code: 'IPE', color: '#7c3aed' },
  ];

  const teachers = [
    { id: 'T001', name: 'Dr. Rahman', department: 'CSE', designation: 'Professor', email: 'rahman@niter.edu.bd', phone: '01700-000001', salary: 95000 },
    { id: 'T002', name: 'Prof. Ahmed', department: 'EEE', designation: 'Professor', email: 'ahmed@niter.edu.bd', phone: '01700-000002', salary: 92000 },
    { id: 'T003', name: 'Ms. Sultana', department: 'TEX', designation: 'Associate Professor', email: 'sultana@niter.edu.bd', phone: '01700-000003', salary: 88000 },
    { id: 'T004', name: 'Mr. Karim', department: 'IPE', designation: 'Assistant Professor', email: 'karim@niter.edu.bd', phone: '01700-000004', salary: 75000 },
    { id: 'T005', name: 'Mrs. Yasmin', department: 'FASHION', designation: 'Assistant Professor', email: 'yasmin@niter.edu.bd', phone: '01700-000005', salary: 72000 },
  ];

  const students = [
    { id: '2023001', name: 'Arifin Rupom', department: 'CSE', batch: 'CSE-23', semester: '2-2', theorySection: 'A', labSection: 'L2', email: 'arifin.rupom@niter.edu.bd', phone: '01800-000001', cgpa: 3.78 },
    { id: '2023002', name: 'Student Two', department: 'CSE', batch: 'CSE-23', semester: '2-2', theorySection: 'A', labSection: 'L1', email: 'student2@niter.edu.bd', phone: '01800-000002', cgpa: 3.45 },
    { id: '2023003', name: 'Student Three', department: 'EEE', batch: 'EEE-23', semester: '2-2', theorySection: 'A', labSection: 'L1', email: 'student3@niter.edu.bd', phone: '01800-000003', cgpa: 3.62 },
    { id: '2023004', name: 'Tanvir Ahmed', department: 'TEX', batch: 'TEX-23', semester: '2-1', theorySection: 'A', labSection: 'L2', email: 'tanvir@niter.edu.bd', phone: '01800-000004', cgpa: 3.2 },
    { id: '2023005', name: 'Farhana Akter', department: 'FASHION', batch: 'FASHION-23', semester: '2-2', theorySection: 'A', labSection: 'L1', email: 'farhana@niter.edu.bd', phone: '01800-000005', cgpa: 3.9 },
    { id: '2023006', name: 'Nayeem Islam', department: 'IPE', batch: 'IPE-23', semester: '2-1', theorySection: 'A', labSection: 'L2', email: 'nayeem@niter.edu.bd', phone: '01800-000006', cgpa: 3.3 },
    { id: '2023007', name: 'Sadia Jahan', department: 'CSE', batch: 'CSE-23', semester: '2-2', theorySection: 'B', labSection: 'L2', email: 'sadia@niter.edu.bd', phone: '01800-000007', cgpa: 3.55 },
    { id: '2023008', name: 'Rakib Chowdhury', department: 'EEE', batch: 'EEE-23', semester: '2-2', theorySection: 'B', labSection: 'L2', email: 'rakib@niter.edu.bd', phone: '01800-000008', cgpa: 3.05 },
  ];

  const batches = [
    { id: 'CSE-23', department: 'CSE', semester: '2-2', theorySection: 'A', labSection: 'L2', totalStudents: 60 },
    { id: 'EEE-23', department: 'EEE', semester: '2-2', theorySection: 'A', labSection: 'L1', totalStudents: 55 },
    { id: 'TEX-23', department: 'TEX', semester: '2-1', theorySection: 'A', labSection: 'L2', totalStudents: 50 },
    { id: 'FASHION-23', department: 'FASHION', semester: '2-2', theorySection: 'A', labSection: 'L1', totalStudents: 45 },
    { id: 'IPE-23', department: 'IPE', semester: '2-1', theorySection: 'A', labSection: 'L2', totalStudents: 40 },
  ];

  const courses = [
    { code: 'CSE-2101', name: 'Object-Oriented Programming', credit: 3, type: 'Theory', semester: '2-2', department: 'CSE', teacherId: 'T001' },
    { code: 'CSE-2103', name: 'Object-Oriented Programming Lab', credit: 1.5, type: 'Lab', semester: '2-2', department: 'CSE', teacherId: 'T001' },
    { code: 'CSE-2102', name: 'Data Structures', credit: 3, type: 'Theory', semester: '2-2', department: 'CSE', teacherId: 'T001' },
    { code: 'EEE-2101', name: 'Circuit Theory', credit: 3, type: 'Theory', semester: '2-2', department: 'EEE', teacherId: 'T002' },
    { code: 'EEE-2103', name: 'Circuit Theory Lab', credit: 1.5, type: 'Lab', semester: '2-2', department: 'EEE', teacherId: 'T002' },
    { code: 'TEX-2101', name: 'Textile Fiber', credit: 3, type: 'Theory', semester: '2-1', department: 'TEX', teacherId: 'T003' },
    { code: 'IPE-2101', name: 'Industrial Management', credit: 3, type: 'Theory', semester: '2-1', department: 'IPE', teacherId: 'T004' },
    { code: 'FASH-2101', name: 'Fashion Illustration', credit: 3, type: 'Theory', semester: '2-2', department: 'FASHION', teacherId: 'T005' },
  ];

  const rooms = [
    { id: '201', number: '201', floor: '2nd', capacity: 60, type: 'Theory Room', status: 'Available' },
    { id: '202', number: '202', floor: '2nd', capacity: 60, type: 'Theory Room', status: 'Available' },
    { id: '301', number: '301', floor: '3rd', capacity: 35, type: 'Computer Lab', status: 'Occupied' },
    { id: '401', number: '401', floor: '4th', capacity: 30, type: 'Electrical Lab', status: 'Available' },
    { id: '501', number: '501', floor: '5th', capacity: 30, type: 'Textile Lab', status: 'Maintenance' },
    { id: '101', number: '101', floor: '1st', capacity: 80, type: 'Theory Room', status: 'Available' },
  ];

  const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
  const routines = [
    { id: 'RT-001', department: 'CSE', batch: 'CSE-23', semester: '2-2', theorySection: 'A', labSection: 'L2', course: 'CSE-2101', teacherId: 'T001', room: '201', day: 'Saturday', startTime: '09:00', endTime: '10:30' },
    { id: 'RT-002', department: 'CSE', batch: 'CSE-23', semester: '2-2', theorySection: 'A', labSection: 'L2', course: 'CSE-2102', teacherId: 'T001', room: '201', day: 'Saturday', startTime: '10:45', endTime: '12:15' },
    { id: 'RT-003', department: 'CSE', batch: 'CSE-23', semester: '2-2', theorySection: 'A', labSection: 'L2', course: 'CSE-2103', teacherId: 'T001', room: '301', day: 'Sunday', startTime: '09:00', endTime: '11:45' },
    { id: 'RT-004', department: 'EEE', batch: 'EEE-23', semester: '2-2', theorySection: 'A', labSection: 'L1', course: 'EEE-2101', teacherId: 'T002', room: '202', day: 'Saturday', startTime: '09:00', endTime: '10:30' },
    { id: 'RT-005', department: 'EEE', batch: 'EEE-23', semester: '2-2', theorySection: 'A', labSection: 'L1', course: 'EEE-2103', teacherId: 'T002', room: '401', day: 'Monday', startTime: '09:00', endTime: '11:45' },
    { id: 'RT-006', department: 'TEX', batch: 'TEX-23', semester: '2-1', theorySection: 'A', labSection: 'L2', course: 'TEX-2101', teacherId: 'T003', room: '501', day: 'Sunday', startTime: '09:00', endTime: '10:30' },
  ];

  const notices = [
    { id: 'N-001', title: 'Mid-term Examination Schedule for Spring 2026 has been published', category: 'Exam', summary: 'Mid-term examinations for all departments will begin on 20 August 2026. Students are advised to collect their admit cards from the respective batch coordinators.', date: '2026-08-05', badge: 'IMPORTANT' },
    { id: 'N-002', title: 'NITER Smart Transport digital bus pass is now live', category: 'Transport', summary: 'Authorized students can now use their digital Smart Bus Pass with QR boarding on Student Bus 1 and Student Bus 2.', date: '2026-08-04', badge: 'NEW' },
    { id: 'N-003', title: 'Admissions Open — B.Sc. Engineering Program 2026-27', category: 'Admission', summary: 'Online application for the 2026-27 academic session is open for CSE, EEE, Textile, Fashion and IPE departments.', date: '2026-08-02', badge: 'NEW' },
    { id: 'N-004', title: 'Orientation program for newly admitted students', category: 'Academic', summary: 'The orientation program for freshmen of the 2026-27 session will be held in the NITER auditorium.', date: '2026-07-28', badge: '' },
    { id: 'N-005', title: 'Laboratory safety guidelines — mandatory reading', category: 'Lab', summary: 'All students using the computer, electrical and textile laboratories must follow the updated safety guidelines.', date: '2026-07-22', badge: 'IMPORTANT' },
    { id: 'N-006', title: 'Class suspension due to national holiday', category: 'Academic', summary: 'All classes and administrative activities will remain suspended on the upcoming national holiday.', date: '2026-07-20', badge: '' },
  ];

  const news = [
    { id: 'NW-001', title: 'NITER students win the National AI Hackathon 2026', category: 'Achievement', date: '2026-08-01', image: 'news-1', summary: 'Team NITER took first place with an AI-driven smart transport optimization solution. The team will represent Bangladesh in the regional finals.' },
    { id: 'NW-002', title: 'New textile innovation lab inaugurated at NITER campus', category: 'Campus', date: '2026-07-18', image: 'news-2', summary: 'The state-of-the-art textile innovation lab will support research in sustainable fabrics and smart textiles.' },
    { id: 'NW-003', title: 'Research collaboration agreement signed with leading industry partners', category: 'Research', date: '2026-07-05', image: 'news-3', summary: 'NITER signed memorandums of understanding with textile and technology industries for joint research and internship programs.' },
  ];

  const events = [
    { id: 'EV-001', title: 'NITER Tech Fest 2026', date: '2026-09-12', time: '10:00 AM – 6:00 PM', location: 'NITER Main Campus', category: 'Tech Festival', registration: 'Open', description: 'A full day of competitions, tech showcases, workshops and exhibitions across all departments.' },
    { id: 'EV-002', title: 'Career Development Workshop', date: '2026-08-25', time: '2:00 PM – 5:00 PM', location: 'Seminar Hall 1', category: 'Career', registration: 'Open', description: 'CV writing, interview skills and industry readiness sessions led by corporate professionals.' },
    { id: 'EV-003', title: 'Textile Innovation Seminar', date: '2026-08-30', time: '11:00 AM – 1:00 PM', location: 'Auditorium', category: 'Seminar', registration: 'Open', description: 'Industry experts discuss smart textiles, sustainability and the future of textile manufacturing.' },
    { id: 'EV-004', title: 'Inter-Department Programming Contest', date: '2026-09-05', time: '9:00 AM – 5:00 PM', location: 'Computer Lab 301', category: 'Competition', registration: 'Open', description: 'Teams from all five departments compete in an algorithmic programming challenge.' },
    { id: 'EV-005', title: 'Research and Project Exhibition', date: '2026-09-20', time: '10:00 AM – 4:00 PM', location: 'NITER Field', category: 'Exhibition', registration: 'Coming Soon', description: 'Final year projects, research posters and prototypes showcased to faculty and industry judges.' },
  ];

  const helpingZone = [
    { id: 'HZ-0001', category: 'Academic', question: 'When will the OOP course materials for week 8 be uploaded?', studentId: '2023002', status: 'In Progress', createdAt: '2026-08-01', replies: [{ by: 'T001', text: 'Materials will be uploaded by Saturday evening.', at: '2026-08-02' }] },
    { id: 'HZ-0002', category: 'Exam', question: 'How do I apply for a mid-term re-examination?', studentId: '2023001', status: 'Pending', createdAt: '2026-08-03', replies: [] },
    { id: 'HZ-0003', category: 'Scholarship', question: 'What documents are needed for the merit scholarship application?', studentId: '2023007', status: 'Resolved', createdAt: '2026-07-20', replies: [{ by: 'T002', text: 'Submit your transcripts, ID card copy and income statement to the scholarship office.', at: '2026-07-22' }] },
  ];

  const attendance = [
    { id: 'AT-001', course: 'CSE-2101', batch: 'CSE-23', date: '2026-08-03', records: { '2023001': 'present', '2023002': 'present', '2023007': 'absent' }, totalClasses: 20 },
    { id: 'AT-002', course: 'CSE-2102', batch: 'CSE-23', date: '2026-08-04', records: { '2023001': 'present', '2023002': 'absent', '2023007': 'present' }, totalClasses: 18 },
  ];

  const results = [
    { id: 'RS-001', course: 'CSE-2101', studentId: '2023001', marks: 84, total: 100, grade: 'A+', gradePoint: 4.0 },
    { id: 'RS-002', course: 'CSE-2101', studentId: '2023002', marks: 71, total: 100, grade: 'A-', gradePoint: 3.5 },
    { id: 'RS-003', course: 'CSE-2102', studentId: '2023001', marks: 78, total: 100, grade: 'A', gradePoint: 3.75 },
    { id: 'RS-004', course: 'EEE-2101', studentId: '2023003', marks: 82, total: 100, grade: 'A+', gradePoint: 4.0 },
  ];

  const maintenance = BUSES.map((b, i) => ({
    id: `MAINT-00${i + 1}`,
    busId: b.id,
    date: new Date(Date.now() - (30 + i * 40) * 86400000).toISOString().slice(0, 10),
    mileage: 18000 + i * 3500,
    issue: 'Routine inspection',
    status: 'Healthy',
  }));

  const schedules = [
    { id: 'SCH-0001', name: 'Student Bus 1 — Morning Trip', type: 'Morning Trip', busId: 'SB1', routeId: 'r1', departure: '6:40 AM' },
    { id: 'SCH-0002', name: 'Student Bus 2 — Morning Trip', type: 'Morning Trip', busId: 'SB2', routeId: 'r2', departure: '6:30 AM' },
    { id: 'SCH-0003', name: 'Teacher Bus 1 — Morning Trip', type: 'Morning Trip', busId: 'TB1', routeId: 'r3', departure: '6:45 AM' },
    { id: 'SCH-0004', name: 'Teacher Bus 2 — Morning Trip', type: 'Morning Trip', busId: 'TB2', routeId: 'r4', departure: '6:45 AM' },
  ];

  return {
    meta: { seededAt: new Date().toISOString(), schemaVersion: 1, demoMode: config.demoMode, simTimeScale: config.simTimeScale },
    departments,
    teachers,
    students,
    batches,
    courses,
    rooms,
    routines,
    notices,
    news,
    events,
    helpingZone,
    attendance,
    results,
    buses: BUSES.map((b) => ({ ...b, status: 'Active' })),
    routes: ROUTES,
    drivers: DRIVERS.map((d) => ({ id: d.id, name: d.name, phone: d.phone, busId: d.busId, status: 'Available' })),
    transportStudents: TRANSPORT_STUDENTS,
    transportTeachers: TRANSPORT_TEACHERS,
    admins: NSCMS_ADMINS,
    trips: [],
    gpsLog: [],
    boarding: [],
    payments: [],
    complaints: [],
    lostFound: [
      { id: 'LF-0001', kind: 'found', description: 'A blue umbrella was found on Student Bus 1.', date: '2026-08-03', busId: 'SB1', status: 'Pending' },
    ],
    emergencies: [],
    maintenance,
    anomalies: [],
    notifications: [
      { id: 'NOTIF-0001', audience: 'all', title: 'Welcome to NITER Smart Transport', body: 'Live bus tracking, digital passes and AI-powered ETA are now available.', read: false, at: new Date().toISOString() },
    ],
    schedules,
    transportSessions: [],
    analytics: { tripsByDay: {}, passengerLog: [], revenueByDay: {}, onTimeByTrip: {} },
    seq: { help: 4, trip: 0, pay: 0, board: 0, notif: 2, complaint: 0, lost: 2, emergency: 0, schedule: 5, anomaly: 0, maint: 2 },
  };
}

export const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
