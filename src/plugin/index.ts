import TelemetryDeck from "@telemetrydeck/sdk";
import type { Plugin } from 'vue';
import type { TelemetryDeckErrorHandler } from '../hooks';

export interface TelemetryDeckPluginOptions {
  appID: string;
  clientUser?: string;
  testMode?: boolean;
  onError?: TelemetryDeckErrorHandler;
}

export const plugin: Plugin = {
  install(app, options?: TelemetryDeckPluginOptions) {
    if (!options?.appID) {
      throw new Error('TelemetryDeck appID is required');
    }

    const td = new TelemetryDeck({
      appID: options.appID,
      clientUser: options.clientUser || 'guest',
      testMode: options.testMode || false
    });

    app.provide('td', td);
    app.provide('tdOnError', options.onError);
  },
};
