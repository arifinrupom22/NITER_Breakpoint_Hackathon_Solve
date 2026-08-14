import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Bus, Gauge, MapPin, Navigation, Users, Clock, Signal, ArrowLeft, RefreshCw, AlertTriangle, Sparkles, TrendingDown,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useTransportState } from '../../lib/useTransport';
import { api } from '../../lib/api';
import { LiveMap } from '../../components/LiveMap';
import { Badge, Spinner } from '../../components/ui';
import { cls, fmtRelative, ocTone, trafficTone } from '../../lib/format';

type EtaAi = { etaToCampus: number | null; expectedDelay: number; risk: string; traffic: string; comparison: string; source: string };
type Route = { id: string; name: string; stops: { name: string; lat: number; lng: number }[] };

const CAMPUS = { lat: 23.8995, lng: 90.2563 };

export default function TransportLive() {
  const { user, token, logout } = useAuth();
  const { state, liveBus } = useTransportState(token);
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const [etaAi, setEtaAi] = useState<EtaAi | null>(null);
  const [routes, setRoutes] = useState<Record<string, Route>>({});

  const eligible = user?.eligibleBuses ?? [];
  const [selected, setSelected] = useState<string>(params.get('bus') || eligible[0] || '');

  useEffect(() => {
    if (!user || !['transport-student', 'transport-teacher'].includes(user.role)) {
      nav('/transport?verify=1', { replace: true });
    }
  }, [user, nav]);

  useEffect(() => {
    api.get<Route[]>('/api/transport/routes').then((rs) => setRoutes(Object.fromEntries(rs.map((r) => [r.id, r])))).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selected) return;
    setParams({ bus: selected }, { replace: true });
    api.get<EtaAi>(`/api/ai/eta?busId=${selected}`).then(setEtaAi).catch(() => {});
    const iv = setInterval(() => {
      api.get<EtaAi>(`/api/ai/eta?busId=${selected}`).then(setEtaAi).catch(() => {});
    }, 8000);
    return () => clearInterval(iv);
  }, [selected, setParams]);

  const bus = liveBus(selected);
  const route = selected ? routes[selected] : undefined;
  const stops = route?.stops ?? [];

  const infoRows = useMemo(() => {
    if (!bus) return [];
    return [
      { icon: MapPin, l: 'Current Location', v: bus.currentStop || 'At origin' },
      { icon: Navigation, l: 'Next Stop', v: bus.nextStop || '—' },
      { icon: Gauge, l: 'Distance to Next', v: bus.distToNext != null ? `${bus.distToNext} km` : '—' },
      { icon: Bus, l: 'Distance to Campus', v: bus.distToCampus != null ? `${bus.distToCampus} km` : '—' },
      { icon: Clock, l: 'ETA to Next', v: bus.etaToNext != null ? `~${bus.etaToNext} min` : '—' },
      { icon: Clock, l: 'ETA to Campus', v: bus.etaToCampus != null ? `~${bus.etaToCampus} min` : '—' },
      { icon: Gauge, l: 'Speed', v: bus.speedKmh ? `${bus.speedKmh} km/h` : '0 km/h' },
      { icon: Signal, l: 'Trip Status', v: bus.tripStatus },
      { icon: Users, l: 'Passengers', v: `${bus.passengers}/${bus.capacity}` },
    ];
  }, [bus]);

  if (!user || !['transport-student', 'transport-teacher'].includes(user.role)) return null;

  return (
    <section className="section bg-ink-50/40 min-h-[70vh]">
      <div className="container-x">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <button onClick={() => nav('/transport')} className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-niter-600 hover:text-niter-500">
              <ArrowLeft size={15} /> Smart Transport
            </button>
            <h1 className="font-display text-2xl font-semibold text-ink-900">Live Tracking</h1>
            <p className="text-sm text-ink-500">
              {user.role === 'transport-student' ? 'Student access' : 'Teacher access'} · {user.name} · <span className="font-semibold text-niter-600">{user.card}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => window.location.reload()} className="btn btn-outline btn-sm"><RefreshCw size={14} /> Refresh</button>
            <button onClick={() => { logout(); nav('/transport'); }} className="btn btn-danger btn-sm">Sign out</button>
          </div>
        </div>

        {/* Bus selector */}
        <div className="mb-6 flex flex-wrap gap-2">
          {eligible.map((id) => {
            const b = state?.public?.buses.find((x) => x.id === id);
            const isSel = selected === id;
            return (
              <button
                key={id}
                onClick={() => setSelected(id)}
                className={cls(
                  'flex items-center gap-2.5 rounded-xl border-2 px-4 py-2.5 transition-all',
                  isSel ? 'border-niter-600 bg-white shadow-card' : 'border-ink-100 bg-white/60 hover:border-niter-200'
                )}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${b?.color || '#2563eb'}22`, color: b?.color }}>
                  <Bus size={16} />
                </span>
                <span className="text-left">
                  <span className="block text-sm font-semibold text-ink-900">{b?.name}</span>
                  <span className="block text-[11px] text-ink-400">{b?.routeName}</span>
                </span>
                <span className={cls('h-2 w-2 rounded-full', b?.tripStatus === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-ink-200')} />
              </button>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="h-[520px]">
              <LiveMap bus={bus} route={route ?? null} stops={stops} campus={CAMPUS} />
            </div>
            {/* AI ETA */}
            <div className="card mt-4 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-ink-500">
                  <Sparkles size={14} className="text-niter-600" /> AI Arrival Forecast
                </p>
                {etaAi?.source && <Badge tone="gold">{etaAi.source}</Badge>}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
                <MiniStat l="ETA Campus" v={etaAi?.etaToCampus != null ? `~${etaAi.etaToCampus} min` : '—'} />
                <MiniStat l="Expected Delay" v={etaAi?.expectedDelay != null ? `${etaAi.expectedDelay} min` : '—'} />
                <MiniStat l="Traffic Risk" v={etaAi?.risk ?? '—'} />
                <MiniStat l="Traffic" v={etaAi?.traffic ?? '—'} />
              </div>
              {etaAi?.comparison && <p className="mt-2 text-xs text-ink-400">{etaAi.comparison}</p>}
            </div>
          </div>

          {/* Info panel */}
          <div className="space-y-4">
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between bg-ink-950 px-5 py-4 text-white">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${bus?.color || '#2563eb'}33`, color: bus?.color }}>
                    <Bus size={19} />
                  </span>
                  <div>
                    <p className="font-semibold">{bus?.busName ?? selected}</p>
                    <p className="text-[11px] text-ink-300">{bus?.driverName} · {bus?.routeName}</p>
                  </div>
                </div>
                <span className={cls('flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase', bus?.tripStatus === 'Active' ? 'bg-emerald-400/15 text-emerald-400' : 'bg-white/10 text-ink-300')}>
                  <span className={cls('h-1.5 w-1.5 rounded-full', bus?.tripStatus === 'Active' ? 'animate-pulseDot bg-emerald-400' : 'bg-ink-400')} />
                  {bus?.tripStatus || 'Inactive'}
                </span>
              </div>
              <div className="space-y-3 p-5">
                {bus ? (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                        <div className={cls('h-full transition-all duration-500', bus.occupancyTone === 'green' ? 'bg-emerald-500' : bus.occupancyTone === 'amber' ? 'bg-amber-500' : bus.occupancyTone === 'orange' ? 'bg-orange-500' : 'bg-red-500')} style={{ width: `${bus.occupancyPct}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-ink-600">{bus.occupancyPct}%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      {infoRows.map((r) => (
                        <div key={r.l} className="rounded-lg bg-ink-50/60 p-2.5">
                          <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-ink-400"><r.icon size={11} /> {r.l}</p>
                          <p className="mt-0.5 truncate text-[13px] font-semibold text-ink-900">{r.v}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className={cls('chip border', ocTone[bus.occupancyTone])}>{bus.occupancyLabel} · {bus.passengers} on board</span>
                      <span className={cls('chip border', trafficTone[bus.trafficStatus] || 'bg-ink-50 text-ink-500 border-ink-100')}>{bus.trafficStatus}</span>
                    </div>
                    <p className="flex items-center gap-1.5 text-[11px] text-ink-400">
                      <Clock size={11} /> Updated {fmtRelative(bus.lastUpdate)} · {bus.mode === 'live-gps' ? 'LIVE GPS' : 'DEMO SIMULATION'}
                    </p>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <Spinner className="h-6 w-6 text-niter-500" />
                    <p className="text-sm text-ink-400">Waiting for transport data…</p>
                  </div>
                )}
              </div>
            </div>

            <div className="card p-4">
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-ink-500"><TrendingDown size={14} className="text-amber-500" /> Crowd Forecast</p>
              {bus && <p className="mt-2 text-sm text-ink-600">Occupancy is projected to stay around <span className="font-semibold text-ink-900">{bus.occupancyPct}%</span> for the remainder of this trip.</p>}
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <p className="flex items-center gap-2 font-semibold"><AlertTriangle size={14} /> {bus?.trafficStatus === 'On Time' ? 'All clear on this route' : 'Heavier traffic than usual'}</p>
              <p className="mt-1 text-xs">Times are estimates from live speed, traffic state and historical route data.</p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-ink-400">
          Live location is available only to authorized NITER students and teachers. · <Link to="/transport" className="text-niter-600 hover:underline">Back to Smart Transport</Link>
        </p>
      </div>
    </section>
  );
}

function MiniStat({ l, v }: { l: string; v: string }) {
  return (
    <div className="rounded-lg border border-ink-100 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">{l}</p>
      <p className="mt-0.5 font-semibold text-ink-900">{v}</p>
    </div>
  );
}
