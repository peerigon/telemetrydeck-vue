import TelemetryDeck from "@telemetrydeck/sdk";
import type { Plugin } from 'vue';

const plugin: Plugin = {
  install(app, options) {
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

export default plugin;
