import { useSyncExternalStore } from "react";

type Listener = () => void;

// Used when localStorage is unavailable (private mode, blocked storage).
const memoryFallback = new Map<string, string>();

// Saved values are namespaced per signed-in account ("u42:cursus.profile.v1"),
// so two people sharing a browser never see each other's progress.
let scope: string | null = null;
const registeredKeys = new Set<string>();
const scopeListeners = new Set<Listener>();

function scoped(key: string): string {
  return scope ? `${scope}:${key}` : key;
}

export function setStorageScope(next: string | null) {
  if (next === scope) return;
  scope = next;
  scopeListeners.forEach((listener) => listener());
}

/**
 * Moves progress saved before accounts existed into the signed-in account.
 * The first account to sign in on this browser claims it; later accounts
 * start fresh. Returns true when anything was moved.
 */
export function claimUnscopedData(): boolean {
  if (!scope) return false;
  let moved = false;
  for (const key of registeredKeys) {
    const legacy = readRaw(key);
    if (legacy === null) continue;
    if (readRaw(scoped(key)) === null) {
      writeRaw(scoped(key), legacy);
      moved = true;
    }
    writeRaw(key, null);
  }
  if (moved) scopeListeners.forEach((listener) => listener());
  return moved;
}

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

  registeredKeys.add(key);
  scopeListeners.add(() => listeners.forEach((listener) => listener()));

  function get(): T | null {
    const raw = readRaw(scoped(key));
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
    writeRaw(scoped(key), value === null ? null : JSON.stringify(value));
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: Listener) {
    listeners.add(listener);
    // Keep other tabs in sync.
    const onStorage = (event: StorageEvent) => {
      if (event.key === scoped(key) || event.key === null) listener();
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
