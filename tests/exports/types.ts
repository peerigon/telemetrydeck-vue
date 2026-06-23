import {
  useTelemetryDeck,
  type TelemetryDeckHooks,
  type TelemetryDeckOptions,
  type TelemetryDeckPayload,
  type TelemetryDeckSafeSignal,
  type TelemetryDeckSignal,
} from "@peerigon/telemetrydeck-vue";

const hooks: TelemetryDeckHooks = useTelemetryDeck();
const signal: TelemetryDeckSignal = hooks.signal;
const safeSignal: TelemetryDeckSafeSignal = hooks.safeSignal;

const payload: TelemetryDeckPayload = { source: "type-smoke-test" };
const options: TelemetryDeckOptions = {
  appID: "test-app-id",
  clientUser: "test-user",
};

void signal("example.signal", payload, options);
void safeSignal("example.safeSignal", payload, options);
