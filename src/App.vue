<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

import { useTelemetryDeck } from "../index.ts";
import type { TelemetryDeckErrorMeta, TelemetryDeckMethod } from "../index.ts";

interface TelemetryDeckErrorEventDetail {
  message: string;
  meta: TelemetryDeckErrorMeta;
}

const { signal, queue, flush, safeSignal, safeQueue, safeFlush, setClientUser } =
  useTelemetryDeck();

const currentClientUser = ref("guest");
const queuedEvents = ref(0);
const lastAction = ref("");
const lastResult = ref("");
const lastError = ref("");

const payload = (source: string) => ({
  source,
  custom_data: "other_data",
  timestamp: new Date().toISOString(),
});

const options = {
  testMode: true,
  clientUser: "other_user",
  appID: "other_app_id",
};

const changeClientUserClick = () => {
  currentClientUser.value = `user${Math.floor(Math.random() * 1000)}`;
  setClientUser(currentClientUser.value);
  lastAction.value = `Client user changed to ${currentClientUser.value}`;
  lastResult.value = "setClientUser completed";
};

const clearStatusClick = () => {
  lastAction.value = "";
  lastResult.value = "";
  lastError.value = "";
};

const buttonSignalClick = async () => {
  await runRawAction("signal", "Signal sent immediately", () =>
    signal("example_signal_event_name", payload("signal")),
  );
};

const buttonSignalClickWithOptions = async () => {
  await runRawAction("signal", "Signal sent with per-call options", () =>
    signal(
      "example_signal_event_name_with_options",
      payload("signal_with_options"),
      options,
    ),
  );
};

const buttonQueueClick = async () => {
  await runRawAction(
    "queue",
    "Event added to the queue",
    () => queue("example_queue_event_name", payload("queue")),
    () => {
      queuedEvents.value += 1;
    },
  );
};

const buttonQueueClickWithOptions = async () => {
  await runRawAction(
    "queue",
    "Event with options added to the queue",
    () => queue(
      "example_queue_event_name_with_options",
      payload("queue_with_options"),
      options,
    ),
    () => {
      queuedEvents.value += 1;
    },
  );
};

const buttonFlushClick = async () => {
  await runRawAction(
    "flush",
    "Queued events flushed",
    flush,
    () => {
      queuedEvents.value = 0;
    },
  );
};

const buttonSafeSignalClick = async () => {
  await runSafeAction("safeSignal", "Safe signal completed", () =>
    safeSignal("example_safe_signal_event_name", payload("safe_signal")),
  );
};

const buttonSafeQueueClick = async () => {
  await runSafeAction(
    "safeQueue",
    "Safe queue completed",
    () => safeQueue("example_safe_queue_event_name", payload("safe_queue")),
  );
};

const buttonSafeFlushClick = async () => {
  await runSafeAction(
    "safeFlush",
    "Safe flush completed",
    safeFlush,
  );
};

const runRawAction = async (
  method: TelemetryDeckMethod,
  actionLabel: string,
  action: () => Promise<unknown>,
  onResolved?: () => void,
) => {
  lastAction.value = actionLabel;

  try {
    const response = await action();
    onResolved?.();
    lastResult.value = formatResolvedResult(method, response);
  } catch (error) {
    lastResult.value = `${method} rejected`;
    lastError.value = `${method} failed: ${getErrorMessage(error)}`;
  }
};

const runSafeAction = async (
  method: string,
  actionLabel: string,
  action: () => Promise<void>,
  onResolved?: () => void,
) => {
  await action();
  onResolved?.();
  lastAction.value = actionLabel;
  lastResult.value = `${method} promise resolved`;
};

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : String(error);
};

const formatResolvedResult = (method: TelemetryDeckMethod, response: unknown) => {
  if (response === undefined) {
    return `${method} promise resolved without response`;
  }

  if (typeof response === "string") {
    return `${method} response: ${response}`;
  }

  try {
    return `${method} response: ${JSON.stringify(response)}`;
  } catch {
    return `${method} response could not be serialized`;
  }
};

const formatErrorMeta = (meta: TelemetryDeckErrorMeta) => {
  return meta.type ? `${meta.method}: ${meta.type}` : meta.method;
};

const handleTelemetryDeckError = (event: Event) => {
  const { message, meta } = (event as CustomEvent<TelemetryDeckErrorEventDetail>).detail;
  lastError.value = `${formatErrorMeta(meta)} failed: ${message}`;
};

onMounted(() => {
  window.addEventListener("telemetrydeck:error", handleTelemetryDeckError);
});

onUnmounted(() => {
  window.removeEventListener("telemetrydeck:error", handleTelemetryDeckError);
});
</script>

