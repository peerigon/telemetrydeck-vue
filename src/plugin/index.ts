import TelemetryDeck from "@telemetrydeck/sdk";
import type { TelemetryDeckErrorHandler } from '../hooks';

interface TelemetryDeckApp {
  provide: (key: string, value: unknown) => void;
}

export interface TelemetryDeckPluginOptions {
  appID: string;
  clientUser?: string;
  testMode?: boolean;
  onError?: TelemetryDeckErrorHandler;
}

// Keep this as a structural plugin type to avoid `Plugin` alias mismatches across Vue type versions.
export const plugin = {
  install(app: TelemetryDeckApp, ...options: [TelemetryDeckPluginOptions?]) {
    const [pluginOptions] = options;

    if (!pluginOptions?.appID) {
      throw new Error('TelemetryDeck appID is required');
    }

    const td = new TelemetryDeck({
      appID: pluginOptions.appID,
      clientUser: pluginOptions.clientUser || 'guest',
      testMode: pluginOptions.testMode || false
    });

    app.provide('td', td);
    app.provide('tdOnError', pluginOptions.onError);
  },
};
