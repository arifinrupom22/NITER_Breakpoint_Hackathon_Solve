import { useEffect, useState } from 'react';
import { connectSocket, onTransportState } from './socket';
import type { TransportState, LiveBus } from './api';

export type BusLive = LiveBus & { position: { lat: number; lng: number; heading: number } };

export function useTransportState(token: string | null): { state: TransportState | null; connected: boolean; liveBus: (id: string) => BusLive | undefined } {
  const [state, setState] = useState<TransportState | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = connectSocket(token);
    const off = onTransportState((s) => {
      setState(s);
      setConnected(true);
    });
    const onOk = () => setConnected(true);
    socket.on('auth:ok', onOk);
    return () => {
      off();
      socket.off('auth:ok', onOk);
    };
  }, [token]);

  const liveBus = (id: string) => (state?.live?.[id] as BusLive | undefined);

  return { state, connected, liveBus };
}
