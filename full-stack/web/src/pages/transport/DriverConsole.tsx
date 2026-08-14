import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bus, Lock, Power, PowerOff, Gauge, Users, Satellite, Siren, Fuel, Wrench, ArrowLeft, LogOut, MapPin, Navigation,
} from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { useTransportState } from '../../lib/useTransport';
import { LiveMap } from '../../components/LiveMap';
import { Badge, Spinner } from '../../components/ui';
import { cls, fmtRelative } from '../../lib/format';

type DriverUser = { id: string; name: string; role: string; busId: string; phone?: string };
type Route = { id: string; name: string; stops: { name: string; lat: number; lng: number }[] };

const CAMPUS = { lat: 23.8995, lng: 90.2563 };

export default function DriverConsole() {
  const [driver, setDriver] = useState<DriverUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [step, setStep] = useState<'login' | 'dashboard'>('login');
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [tripBusy, setTripBusy] = useState(false);
  const [routes, setRoutes] = useState<Record<string, Route>>({});
  const [tripInfo, setTripInfo] = useState<{ tripId?: string; message?: string }>({});

  const { state, liveBus } = useTransportState(token);
  const bus = driver ? liveBus(driver.busId) : undefined;
  const busMeta = state?.public?.buses.find((b) => b.id === driver?.busId);

  useEffect(() => {
    api.get<Route[]>('/api/transport/routes').then((rs) => setRoutes(Object.fromEntries(rs.map((r) => [r.id, r])))).catch(() => {});
  }, []);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await api.post<{ token: string; user: DriverUser }>('/api/auth/transport/driver-login', { driverId: loginId, password: loginPw });
      setDriver(res.user);
      setToken(res.token);
      setStep('dashboard');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Connection temporarily unavailable');
    }
    setBusy(false);
  };

  const startTrip = async () => {
    if (!driver) return;
    setTripBusy(true);
    try {
      const res = await api.post<{ trip: { tripId: string }; message: string }>('/api/transport/trip/start', { busId: driver.busId });
      setTripInfo(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not start trip');
    }
    setTripBusy(false);
  };

  const endTrip = async () => {
    if (!driver || !bus?.tripId) return;
    setTripBusy(true);
    try {
      const res = await api.post<{ trip: { tripId: string }; message: string }>('/api/transport/trip/end', { tripId: bus.tripId });
      setTripInfo(res);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not end trip');
    }
    setTripBusy(false);
  };

  const logout = () => {
    setDriver(null);
    setToken(null);
    setStep('login');
    setLoginId('');
    setLoginPw('');
  };

  const route = driver && busMeta ? routes[busMeta.routeId] : undefined;
  const stops = route?.stops ?? [];

  return (
    <section className="min-h-screen bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 py-10">
      <div className="container-x">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/transport" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-300 hover:text-white">
            <ArrowLeft size={15} /> Back to Smart Transport
          </Link>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold-300">
            <Satellite size={13} /> NITER Transport · Driver Console
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[380px_1fr]">
          {/* Phone frame */}
          <div className="relative mx-auto w-[360px] rounded-[2.6rem] border-4 border-ink-700 bg-ink-950 p-3 shadow-2xl">
            <div className="absolute left-1/2 top-1 z-10 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-ink-700" />
            <div className="h-[680px] overflow-hidden rounded-[2rem] bg-ink-900">
              {step === 'login' ? (
                <div className="flex h-full flex-col p-6">
                  <div className="mt-8 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-niter-700 text-white"><Bus size={30} /></div>
                    <h2 className="mt-3 font-display text-2xl font-semibold text-white">NITER Transport</h2>
                    <p className="mt-1 text-xs text-ink-300">Driver Login · Secure Access</p>
                  </div>
                  <form onSubmit={login} className="mt-8 space-y-4">
                    <div>
                      <label className="label !text-ink-300">Driver ID</label>
                      <input className="input !bg-ink-800 !border-ink-700 !text-white" placeholder="e.g. DRV001" value={loginId} onChange={(e) => setLoginId(e.target.value)} required />
                    </div>
                    <div>
                      <label className="label !text-ink-300">Password</label>
                      <input type="password" className="input !bg-ink-800 !border-ink-700 !text-white" placeholder="••••••••" value={loginPw} onChange={(e) => setLoginPw(e.target.value)} required />
                    </div>
                    {error && <p className="rounded-lg bg-red-500/15 p-3 text-xs text-red-300">{error}</p>}
                    <button disabled={busy} className="btn btn-gold w-full !py-3">
                      {busy ? <Spinner /> : <><Lock size={15} /> Sign In as Driver</>}
                    </button>
                  </form>
                  <div className="mt-auto rounded-xl bg-white/5 p-3 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-300">Demo Driver Accounts</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-ink-400">DRV001 · Student Bus 1<br />DRV002 · Student Bus 2<br />DRV003 · Teacher Bus 1<br />DRV004 · Teacher Bus 2<br /><span className="text-gold-300">Password: driver123</span></p>
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col">
                  {/* header */}
                  <div className="bg-niter-700 p-4 pt-9 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15"><Bus size={17} /></span>
                        <div>
                          <p className="text-sm font-semibold">{driver?.name}</p>
                          <p className="text-[10px] text-ink-200">{driver?.id} · {busMeta?.name}</p>
                        </div>
                      </div>
                      <button onClick={logout} aria-label="Logout" className="rounded-lg bg-white/10 p-2 transition hover:bg-white/20"><LogOut size={14} /></button>
                    </div>
                    <div className="mt-3 flex items-center justify-between rounded-xl bg-white/10 px-3 py-2">
                      <span className="text-[11px] text-ink-200">Assigned Route</span>
                      <span className="text-xs font-semibold">{busMeta?.routeName}</span>
                    </div>
                  </div>

                  {/* body */}
                  <div className="flex-1 space-y-3 overflow-y-auto p-4">
                    <div className="grid grid-cols-2 gap-2.5">
                      <PhoneStat icon={Satellite} l="GPS Status" v={bus?.tripStatus === 'Active' ? 'ON' : 'Idle'} tone={bus?.tripStatus === 'Active' ? 'text-emerald-400' : 'text-ink-400'} />
                      <PhoneStat icon={Users} l="Passengers" v={bus ? `${bus.passengers}` : '0'} />
                      <PhoneStat icon={Gauge} l="Speed" v={bus?.speedKmh ? `${bus.speedKmh} km/h` : '0'} />
                      <PhoneStat icon={Navigation} l="ETA Campus" v={bus?.etaToCampus != null ? `${bus.etaToCampus}m` : '—'} />
                    </div>

                    <div className="rounded-xl bg-white/5 p-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-ink-300">Occupancy</span>
                        <span className="font-semibold text-white">{bus?.occupancyPct ?? 0}%</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-800">
                        <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${bus?.occupancyPct ?? 0}%` }} />
                      </div>
                    </div>

                    <div className="h-44 overflow-hidden rounded-xl border border-ink-700">
                      <LiveMap bus={bus} route={route ?? null} stops={stops} campus={CAMPUS} />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={startTrip}
                        disabled={bus?.tripStatus === 'Active' || tripBusy}
                        className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:opacity-40"
                      >
                        <Power size={16} /> START TRIP
                      </button>
                      <button
                        onClick={endTrip}
                        disabled={bus?.tripStatus !== 'Active' || tripBusy}
                        className="flex items-center justify-center gap-2 rounded-xl bg-red-600 py-3.5 text-sm font-bold text-white transition hover:bg-red-500 disabled:opacity-40"
                      >
                        <PowerOff size={16} /> END TRIP
                      </button>
                    </div>

                    {tripInfo.message && <p className="rounded-lg bg-emerald-500/15 p-2.5 text-xs text-emerald-300">{tripInfo.message}</p>}

                    <div className="grid grid-cols-2 gap-2.5 text-[11px]">
                      <button className="flex items-center gap-1.5 rounded-lg bg-red-500/15 p-2.5 font-semibold text-red-300 transition hover:bg-red-500/25"><Siren size={13} /> Emergency SOS</button>
                      <button className="flex items-center gap-1.5 rounded-lg bg-amber-500/15 p-2.5 font-semibold text-amber-300 transition hover:bg-amber-500/25"><Fuel size={13} /> Fuel Report</button>
                      <button className="flex items-center gap-1.5 rounded-lg bg-sky-500/15 p-2.5 font-semibold text-sky-300 transition hover:bg-sky-500/25"><Wrench size={13} /> Maintenance</button>
                      <div className="rounded-lg bg-white/5 p-2.5 text-ink-300">Trips today: <span className="font-bold text-white">—</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right panel: driver dashboard web view */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-xs font-bold uppercase tracking-widest text-gold-300">Driver Dashboard</p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-white">
                {step === 'login' ? 'Start your trip from the driver app' : `Welcome, ${driver?.name}`}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-300">
                This is a web mirror of the <span className="font-semibold text-white">NITER Transport</span> Flutter driver application —
                identical API calls, identical real-time state. On a physical phone the driver app uses device GPS
                (<span className="text-emerald-400">LIVE GPS</span>); here the demo simulation moves the bus
                (<span className="text-gold-300">DEMO SIMULATION</span>).
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {['DRV001', 'DRV002', 'DRV003', 'DRV004'].map((d) => (
                  <span key={d} className="rounded-lg border border-white/10 bg-ink-800 px-3 py-1.5 font-mono text-xs text-ink-200">{d} · driver123</span>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {state?.public?.buses.map((b) => (
                <div key={b.id} className={cls('rounded-2xl border p-4', driver?.busId === b.id ? 'border-gold-400/50 bg-gold-400/5' : 'border-white/10 bg-white/5')}>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white">{b.name}</p>
                    {driver?.busId === b.id && <Badge tone="gold">Your Bus</Badge>}
                  </div>
                  <p className="text-xs text-ink-300">{b.routeName} · {b.departure}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs">
                    <span className={cls('h-1.5 w-1.5 rounded-full', b.tripStatus === 'Active' ? 'animate-pulse bg-emerald-400' : 'bg-ink-500')} />
                    <span className="text-ink-200">{b.tripStatus}</span>
                    <span className="ml-auto text-ink-300">{b.passengers}/{b.capacity} · {b.occupancyPct}%</span>
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-ink-300">
              <p className="mb-2 flex items-center gap-2 font-semibold text-white"><MapPin size={14} className="text-gold-300" /> Flow</p>
              <p className="leading-relaxed">
                Driver Login → Assigned Bus → <span className="font-semibold text-emerald-400">START TRIP</span> → GPS ON → Real-time backend
                → Website + App + Admin sync → <span className="font-semibold text-red-400">END TRIP</span> → Trip saved with analytics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PhoneStat({ icon: Icon, l, v, tone = 'text-white' }: { icon: typeof Gauge; l: string; v: string; tone?: string }) {
  return (
    <div className="rounded-xl bg-white/5 p-3">
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-ink-400"><Icon size={11} /> {l}</p>
      <p className={cls('mt-0.5 text-sm font-bold', tone)}>{v}</p>
    </div>
  );
}
