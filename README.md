# telemetrydeck-vue

A library for using TelemetryDeck in your React app.

[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

[![Test and 🚀 Release](https://github.com/peerigon/telemetrydeck-vue/actions/workflows/test_and_release.yml/badge.svg)](https://github.com/peerigon/telemetrydeck-vue/actions/workflows/test_and_release.yml)

## Installation

```shell
npm i @peerigon/telemetrydeck-vue --save
```

## Setup

Set up the plugin in your application setup:

```javascript
import TelemetryDeckPlugin from '@peerigon/telemetrydeck-vue';

const app = createApp(App);
app.use(TelemetryDeckPlugin, {
  appID: "{your telemetrydeck appID}",
  testMode: true, // optional - defaults to false
  clientUser: 'Guest' // optional - defaults to 'Guest'
});

app.mount('#app');
```

## Basic Usage

```vue
<script setup lang="ts">
import { useTelemetryDeck } from "@peerigon/telemetrydeck-vue";
const { signal, queue, setClientUser } = useTelemetryDeck();

const changeClientUserClick = () => {
  setClientUser('user' + Math.floor(Math.random() * 1000));
};

const buttonSignalClick = () => {
  signal('example_signal_event_name', {
    custom_data: 'other_data', // any custom data as required
  });
};

const buttonQueueClick = () => {
  queue('example_queue_event_name', {
    custom_data: 'other_data', // any custom data as required
  });
};

const buttonSignalClickWithOptions = () => {
  signal('example_signal_event_name_with_options', {
    custom_data: 'other_data', // any custom data as required
  }, {
    testMode: true,
    clientUser: 'other_user',
    appID: 'other_app_id',
  }); // telemetryDeck options (optional)
};

const buttonQueueClickWithOptions = () => {
  queue('example_queue_event_name_with_options', {
    custom_data: 'other_data', // any custom data as required
  }, {
    testMode: true,
    clientUser: 'other_user',
    appID: 'other_app_id',
  }); // telemetryDeck options (optional)
};
</script>

<template>
  <div>
    <div>
      <button id="btnSignalClick" @click="buttonSignalClick">Log a click with signal</button>
      <button id="btnQueueClick" @click="buttonQueueClick">Log a click with queue</button>
      <button id="btnSetClient" @click="changeClientUserClick">Change user</button>
    </div>
    <div>
      <button id="btnSignalClickWithOptions" @click="buttonSignalClickWithOptions">Log a click with signal with Options</button>
      <button id="btnQueueClickWithOptions" @click="buttonQueueClickWithOptions">Log a click with queue with Options</button>
    </div>
  </div>
</template>
```

## Contributions

### Local Development

To run the plugin locally for development:

1. Install Node.js v20
2. Run `npm i`
3. create .env file from .env.example and add your test telemetryDeck appID. Create an account here: [telemetrydeck.com](https://telemetrydeck.com/)
3. Run `npm run dev`
4. Navigate to [http://localhost:5173/](http://localhost:5173/) for the test page

### Tests

Run the tests with:

```shell
npm run test
```
