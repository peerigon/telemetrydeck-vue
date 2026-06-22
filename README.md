# telemetrydeck-vue

A library for using TelemetryDeck in your Vue app.

[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

[![Test and 🚀 Release](https://github.com/peerigon/telemetrydeck-vue/actions/workflows/test_and_release.yml/badge.svg)](https://github.com/peerigon/telemetrydeck-vue/actions/workflows/test_and_release.yml)

## Installation

```shell
npm i @peerigon/telemetrydeck-vue --save
```

## Setup

Set up the plugin in your application setup:

```javascript
import TelemetryDeckPlugin from "@peerigon/telemetrydeck-vue";
import { createApp } from "vue";

const app = createApp(App);
app.use(TelemetryDeckPlugin, {
  appID: "{your telemetrydeck appID}",
  testMode: true, // optional - defaults to false
  clientUser: "guest", // optional - defaults to 'guest'
  onError: (error, meta) => {
    console.debug("TelemetryDeck failed", meta, error);
  }, // optional
});

app.mount("#app");
```

## Basic Usage

```vue
<script setup lang="ts">
import { useTelemetryDeck } from "@peerigon/telemetrydeck-vue";

const { signal, queue, safeSignal, safeQueue, setClientUser } =
  useTelemetryDeck();

const changeClientUserClick = () => {
  setClientUser("user" + Math.floor(Math.random() * 1000));
};

const buttonSignalClick = () => {
  safeSignal("example_signal_event_name", {
    custom_data: "other_data", // any custom data as required
  });
};

const buttonQueueClick = () => {
  safeQueue("example_queue_event_name", {
    custom_data: "other_data", // any custom data as required
  });
};

const buttonSignalClickWithOptions = async () => {
  await signal(
    "example_signal_event_name_with_options",
    {
      custom_data: "other_data", // any custom data as required
    },
    {
      testMode: true,
      clientUser: "other_user",
      appID: "other_app_id",
    },
  ); // telemetryDeck options (optional)
};

const buttonQueueClickWithOptions = async () => {
  await queue(
    "example_queue_event_name_with_options",
    {
      custom_data: "other_data", // any custom data as required
    },
    {
      testMode: true,
      clientUser: "other_user",
      appID: "other_app_id",
    },
  ); // telemetryDeck options (optional)
};
</script>

<template>
  <div>
    <div>
      <button id="btnSignalClick" @click="buttonSignalClick">
        Log a click with signal
      </button>
      <button id="btnQueueClick" @click="buttonQueueClick">
        Log a click with queue
      </button>
      <button id="btnSetClient" @click="changeClientUserClick">
        Change user
      </button>
    </div>
    <div>
      <button
        id="btnSignalClickWithOptions"
        @click="buttonSignalClickWithOptions"
      >
        Log a click with signal with Options
      </button>
      <button
        id="btnQueueClickWithOptions"
        @click="buttonQueueClickWithOptions"
      >
        Log a click with queue with Options
      </button>
    </div>
  </div>
</template>
```

## Flushing Queued Events

```ts
import { useTelemetryDeck } from "@peerigon/telemetrydeck-vue";

const { queue, flush, safeFlush, getQueueCount } = useTelemetryDeck();

await queue("example_queue_event_name");
console.log(getQueueCount());
await flush();
await safeFlush();
```

`getQueueCount()` returns the number of signals currently stored in the SDK queue. It does not indicate whether queued signals have been sent successfully.

`signal()`, `queue()`, and `flush()` return promises and may reject (for example on network failures).  
Use `safeSignal()`, `safeQueue()`, and `safeFlush()` for fire-and-forget analytics calls to avoid unhandled promise rejections.

## Contributions

### Local Development

To run the plugin locally for development:

1. Install the Node.js version from `.nvmrc`
2. Run `npm i`
3. Create a `.env` file from `.env.example` and add your test TelemetryDeck appID. Create an account here: [telemetrydeck.com](https://telemetrydeck.com/)
4. Run `npm run dev`
5. Navigate to [http://localhost:5173/](http://localhost:5173/) for the test page

### Tests

Run the tests with:

```shell
npm run test
```

### Formatting

Format the project with:

```shell
npm run format
```

Check formatting without writing changes with:

```shell
npm run format:check
```
