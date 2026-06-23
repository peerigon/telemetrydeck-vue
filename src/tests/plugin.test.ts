import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { useTelemetryDeck, type TelemetryDeckHooks } from "../hooks";
import { plugin } from "../plugin";

const { mockTelemetryDeck, telemetryDeckCtor } = vi.hoisted(() => {
  const instance = {
    clientUser: "test-user",
    signal: vi.fn(),
    queue: vi.fn(),
    flush: vi.fn(),
  };

  return {
    mockTelemetryDeck: instance,
    telemetryDeckCtor: vi.fn(function TelemetryDeckMock() {
      return instance;
    }),
  };
});

vi.mock("@telemetrydeck/sdk", () => ({
  default: telemetryDeckCtor,
}));

const HookConsumer = defineComponent({
  name: "HookConsumer",
  setup() {
    return useTelemetryDeck();
  },
  template: "<div />",
});

describe("plugin onError integration", () => {
  beforeEach(() => {
    telemetryDeckCtor.mockClear();
    mockTelemetryDeck.signal.mockReset();
    mockTelemetryDeck.queue.mockReset();
    mockTelemetryDeck.flush.mockReset();
  });

  it("routes safe method errors to plugin onError handler", async () => {
    const signalError = new Error("signal failed");
    const queueError = new Error("queue failed");
    const flushError = new Error("flush failed");
    const onError = vi.fn();

    mockTelemetryDeck.signal.mockRejectedValueOnce(signalError);
    mockTelemetryDeck.queue.mockRejectedValueOnce(queueError);
    mockTelemetryDeck.flush.mockRejectedValueOnce(flushError);

    const wrapper = mount(HookConsumer, {
      global: {
        plugins: [[plugin, { appID: "test-app-id", onError }]],
      },
    });
    const vm = wrapper.vm as unknown as TelemetryDeckHooks;

    await expect(vm.safeSignal("ui.opened")).resolves.toBeUndefined();
    await expect(vm.safeQueue("button.clicked")).resolves.toBeUndefined();
    await expect(vm.safeFlush()).resolves.toBeUndefined();

    expect(telemetryDeckCtor).toHaveBeenCalledWith({
      appID: "test-app-id",
      clientUser: "guest",
      testMode: false,
    });
    expect(onError).toHaveBeenCalledTimes(3);
    expect(onError).toHaveBeenNthCalledWith(1, signalError, {
      method: "signal",
      type: "ui.opened",
      payload: undefined,
      options: undefined,
    });
    expect(onError).toHaveBeenNthCalledWith(2, queueError, {
      method: "queue",
      type: "button.clicked",
      payload: undefined,
      options: undefined,
    });
    expect(onError).toHaveBeenNthCalledWith(3, flushError, {
      method: "flush",
    });
  });
});
