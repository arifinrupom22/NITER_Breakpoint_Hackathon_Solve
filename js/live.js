/* ============================================================================
   NITER Smart Campus — LIVE SYNC LAYER
   ----------------------------------------------------------------------------
   Connects the website to the shared NITER Smart Transport backend
   (full-stack/backend, REST + Socket.IO on http://localhost:3001) so that the
   website, the NITER Transport mobile app and the admin dashboard all observe
   the SAME live bus state.

   Behavior:
   - If the backend is reachable, the website receives "transport:state"
     payloads over Socket.IO and renders them (trips started from the mobile
     app appear here instantly, and vice-versa). The local demo simulation is
     paused while the backend is authoritative.
   - If the backend is NOT reachable (e.g. opening index.html directly from
     disk, or static hosting without the Node server), the site silently falls
     back to its own DEMO SIMULATION — nothing breaks.
   ============================================================================ */
(function () {
  'use strict';

  var BACKEND_URL = 'http://localhost:3001';
  var CONNECT_TIMEOUT = 2500; // ms — if the backend isn't up, stay offline

  function connect() {
    var transport = window.NITER.transport;
    var started = false;
    var socket = null;

    function attach() {
      if (!socket || !transport) return;
      socket.on('connect', function () {
        started = true;
        // Backend is authoritative — pause the local sim and pull current state.
        if (transport.setLocalSim) transport.setLocalSim(false);
        socket.emit('transport:subscribe');
      });
      socket.on('transport:state', function (payload) {
        if (transport && transport.applyRemote) transport.applyRemote(payload);
      });
      socket.on('disconnect', function () {
        if (transport && transport.setLocalSim && started) transport.setLocalSim(true);
      });
    }

    try {
      if (typeof window.io === 'undefined') return; // socket.io client not loaded
      socket = window.io(BACKEND_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 3000,
        reconnectionDelayMax: 8000,
        timeout: CONNECT_TIMEOUT,
      });
      attach();
    } catch (e) {
      /* offline fallback — local demo simulation stays active */
    }

    // If the backend never answers, never pause the local demo simulation.
    setTimeout(function () {
      if (!started && socket && transport && transport.setLocalSim) {
        try { socket.close(); } catch (e) { /* noop */ }
      }
    }, CONNECT_TIMEOUT + 500);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', connect);
  else connect();
})();
