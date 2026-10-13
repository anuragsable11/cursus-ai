"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  Check,
  FileText,
  LayoutDashboard,
  LoaderCircle,
  Route,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { BackendBanner } from "@/components/backend-banner";
import { ThemeCycleButton, ThemeToggle } from "@/components/theme-toggle";
import { useProfile, useSavedMatch, useSavedRoadmap } from "@/lib/app-state";
import { cn } from "@/lib/cn";
import { useRoadmapJob } from "@/lib/roadmap-job";
import { useSystemStatus } from "@/lib/system-status";
import { formatDuration, useNow } from "@/lib/use-now";

type StepState = "todo" | "done" | "running";

type Step = {
  href: string;
  label: string;
  icon: LucideIcon;
  state: StepState;
  detail: string;
};

function useJourney(): Step[] {
  const { value: profile, ready } = useProfile();
  const { value: match } = useSavedMatch();
  const { value: roadmap } = useSavedRoadmap();
  const job = useRoadmapJob();

  const skills = profile?.skills.length ?? 0;
  const running = job.status === "running";

  return [
    {
      href: "/resume-analyzer",
      label: "Resume",
      icon: FileText,
      state: skills ? "done" : "todo",
      detail: !ready ? "" : skills ? `${skills} skills` : "Upload or enter skills",
    },
    {
      href: "/job-matcher",
      label: "Job match",
      icon: BriefcaseBusiness,
      state: match ? "done" : "todo",
      detail: !ready ? "" : match ? `${match.result.match_score}% coverage` : "Paste a job description",
    },
    {
      href: "/skill-gap-analysis",
      label: "Roadmap",
      icon: Route,
      state: running ? "running" : roadmap ? "done" : "todo",
      detail: !ready
        ? ""
        : running
          ? job.mode === "ai"
            ? "Generating with AI"
            : "Generating"
          : roadmap
            ? `${roadmap.result.target_weeks}-week ${roadmap.mode === "ai" ? "AI" : "quick"} plan`
            : "Build your plan",
    },
  ];
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const steps = useJourney();

  return (
    <div className="flex min-h-full">
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-brand px-3 py-2 text-sm text-on-brand focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      <Sidebar pathname={pathname} steps={steps} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <BackendBanner />
        <main
          id="main"
          className="mx-auto w-full max-w-[1120px] flex-1 px-4 pt-6 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-8 sm:pt-10 lg:px-12 lg:pb-16"
        >
          {children}
        </main>
      </div>

      <BottomTabs pathname={pathname} steps={steps} />
    </div>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5 rounded-lg">
      <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-on-brand shadow-[0_6px_16px_-6px_var(--brand)]">
        <Sparkles className="size-4" aria-hidden />
      </span>
      <span className="font-display text-[17px] font-medium tracking-tight text-ink">
        Cursus <span className="text-brand-ink">AI</span>
      </span>
    </Link>
  );
}

function Sidebar({ pathname, steps }: { pathname: string; steps: Step[] }) {
  return (
    <aside className="print-hidden sticky top-0 hidden h-screen w-[272px] shrink-0 flex-col border-r border-line bg-surface/60 px-5 py-6 lg:flex">
      <Brand />

      <nav aria-label="Main" className="mt-8 flex-1">
        <NavItem href="/" active={pathname === "/"} icon={LayoutDashboard} label="Dashboard" />

        <p className="mt-6 mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
          Your journey
        </p>
        <ol className="relative">
          {steps.map((step, index) => (
            <li key={step.href} className="relative">
              {index < steps.length - 1 && (
                <span className="absolute top-9 left-[23px] h-[calc(100%-1.25rem)] w-px bg-line" aria-hidden />
              )}
              <JourneyItem step={step} index={index} active={pathname.startsWith(step.href)} />
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-6 space-y-4 border-t border-line pt-5">
        <SystemRows />
        <ThemeToggle />
      </div>
    </aside>
  );
}

function NavItem({ href, active, icon: Icon, label }: { href: string; active: boolean; icon: LucideIcon; label: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors",
        active ? "bg-surface font-medium text-ink shadow-card" : "text-ink-muted hover:bg-surface-2 hover:text-ink",
      )}
    >
      <Icon className={cn("size-4", active && "text-brand-ink")} aria-hidden />
      {label}
    </Link>
  );
}

function JourneyItem({ step, index, active }: { step: Step; index: number; active: boolean }) {
  return (
    <Link
      href={step.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex items-start gap-3 rounded-lg px-3 py-2 transition-colors",
        active ? "bg-surface shadow-card" : "hover:bg-surface-2",
      )}
    >
      <StepBadge state={step.state} index={index} />
      <span className="min-w-0 pt-0.5">
        <span className={cn("block text-sm", active ? "font-medium text-ink" : "text-ink-muted")}>{step.label}</span>
        <span className="mt-0.5 block truncate text-xs text-ink-faint">
          {step.state === "running" ? <RunningDetail label={step.detail} /> : step.detail || " "}
        </span>
      </span>
    </Link>
  );
}

