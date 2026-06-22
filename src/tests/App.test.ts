import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../App.vue';

const mockTelemetryDeck = {
  clientUser: '',
  signal: vi.fn(),
  queue: vi.fn(),
  flush: vi.fn(),
};

const waitForClickHandler = async () => {
  await Promise.resolve();
  await nextTick();
};

describe('App', () => {
  beforeEach(() => {
    mockTelemetryDeck.signal.mockReset();
    mockTelemetryDeck.queue.mockReset();
    mockTelemetryDeck.flush.mockReset();
    mockTelemetryDeck.clientUser = 'test-user';
  });

  it('renders the demo controls', () => {
    const wrapper = mount(App, {
      global: {
        provide: {
          td: mockTelemetryDeck,
        },
      },
    });

    expect(wrapper.find('h1').text()).toBe('Demo controls');
    expect(wrapper.find('#lastTelemetryAction').text()).toBe('');
    expect(wrapper.find('#lastTelemetryResult').text()).toBe('');
    expect(wrapper.find('#lastTelemetryError').text()).toBe('');

    const buttons = [
      ['#btnSignalClick', 'Send signal'],
      ['#btnSignalClickWithOptions', 'Send signal with options'],
      ['#btnQueueClick', 'Queue event'],
      ['#btnQueueClickWithOptions', 'Queue event with options'],
      ['#btnFlushClick', 'Flush queue'],
      ['#btnSafeSignalClick', 'Safe signal'],
      ['#btnSafeQueueClick', 'Safe queue'],
      ['#btnSafeFlushClick', 'Safe flush'],
      ['#btnSetClient', 'Change user'],
      ['#btnClearStatus', 'Clear last action'],
    ];

    for (const [selector, label] of buttons) {
      const button = wrapper.find(selector);
      expect(button.exists()).toBe(true);
      expect(button.text()).toBe(label);
    }
  });

  it('calls TelemetryDeck methods from the demo controls', async () => {
    const wrapper = mount(App, {
      global: {
        provide: {
          td: mockTelemetryDeck,
        },
      },
    });

    mockTelemetryDeck.signal.mockResolvedValueOnce({ accepted: true });

    await wrapper.find('#btnSignalClick').trigger('click');
    await waitForClickHandler();
    expect(mockTelemetryDeck.signal).toHaveBeenCalledWith(
      'example_signal_event_name',
      expect.objectContaining({
        custom_data: 'other_data',
        source: 'signal',
        timestamp: expect.any(String),
      }),
      undefined,
    );
    expect(wrapper.find('#lastTelemetryResult').text()).toBe('signal response: {"accepted":true}');

    await wrapper.find('#btnQueueClick').trigger('click');
    await waitForClickHandler();
    expect(mockTelemetryDeck.queue).toHaveBeenCalledWith(
      'example_queue_event_name',
      expect.objectContaining({
        custom_data: 'other_data',
        source: 'queue',
        timestamp: expect.any(String),
      }),
      undefined,
    );
    expect(wrapper.find('#lastTelemetryResult').text()).toBe('queue promise resolved without response');

    await wrapper.find('#btnQueueClickWithOptions').trigger('click');
    await waitForClickHandler();
    expect(mockTelemetryDeck.queue).toHaveBeenCalledWith(
      'example_queue_event_name_with_options',
      expect.objectContaining({
        custom_data: 'other_data',
        source: 'queue_with_options',
        timestamp: expect.any(String),
      }),
      { testMode: true, clientUser: 'other_user', appID: 'other_app_id' },
    );

    await wrapper.find('#btnSignalClickWithOptions').trigger('click');
    await waitForClickHandler();
    expect(mockTelemetryDeck.signal).toHaveBeenCalledWith(
      'example_signal_event_name_with_options',
      expect.objectContaining({
        custom_data: 'other_data',
        source: 'signal_with_options',
        timestamp: expect.any(String),
      }),
      { testMode: true, clientUser: 'other_user', appID: 'other_app_id' },
    );

    await wrapper.find('#btnFlushClick').trigger('click');
    await waitForClickHandler();
    expect(mockTelemetryDeck.flush).toHaveBeenCalledTimes(1);
    expect(wrapper.find('#lastTelemetryResult').text()).toBe('flush promise resolved without response');

    await wrapper.find('#btnSafeSignalClick').trigger('click');
    await waitForClickHandler();
    expect(mockTelemetryDeck.signal).toHaveBeenCalledWith(
      'example_safe_signal_event_name',
      expect.objectContaining({
        source: 'safe_signal',
      }),
      undefined,
    );
    expect(wrapper.find('#lastTelemetryResult').text()).toBe('safeSignal promise resolved');

    await wrapper.find('#btnSafeQueueClick').trigger('click');
    await waitForClickHandler();
    expect(mockTelemetryDeck.queue).toHaveBeenCalledWith(
      'example_safe_queue_event_name',
      expect.objectContaining({
        source: 'safe_queue',
      }),
      undefined,
    );

    await wrapper.find('#btnSafeFlushClick').trigger('click');
    await waitForClickHandler();
    expect(mockTelemetryDeck.flush).toHaveBeenCalledTimes(2);
    expect(wrapper.find('#lastTelemetryResult').text()).toBe('safeFlush promise resolved');

    let previousClientUser = mockTelemetryDeck.clientUser;
    await wrapper.find('#btnSetClient').trigger('click');
    await waitForClickHandler();
    expect(mockTelemetryDeck.clientUser).not.toBe('');
    expect(mockTelemetryDeck.clientUser).not.toBe(previousClientUser);

    previousClientUser = mockTelemetryDeck.clientUser;
    await wrapper.find('#btnSetClient').trigger('click');
    await waitForClickHandler();
    expect(mockTelemetryDeck.clientUser).not.toBe('');
    expect(mockTelemetryDeck.clientUser).not.toBe(previousClientUser);
    expect(wrapper.find('#lastTelemetryResult').text()).toBe('setClientUser completed');
  });

  it('displays TelemetryDeck errors captured by the demo onError handler', async () => {
    const wrapper = mount(App, {
      global: {
        provide: {
          td: mockTelemetryDeck,
        },
      },
    });

    window.dispatchEvent(new CustomEvent('telemetrydeck:error', {
      detail: {
        message: 'network failed',
        meta: {
          method: 'flush',
        },
      },
    }));
    await nextTick();

    expect(wrapper.find('#lastTelemetryError').text()).toBe('flush failed: network failed');
  });

  it('displays raw method promise rejections', async () => {
    mockTelemetryDeck.flush.mockRejectedValueOnce(new Error('flush failed'));
    const wrapper = mount(App, {
      global: {
        provide: {
          td: mockTelemetryDeck,
        },
      },
    });

    await wrapper.find('#btnFlushClick').trigger('click');
    await waitForClickHandler();

    expect(wrapper.find('#lastTelemetryResult').text()).toBe('flush rejected');
    expect(wrapper.find('#lastTelemetryError').text()).toBe('flush failed: flush failed');

    await wrapper.find('#btnClearStatus').trigger('click');
    await nextTick();

    expect(wrapper.find('#lastTelemetryAction').text()).toBe('');
    expect(wrapper.find('#lastTelemetryResult').text()).toBe('');
    expect(wrapper.find('#lastTelemetryError').text()).toBe('');
  });
});
