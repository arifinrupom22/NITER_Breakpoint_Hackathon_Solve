// ============================================================================
// Realtime hub — Socket.IO. Every client (website, mobile app, admin) receives
// the same bus state from the single transport engine. Live coordinates are
// filtered per connection role: students/teachers only see their eligible
// buses, drivers see their own bus, admin sees all four.
// ============================================================================

import { Server } from 'socket.io';
import { engine } from '../transport/engine.js';
import { getDb } from '../db.js';
import { verifyToken } from '../auth.js';

let io = null;

export function initRealtime(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    transports: ['websocket', 'polling'],
  });

  engine.setOnChange((event, payload) => {
    if (!io) return;
    if (event === 'transport:state') {
      broadcastState();
      return;
    }
    // Role-targeted event fan-out
    for (const socket of io.sockets.sockets.values()) {
      const u = socket.data?.user;
      if (!u) continue;
      if (event === 'trip:start' || event === 'trip:end') {
        if (u.role === 'admin' || (u.busId && u.busId === payload.busId) || (u.eligible && u.eligible.includes(payload.busId))) {
          socket.emit(event, payload);
        }
      } else if (event === 'emergency:new' && u.role === 'admin') {
        socket.emit(event, payload);
      } else if (event === 'anomaly:new' && u.role === 'admin') {
        socket.emit(event, payload);
      } else if (event === 'notification:new') {
        socket.emit('notification:new', payload);
      }
    }
  });

  io.on('connection', (socket) => {
    socket.emit('hello', { demoMode: getDb().meta.demoMode, ts: Date.now() });
    socket.on('auth', (payload) => {
      if (!payload || !payload.token) return;
      try {
        socket.data.user = verifyToken(payload.token);
        socket.emit('auth:ok', { role: socket.data.user.role });
        socket.emit('transport:state', stateForUser(socket.data.user));
      } catch {
        socket.emit('auth:error', { error: 'Invalid token' });
      }
    });
  });

  return io;
}

function stateForUser(user) {
  if (!user) return { public: engine.getPublicState(), live: {} };
  if (user.role === 'admin') {
    return { public: engine.getPublicState(), live: engine.getLiveState(getDb().buses.map((b) => b.id)) };
  }
  if (user.role === 'driver') {
    return { public: engine.getPublicState(), live: engine.getLiveState([user.busId]) };
  }
  if (user.role === 'transport-student' || user.role === 'transport-teacher') {
    const busIds = (user.eligible || []).filter((id) => {
      const bus = getDb().buses.find((b) => b.id === id);
      return bus && ((user.role === 'transport-student' && bus.type === 'Student') || (user.role === 'transport-teacher' && bus.type === 'Teacher'));
    });
    return { public: engine.getPublicState(), live: engine.getLiveState(busIds) };
  }
  return { public: engine.getPublicState(), live: {} };
}

function broadcastState() {
  for (const socket of io.sockets.sockets.values()) {
    const u = socket.data?.user;
    if (!u) {
      socket.emit('transport:state', { public: engine.getPublicState(), live: {} });
      continue;
    }
    socket.emit('transport:state', stateForUser(u));
  }
}

export function pushToAll(event, payload) {
  if (io) io.emit(event, payload);
}
