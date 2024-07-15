import TelemetryDeck from "@telemetrydeck/sdk";
import type { Plugin } from 'vue';

export const plugin: Plugin = {
  install(app, options) {
    if (!options.appID) {
      throw new Error('TelemetryDeck appID is required');
    }
    const td = options.appID

    ? new TelemetryDeck({
        appID: options.appID,
        clientUser: options.clientUser || 'guest',
        testMode: options.testMode || false
      })
    : undefined;
    app.provide('td', td);
  },
};