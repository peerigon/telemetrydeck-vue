import { mount, type VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import App from "../App.vue";

let queuedSignals: unknown[] = [];
const mountedWrappers: VueWrapper[] = [];

const mockTelemetryDeck = {
  clientUser: "guest",
  signal: vi.fn(),
  queue: vi.fn(),
  flush: vi.fn(),
  store: {
    values: vi.fn(() => queuedSignals),
  },
};

const waitForClickHandler = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await nextTick();
};

const mountApp = (provide: Record<string, unknown> = {}) => {
  const wrapper = mount(App, {
    global: {
      provide: {
        td: mockTelemetryDeck,
        ...provide,
      },
    },
  });
  mountedWrappers.push(wrapper);
  return wrapper;
};

describe("App", () => {
  beforeEach(() => {
    mockTelemetryDeck.signal.mockReset();
    mockTelemetryDeck.queue.mockReset();
    mockTelemetryDeck.flush.mockReset();
    mockTelemetryDeck.store.values.mockClear();
    mockTelemetryDeck.clientUser = "guest";
    queuedSignals = [];
    mockTelemetryDeck.queue.mockImplementation(async () => {
      queuedSignals.push({});
    });
    mockTelemetryDeck.flush.mockImplementation(async () => {
      queuedSignals = [];
    });
  });

  afterEach(() => {
    for (const wrapper of mountedWrappers) {
      wrapper.unmount();
    }
    mountedWrappers.length = 0;
  });

  it("renders the demo controls", () => {
    const wrapper = mountApp();

    expect(wrapper.find("h1").text()).toBe("Demo controls");
    expect(mockTelemetryDeck.clientUser).toBe("guest");
    expect(wrapper.find("#queuedTelemetryEvents").text()).toBe("0");
    expect(wrapper.find("#lastTelemetryAction").text()).toBe("");
    expect(wrapper.find("#lastTelemetryResult").text()).toBe("");
    expect(wrapper.find("#lastTelemetryError").text()).toBe("");

    const buttons = [
      ["#btnSignalClick", "Send signal"],
      ["#btnSignalClickWithOptions", "Send signal with options"],
      ["#btnQueueClick", "Queue event"],
      ["#btnQueueClickWithOptions", "Queue event with options"],
      ["#btnFlushClick", "Flush queue"],
      ["#btnSafeSignalClick", "Safe signal"],
      ["#btnSafeQueueClick", "Safe queue"],
      ["#btnSafeFlushClick", "Safe flush"],
      ["#btnSetClient", "Change user"],
      ["#btnClearStatus", "Clear last action"],
    ];

    for (const [selector, label] of buttons) {
      const button = wrapper.find(selector);
      expect(button.exists()).toBe(true);
      expect(button.text()).toBe(label);
    }
  });

  it("calls TelemetryDeck methods from the demo controls", async () => {
    const wrapper = mountApp();

    mockTelemetryDeck.signal.mockResolvedValueOnce({ accepted: true });

    await wrapper.find("#btnSignalClick").trigger("click");
    await waitForClickHandler();
    expect(mockTelemetryDeck.signal).toHaveBeenCalledWith(
      "example_signal_event_name",
      expect.objectContaining({
        custom_data: "other_data",
        source: "signal",
        timestamp: expect.any(String),
      }),
      undefined,
    );
    expect(wrapper.find("#lastTelemetryResult").text()).toBe(
      'signal response: {"accepted":true}',
    );

    await wrapper.find("#btnQueueClick").trigger("click");
    await waitForClickHandler();
    expect(mockTelemetryDeck.queue).toHaveBeenCalledWith(
      "example_queue_event_name",
      expect.objectContaining({
        custom_data: "other_data",
        source: "queue",
        timestamp: expect.any(String),
      }),
      undefined,
    );
    expect(wrapper.find("#lastTelemetryResult").text()).toBe(
      "queue promise resolved without response",
    );
    expect(wrapper.find("#queuedTelemetryEvents").text()).toBe("1");

    await wrapper.find("#btnQueueClickWithOptions").trigger("click");
    await waitForClickHandler();
    expect(mockTelemetryDeck.queue).toHaveBeenCalledWith(
      "example_queue_event_name_with_options",
      expect.objectContaining({
        custom_data: "other_data",
        source: "queue_with_options",
        timestamp: expect.any(String),
      }),
      { testMode: true, clientUser: "other_user", appID: "other_app_id" },
    );

    await wrapper.find("#btnSignalClickWithOptions").trigger("click");
    await waitForClickHandler();
    expect(mockTelemetryDeck.signal).toHaveBeenCalledWith(
      "example_signal_event_name_with_options",
      expect.objectContaining({
        custom_data: "other_data",
        source: "signal_with_options",
        timestamp: expect.any(String),
      }),
      { testMode: true, clientUser: "other_user", appID: "other_app_id" },
    );

    await wrapper.find("#btnFlushClick").trigger("click");
    await waitForClickHandler();
    expect(mockTelemetryDeck.flush).toHaveBeenCalledTimes(1);
    expect(wrapper.find("#lastTelemetryResult").text()).toBe(
      "flush promise resolved without response",
    );
    expect(wrapper.find("#queuedTelemetryEvents").text()).toBe("0");

    await wrapper.find("#btnSafeSignalClick").trigger("click");
    await waitForClickHandler();
    expect(mockTelemetryDeck.signal).toHaveBeenCalledWith(
      "example_safe_signal_event_name",
      expect.objectContaining({
        source: "safe_signal",
      }),
      undefined,
    );
    expect(wrapper.find("#lastTelemetryResult").text()).toBe(
      "safeSignal promise resolved",
    );

    await wrapper.find("#btnSafeQueueClick").trigger("click");
    await waitForClickHandler();
    expect(mockTelemetryDeck.queue).toHaveBeenCalledWith(
      "example_safe_queue_event_name",
      expect.objectContaining({
        source: "safe_queue",
      }),
      undefined,
    );
    expect(wrapper.find("#lastTelemetryResult").text()).toBe(
      "safeQueue promise resolved",
    );
    expect(wrapper.find("#queuedTelemetryEvents").text()).toBe("1");

    await wrapper.find("#btnSafeFlushClick").trigger("click");
    await waitForClickHandler();
    expect(mockTelemetryDeck.flush).toHaveBeenCalledTimes(2);
    expect(wrapper.find("#lastTelemetryResult").text()).toBe(
      "safeFlush promise resolved",
    );
    expect(wrapper.find("#queuedTelemetryEvents").text()).toBe("0");

    let previousClientUser = mockTelemetryDeck.clientUser;
    await wrapper.find("#btnSetClient").trigger("click");
    await waitForClickHandler();
    expect(mockTelemetryDeck.clientUser).not.toBe("");
    expect(mockTelemetryDeck.clientUser).not.toBe(previousClientUser);

    previousClientUser = mockTelemetryDeck.clientUser;
    await wrapper.find("#btnSetClient").trigger("click");
    await waitForClickHandler();
    expect(mockTelemetryDeck.clientUser).not.toBe("");
    expect(mockTelemetryDeck.clientUser).not.toBe(previousClientUser);
    expect(wrapper.find("#lastTelemetryResult").text()).toBe(
      "setClientUser completed",
    );
  });

  it("displays TelemetryDeck errors captured by the demo onError handler", async () => {
    const wrapper = mountApp();

    window.dispatchEvent(
      new CustomEvent("telemetrydeck:error", {
        detail: {
          message: "network failed",
          meta: {
            method: "flush",
          },
        },
      }),
    );
    await nextTick();

    expect(wrapper.find("#lastTelemetryError").text()).toBe(
      "flush failed: network failed",
    );
  });

  it("displays raw method promise rejections", async () => {
    mockTelemetryDeck.flush.mockRejectedValueOnce(new Error("flush failed"));
    const wrapper = mountApp();

    await wrapper.find("#btnFlushClick").trigger("click");
    await waitForClickHandler();

    expect(wrapper.find("#lastTelemetryResult").text()).toBe("flush rejected");
    expect(wrapper.find("#lastTelemetryError").text()).toBe(
      "flush failed: flush failed",
    );

    await wrapper.find("#btnSetClient").trigger("click");
    await waitForClickHandler();

    expect(wrapper.find("#lastTelemetryAction").text()).toBe("Change user");
    expect(wrapper.find("#lastTelemetryResult").text()).toBe(
      "setClientUser completed",
    );
    expect(wrapper.find("#lastTelemetryError").text()).toBe("");

    mockTelemetryDeck.flush.mockRejectedValueOnce(new Error("flush failed"));
    await wrapper.find("#btnFlushClick").trigger("click");
    await waitForClickHandler();

    expect(wrapper.find("#lastTelemetryError").text()).toBe(
      "flush failed: flush failed",
    );

    await wrapper.find("#btnFlushClick").trigger("click");
    await waitForClickHandler();

    expect(wrapper.find("#lastTelemetryResult").text()).toBe(
      "flush promise resolved without response",
    );
    expect(wrapper.find("#lastTelemetryError").text()).toBe("");

    await wrapper.find("#btnClearStatus").trigger("click");
    await nextTick();

    expect(wrapper.find("#lastTelemetryAction").text()).toBe("");
    expect(wrapper.find("#lastTelemetryResult").text()).toBe("");
    expect(wrapper.find("#lastTelemetryError").text()).toBe("");
  });

  it("does not increment the queue count when safe queue captures an error", async () => {
    mockTelemetryDeck.queue.mockRejectedValueOnce(new Error("queue failed"));
    const wrapper = mountApp({
      tdOnError: (error: unknown, meta: unknown) => {
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

    await wrapper.find("#btnSafeQueueClick").trigger("click");
    await waitForClickHandler();

    expect(wrapper.find("#lastTelemetryResult").text()).toBe(
      "safeQueue promise resolved",
    );
    expect(wrapper.find("#lastTelemetryError").text()).toBe(
      "queue: example_safe_queue_event_name failed: queue failed",
    );
    expect(wrapper.find("#queuedTelemetryEvents").text()).toBe("0");
  });

  it("updates safe action status while the promise is pending", async () => {
    let resolveSignal: () => void = () => {};
    mockTelemetryDeck.signal.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveSignal = resolve;
      }),
    );
    const wrapper = mountApp();

    await wrapper.find("#btnSafeSignalClick").trigger("click");
    await nextTick();

    expect(wrapper.find("#lastTelemetryAction").text()).toBe("Safe signal");
    expect(wrapper.find("#lastTelemetryResult").text()).toBe("");

    resolveSignal();
    await waitForClickHandler();

    expect(wrapper.find("#lastTelemetryResult").text()).toBe(
      "safeSignal promise resolved",
    );
  });
});
