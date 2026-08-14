import { io, Socket } from 'socket.io-client';
import type { TransportState } from './api';

let socket: Socket | null = null;
const listeners = new Set<(state: TransportState) => void>();

export function connectSocket(token: string | null) {
  if (socket) {
    socket.auth = { token };
    if (token) socket.emit('auth', { token });
    return socket;
  }
  socket = io({
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    auth: { token },
  });
  socket.on('connect', () => {
    if (token) socket?.emit('auth', { token });
  });
  socket.on('transport:state', (state: TransportState) => {
    listeners.forEach((fn) => fn(state));
  });
  socket.on('connect_error', () => {
    /* non-fatal; polling fallback handles it */
  });
  return socket;
}

export function getSocket() {
  return socket;
}

export function onTransportState(fn: (state: TransportState) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function onEvent<T = unknown>(event: string, fn: (payload: T) => void) {
  if (!socket) return () => {};
  const handler = (payload: T) => fn(payload);
  socket.on(event, handler);
  return () => {
    socket?.off(event, handler);
  };
}
