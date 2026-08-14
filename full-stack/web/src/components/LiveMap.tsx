import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { LiveBus } from '../lib/api';
import { Bus } from 'lucide-react';

type Stop = { name: string; lat: number; lng: number };
type RouteData = { id: string; name: string; stops: Stop[] };

function busIcon(color: string, active: boolean) {
  const size = active ? 38 : 30;
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 48 48">
    <g transform="translate(24 24)">
      <circle r="21" fill="${color}" opacity="0.18"/>
      <rect x="-16" y="-14" width="32" height="26" rx="6" fill="${color}"/>
      <rect x="-12" y="-10" width="9" height="5" rx="2" fill="#ffffff" opacity="0.85"/>
      <rect x="-1" y="-10" width="12" height="5" rx="2" fill="#f7df9a"/>
      <circle cx="-9" cy="16" r="6.5" fill="#0b1a38" stroke="${color}" stroke-width="2.5"/>
      <circle cx="9" cy="16" r="6.5" fill="#0b1a38" stroke="${color}" stroke-width="2.5"/>
      ${active ? '<circle cx="0" cy="-24" r="4" fill="#10b981"><animate attributeName="opacity" values="1;0.2;1" dur="1.4s" repeatCount="indefinite"/></circle>' : ''}
    </g></svg>`;
  return L.divIcon({ html: svg, className: 'bus-marker', iconSize: [size, size], iconAnchor: [size / 2, size / 2 + 2] });
}

export function LiveMap({
  bus, route, stops, campus,
}: {
  bus: LiveBus | undefined;
  route: RouteData | null;
  stops: Stop[];
  campus: { lat: number; lng: number };
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{ route?: L.Polyline; markers: (L.Marker | L.CircleMarker)[]; busMarker?: L.Marker; campusMarker?: L.Marker }>({ markers: [] });
  const [tilesFailed, setTilesFailed] = useState(false);

  // Init map once (default center; bounds are fit when stops arrive)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [23.83, 90.34],
      zoom: 12,
      zoomControl: true,
      attributionControl: true,
    });
    mapRef.current = map;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    })
      .addTo(map)
      .on('tileerror', () => setTilesFailed(true));

    const campusMarker = L.marker([campus.lat, campus.lng], {
      icon: L.divIcon({ html: '<div class="campus-pin"></div>', className: 'bus-marker', iconSize: [26, 26] }),
    }).addTo(map);
    campusMarker.bindPopup('<strong>NITER Campus</strong><br/>Nayarhat, Savar, Dhaka');
    layersRef.current.campusMarker = campusMarker;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fit bounds to route when it first loads
  useEffect(() => {
    const map = mapRef.current;
    if (!map || stops.length < 2) return;
    map.fitBounds(L.latLngBounds(stops.map((s) => [s.lat, s.lng] as [number, number])), { padding: [40, 40] });
  }, [stops]);

  // Route polyline + stop markers when route changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !route || stops.length < 2) return;
    const latlngs = stops.map((s) => [s.lat, s.lng] as [number, number]);
    if (layersRef.current.route) layersRef.current.route.remove();
    const poly = L.polyline(latlngs, { color: '#2563eb', weight: 4, opacity: 0.85, dashArray: '1 8' }).addTo(map);
    layersRef.current.route = poly;

    layersRef.current.markers.forEach((m) => m.remove());
    layersRef.current.markers = stops.map((s) => {
      const m = L.circleMarker([s.lat, s.lng], {
        radius: 6, fillColor: s.name === 'NITER Campus' ? '#c9a227' : '#ffffff',
        color: s.name === 'NITER Campus' ? '#a98520' : '#2563eb', weight: 2.5, fillOpacity: 1,
      }).addTo(map);
      m.bindPopup(`<strong>${s.name}</strong>`);
      return m;
    });
    map.fitBounds(L.latLngBounds(latlngs), { padding: [40, 40] });
  }, [route, stops]);

  // Bus marker movement — smooth, no flicker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !bus?.position) return;
    if (!layersRef.current.busMarker) {
      layersRef.current.busMarker = L.marker([bus.position.lat, bus.position.lng], { icon: busIcon(bus.color, bus.tripStatus === 'Active'), zIndexOffset: 1000 }).addTo(map);
      layersRef.current.busMarker.bindPopup(`<strong>${bus.busName || bus.name}</strong><br/>${bus.currentStop} → ${bus.nextStop || 'Campus'}`);
    } else {
      layersRef.current.busMarker.setIcon(busIcon(bus.color, bus.tripStatus === 'Active'));
      layersRef.current.busMarker.setLatLng([bus.position.lat, bus.position.lng]);
    }
  }, [bus?.position?.lat, bus?.position?.lng, bus?.tripStatus, bus?.color, bus?.busName, bus?.currentStop, bus?.nextStop]);


  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-ink-100">
      <div ref={containerRef} className="absolute inset-0" />
      <style>{`
        .campus-pin { width: 22px; height: 22px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); background: #c9a227; border: 3px solid #fff; box-shadow: 0 2px 8px rgb(0 0 0 / .35); }
        .leaflet-popup-content { font-family: inherit; }
      `}</style>
      {bus?.tripStatus === 'Active' && (
        <div className="absolute left-3 top-3 z-[500] flex items-center gap-2 rounded-full bg-ink-950/85 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400 backdrop-blur">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          {bus.mode === 'live-gps' ? 'LIVE GPS' : 'DEMO SIMULATION'}
        </div>
      )}
    </div>
  );
}

export { Bus };
