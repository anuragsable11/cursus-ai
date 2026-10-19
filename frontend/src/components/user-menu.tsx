"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { initials, signOut, useCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/cn";

/** Avatar with the account's name and a sign-out action. */
export function UserMenu({ compact = false }: { compact?: boolean }) {
  const user = useCurrentUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!user) return null;

  async function leave() {
    setLeaving(true);
    await signOut();
    router.replace("/login");
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={compact ? `Account: ${user.name}` : undefined}
        className={cn(
          "flex items-center gap-3 rounded-xl text-left transition-colors hover:bg-surface-2",
          compact ? "size-9 justify-center" : "w-full p-2",
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-semibold text-on-brand shadow-[0_0_0_3px_var(--brand-tint)]">
          {initials(user)}
        </span>
        {!compact && (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-ink">{user.name}</span>
              <span className="block truncate text-xs text-ink-faint">{user.email}</span>
            </span>
            <ChevronDown className={cn("size-4 shrink-0 text-ink-faint transition-transform", open && "rotate-180")} aria-hidden />
          </>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            "absolute z-40 min-w-56 rounded-xl bg-surface p-1.5 shadow-pop animate-pop",
            compact ? "top-full right-0 mt-2" : "bottom-full left-0 mb-2 w-full",
          )}
        >
          <div className="px-2.5 py-2">
            <p className="truncate text-sm font-medium text-ink">{user.name}</p>
            <p className="truncate text-xs text-ink-faint">{user.email}</p>
          </div>
          <div className="my-1 h-px bg-line" />
          <button
            type="button"
            role="menuitem"
            onClick={leave}
            disabled={leaving}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-ink hover:bg-surface-2 disabled:opacity-60"
          >
            <LogOut className="size-4 text-ink-muted" aria-hidden />
            {leaving ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}