function StepBadge({ state, index }: { state: StepState; index: number }) {
  return (
    <span
      className={cn(
        "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
        state === "done" && "bg-good text-white",
        state === "running" && "bg-brand-tint text-brand-ink",
        state === "todo" && "bg-surface-3 text-ink-muted",
      )}
      aria-hidden
    >
      {state === "done" ? (
        <Check className="size-3.5" strokeWidth={3} />
      ) : state === "running" ? (
        <LoaderCircle className="size-3.5 animate-spin" />
      ) : (
        index + 1
      )}
    </span>
  );
}

function RunningDetail({ label }: { label: string }) {
  const job = useRoadmapJob();
  const now = useNow();
  const elapsed = job.status === "running" && now ? (now - job.startedAt) / 1000 : 0;
  return (
    <span className="text-brand-ink">
      {label} · <span className="tabular-nums">{formatDuration(elapsed)}</span>
    </span>
  );
}

function SystemRows() {
  const status = useSystemStatus();
  const backend =
    status.backend === "checking"
      ? { dot: "bg-ink-faint", text: "Connecting to backend" }
      : status.backend === "offline"
        ? { dot: "bg-critical", text: "Backend offline" }
        : { dot: "bg-good", text: "Backend online" };
  const ai =
    status.backend !== "online"
      ? null
      : status.ai === null
        ? { dot: "bg-ink-faint", text: "AI status unknown" }
        : status.ai.available
          ? { dot: "bg-good", text: `AI ready · ${status.ai.model}` }
          : { dot: "bg-warning", text: "AI not available" };

  return (
    <ul className="space-y-1.5 text-xs text-ink-muted">
      <li className="flex items-center gap-2">
        <span className={cn("size-1.5 rounded-full", backend.dot)} aria-hidden />
        {backend.text}
      </li>
      {ai && (
        <li className="flex items-center gap-2" title={status.ai?.message}>
          <span className={cn("size-1.5 rounded-full", ai.dot)} aria-hidden />
          <span className="truncate">{ai.text}</span>
        </li>
      )}
    </ul>
  );
}

function TopBar() {
  const status = useSystemStatus();
  const job = useRoadmapJob();
  const dot =
    status.backend === "checking" ? "bg-ink-faint" : status.backend === "offline" ? "bg-critical" : "bg-good";

  return (
    <header className="print-hidden sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-canvas/85 px-4 backdrop-blur-md lg:hidden">
      <Brand />
      <div className="flex items-center gap-1">
        {job.status === "running" && job.mode === "ai" && (
          <Link
            href="/skill-gap-analysis"
            className="mr-1 inline-flex h-8 items-center gap-1.5 rounded-full bg-brand-tint px-2.5 text-xs font-medium text-brand-ink"
          >
            <LoaderCircle className="size-3.5 animate-spin" aria-hidden />
            AI
          </Link>
        )}
        <ThemeCycleButton />
        <span
          className="flex size-9 items-center justify-center"
          title={status.backend === "offline" ? "Backend offline" : "Backend online"}
        >
          <span className={cn("size-2 rounded-full", dot)} aria-hidden />
          <span className="sr-only">{status.backend === "offline" ? "Backend offline" : "Backend online"}</span>
        </span>
      </div>
    </header>
  );
}

function BottomTabs({ pathname, steps }: { pathname: string; steps: Step[] }) {
  const tabs = [{ href: "/", label: "Home", icon: LayoutDashboard, state: "todo" as StepState }, ...steps];

  return (
    <nav
      aria-label="Main"
      className="print-hidden fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="grid grid-cols-4">
        {tabs.map(({ href, label, icon: Icon, state }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium",
                  active ? "text-brand-ink" : "text-ink-faint",
                )}
              >
                <Icon className="size-5" aria-hidden />
                {label}
                {state === "running" && (
                  <span className="absolute top-2 right-[calc(50%-16px)] size-2 rounded-full bg-brand" aria-hidden />
                )}
                {state === "done" && !active && (
                  <span className="absolute top-2 right-[calc(50%-16px)] size-1.5 rounded-full bg-good" aria-hidden />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
