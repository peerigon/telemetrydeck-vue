import { inject } from 'vue';
import type TelemetryDeck from '@telemetrydeck/sdk';
import type { TelemetryDeckOptions, TelemetryDeckPayload } from '@telemetrydeck/sdk';

export function useTelemetryDeck() {
  const td = inject<TelemetryDeck>('td');

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

  return {
    setClientUser,
    signal,
    queue,
  };
}