<template>
  <main class="demo-shell">
    <header class="demo-header">
      <div>
        <p class="eyebrow">TelemetryDeck Vue</p>
        <h1>Demo controls</h1>
      </div>
      <dl class="status-list" aria-label="TelemetryDeck demo state">
        <div>
          <dt>User</dt>
          <dd>{{ currentClientUser }}</dd>
        </div>
        <div>
          <dt>Queued</dt>
          <dd id="queuedTelemetryEvents">{{ queuedEvents }}</dd>
        </div>
        <div class="status-wide">
          <dt>Last action</dt>
          <dd id="lastTelemetryAction">{{ lastAction }}</dd>
        </div>
        <div class="status-wide">
          <dt>Last result</dt>
          <dd id="lastTelemetryResult">{{ lastResult }}</dd>
        </div>
        <div class="status-wide status-error">
          <dt>Last error</dt>
          <dd id="lastTelemetryError">{{ lastError }}</dd>
        </div>
      </dl>
      <button id="btnClearStatus" class="clear-action" type="button" @click="clearStatusClick">
        Clear last action
      </button>
    </header>

    <section class="demo-section" aria-labelledby="send-now-title">
      <div>
        <p class="section-kicker">Send now</p>
        <h2 id="send-now-title">Signal</h2>
      </div>
      <div class="button-grid">
        <button id="btnSignalClick" class="primary-action" type="button" @click="buttonSignalClick">
          Send signal
        </button>
        <button
          id="btnSignalClickWithOptions"
          class="secondary-action"
          type="button"
          @click="buttonSignalClickWithOptions"
        >
          Send signal with options
        </button>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="queue-title">
      <div>
        <p class="section-kicker">Queue for later</p>
        <h2 id="queue-title">Queue and flush</h2>
      </div>
      <div class="button-grid">
        <button id="btnQueueClick" class="queue-action" type="button" @click="buttonQueueClick">
          Queue event
        </button>
        <button
          id="btnQueueClickWithOptions"
          class="queue-action"
          type="button"
          @click="buttonQueueClickWithOptions"
        >
          Queue event with options
        </button>
        <button id="btnFlushClick" class="flush-action" type="button" @click="buttonFlushClick">
          Flush queue
        </button>
      </div>
    </section>

    <section class="demo-section" aria-labelledby="safe-title">
      <div>
        <p class="section-kicker">Fire and forget</p>
        <h2 id="safe-title">Safe wrappers</h2>
      </div>
      <div class="button-grid">
        <button id="btnSafeSignalClick" class="safe-action" type="button" @click="buttonSafeSignalClick">
          Safe signal
        </button>
        <button id="btnSafeQueueClick" class="safe-action" type="button" @click="buttonSafeQueueClick">
          Safe queue
        </button>
        <button id="btnSafeFlushClick" class="safe-action" type="button" @click="buttonSafeFlushClick">
          Safe flush
        </button>
      </div>
    </section>

    <section class="demo-section user-section" aria-labelledby="user-title">
      <div>
        <p class="section-kicker">User state</p>
        <h2 id="user-title">Client user</h2>
      </div>
      <button id="btnSetClient" class="user-action" type="button" @click="changeClientUserClick">
        Change user
      </button>
    </section>
  </main>
</template>

<style scoped>
.demo-shell {
  width: min(100%, 1040px);
  margin: 0 auto;
  padding: 48px 24px;
}

.demo-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 460px);
  gap: 32px;
  align-items: end;
  padding-bottom: 32px;
  border-bottom: 1px solid #d8dee8;
}

.eyebrow,
.section-kicker {
  margin: 0 0 8px;
  color: #4a6a58;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1,
h2 {
  margin: 0;
  color: #162033;
}

h1 {
  font-size: 2.75rem;
  line-height: 1;
}

h2 {
  font-size: 1.35rem;
}

.status-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
}

.status-list div {
  min-width: 0;
  padding: 14px 16px;
  border: 1px solid #d8dee8;
  border-radius: 8px;
  background: #ffffff;
}

.status-wide {
  grid-column: 1 / -1;
}

.status-error dd {
  color: #8a1f14;
}

.clear-action {
  grid-column: 2;
  justify-self: end;
  width: auto;
  min-height: 40px;
  padding: 8px 14px;
  background: #ffffff;
  color: #3e4f68;
  border-color: #c4ccd8;
  font-weight: 800;
}

dt {
  color: #637087;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
}

dd {
  margin: 4px 0 0;
  overflow-wrap: anywhere;
  color: #162033;
  font-weight: 700;
}

.demo-section {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 24px;
  align-items: start;
  padding: 28px 0;
  border-bottom: 1px solid #d8dee8;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

button {
  min-height: 56px;
  width: 100%;
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 12px 16px;
  color: #ffffff;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    border-color 160ms ease;
}

button:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgb(22 32 51 / 14%);
}

button:focus-visible {
  outline: 3px solid #f2c94c;
  outline-offset: 3px;
}

.primary-action {
  background: #2157d6;
}

.secondary-action {
  background: #2b6b78;
}

.queue-action {
  background: #74652f;
}

.flush-action {
  background: #c23a2b;
}

.safe-action {
  background: #2e7448;
}

.user-action {
  max-width: 220px;
  background: #3e4f68;
}

@media (max-width: 760px) {
  .demo-shell {
    padding: 32px 16px;
  }

  .demo-header,
  .demo-section {
    grid-template-columns: 1fr;
  }

  .clear-action {
    grid-column: auto;
    justify-self: stretch;
    width: 100%;
  }

  h1 {
    font-size: 2.2rem;
  }

  .user-action {
    max-width: none;
  }
}
</style>
