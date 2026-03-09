import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';
import { useTelemetryDeck } from '../hooks';

const mockTelemetryDeck = {
  clientUser: 'test-user',
  signal: vi.fn(),
  queue: vi.fn(),
};

const HookConsumer = defineComponent({
  name: 'HookConsumer',
  setup() {
    return useTelemetryDeck();
  },
  template: '<div />',
});

describe('useTelemetryDeck safe methods', () => {
  beforeEach(() => {
    mockTelemetryDeck.signal.mockReset();
    mockTelemetryDeck.queue.mockReset();
  });

  it('swallows rejected promises in safe methods and calls onError', async () => {
    const signalError = new Error('signal failed');
    const queueError = new Error('queue failed');
    const signalPayload = { feature: 'home' };
    const queuePayload = { action: 'tap' };
    const queueOptions = { appID: 'other-app-id', clientUser: 'other-user' };
    const onError = vi.fn();

    mockTelemetryDeck.signal.mockRejectedValueOnce(signalError);
    mockTelemetryDeck.queue.mockRejectedValueOnce(queueError);

    const wrapper = mount(HookConsumer, {
      global: {
        provide: {
          td: mockTelemetryDeck,
          tdOnError: onError,
        },
      },
    });
    const vm = wrapper.vm as unknown as ReturnType<typeof useTelemetryDeck>;

    await expect(vm.safeSignal('ui.opened', signalPayload)).resolves.toBeUndefined();
    await expect(vm.safeQueue('button.clicked', queuePayload, queueOptions)).resolves.toBeUndefined();
    expect(onError).toHaveBeenCalledTimes(2);
    expect(onError).toHaveBeenNthCalledWith(1, signalError, {
      method: 'signal',
      type: 'ui.opened',
      payload: signalPayload,
      options: undefined,
    });
    expect(onError).toHaveBeenNthCalledWith(2, queueError, {
      method: 'queue',
      type: 'button.clicked',
      payload: queuePayload,
      options: queueOptions,
    });
  });

  it('still resolves safe methods when onError throws', async () => {
    const signalError = new Error('signal failed');
    const queueError = new Error('queue failed');
    const onError = vi.fn(() => {
      throw new Error('onError failed');
    });

    mockTelemetryDeck.signal.mockRejectedValueOnce(signalError);
    mockTelemetryDeck.queue.mockRejectedValueOnce(queueError);

    const wrapper = mount(HookConsumer, {
      global: {
        provide: {
          td: mockTelemetryDeck,
          tdOnError: onError,
        },
      },
    });
    const vm = wrapper.vm as unknown as ReturnType<typeof useTelemetryDeck>;

    await expect(vm.safeSignal('ui.opened')).resolves.toBeUndefined();
    await expect(vm.safeQueue('button.clicked')).resolves.toBeUndefined();
    expect(onError).toHaveBeenCalledTimes(2);
    expect(onError).toHaveBeenNthCalledWith(1, signalError, {
      method: 'signal',
      type: 'ui.opened',
      payload: undefined,
      options: undefined,
    });
    expect(onError).toHaveBeenNthCalledWith(2, queueError, {
      method: 'queue',
      type: 'button.clicked',
      payload: undefined,
      options: undefined,
    });
  });

  it('keeps raw methods rejecting so callers can handle errors explicitly', async () => {
    const signalError = new Error('raw signal failed');
    const queueError = new Error('raw queue failed');

    mockTelemetryDeck.signal.mockRejectedValueOnce(signalError);
    mockTelemetryDeck.queue.mockRejectedValueOnce(queueError);

    const wrapper = mount(HookConsumer, {
      global: {
        provide: {
          td: mockTelemetryDeck,
        },
      },
    });
    const vm = wrapper.vm as unknown as ReturnType<typeof useTelemetryDeck>;

    await expect(vm.signal('ui.opened')).rejects.toBe(signalError);
    await expect(vm.queue('button.clicked')).rejects.toBe(queueError);
  });
});
