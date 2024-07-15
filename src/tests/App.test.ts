import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App.vue';

const mockTelemetryDeck = {
  clientUser: '',
  signal: vi.fn(),
  queue: vi.fn(),
};

// Mock the TelemetryDeck SDK
vi.mock('@telemetrydeck/sdk', () => ({
  default: () => mockTelemetryDeck,
}));

describe('MyComponent', () => {
  beforeEach(() => {
    // Reset mock functions before each test
    mockTelemetryDeck.signal.mockClear();
    mockTelemetryDeck.queue.mockClear();
    mockTelemetryDeck.clientUser = '';
  });

  it('renders the component and buttons work', async () => {
    const wrapper = mount(App, {
      global: {
        provide: {
          td: mockTelemetryDeck,
        },
      },
    });

    // Check if the component is rendered
    expect(wrapper.find('a').attributes('href')).toBe('https://vitejs.dev');
    expect(wrapper.find('.logo').exists()).toBe(true);

    // Test button click event for buttonSignalClick
    await wrapper.find('button').trigger('click');
    expect(mockTelemetryDeck.signal).toHaveBeenCalledTimes(1);

    // Test button click event for buttonQueueClick
    await wrapper.find('button:nth-of-type(2)').trigger('click');
    expect(mockTelemetryDeck.signal).toHaveBeenCalledTimes(2);

    // Test button click event for changeClientUserClick
    await wrapper.find('button:nth-of-type(3)').trigger('click');
    expect(mockTelemetryDeck.clientUser).not.toBe('');
  });
});
