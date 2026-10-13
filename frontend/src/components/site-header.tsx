"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  FileText,
  LayoutDashboard,
  LoaderCircle,
  Route,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/cn";
import { useRoadmapJob } from "@/lib/roadmap-job";
import { useSystemStatus } from "@/lib/system-status";
import { formatDuration, useNow } from "@/lib/use-now";

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/resume-analyzer", label: "Resume", icon: FileText },
  { href: "/job-matcher", label: "Job Match", icon: BriefcaseBusiness },
  { href: "/skill-gap-analysis", label: "Roadmap", icon: Route },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/80 backdrop-blur-md print:hidden">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 rounded-lg">
          <span className="flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-indigo-500 text-white shadow-md shadow-brand/30">
            <Sparkles className="size-4" aria-hidden />
          </span>
          <span className="text-sm font-semibold tracking-wide text-ink">
            CURSUS <span className="text-brand-soft">AI</span>
          </span>
        </Link>

        <nav aria-label="Main" className="hidden flex-1 md:block">
          <NavLinks pathname={pathname} />
        </nav>

        <div className="ml-auto">
          <StatusPill />
        </div>
      </div>

      <nav aria-label="Main" className="border-t border-line px-2 md:hidden">
        <NavLinks pathname={pathname} compact />
      </nav>
    </header>
  );
}

function NavLinks({ pathname, compact = false }: { pathname: string; compact?: boolean }) {
  return (
    <ul className={cn(compact ? "grid grid-cols-4 gap-1 py-1.5" : "flex items-center gap-1")}>
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-lg transition-colors",
                compact
                  ? "flex flex-col items-center gap-1 px-1 py-1.5 text-[11px]"
                  : "inline-flex items-center gap-2 px-3 py-2 text-sm",
                active
                  ? "bg-white/[0.07] font-medium text-ink"
                  : "text-ink-muted hover:bg-white/[0.04] hover:text-ink",
              )}
            >
              <Icon className={cn("size-4", active && "text-brand-soft")} aria-hidden />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function StatusPill() {
  const status = useSystemStatus();
  const job = useRoadmapJob();

  if (job.status === "running" && job.mode === "ai") {
    return (
      <Link
        href="/skill-gap-analysis"
        className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1.5 text-xs font-medium text-violet-100 hover:bg-brand/20"
      >
        <LoaderCircle className="size-3.5 animate-spin" aria-hidden />
        AI roadmap <AiElapsed startedAt={job.startedAt} />
      </Link>
    );
  }

  const { label, dot, title } =
    status.backend === "checking"
      ? { label: "Connecting", dot: "bg-ink-faint", title: "Checking the backend…" }
      : status.backend === "offline"
        ? { label: "Backend offline", dot: "bg-danger", title: "The FastAPI backend is not reachable." }
        : status.ai?.available
          ? { label: "AI ready", dot: "bg-success", title: `Backend online. ${status.ai.model} is ready.` }
          : {
              label: "Online",
              dot: "bg-success",
              title: status.ai ? `Backend online. ${status.ai.message}` : "Backend online.",
            };

  return (
    <span
      title={title}
      className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs text-ink-muted"
    >
      <span className={cn("size-2 rounded-full", dot)} aria-hidden />
      {label}
    </span>
  );
}

function AiElapsed({ startedAt }: { startedAt: number }) {
  const now = useNow();
  return <span className="tabular-nums">{formatDuration(now ? (now - startedAt) / 1000 : 0)}</span>;
}
