"use client";

import { CircleAlert, CircleCheck, Info, X } from "lucide-react";

import { NavLink } from "@/components/nav-link";
import { dismissToast, useToasts } from "@/lib/toasts";

const icons = {
  success: <CircleCheck className="size-4 text-good" aria-hidden />,
  error: <CircleAlert className="size-4 text-critical" aria-hidden />,
  info: <Info className="size-4 text-accent" aria-hidden />,
};

export function ToastHost() {
  const toasts = useToasts();
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="print-hidden pointer-events-none fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="pointer-events-auto flex w-full max-w-sm gap-3 rounded-xl bg-surface p-4 shadow-pop animate-rise"
        >
          <span className="mt-0.5 shrink-0">{icons[toast.tone]}</span>
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-medium text-ink">{toast.title}</p>
            {toast.description && <p className="mt-0.5 leading-5 text-ink-muted">{toast.description}</p>}
            {toast.href && (
              <NavLink
                href={toast.href}
                onClick={() => dismissToast(toast.id)}
                className="mt-2 inline-block text-[13px] font-medium text-ink underline underline-offset-4 hover:text-ink-muted"
              >
                {toast.actionLabel ?? "Open"}
              </NavLink>
            )}
          </div>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
            className="-m-1 h-fit rounded-md p-1 text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ))}
    </div>
  );
}
