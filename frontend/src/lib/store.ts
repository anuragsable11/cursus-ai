import { useSyncExternalStore } from "react";

type Listener = () => void;

// Used when localStorage is unavailable (private mode, blocked storage).
const memoryFallback = new Map<string, string>();

function readRaw(key: string): string | null {
  // A value only lives in memory when writing to localStorage failed,
  // so it is newer than whatever localStorage still holds.
  const fallback = memoryFallback.get(key);
  if (fallback !== undefined) return fallback;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeRaw(key: string, raw: string | null) {
  try {
    if (raw === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, raw);
    memoryFallback.delete(key);
  } catch {
    if (raw === null) memoryFallback.delete(key);
    else memoryFallback.set(key, raw);
  }
}

export type PersistedStore<T> = {
  get: () => T | null;
  set: (value: T | null) => void;
  subscribe: (listener: Listener) => () => void;
};

/**
 * A localStorage-backed value that React components can subscribe to.
 * `parse` validates stored JSON, so corrupted or outdated data is
 * treated as missing instead of crashing a page.
 */
export function createPersistedStore<T>(
  key: string,
  parse: (value: unknown) => T | null,
): PersistedStore<T> {
  const listeners = new Set<Listener>();
  let cachedRaw: string | null | undefined;
  let cachedValue: T | null = null;

  function get(): T | null {
    const raw = readRaw(key);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedValue = null;
      if (raw !== null) {
        try {
          cachedValue = parse(JSON.parse(raw));
        } catch {
          cachedValue = null;
        }
      }
    }
    return cachedValue;
  }

  function set(value: T | null) {
    writeRaw(key, value === null ? null : JSON.stringify(value));
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: Listener) {
    listeners.add(listener);
    // Keep other tabs in sync.
    const onStorage = (event: StorageEvent) => {
      if (event.key === key || event.key === null) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  return { get, set, subscribe };
}

const NOT_READY: unique symbol = Symbol("not-ready");
const getNotReady = (): typeof NOT_READY => NOT_READY;

export type StoredValue<T> = {
  value: T | null;
  // False during server rendering and hydration, before storage is read.
  ready: boolean;
};

export function useStore<T>(store: PersistedStore<T>): StoredValue<T> {
  const snapshot = useSyncExternalStore<T | null | typeof NOT_READY>(
    store.subscribe,
    store.get,
    getNotReady,
  );
  return snapshot === NOT_READY
    ? { value: null, ready: false }
    : { value: snapshot, ready: true };
}
