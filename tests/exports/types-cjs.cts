import TelemetryDeckVue = require("@peerigon/telemetrydeck-vue");

const plugin: typeof TelemetryDeckVue.default = TelemetryDeckVue.default;
const useTelemetryDeck: typeof TelemetryDeckVue.useTelemetryDeck =
  TelemetryDeckVue.useTelemetryDeck;

const hooks = useTelemetryDeck();

plugin.install(
  {
    provide: (_key: string, _value: unknown) => {},
  },
  {
    appID: "test-app-id",
    clientUser: "test-user",
  },
);

void hooks.safeSignal("example.safeSignal", { source: "cjs-type-smoke-test" });
