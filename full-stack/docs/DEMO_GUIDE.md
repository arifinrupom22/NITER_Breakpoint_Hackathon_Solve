# Hackathon Demo Guide

A 12-moment presentation flow that shows the ecosystem is genuinely connected.

## Before you start

```bash
cd backend && npm install && npm start     # terminal 1 — http://localhost:3001
cd web && npm install && npm run dev       # terminal 2 — http://localhost:5173
```

Reset demo data anytime: stop the backend, delete `backend/data/db.json`, restart.

## The flow

1. **Premium NITER website** — open http://localhost:5173. Scroll the landing page:
   hero slider, quick access, notices (NEW/IMPORTANT badges), news & events, about NITER with
   animated counters, five departments, campus statistics, director message, upcoming events,
   gallery with preview modal, student services, footer with live clock.

2. **SMART TRANSPORT** — click the gold SMART TRANSPORT nav item (top-level, beside PORTAL).
   Four bus cards appear with driver, route, departure, occupancy and trip status.

3. **Four buses** — point out Student Bus 1 (Khamarbari, 6:40 AM), Student Bus 2 (Uttara, 6:30 AM),
   Teacher Bus 1 (Mirpur, 6:45 AM), Teacher Bus 2 (Shyamoli, 6:45 AM). Route stops shown in order.

4. **Authorized verification** — click **See Bus Location** → Student tab →
   `Arifin Rupom` / `BUS06` → Verify. Show the professional access-denied message with a wrong
   card first, then succeed. (Bad attempts are flagged in Admin → Security Alerts.)

5. **Live map** — the Leaflet/OSM map opens with the Khamarbari route, stops and the NITER
   campus pin. Student sees only Student buses; a teacher login would see only Teacher buses.

6. **Driver starts trip from "phone"** — open `/transport/driver` (or the Flutter app), log in
   `DRV001` / `driver123`, click **START TRIP**. GPS status flips ON, a trip ID is created.

7. **Bus starts moving** — back on the live page (or split-screen), the bus marker advances
   along the route; speed, current stop and next stop update every second. Label: **DEMO SIMULATION**.

8. **ETA changes** — ETA to campus counts down in real time; AI Arrival Forecast shows expected
   delay, traffic risk and comparison to the historical average.

9. **Occupancy changes** — passenger count and occupancy % rise as the bus passes stops.
   Open the chatbot (bottom-left) and ask *"Is my bus crowded?"* — it answers from live data.

10. **AI predicts crowd** — on the transport page: crowd predictions per bus, best departure
    time, and the additional-bus alert ("Expected occupancy exceeds 90%…" when applicable).

11. **Admin sees all buses** — Admin Portal (`admin` / `admin123`) → **Transport Live**:
    all four buses on one map with driver, route, speed, occupancy and ETA. Then **Analytics**
    for trips, revenue (demo) and on-time rate; **Trips** for trip history; **Security Alerts**
    for the failed verification you tried earlier.

12. **Driver ends trip** — in the driver console click **END TRIP**. GPS off, trip marked
    completed, saved to history, analytics updated, notification broadcast.

## Mobile app (optional)

`App/NITER_Transport` — `flutter pub get && flutter run`. Start screen → Driver Login →
assigned bus → START TRIP. On a physical phone, toggle **Use device GPS** for LIVE GPS mode;
otherwise the simulation drives the same state the website shows.

## Credentials cheat sheet

| Who | Credential |
| --- | --- |
| Admin portal | admin / admin123 |
| Student portal | 2023001 / student123 |
| Teacher portal | T001 / teacher123 |
| Transport student | Arifin Rupom · BUS06 · Sneha Rahman · BUS26 · Nabila Nawshin · BUS32 |
| Transport teacher | Dr. Rahman · T001 · Prof. Ahmed · T002 · Ms. Sultana · T003 |
| Drivers | DRV001–DRV004 · driver123 |
