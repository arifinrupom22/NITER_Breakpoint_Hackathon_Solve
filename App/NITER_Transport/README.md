# NITER Transport (Flutter)

Mobile application for the **NITER Smart Campus + Smart Transport** ecosystem.

Connects to the **same backend** (`backend/`) that powers the website and the admin
dashboard — one source of transport state across every client.

## Features

- **Start screen** — NITER identity, Driver Login, See Bus Location
- **Driver app** — login (4 demo drivers), assigned-bus-only, START/END TRIP,
  device GPS (LIVE GPS) or demo simulation, passenger count, occupancy, fuel,
  maintenance, emergency SOS
- **Student / Teacher access** — verify with Name + Bus Card / Teacher ID,
  bus selection filtered by role, live map with route, stops, moving bus, ETA
- **Digital Smart Bus Pass** — QR code pass (QR/NFC boarding architecture)
- **Realtime** — Socket.IO state identical to the website and admin dashboard

## Run

```bash
flutter pub get
flutter run
```

### Backend URL

Set the backend address with `--dart-define`:

```bash
# Android emulator (default)
flutter run

# iOS simulator / web / desktop
flutter run --dart-define=API_BASE=http://localhost:3001/api --dart-define=SOCKET_URL=http://localhost:3001

# Physical phone on the same Wi-Fi
flutter run --dart-define=API_BASE=http://<your-pc-ip>:3001/api --dart-define=SOCKET_URL=http://<your-pc-ip>:3001
```

## Demo credentials

| Role   | ID            | Password    |
| ------ | ------------- | ----------- |
| Driver | DRV001–DRV004 | driver123   |
| Student| Arifin Rupom + BUS06 / Sneha Rahman + BUS26 / Nabila Nawshin + BUS32 | — |

See the root `README.md` for the complete demo guide.
