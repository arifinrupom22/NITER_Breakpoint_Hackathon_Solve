# NITER Smart Campus + NITER Smart Transport

**National Institute of Engineering and Research** — a connected smart-campus and smart-transport ecosystem for the NITER Innovate Hackathon.

This version is a **fully static, zero-dependency website**. It runs directly from `index.html` by double-clicking it — no `npm`, no `node`, no localhost, no build step, no backend. Every feature (university website, Smart Transport with live bus simulation, portals, driver console, chatbot, maps) runs on plain **HTML + CSS + JavaScript** with demo data stored in `js/data.js` and persistence via `localStorage`.

> The original React + Node.js full-stack version (with Socket.IO real-time GPS and a backend) is preserved intact in the [`full-stack/`](./full-stack) folder. The static site is the primary demo deliverable; `full-stack/` is the optional connected version.

---

## 1. Final folder structure

```
NITER-Smart-Campus/
│
├── index.html              ← ENTRY POINT — double-click this
├── css/
│   └── style.css           ← complete design system (ported from the React/Tailwind version)
│
├── js/
│   ├── data.js             ← all demo data (buses, routes, students, teachers, notices…)
│   ├── ui.js               ← helpers, clock, modals, toasts, nav, animations
│   ├── home.js             ← hero slider + home sections
│   ├── pages.js            ← About, Academics, Departments, Admissions, Research,
│   │                         Notices, News & Events, Campus Life, Student Services
│   ├── map.js              ← Leaflet (CDN) live map + offline SVG fallback
│   ├── transport.js        ← Smart Transport page, verification, bus simulation engine
│   ├── auth.js             ← DEMO frontend authentication (students/teachers/admin)
│   ├── portals.js          ← Student / Teacher / Admin dashboards
│   ├── driver.js           ← Driver console (phone-framed)
│   └── app.js              ← hash router + boot
│
├── assets/
│   └── images/             ← local JPG photos + illustrations (hero, gallery, campus…)
│
├── App/
│   └── NITER_Transport/    ← Flutter mobile app (same Smart Transport concept)
│
└── full-stack/             ← OPTIONAL: original React + Node + Socket.IO system
    ├── web/                ← React (Vite) frontend
    ├── backend/            ← Express + Socket.IO backend + simulation engine
    └── docs/               ← architecture & full-stack demo guide
```

## 2. Removed dependencies

| Removed | Why |
|---|---|
| React / ReactDOM / TypeScript / JSX | Replaced with vanilla JS + HTML templates |
| Vite + Tailwind build pipeline | Replaced with one hand-written `style.css` |
| Express / Socket.IO / Node backend | Replaced with an in-browser simulation engine + `localStorage` |
| `npm install` / `npm run dev` / `npm run build` | **None needed** — no `package.json` at the project root |
| External images / API keys | All images are local JPGs; no API keys shipped |

## 3. Retained features (all preserved)

- Full premium NITER university website with **real campus photos**: top bar with **live clock**, sticky header, main navigation, **hero slider (4 slides, real NITER campus photos, kenburns + auto-advance)**, quick access, notices (NEW/IMPORTANT badges), news & events, about + animated counters, departments, campus statistics, director message, upcoming events, campus-life gallery with lightbox, student services, contact + footer.
- **SMART TRANSPORT** is a separate top-level nav item (before PORTAL):
  - Four buses: Student Bus 1 (Khamarbari, 6:40 AM), Student Bus 2 (Uttara, 6:30 AM), Teacher Bus 1 (Mirpur, 6:45 AM), Teacher Bus 2 (Shyamoli, 6:45 AM) — **exact routes preserved**.
  - **See Bus Location → verify (Student: name + Bus Card No. / Teacher: short name + Teacher/Transport ID, e.g. `SSH` + `T002`) → bus selection → live Leaflet map** with route line, stops, moving bus marker, ETA, traffic status, occupancy, distance, speed. Unauthorized attempts show the professional "authorized access only" message.
  - **DEMO SIMULATION** badge everywhere — never presented as real GPS.
