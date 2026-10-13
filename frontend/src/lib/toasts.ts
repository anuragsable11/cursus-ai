import { useSyncExternalStore } from "react";

export type Toast = {
  id: number;
  tone: "success" | "error" | "info";
  title: string;
  description?: string;
  href?: string;
  actionLabel?: string;
};

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const timers = new Map<number, ReturnType<typeof setTimeout>>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function pushToast(toast: Omit<Toast, "id">, ttlMs = 9000) {
  const id = nextId++;
  toasts = [...toasts, { ...toast, id }];
  emit();
  timers.set(
    id,
    setTimeout(() => dismissToast(id), ttlMs),
  );
  return id;
}

export function dismissToast(id: number) {
  const timer = timers.get(id);
  if (timer) clearTimeout(timer);
  timers.delete(id);
  if (!toasts.some((toast) => toast.id === id)) return;
  toasts = toasts.filter((toast) => toast.id !== id);
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const EMPTY: Toast[] = [];

export function useToasts(): Toast[] {
  return useSyncExternalStore(subscribe, () => toasts, () => EMPTY);
}
