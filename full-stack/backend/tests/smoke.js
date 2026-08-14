// Quick smoke test against a running backend on http://localhost:3001
const BASE = 'http://localhost:3001/api';
let pass = 0, fail = 0;
const t = (name, cond, extra) => {
  if (cond) { pass++; console.log(`  ✓ ${name}`); }
  else { fail++; console.log(`  ✗ ${name}`, extra || ''); }
};
const j = (res) => res.json();

async function main() {
  console.log('== public ==');
  const pub = await fetch(`${BASE}/transport/public`).then(j);
  t('public has 4 buses', pub.buses.length === 4);
  t('public has no coordinates', !('position' in pub.buses[0]));

  console.log('== admin login ==');
  const adminLogin = await fetch(`${BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'admin', password: 'admin123', role: 'admin' }) }).then(j);
  t('admin login works', !!adminLogin.token);

  console.log('== student login ==');
  const studentLogin = await fetch(`${BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: '2023001', password: 'student123', role: 'student' }) }).then(j);
  t('student login works', !!studentLogin.token);

  console.log('== teacher login ==');
  const teacherLogin = await fetch(`${BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'T001', password: 'teacher123', role: 'teacher' }) }).then(j);
  t('teacher login works', !!teacherLogin.token);

  console.log('== transport verify ==');
  const verify = await fetch(`${BASE}/auth/transport/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Arifin Rupom', card: 'BUS06' }) }).then(j);
  t('student transport verify (BUS06)', !!verify.token && verify.user.eligibleBuses.length === 2);
  const badVerify = await fetch(`${BASE}/auth/transport/verify`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Hacker', card: 'BUS99' }) });
  t('bad verify rejected', badVerify.status === 401);

  console.log('== driver login ==');
  const driverLogin = await fetch(`${BASE}/auth/transport/driver-login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ driverId: 'DRV001', password: 'driver123' }) }).then(j);
  t('driver login works', !!driverLogin.token && driverLogin.user.busId === 'BUS-STD-1');
  const A = (token) => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' });

  console.log('== trip lifecycle ==');
  const start = await fetch(`${BASE}/transport/trip/start`, { method: 'POST', headers: A(driverLogin.token), body: JSON.stringify({ busId: 'BUS-STD-1' }) }).then(j);
  t('driver starts trip', !!start.trip && start.trip.status === 'ACTIVE');
  const live = await fetch(`${BASE}/transport/live`, { headers: A(verify.token) }).then(j);
  t('student sees live for eligible buses', Object.keys(live.live).length === 2 && !!live.live['BUS-STD-1'].position);
  const liveAdmin = await fetch(`${BASE}/transport/live`, { headers: A(adminLogin.token) }).then(j);
  t('admin sees all 4 buses live', Object.keys(liveAdmin.live).length === 4);

  console.log('== boarding ==');
  const board = await fetch(`${BASE}/transport/boarding`, { method: 'POST', headers: A(adminLogin.token), body: JSON.stringify({ card: 'BUS26', busId: 'BUS-STD-1', tapType: 'IN' }) }).then(j);
  t('boarding records + payment (demo)', !!board.payment && board.payment.status.includes('DEMO'));
  const boardWrongBus = await fetch(`${BASE}/transport/boarding`, { method: 'POST', headers: A(adminLogin.token), body: JSON.stringify({ card: 'BUS06', busId: 'BUS-TCH-1', tapType: 'IN' }) });
  t('student card rejected on teacher bus', boardWrongBus.status === 403);

  console.log('== AI ==');
  const crowd = await fetch(`${BASE}/ai/crowd?busId=BUS-STD-1`).then(j);
  t('crowd prediction', ['Low', 'Moderate', 'High', 'Very High'].includes(crowd.predicted));
  const eta = await fetch(`${BASE}/ai/eta?busId=BUS-STD-1`).then(j);
  t('ETA prediction active', eta.active === true && typeof eta.etaToCampus === 'number');
  const dep = await fetch(`${BASE}/ai/departure?routeId=R-KHAM`).then(j);
  t('best departure time', !!dep.recommendedDeparture);
  const extra = await fetch(`${BASE}/ai/additional-bus`).then(j);
  t('additional bus recommendation', Array.isArray(extra.recommendations) && extra.recommendations.length === 2);
  const chat = await fetch(`${BASE}/ai/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'When will Student Bus 1 arrive?' }) }).then(j);
  t('chatbot replies with live data', typeof chat.reply === 'string' && chat.reply.includes('Student Bus 1'));
  const maint = await fetch(`${BASE}/ai/maintenance?busId=BUS-STD-1`, { headers: A(adminLogin.token) }).then(j);
  t('predictive maintenance', ['Healthy', 'Maintenance Due Soon', 'Maintenance Required'].includes(maint.status));

  console.log('== admin ==');
  const analytics = await fetch(`${BASE}/admin/analytics/overview`, { headers: A(adminLogin.token) }).then(j);
  t('analytics overview', typeof analytics.activeTrips === 'number');
  const students = await fetch(`${BASE}/admin/students`, { headers: A(adminLogin.token) }).then(j);
  t('student list', Array.isArray(students) && students.length >= 3);
  const dup = await fetch(`${BASE}/admin/students`, { method: 'POST', headers: A(adminLogin.token), body: JSON.stringify({ id: '2023001', name: 'X', department: 'CSE', batch: 'CSE-23' }) });
  t('duplicate student ID rejected', dup.status === 409);

  console.log('== end trip ==');
  const end = await fetch(`${BASE}/transport/trip/end`, { method: 'POST', headers: A(driverLogin.token), body: JSON.stringify({ tripId: start.trip.tripId }) }).then(j);
  t('driver ends trip', end.trip.status === 'COMPLETED');

  console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error('SMOKE ERROR', e); process.exit(1); });
