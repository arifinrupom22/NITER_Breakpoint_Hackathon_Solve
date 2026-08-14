// Thin typed API client. Tokens are injected from localStorage by the auth store.

const TOKEN_KEY = 'niter.token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(path, { ...options, headers });
  } catch {
    throw new ApiError(0, 'Connection temporarily unavailable. Please check your connection.');
  }
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

export type BusPublic = {
  id: string; name: string; type: string; capacity: number; color: string;
  status: string; departure: string; routeName: string; routeId: string;
  driverName: string; tripStatus: string; passengers: number; occupancyPct: number;
  occupancyLabel: string; occupancyTone: string; currentStop: string; nextStop: string;
  etaToCampus: number | null; trafficStatus: string; lastUpdate: string;
};

export type PublicState = {
  demoMode: boolean;
  simTime: number;
  buses: BusPublic[];
  routes: { id: string; name: string; type: string; departure: string; configurable: boolean; stops: string[] }[];
};

export type LiveBus = BusPublic & {
  busId: string;
  busName: string;
  busType: string;
  position: { lat: number; lng: number; heading: number };
  progressKm: number; speedKmh: number; tripId: string | null;
  distToNext: number; distToCampus: number; etaToNext: number | null;
  traffic: { status: string; factor: number };
  delayMinutes: number; mode: string; trafficNote: string;
  driverId: string; currentStop: string; nextStop: string;
};

export type TransportState = { public: PublicState; live: Record<string, LiveBus> };
