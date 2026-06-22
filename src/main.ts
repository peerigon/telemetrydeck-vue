import { createApp } from "vue";
import "./style.css";
import TelemetryDeckPlugin from "../index.ts";
import App from "./App.vue";

const app = createApp(App);
app.use(TelemetryDeckPlugin, {
  appID: import.meta.env.VITE_TELEMETRYDECK_APP_ID || "test-app-id",
  testMode: true,
  onError: (error, meta) => {
    window.dispatchEvent(
      new CustomEvent("telemetrydeck:error", {
        detail: {
          message: error instanceof Error ? error.message : String(error),
          meta,
        },
      }),
    );
  },
});

app.mount("#app");
