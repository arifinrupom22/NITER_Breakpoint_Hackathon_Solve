# full-stack/ — original connected version (optional)

This folder preserves the original **React + Node.js + Socket.IO** version of NITER Smart Campus + Smart Transport. The static site at the project root (`index.html`) is the primary, zero-dependency demo — this is the optional real-time backend version.

## Contents
- `web/` — React (Vite + TypeScript + Tailwind + Leaflet) frontend
- `backend/` — Express + Socket.IO backend with GPS simulation engine, REST API, AI modules and a JSON data store
- `docs/` — `ARCHITECTURE.md` (full architecture) and `DEMO_GUIDE.md` (hackathon demo flow)

## Run it (needs Node.js)
```bash
# terminal 1 — backend on :3001
cd backend && npm install && npm start

# terminal 2 — frontend on :5173
cd web && npm install && npm run dev
```
Then open http://localhost:5173. The backend seeds itself with buses, routes, students, teachers and drivers; the web app connects over REST + Socket.IO.

## Relationship to the static site
- **Static site** (`../index.html`): works by double-click, no server. Bus movement is simulated in the browser and shared via `localStorage`.
- **This version**: real backend, WebSocket push to website + Flutter app (`../App/NITER_Transport`) + admin, labeled **DEMO SIMULATION** when simulated and **LIVE GPS** when a driver phone reports real coordinates.
