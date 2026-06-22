import assert from 'node:assert/strict';
import TelemetryDeckPlugin, { useTelemetryDeck } from '@peerigon/telemetrydeck-vue';

assert.equal(typeof TelemetryDeckPlugin, 'object');
assert.equal(typeof TelemetryDeckPlugin.install, 'function');
assert.equal(typeof useTelemetryDeck, 'function');
