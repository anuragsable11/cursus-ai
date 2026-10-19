import { useSyncExternalStore } from "react";

let open = false;
let returnFocus: HTMLElement | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function openPalette() {
  if (open) return;
  returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  open = true;
  emit();
}

export function closePalette() {
  if (!open) return;
  open = false;
  emit();
  const target = returnFocus;
  returnFocus = null;
  requestAnimationFrame(() => target?.focus());
}

export function togglePalette() {
  if (open) closePalette();
  else openPalette();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function usePaletteOpen(): boolean {
  return useSyncExternalStore(subscribe, () => open, () => false);
}

const noopSubscribe = () => () => {};

/** True on Apple platforms, where the shortcut is ⌘K rather than Ctrl K. */
export function useIsMac(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent),
    () => false,
  );
}
