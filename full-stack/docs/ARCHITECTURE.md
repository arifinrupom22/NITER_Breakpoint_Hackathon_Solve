# NITER Smart Campus + Smart Transport — Architecture

## 1. System architecture

```
                         ┌──────────────────────────────────────────┐
                         │              NITER BACKEND               │
                         │  Express REST API  +  Socket.IO hub      │
                         │  JWT auth · role-based access control    │
                         │  Transport engine (single live state)    │
                         │  Demo simulation loop / GPS ingest       │
                         │  AI intelligence · analytics · reports   │
                         └───────▲──────────────▲──────────────▲────┘
                                 │              │              │
                 REST + WebSocket│              │              │
                                 │              │              │
        ┌────────────────────────┴───┐   ┌──────┴─────┐   ┌────┴─────────┐
        │  Public NITER Website      │   │  Student/  │   │  NITER       │
        │  + Smart Transport pages   │   │  Teacher   │   │  Transport   │
        │  + Driver console (web)    │   │  portals   │   │  Flutter app │
        │  (React + Leaflet + OSM)   │   │  + Admin   │   │  (driver GPS)│
        │                            │   │  dashboard │   └──────────────┘
        └────────────────────────────┘   └────────────┘
```

All three client surfaces receive the **same** transport state from the one engine.

## 2. Real-time architecture

```
Driver phone (LIVE GPS) ──┐
                          ▼
        NITER Transport API  ◄── REST (trip start/end, GPS, boarding)
                          │
              Real-Time Transport Service (Socket.IO)
                          │
   ┌──────────┬───────────┼───────────┬──────────┐
   ▼          ▼           ▼           ▼          ▼
 Website   Student app  Teacher app  Driver app  Admin dashboard
 (live map) (live map)   (live map)   (trips)     (all 4 buses + analytics)
```

The engine ticks once per second, advances active trips along their route polylines
(demo simulation on a compressed clock), updates ETA/occupancy/traffic, and broadcasts a
`transport:state` payload. The hub filters coordinates per connection role:

- public (no auth): status, occupancy, ETA — **no coordinates**
- transport-student: only Student Bus 1 & 2
- transport-teacher: only Teacher Bus 1 & 2
- driver: only their assigned bus
- admin: all four buses, full telemetry

## 3. Data model

```
TransportUser { id, name, role, studentId/teacherId, card, phone, dept, status }
Bus           { id, name, type(Student|Teacher), capacity, routeId, driverId, status, departure }
Driver        { id, name, phone, busId, status }
Route         { id, name, type, departure, configurable, stops[{name,lat,lng,demand}] }
Trip          { tripId, busId, routeId, driverId, startedAt, endedAt, status, passengers, distanceKm }
GPSLocation   { busId, tripId, lat, lng, speed, timestamp }
Boarding      { boardingId, studentId, card, busId, tripId, tapType, at, lat, lng }
Payment       { paymentId, userId, amount, method, status(DEMO PAYMENT), at }
Complaint / Emergency / Maintenance / Anomaly / Notification
+ NSCMS: Student, Teacher, Department, Batch, Course, Room, Routine, Notice, Result, Attendance, HelpingZone
```

## 4. Access flows

```
Website → SMART TRANSPORT → See Bus Location → Verify (Name + Card/ID)
  → authorized? → Student buses (student) / Teacher buses (teacher)
  → select bus → live map: position, route, stops, ETA, traffic, occupancy

Driver app → Driver Login → assigned bus only → START TRIP → GPS ON
  → backend → website + app + admin → END TRIP → trip saved + analytics

Student QR boarding: scan Smart Bus Pass → verify identity/eligibility/active trip
  → record boarding → attendance → passenger count → occupancy → fare → transaction (DEMO PAYMENT)
```

## 5. AI architecture

All AI runs on **real system data** — current occupancy, passenger logs, trip history, route
demand, schedules and the live traffic model. Nothing is fabricated; where a signal is
unavailable the model says so explicitly.

| Feature | Inputs | Output |
| --- | --- | --- |
| Crowd prediction | occupancy, passenger log, route demand, day/time, schedule | Low/Moderate/High/Very High + confidence + reason |
| ETA / delay forecast | distance, speed, traffic factor, historical duration | ETA, expected delay, risk, comparison |
| Best departure time | route length, traffic curve, target arrival | recommended leave time + reasoning |
| Additional bus | predicted morning peak occupancy | Additional Bus Recommended with reason (e.g. ">90% at 7:15 AM") |
| Route optimization | demand, distance, traffic | recommendation **reviewed by admin** — never silently changes official routes |
| Chatbot | intents + live snapshot (+ optional LLM via `AI_API_KEY`) | answers on schedules, location access, crowding, delays, best time, reporting |
| Anomaly detection | QR scans, boarding patterns, GPS jumps, verify failures | flags for admin review — no automatic punishment |
| Predictive maintenance | mileage, trips, service dates, reported issues | Healthy / Due Soon / Required |

## 6. Demo mode

`DEMO_MODE=true` + `SIM_TIME_SCALE=12`. The simulation moves buses along real route coordinates
on a compressed clock; every surface is labeled **DEMO SIMULATION**. With a physical phone the
driver app streams real GPS and the label switches to **LIVE GPS**.

## 7. Security architecture

- JWT sessions (12 h) with role claims; `Bearer` auth on every live/admin route
- Role-based access control at both API and realtime-hub level
- Driver authorization: token contains `busId`; start/end rejected for other buses
- QR expiry (5-minute tokens), repeated-scan fraud detection
- Input validation (duplicate IDs, email/phone/salary, routine conflicts, lab assignment)
- Rate limiting on auth endpoints; anomaly logging for unauthorized attempts
- Secrets only via environment variables; `.env` git-ignored
