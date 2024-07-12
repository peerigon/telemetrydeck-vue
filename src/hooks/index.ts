import { inject } from 'vue';
import type TelemetryDeck from '@telemetrydeck/sdk';
import type { TelemetryDeckOptions, TelemetryDeckPayload } from '@telemetrydeck/sdk';
import { LIB_VERSION } from '../version';

type EnhancedPayload = TelemetryDeckPayload & { tdVueVersion: string };

function enhancePayload(payload: TelemetryDeckPayload = {}): EnhancedPayload {
  return { ...payload, tdVueVersion: LIB_VERSION };
}

export function useTelemetryDeck() {
  const td = inject<TelemetryDeck>('td');

  const signal = async (type: string, payload?: TelemetryDeckPayload, options?: TelemetryDeckOptions) => {
    return td?.signal(type, enhancePayload(payload), options);
  };

  const queue = async (type: string, payload?: TelemetryDeckPayload, options?: TelemetryDeckOptions) => {
    return td?.queue(type, enhancePayload(payload), options);
  };

  return {
    signal,
    queue,
  };
}