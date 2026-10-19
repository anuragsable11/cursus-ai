import { useSyncExternalStore } from "react";

import { api, ApiError } from "./api";
import type { AiStatus } from "./types";

export type SystemStatus = {
  backend: "checking" | "online" | "offline";
  // null while unknown, for example when the backend is offline.
  ai: AiStatus | null;
};

const INITIAL: SystemStatus = { backend: "checking", ai: null };
const POLL_MS = 30_000;

let status: SystemStatus = INITIAL;
let inflight: Promise<void> | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function setStatus(next: SystemStatus) {
  status = next;
  listeners.forEach((listener) => listener());
}

export function refreshSystemStatus(): Promise<void> {
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      await api.health();
    } catch {
      setStatus({ backend: "offline", ai: null });
      return;
    }

    let ai: AiStatus | null;
    try {
      ai = await api.aiStatus();
    } catch (error) {
      // Ollama answers slowly while it is generating, so a timeout keeps the
      // last known state. A 404 means an older backend without the endpoint.
      ai = error instanceof ApiError && error.status === 404 ? null : status.ai;
    }
    setStatus({ backend: "online", ai });
  })().finally(() => {
    inflight = null;
  });

  return inflight;
}

function onFocus() {
  void refreshSystemStatus();
}

// Poll only while at least one component is watching.
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    void refreshSystemStatus();
    timer = setInterval(() => void refreshSystemStatus(), POLL_MS);
    window.addEventListener("focus", onFocus);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      if (timer) clearInterval(timer);
      timer = null;
      window.removeEventListener("focus", onFocus);
    }
  };
}

export function useSystemStatus(): SystemStatus {
  return useSyncExternalStore(subscribe, () => status, () => INITIAL);
}
