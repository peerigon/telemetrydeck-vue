import { inject } from 'vue';
import type TelemetryDeck from '@telemetrydeck/sdk';
import type { TelemetryDeckOptions, TelemetryDeckPayload } from '@telemetrydeck/sdk';

export type TelemetryDeckMethod = 'signal' | 'queue' | 'flush';

export interface TelemetryDeckErrorMeta {
  method: TelemetryDeckMethod;
  type?: string;
  payload?: TelemetryDeckPayload;
  options?: TelemetryDeckOptions;
}

export type TelemetryDeckErrorHandler = (error: unknown, meta: TelemetryDeckErrorMeta) => void;

export function useTelemetryDeck() {
  const td = inject<TelemetryDeck>('td');
  const onError = inject<TelemetryDeckErrorHandler | undefined>('tdOnError', undefined);

  const setClientUser = async (clientUser: string) => {
    if (td) {
      td.clientUser = clientUser;
    }
  };

  const signal = async (type: string, payload?: TelemetryDeckPayload, options?: TelemetryDeckOptions) => {
    return td?.signal(type, payload, options);
  };

  const queue = async (type: string, payload?: TelemetryDeckPayload, options?: TelemetryDeckOptions) => {
    return td?.queue(type, payload, options);
  };

  const flush = async () => {
    return td?.flush();
  };

  const safeSignal = async (type: string, payload?: TelemetryDeckPayload, options?: TelemetryDeckOptions) => {
    try {
      await td?.signal(type, payload, options);
    } catch (error) {
      onError?.(error, { method: 'signal', type, payload, options });
    }
  };

  const safeQueue = async (type: string, payload?: TelemetryDeckPayload, options?: TelemetryDeckOptions) => {
    try {
      await td?.queue(type, payload, options);
    } catch (error) {
      onError?.(error, { method: 'queue', type, payload, options });
    }
  };

  const flushSafe = async () => {
    try {
      await td?.flush();
    } catch (error) {
      onError?.(error, { method: 'flush' });
    }
  };

  return {
    setClientUser,
    signal,
    queue,
    flush,
    safeSignal,
    safeQueue,
    flushSafe,
  };
}
