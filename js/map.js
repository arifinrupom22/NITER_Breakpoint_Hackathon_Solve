/* ============================================================================
   NITER Smart Campus — map module.
   Loads Leaflet from CDN lazily (free OpenStreetMap tiles). If the CDN is
   unavailable or offline, it falls back to a clean SVG schematic of the route
   so the demo still works from file://.
   ============================================================================ */
(function () {
  'use strict';
  let L = null;

  function loadLeaflet() {
    return new Promise((resolve) => {
      if (L) return resolve(L);
      if (window.L) { L = window.L; return resolve(L); }
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
      const js = document.createElement('script');
      js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      js.onload = () => { L = window.L || null; resolve(L); };
      js.onerror = () => resolve(null);
      document.head.appendChild(js);
      setTimeout(() => resolve(window.L || null), 6000); // safety timeout
    });
  }

  /* ---------- SVG fallback schematic ---------- */
  function renderFallback(container, route, bus) {
    container.classList.add('map-fallback');
    const pts = route.coords;
    const W = 620, H = 400, pad = 46;
    const xs = pts.map((p) => p.lng), ys = pts.map((p) => p.lat);
    const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const sx = (lng) => pad + ((lng - minX) / (maxX - minX || 1)) * (W - pad * 2);
    const sy = (lat) => H - pad - ((lat - minY) / (maxY - minY || 1)) * (H - pad * 2);
    const path = pts.map((p, i) => `${i ? 'L' : 'M'}${sx(p.lng).toFixed(1)},${sy(p.lat).toFixed(1)}`).join(' ');
    let svg = `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:100%">`;
    svg += `<path d="${path}" fill="none" stroke="#3f6399" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 0"/>`;
    pts.forEach((p, i) => {
      svg += `<circle cx="${sx(p.lng)}" cy="${sy(p.lat)}" r="9" fill="#fff" stroke="#2563eb" stroke-width="3"/>`;
      svg += `<text x="${sx(p.lng)}" y="${sy(p.lat) - 14}" text-anchor="middle" font-size="11" font-weight="600" fill="#1d3560">${esc(route.stops[i])}</text>`;
    });
    if (bus) {
      svg += `<circle cx="${sx(bus.position.lng)}" cy="${sy(bus.position.lat)}" r="16" fill="#c9a227" stroke="#fff" stroke-width="3"/>`;
      svg += `<text x="${sx(bus.position.lng)}" y="${sy(bus.position.lat) + 5}" text-anchor="middle" font-size="11" font-weight="800" fill="#0b1a38">BUS</text>`;
    }
    svg += `</svg>`;
    container.innerHTML = `<div style="width:100%;height:100%">${svg}</div><div class="map-fallback-tag">Schematic view — live map CDN unavailable</div>`;
    const tag = document.createElement('div');
    tag.style.cssText = 'position:absolute;bottom:10px;left:12px;font-size:11px;color:#3f6399;background:rgba(255,255,255,.85);padding:4px 10px;border-radius:8px;font-weight:600';
    tag.textContent = 'Offline schematic view — live map tiles unavailable';
    container.appendChild(tag);
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  /* ---------- real Leaflet map ---------- */
  function busIcon(color) {
    const svg = `<svg viewBox="0 0 48 48" width="46" height="46"><path d="M24 3 44 12v10c0 10-8.5 18-20 22C12 40 4 32 4 22V12L24 3z" fill="${color}" stroke="#fff" stroke-width="3"/><text x="24" y="21" text-anchor="middle" font-size="13" font-weight="800" fill="#fff">B</text></svg>`;
    return L.divIcon({ html: svg, className: 'bus-marker', iconSize: [46, 46], iconAnchor: [23, 40] });
  }

  function createMap(container, route, bus, opts) {
    opts = opts || {};
    const map = L.map(container, { zoomControl: true, attributionControl: false }).setView([route.coords[0].lat, route.coords[0].lng], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const poly = L.polyline(route.coords.map((p) => [p.lat, p.lng]), { color: opts.color || '#2563eb', weight: 5, opacity: 0.75, dashArray: '1 10', lineCap: 'round' }).addTo(map);
    poly.bindPopup(`<b>${esc(route.name)}</b><br/>${route.stops.join(' → ')}`);

    const markers = route.stops.map((s, i) => L.circleMarker([route.coords[i].lat, route.coords[i].lng], {
      radius: 7, color: '#fff', weight: 2.5, fillColor: i === route.stops.length - 1 ? '#c9a227' : '#2563eb', fillOpacity: 1,
    }).addTo(map).bindPopup(`<b>${esc(s)}</b>`));

    let busMarker = null, campusMarker = null;
    if (bus) {
      busMarker = L.marker([bus.position.lat, bus.position.lng], { icon: busIcon(opts.color || '#2563eb') }).addTo(map);
      busMarker.bindPopup('<b>' + esc(bus.busName || 'Bus') + '</b>');
    }
    if (opts.showCampus !== false) {
      campusMarker = L.marker([window.NITER_DATA.campus.lat, window.NITER_DATA.campus.lng], {
        icon: L.divIcon({ html: '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M12 2 22 8v12H2V8l10-6z" fill="#c9a227" stroke="#0b1a38" stroke-width="1.5"/></svg>', className: 'bus-marker', iconSize: [30, 30], iconAnchor: [15, 15] }),
      }).addTo(map).bindPopup('<b>NITER Campus</b><br/>Nayarhat, Savar');

      const ll = window.NITER_DATA.campus;
      const inside = route.coords.some((p) => Math.abs(p.lat - ll.lat) < 0.01 && Math.abs(p.lng - ll.lng) < 0.01);
      if (!inside) L.circleMarker([ll.lat, ll.lng], { radius: 8, color: '#fff', weight: 2, fillColor: '#c9a227', fillOpacity: 1 }).addTo(map);
    }

    const bounds = L.latLngBounds(route.coords.map((p) => [p.lat, p.lng]));
    if (opts.showCampus) bounds.extend([window.NITER_DATA.campus.lat, window.NITER_DATA.campus.lng]);
    map.fitBounds(bounds, { padding: [40, 40] });

    return {
      update(b) {
        if (!b || !busMarker) return;
        busMarker.setLatLng([b.position.lat, b.position.lng]);
        const heading = b.position.heading || 0;
        busMarker.getElement().style.transform = `translate3d(${busMarker._point.x - 23}px, ${busMarker._point.y - 40}px, 0) rotate(${heading}deg)`;
      },
      getMap: () => map,
    };
  }

  window.NITER.map = {
    async init(container, route, bus, opts) {
      const Lm = await loadLeaflet();
      if (!Lm) { renderFallback(container, route, bus); return null; }
      return createMap(container, route, bus, opts);
    },
  };
})();
