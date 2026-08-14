import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Bus, MapPin, Clock, Radar, Users, Ticket, ClipboardCheck, Bell, Siren, ShieldCheck,
  ArrowRight, ChevronDown, Database, Sparkles, TrendingUp, Navigation, AlertTriangle,
} from 'lucide-react';
import { api } from '../../lib/api';
import type { PublicState, BusPublic } from '../../lib/api';
import { useTransportState } from '../../lib/useTransport';
import { useAuth } from '../../lib/auth';
import { Reveal } from '../../components/Reveal';
import { Badge, Modal, SectionHeading } from '../../components/ui';
import { VerifyPanel } from './VerifyPanel';
import { cls, ocTone, trafficTone, fmtRelative } from '../../lib/format';

type Crowd = { busId: string; busName: string; predicted: string; predictedPct: number; confidence: number; recommendation: string };
type Dep = { recommendedDeparture: string; reasoning: string };
type ExtraBus = { busId: string; busName: string; recommended: boolean; reason: string };

export default function Transport() {
  const { token } = useAuth();
  const { state } = useTransportState(token);
  const [publicState, setPublicState] = useState<PublicState | null>(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [crowd, setCrowd] = useState<Crowd[]>([]);
  const [dep, setDep] = useState<Dep | null>(null);
  const [extra, setExtra] = useState<ExtraBus[]>([]);
  const [searchParams] = useSearchParams();

  const pub = state?.public ?? publicState;
  const buses = pub?.buses ?? [];

  useEffect(() => {
    api.get<PublicState>('/api/transport/public').then(setPublicState).catch(() => {});
    api.get<Crowd>('/api/ai/crowd?busId=BUS-STD-1').then((c) => setCrowd([c])).catch(() => {});
    api.get<Crowd>('/api/ai/crowd?busId=BUS-STD-2').then((c) => setCrowd((p) => [...p, c])).catch(() => {});
    api.get<Dep>('/api/ai/departure?routeId=R-KHAM').then(setDep).catch(() => {});
    api.get<{ recommendations: ExtraBus[] }>('/api/ai/additional-bus').then((r) => setExtra(r.recommendations)).catch(() => {});
  }, []);

  useEffect(() => {
    if (searchParams.get('verify') === '1') setVerifyOpen(true);
  }, [searchParams]);

  const activeCount = buses.filter((b) => b.tripStatus === 'Active').length;
  const totalPax = buses.reduce((s, b) => s + b.passengers, 0);
  const avgOcc = buses.length ? Math.round(buses.reduce((s, b) => s + b.occupancyPct, 0) / buses.length) : 0;

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-ink-950 py-20 md:py-28">
        <img src="/images/hero-2.svg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950/95 via-ink-950/75 to-ink-950/30" />
        <div className="container-x relative">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-gold-300">
            <Radar size={13} /> NITER Smart Transport
          </p>
          <h1 className="font-display text-4xl font-semibold leading-tight text-white md:text-6xl">
            Smart Mobility for a <span className="text-gold-300">Connected NITER</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-ink-200">
            Track campus buses, view routes, estimate arrival times, and experience secure digital transportation.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => setVerifyOpen(true)} className="btn btn-gold text-base !px-7 !py-3">
              <Navigation size={18} /> See Bus Location
            </button>
            <a href="#routes" className="btn btn-primary bg-white/10 border border-white/25 backdrop-blur hover:bg-white/20">View Routes</a>
            <Link to="/transport/driver" className="btn btn-primary bg-niter-700 border border-transparent hover:bg-niter-600">
              <Bus size={17} /> Driver Console
            </Link>
          </div>
          {pub?.demoMode && (
            <p className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gold-400/15 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gold-300">
              <Database size={12} /> Demo Simulation Mode — buses move on a compressed timeline
            </p>
          )}
        </div>
      </section>

      {/* ============ FOUR BUS OVERVIEW ============ */}
      <section className="section -mt-10 relative z-20">
        <div className="container-x">
          <SectionHeading eyebrow="Our Fleet" title="Four Buses, Four Routes, On Time" desc="Student and teacher buses depart every morning — tracked live across the city." />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {buses.map((b, i) => (
              <Reveal key={b.id} delay={i * 70}>
                <BusCard bus={b} onSee={() => setVerifyOpen(true)} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="bg-ink-950 py-12">
        <div className="container-x grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { v: String(activeCount), l: 'Active Buses', icon: Bus },
            { v: `${totalPax}`, l: 'Current Passengers', icon: Users },
            { v: String(buses.length), l: 'Total Buses', icon: Radar },
            { v: `${avgOcc}%`, l: 'Avg Occupancy', icon: TrendingUp },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur">
              <s.icon size={20} className="mx-auto text-gold-300" />
              <p className="mt-2 font-display text-3xl font-semibold text-white">{s.v}</p>
              <p className="text-xs uppercase tracking-wider text-ink-300">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ ROUTES ============ */}
      <section id="routes" className="section">
        <div className="container-x">
          <SectionHeading eyebrow="Routes" title="Campus Routes Across Dhaka" desc="Official routes with fixed departure times. Student Bus 2 and Teacher Bus 2 have admin-configurable intermediate stops." />
          <div className="grid gap-6 lg:grid-cols-2">
            {pub?.routes.map((r, i) => (
              <Reveal key={r.id} delay={i * 70}>
                <div className="card card-hover h-full p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display text-lg font-semibold text-ink-900">{r.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge tone={r.type === 'Student' ? 'niter' : 'purple'}>{r.type} Bus</Badge>
                      {r.configurable && <Badge tone="gold">Stops Configurable</Badge>}
                    </div>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500"><Clock size={13} /> Departs {r.departure}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-1.5">
                    {r.stops.map((s, si) => (
                      <span key={s} className="flex items-center gap-1.5">
                        <span className={cls('rounded-lg px-2.5 py-1.5 text-xs font-semibold', si === 0 ? 'bg-niter-700 text-white' : si === r.stops.length - 1 ? 'bg-gold-500 text-ink-900' : 'bg-ink-50 text-ink-600')}>
                          {s}
                        </span>
                        {si < r.stops.length - 1 && <ChevronDown size={13} className="rotate-[-90deg] text-ink-300" />}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ AI ============ */}
      <section className="section bg-ink-50/50">
        <div className="container-x">
          <SectionHeading eyebrow="AI Transport Intelligence" title="Predictions from Real System Data" desc="Crowd, delay and departure-time forecasts computed from live occupancy, passenger history, route demand and schedules." />
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="card p-6 lg:col-span-2">
              <p className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-ink-500"><Sparkles size={15} className="text-niter-600" /> AI Crowd Prediction</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {crowd.map((c) => (
                  <div key={c.busId} className="rounded-xl border border-ink-100 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-ink-900">{c.busName}</p>
                      <Badge tone={c.predicted === 'Low' ? 'green' : c.predicted === 'Moderate' ? 'gold' : c.predicted === 'High' ? 'red' : 'red'}>{c.predicted}</Badge>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink-100">
                      <div className={cls('h-full rounded-full transition-all duration-700', c.predictedPct > 85 ? 'bg-red-500' : c.predictedPct > 60 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${Math.min(100, c.predictedPct)}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-ink-500">{c.recommendation} · {c.confidence}% confidence</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-6">
              <p className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-ink-500"><Navigation size={15} className="text-niter-600" /> Best Departure Time</p>
              {dep && (
                <>
                  <p className="font-display text-3xl font-semibold text-niter-700">{dep.recommendedDeparture}</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{dep.reasoning}</p>
                </>
              )}
              <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-amber-600"><AlertTriangle size={13} /> Additional Bus Alert</p>
              {extra.filter((e) => e.recommended).map((e) => (
                <p key={e.busId} className="mt-1.5 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800">{e.reason}</p>
              ))}
              {extra.filter((e) => !e.recommended).map((e) => (
                <p key={e.busId} className="mt-1.5 rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-800">{e.reason}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="section">
        <div className="container-x">
          <SectionHeading eyebrow="Smart Features" title="A Complete Digital Transport Experience" center />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { icon: Radar, t: 'Live Tracking', d: 'Real-time bus position on map.' },
              { icon: Ticket, t: 'Digital Bus Pass', d: 'QR / NFC smart passes for students.' },
              { icon: ClipboardCheck, t: 'Smart Attendance', d: 'Automatic attendance on boarding.' },
              { icon: Sparkles, t: 'AI Crowd Prediction', d: 'Forecast occupancy ahead of time.' },
              { icon: Navigation, t: 'Live ETA', d: 'Arrival estimates to every stop.' },
              { icon: Bell, t: 'Notifications', d: 'Trip, delay and alert updates.' },
              { icon: Siren, t: 'Emergency SOS', d: 'One-tap help for students & drivers.' },
              { icon: Users, t: 'Occupancy', d: 'Seat availability in real time.' },
            ].map((f, i) => (
              <Reveal key={f.t} delay={i * 50}>
                <div className="card card-hover h-full p-5 text-center">
                  <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-niter-50 text-niter-600"><f.icon size={20} /></span>
                  <p className="mt-3 text-sm font-semibold text-ink-900">{f.t}</p>
                  <p className="mt-1 text-xs text-ink-500">{f.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SECURITY ============ */}
      <section className="section bg-ink-950">
        <div className="container-x flex flex-col items-center gap-6 text-center">
          <ShieldCheck size={44} className="text-gold-300" />
          <h2 className="h-display !text-white max-w-2xl">Secure, Verified Tracking</h2>
          <p className="max-w-xl text-ink-300">Live transport tracking is available only to authorized NITER students and teachers. Unauthorized attempts are detected, logged and flagged for the transport administration.</p>
          <button onClick={() => setVerifyOpen(true)} className="btn btn-gold text-base !px-8 !py-3">
            <MapPin size={17} /> Verify & See Bus Location
          </button>
        </div>
      </section>

      {/* ============ VERIFY MODAL ============ */}
      <Modal open={verifyOpen} onClose={() => setVerifyOpen(false)} title="Authorized Access — See Bus Location">
        <VerifyPanel onDone={() => setVerifyOpen(false)} />
      </Modal>
    </>
  );
}

function BusCard({ bus, onSee }: { bus: BusPublic; onSee: () => void }) {
  const active = bus.tripStatus === 'Active';
  return (
    <div className="card card-hover flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between bg-ink-950 px-5 py-4" style={{ borderLeft: `4px solid ${bus.color}` }}>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${bus.color}22`, color: bus.color }}>
            <Bus size={20} />
          </span>
          <div>
            <p className="font-semibold text-white">{bus.name}</p>
            <p className="text-[11px] text-ink-300">{bus.routeName} · {bus.departure}</p>
          </div>
        </div>
        <span className={cls('flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider', active ? 'bg-emerald-400/15 text-emerald-400' : 'bg-white/10 text-ink-300')}>
          <span className={cls('h-1.5 w-1.5 rounded-full', active ? 'animate-pulseDot bg-emerald-400' : 'bg-ink-400')} />
          {active ? 'On Trip' : bus.tripStatus === 'Arrived' ? 'Arrived' : 'Inactive'}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
          <Info l="Driver" v={bus.driverName} />
          <Info l="Type" v={bus.type} />
          <Info l="Current Stop" v={bus.currentStop} />
          <Info l="Next Stop" v={bus.nextStop || '—'} />
          <Info l="Occupancy" v={`${bus.passengers}/${bus.capacity}`} />
          <Info l="ETA Campus" v={bus.etaToCampus != null ? `~${bus.etaToCampus} min` : '—'} />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
            <div className={cls('h-full transition-all', bus.occupancyTone === 'green' ? 'bg-emerald-500' : bus.occupancyTone === 'amber' ? 'bg-amber-500' : bus.occupancyTone === 'orange' ? 'bg-orange-500' : 'bg-red-500')} style={{ width: `${bus.occupancyPct}%` }} />
          </div>
          <span className="text-xs font-semibold text-ink-600">{bus.occupancyPct}%</span>
        </div>
        <div className="flex items-center justify-between border-t border-ink-50 pt-3">
          <span className={cls('chip border', trafficTone[bus.trafficStatus] || 'bg-ink-50 text-ink-500 border-ink-100')}>{bus.trafficStatus}</span>
          <button onClick={onSee} className="link-underline">See Location <ArrowRight size={13} /></button>
        </div>
        <p className="text-[10px] text-ink-300">Updated {fmtRelative(bus.lastUpdate)}</p>
      </div>
    </div>
  );
}

function Info({ l, v }: { l: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-ink-400">{l}</span>
      <span className="truncate font-semibold text-ink-800">{v}</span>
    </div>
  );
}
