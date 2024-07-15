import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App.vue';
import { LIB_VERSION } from '../version';

const mockTelemetryDeck = {
  clientUser: '',
  signal: vi.fn(),
  queue: vi.fn(),
};

// Mock the TelemetryDeck SDK
vi.mock('@telemetrydeck/sdk', () => ({
  default: () => mockTelemetryDeck,
}));

describe('App', () => {
  beforeEach(() => {
    // Reset mock functions before each test
    mockTelemetryDeck.signal.mockClear();
    mockTelemetryDeck.queue.mockClear();
    mockTelemetryDeck.clientUser = 'test-user';
  });

  it('renders the App and test buttons exist', async () => {
    const wrapper = mount(App);

    // Check if the component is rendered
    expect(wrapper.find('a').attributes('href')).toBe('https://vitejs.dev');
    expect(wrapper.find('.logo').exists()).toBe(true);

    const signalClickButton = wrapper.find('#btnSignalClick');
    const queueClickButton = wrapper.find('#btnQueueClick');
    const signalClickButtonWithOptions = wrapper.find('#btnSignalClickWithOptions');
    const queueClickButtonWithOptions = wrapper.find('#btnQueueClickWithOptions');
    const setClientUserButton = wrapper.find('#btnSetClient');
    expect(signalClickButton.exists()).toBe(true);
    expect(queueClickButton.exists()).toBe(true);
    expect(signalClickButtonWithOptions.exists()).toBe(true);
    expect(queueClickButtonWithOptions.exists()).toBe(true);
    expect(setClientUserButton.exists()).toBe(true);
    expect(signalClickButton.text()).toBe('Log a click with signal');
    expect(queueClickButton.text()).toBe('Log a click with queue');
    expect(signalClickButtonWithOptions.text()).toBe('Log a click with signal with Options');
    expect(queueClickButtonWithOptions.text()).toBe('Log a click with queue with Options');
    expect(setClientUserButton.text()).toBe('Change user');
  });

  it('useTelementryDeck hook calls Telementry Deck correctly', async () => {
    const wrapper = mount(App, {
      global: {
        provide: {
          td: mockTelemetryDeck,
        },
      },
    });

    // Test button click event for buttonSignalClick
    await wrapper.find('#btnSignalClick').trigger('click');
    expect(mockTelemetryDeck.signal).toHaveBeenCalledTimes(1);
    expect(mockTelemetryDeck.signal).toHaveBeenCalledWith('example_signal_event_name', { tdVueVersion: LIB_VERSION, custom_data: 'other_data', timestamp: expect.any(String) }, undefined);

    // Test button click event for buttonQueueClick
    await wrapper.find('#btnQueueClick').trigger('click');
    expect(mockTelemetryDeck.queue).toHaveBeenCalledTimes(1);
    expect(mockTelemetryDeck.queue).toHaveBeenCalledWith('example_queue_event_name', { tdVueVersion: LIB_VERSION, custom_data: 'other_data', timestamp: expect.any(String) }, undefined);

    // Test button click event for buttonQueueClickWithOptions
    await wrapper.find('#btnQueueClickWithOptions').trigger('click');
    expect(mockTelemetryDeck.queue).toHaveBeenCalledTimes(2);
    expect(mockTelemetryDeck.queue).toHaveBeenCalledWith('example_queue_event_name', { tdVueVersion: LIB_VERSION, custom_data: 'other_data', timestamp: expect.any(String) }, { testMode: true, clientUser: 'other_user', appID: "other_app_id" });

    // Test button click event for buttonQueueClickWithOptions
    await wrapper.find('#btnSignalClickWithOptions').trigger('click');
    expect(mockTelemetryDeck.signal).toHaveBeenCalledTimes(2);
    expect(mockTelemetryDeck.signal).toHaveBeenCalledWith('example_signal_event_name', { tdVueVersion: LIB_VERSION, custom_data: 'other_data', timestamp: expect.any(String) }, { testMode: true, clientUser: 'other_user', appID: "other_app_id" });


    // Test button click event for changeClientUserClick
    let prevClientUser = mockTelemetryDeck.clientUser;
    await wrapper.find('#btnSetClient').trigger('click');
    expect(mockTelemetryDeck.clientUser).not.toBe('');
    expect(mockTelemetryDeck.clientUser).not.toBe(prevClientUser); // check client user has changed

    // update user again
    prevClientUser = mockTelemetryDeck.clientUser;
    await wrapper.find('#btnSetClient').trigger('click');
    expect(mockTelemetryDeck.clientUser).not.toBe('');
    expect(mockTelemetryDeck.clientUser).not.toBe(prevClientUser); // check client user has changed
  });
});
