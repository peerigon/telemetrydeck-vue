import type TelemetryDeck from "@telemetrydeck/sdk";
import type {
  TelemetryDeckOptions,
  TelemetryDeckPayload,
} from "@telemetrydeck/sdk";
import { inject } from "vue";

export type {
  TelemetryDeckOptions,
  TelemetryDeckPayload,
} from "@telemetrydeck/sdk";

export type TelemetryDeckMethod = "signal" | "queue" | "flush";

export interface TelemetryDeckErrorMeta {
  method: TelemetryDeckMethod;
  type?: string;
  payload?: TelemetryDeckPayload;
  options?: TelemetryDeckOptions;
}

export type TelemetryDeckErrorHandler = (
  error: unknown,
  meta: TelemetryDeckErrorMeta,
) => void | Promise<void>;

export type TelemetryDeckSetClientUser = (clientUser: string) => Promise<void>;

export type TelemetryDeckSignal = (
  type: string,
  payload?: TelemetryDeckPayload,
  options?: TelemetryDeckOptions,
) => Promise<Response | undefined>;

export type TelemetryDeckQueue = (
  type: string,
  payload?: TelemetryDeckPayload,
  options?: TelemetryDeckOptions,
) => Promise<void | undefined>;

export type TelemetryDeckFlush = () => Promise<Response | undefined>;

export type TelemetryDeckGetQueueCount = () => number;

export type TelemetryDeckSafeSignal = (
  type: string,
  payload?: TelemetryDeckPayload,
  options?: TelemetryDeckOptions,
) => Promise<void>;

export type TelemetryDeckSafeQueue = (
  type: string,
  payload?: TelemetryDeckPayload,
  options?: TelemetryDeckOptions,
) => Promise<void>;

export type TelemetryDeckSafeFlush = () => Promise<void>;

export interface TelemetryDeckHooks {
  setClientUser: TelemetryDeckSetClientUser;
  signal: TelemetryDeckSignal;
  queue: TelemetryDeckQueue;
  flush: TelemetryDeckFlush;
  getQueueCount: TelemetryDeckGetQueueCount;
  safeSignal: TelemetryDeckSafeSignal;
  safeQueue: TelemetryDeckSafeQueue;
  safeFlush: TelemetryDeckSafeFlush;
}

export function useTelemetryDeck(): TelemetryDeckHooks {
  const td = inject<TelemetryDeck>("td");
  const onError = inject<TelemetryDeckErrorHandler | undefined>(
    "tdOnError",
    undefined,
  );

  const handleError = async (error: unknown, meta: TelemetryDeckErrorMeta) => {
    try {
      await onError?.(error, meta);
    } catch {
      // Swallow handler errors to keep safe* methods from rejecting.
    }
  };

  const setClientUser = async (clientUser: string) => {
    if (td) {
      td.clientUser = clientUser;
    }
  };

  const signal = async (
    type: string,
    payload?: TelemetryDeckPayload,
    options?: TelemetryDeckOptions,
  ) => {
    return td?.signal(type, payload, options);
  };

  const queue = async (
    type: string,
    payload?: TelemetryDeckPayload,
    options?: TelemetryDeckOptions,
  ) => {
    return td?.queue(type, payload, options);
  };

  const flush = async () => {
    return td?.flush();
  };

  const getQueueCount = () => {
    return td?.store?.values().length ?? 0;
  };

  const safeSignal = async (
    type: string,
    payload?: TelemetryDeckPayload,
    options?: TelemetryDeckOptions,
  ) => {
    try {
      await signal(type, payload, options);
    } catch (error) {
      await handleError(error, { method: "signal", type, payload, options });
    }
  };

  const safeQueue = async (
    type: string,
    payload?: TelemetryDeckPayload,
    options?: TelemetryDeckOptions,
  ) => {
    try {
      await queue(type, payload, options);
    } catch (error) {
      await handleError(error, { method: "queue", type, payload, options });
    }
  };

  const safeFlush = async () => {
    try {
      await flush();
    } catch (error) {
      await handleError(error, { method: "flush" });
    }
  };

  return {
    setClientUser,
    signal,
    queue,
    flush,
    getQueueCount,
    safeSignal,
    safeQueue,
    safeFlush,
  };
}
