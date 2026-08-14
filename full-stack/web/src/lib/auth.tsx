import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, getToken, setToken } from './api';

export type User = {
  id?: string;
  name?: string;
  role: string;
  kind?: string;
  card?: string;
  studentId?: string;
  teacherId?: string;
  department?: string;
  batch?: string;
  eligibleBuses?: string[];
  busId?: string;
  email?: string;
};

type AuthCtx = {
  user: User | null;
  token: string | null;
  login: (u: User, t: string) => void;
  logout: () => void;
  connected: boolean;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  connected: false,
});

function readUser(): User | null {
  try {
    const raw = localStorage.getItem('niter.user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readUser);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Prefetch public transport state so the header badge is instant.
    api.get<{ demoMode: boolean }>('/api/transport/public').then(() => setConnected(true)).catch(() => setConnected(false));
    const iv = setInterval(() => {
      api.get<{ demoMode: boolean }>('/api/transport/public').then(() => setConnected(true)).catch(() => setConnected(false));
    }, 15000);
    return () => clearInterval(iv);
  }, []);

  const login = (u: User, t: string) => {
    setUser(u);
    setTokenState(t);
    setToken(t);
    localStorage.setItem('niter.user', JSON.stringify(u));
  };
  const logout = () => {
    setUser(null);
    setTokenState(null);
    setToken(null);
    localStorage.removeItem('niter.user');
  };

  return <Ctx.Provider value={{ user, token, login, logout, connected }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