- **PORTAL** dropdown → Student / Teacher / Admin portals with working demo logins and dashboards (courses, routine, attendance, results, Smart Bus Pass with QR, Helping Zone, marks, admin CRUD + reports + transport admin).
- **Driver Console** (phone-framed): driver login → assigned bus → **Start Trip / End Trip** → GPS simulation updates the website map, bus cards, admin dashboard **in real time** (same-tab events + cross-tab `localStorage` sync).
- Chatbot (NITER Transport Assistant), search modal, notifications, toasts, back-to-top, responsive design (desktop/tablet/mobile), reveal-on-scroll animations.

## 4. Demo accounts (DEMO FRONTEND AUTHENTICATION — not production-grade)

**Student portal** (password `123456@#`):

| Name | Student ID | Bus Card |
|---|---|---|
| Arifin Rupom | `CS 2405006` | BUS06 |
| Sneha Rahman | `CS 2405026` | BUS26 |
| Nabila Nawshin | `CS 2405032` | BUS32 |

**Transport live tracking** (Smart Transport → See Bus Location): same three students (Name + BUS06/BUS26/BUS32), or teachers with their **short name + Teacher/Transport ID** (e.g. `SSH` + `T002`).

**Teacher portal** (password `654321@#` — same for all teachers; login with the **Teacher ID short name**):

| Teacher ID (login) | Name | Transport ID (T-ID) |
|---|---|---|
| JTT | Jarin Tasnim Tamanna | T001 |
| SSH | Shakila Shafiq | T002 |
| UKD | Utpol Kanti Das | T003 |
| MAB | Md. Abul Basar | T004 |
| MdAM | Md. Alam Miah | T005 |
| TA | Tanvir Ahmed | T006 |
| MR | Muaz Rahman | T007 |
| DMSS | Dr. Mohammed Shahriar Sabuktagin | T008 |
| SKB | Shemanta Kumar Biswas | T009 |
| KN | Kamrun Nahar | T010 |
| MMR | Md. Musfikur Rahman | T011 |

> The optional `full-stack/` version still keeps its own **legacy demo accounts** (`T001` / `teacher123` with Dr. Rahman, Prof. Ahmed, Ms. Sultana). Those belong to the old React prototype and are separate from the static site's credentials above.

**Admin portal**: `admin` / `admin123`

**Drivers** (password `driver123`): `DRV1` Student Bus 1 · `DRV2` Student Bus 2 · `DRV3` Teacher Bus 1 · `DRV4` Teacher Bus 2

## 5. How to open it

1. Open the project folder.
2. Double-click **`index.html`** → opens in Google Chrome.
3. Done. No server, no install, no localhost.

The map uses the free **Leaflet + OpenStreetMap CDN** when online; if you are offline it automatically falls back to a clean SVG schematic of the route, so the demo never breaks.

## 6. How to deploy (GitHub Pages / Netlify / Cloudflare Pages / Vercel)

The whole project is static — upload the folder as-is.

**GitHub Pages:**
1. Push this folder to a GitHub repository.
2. Repo → **Settings → Pages → Source: Deploy from a branch → main / (root)**.
3. Save — your site is live at `https://<user>.github.io/<repo>/` in ~1 minute.

**Netlify:** drag-and-drop the folder onto https://app.netlify.com/drop (Build command: none; Publish directory: `/`).

**Vercel / Cloudflare Pages:** import the repo or upload the folder — no build command required.

## 7. Confirmation checklist

- ✅ **No localhost needed** — works from `file://` by double-clicking `index.html`.
- ✅ **No missing module / import errors** — no ES modules, no `fetch()`, no `import` statements; ten classic `<script>` tags load in order.
- ✅ **Opens directly** — verified end-to-end: home, navigation, Smart Transport, verification, live map, driver trip start/end, portal logins, admin dashboard all run from the static files.
- ✅ **Deployable** — pure static; upload to any static host.
- ✅ **Design preserved** — same palette (ink navy `#0b1a38`, niter blue `#2563eb`, gold `#c9a227`), Playfair Display + Inter typography, same sections, animations and layout.

## 8. Running the optional full-stack version

If you want the real backend (REST API + Socket.IO real-time GPS across tabs/devices), see [`full-stack/README.md`](./full-stack) and [`full-stack/docs/`](./full-stack/docs). It needs `npm install` and two terminals (`backend` on :3001, `web` on :5173) — the static site does not.
