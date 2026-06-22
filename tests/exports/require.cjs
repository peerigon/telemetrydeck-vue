const assert = require('node:assert/strict');
const TelemetryDeckVue = require('@peerigon/telemetrydeck-vue');

assert.equal(typeof TelemetryDeckVue.default, 'object');
assert.equal(typeof TelemetryDeckVue.default.install, 'function');
assert.equal(typeof TelemetryDeckVue.useTelemetryDeck, 'function');
