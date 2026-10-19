"use client";

import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { NavLink } from "@/components/nav-link";
import { ThemeToggle } from "@/components/theme-toggle";
import { initials, signOut, useCurrentUser } from "@/lib/auth";
import { openPalette, useIsMac } from "@/lib/command-palette";

const itemClasses =
  "flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-left text-sm text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-60 [&_svg]:size-4";

/** Avatar button with account details, theme and sign out. */
export function UserMenu() {
  const user = useCurrentUser();
  const router = useRouter();
  const isMac = useIsMac();
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
        aria-label={`Account: ${user.name}`}
        className="flex size-8 items-center justify-center rounded-full bg-surface-3 text-xs font-semibold text-ink shadow-[0_0_0_1px_var(--line)] transition-shadow hover:shadow-[0_0_0_1px_var(--line-hover)]"
      >
        {initials(user)}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 z-40 mt-2 w-64 rounded-xl bg-surface p-1.5 shadow-pop animate-pop"
        >
          <div className="px-2.5 pt-1.5 pb-2">
            <p className="truncate text-sm font-medium text-ink">{user.name}</p>
            <p className="truncate text-[13px] text-ink-muted">{user.email}</p>
          </div>
          <div className="my-1 h-px bg-line" />
          <NavLink href="/" role="menuitem" onClick={() => setOpen(false)} className={itemClasses}>
            <LayoutDashboard aria-hidden />
            Overview
          </NavLink>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              openPalette();
            }}
            className={itemClasses}
          >
            <Search aria-hidden />
            <span className="flex-1">Command menu</span>
            <kbd className="font-mono text-[11px] text-ink-faint">{isMac ? "⌘K" : "Ctrl K"}</kbd>
          </button>
          <div className="flex h-10 items-center justify-between gap-3 px-2.5 text-sm text-ink-muted">
            Theme
            <ThemeToggle />
          </div>
          <div className="my-1 h-px bg-line" />
          <button type="button" role="menuitem" onClick={leave} disabled={leaving} className={itemClasses}>
            <LogOut aria-hidden />
            {leaving ? "Signing out…" : "Sign out"}
          </button>
        </div>
      )}
    </div>
  );
}
