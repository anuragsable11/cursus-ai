"use client";

import { usePathname } from "next/navigation";
import { LoaderCircle, Search } from "lucide-react";
import type { ReactNode } from "react";

import { BackendBanner } from "@/components/backend-banner";
import { BrandLockup, BrandMark } from "@/components/brand-mark";
import { CommandPalette } from "@/components/command-palette";
import { NavLink } from "@/components/nav-link";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { fieldClasses } from "@/components/ui/field";
import { containerClasses } from "@/components/ui/page-header";
import { cn } from "@/lib/cn";
import { openPalette, useIsMac } from "@/lib/command-palette";
import { useRoadmapJob } from "@/lib/roadmap-job";
import { useSystemStatus } from "@/lib/system-status";

type Tab = { href: string; label: string; running?: boolean };

function useTabs(): Tab[] {
  const job = useRoadmapJob();
  return [
    { href: "/", label: "Overview" },
    { href: "/resume-analyzer", label: "Resume" },
    { href: "/job-matcher", label: "Job Match" },
    { href: "/skill-gap-analysis", label: "Roadmap", running: job.status === "running" },
  ];
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const tabs = useTabs();

  return (
    <div className="flex min-h-full flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-brand px-3 py-2 text-sm text-on-brand focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      <header className="print-hidden bg-surface">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <NavLink href="/" className="rounded-md">
            <BrandLockup />
          </NavLink>
          <div className="flex items-center gap-2 sm:gap-3">
            <SearchButton />
            <UserMenu />
          </div>
        </div>
      </header>

      <TabBar pathname={pathname} tabs={tabs} />
      <BackendBanner />

      <main id="main" className="flex-1">
        {children}
      </main>

      <Footer />
      <CommandPalette />
    </div>
  );
}

function SearchButton() {
  const isMac = useIsMac();
  return (
    <>
      <button
        type="button"
        onClick={openPalette}
        className={cn(fieldClasses, "hidden h-8 w-56 items-center gap-2 px-2.5 text-ink-faint sm:flex")}
      >
        <Search className="size-3.5" aria-hidden />
        <span className="flex-1 text-left text-[13px]">Find…</span>
        <kbd className="rounded border border-line bg-canvas px-1.5 font-mono text-[11px] leading-[18px] text-ink-muted">
          {isMac ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>
      <button
        type="button"
        onClick={openPalette}
        aria-label="Open command menu"
        className="flex size-8 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink sm:hidden"
      >
        <Search className="size-4" aria-hidden />
      </button>
    </>
  );
}

/** Underlined tabs that stick to the top once the header scrolls away. */
function TabBar({ pathname, tabs }: { pathname: string; tabs: Tab[] }) {
  return (
    <nav aria-label="Main" className="print-hidden sticky top-0 z-30 border-b border-line bg-surface">
      <div className="flex h-12 items-stretch sm:px-2">
        <NavLink href="/" tabIndex={-1} aria-hidden className="nav-mark flex shrink-0 items-center">
          <BrandMark className="size-6" />
        </NavLink>
        <ul className="flex items-stretch gap-0.5 overflow-x-auto px-1 [scrollbar-width:none]">
          {tabs.map((tab) => {
            const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
            return (
              <li key={tab.href} className="relative flex shrink-0 items-center">
                <NavLink
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-8 items-center gap-1.5 rounded-md px-3 text-sm transition-colors",
                    active ? "text-ink" : "text-ink-muted hover:bg-surface-2 hover:text-ink",
                  )}
                >
                  {tab.label}
                  {tab.running && (
                    <>
                      <LoaderCircle className="size-3.5 animate-spin text-ink-faint" aria-hidden />
                      <span className="sr-only">(generating)</span>
                    </>
                  )}
                </NavLink>
                {active && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-ink" aria-hidden />}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="print-hidden border-t border-line bg-surface">
      <div className={cn(containerClasses, "flex flex-wrap items-center justify-between gap-4 py-4")}>
        <SystemStatus />
        <ThemeToggle />
      </div>
    </footer>
  );
}

function SystemStatus() {
  const status = useSystemStatus();
  const { dot, text } =
    status.backend === "checking"
      ? { dot: "bg-ink-faint", text: "Connecting to backend…" }
      : status.backend === "offline"
        ? { dot: "bg-critical", text: "Backend offline" }
        : status.ai === null
          ? { dot: "bg-good", text: "Backend online" }
          : status.ai.available
            ? { dot: "bg-good", text: `All systems normal · AI ready with ${status.ai.model}` }
            : { dot: "bg-warning", text: "Backend online · AI-enhanced roadmaps need Ollama" };

  return (
    <p className="flex min-w-0 items-center gap-2 text-[13px] text-ink-muted" title={status.ai?.message}>
      <span className={cn("size-2 shrink-0 rounded-full", dot)} aria-hidden />
      <span className="truncate">{text}</span>
    </p>
  );
}
