"use client";

import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CircleDashed,
  FileText,
  LoaderCircle,
  Route,
  Sparkles,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import { HeroPreview } from "@/components/hero-preview";
import { MatchVerdictBlock } from "@/components/match-verdict";
import { NavLink } from "@/components/nav-link";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, SectionLabel } from "@/components/ui/card";
import { ChipList } from "@/components/ui/chip";
import { ProgressBar } from "@/components/ui/meter";
import { Skeleton } from "@/components/ui/stat";
import { clearAllData, useProfile, useSavedMatch, useSavedRoadmap } from "@/lib/app-state";
import { firstName, useCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { verdictForMatch } from "@/lib/match-verdict";
import { trackSpotlight } from "@/lib/motion";
import { countDone, countTopics, topicKey, useRoadmapProgress, weekProgress } from "@/lib/progress";
import { useRoadmapJob } from "@/lib/roadmap-job";
import { useSystemStatus } from "@/lib/system-status";
import type { ResumeProfile, SavedMatch, SavedRoadmap } from "@/lib/types";

export function Dashboard() {
  const { value: profile, ready } = useProfile();
  const { value: match } = useSavedMatch();
  const { value: roadmap } = useSavedRoadmap();
  const job = useRoadmapJob();
  const system = useSystemStatus();
  const user = useCurrentUser();
  const name = firstName(user);

  const skillCount = profile?.skills.length ?? 0;
  const running = job.status === "running";
  const started = Boolean(skillCount || match || roadmap);

  const next = !skillCount
    ? { href: "/resume-analyzer", label: "Analyze your resume", hint: "Takes a few seconds" }
    : !match
      ? { href: "/job-matcher", label: "Match a job description", hint: "Instant" }
      : !roadmap
        ? { href: "/skill-gap-analysis", label: "Build your roadmap", hint: "Quick or AI-enhanced" }
        : { href: "/skill-gap-analysis", label: "Continue your roadmap", hint: "Pick up where you left off" };

  function resetAll() {
    if (window.confirm("Clear your saved skills, job description, results and progress from this browser?")) {
      clearAllData();
    }
  }

  return (
    <div className="space-y-14">
      <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="animate-rise">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-xs font-medium text-ink-muted shadow-card">
            <Sparkles className="size-3.5 text-brand-ink" aria-hidden />
            Career intelligence for aspiring AI Engineers
          </p>
          <h1 className="text-balance font-display text-[2.75rem] font-medium leading-[1.02] tracking-[-0.02em] text-ink sm:text-[3.6rem]">
            {started ? (
              <>
                {name ? `Welcome back, ${name}.` : "Welcome back."}{" "}
                <span className="bg-linear-to-r from-brand-ink to-[color-mix(in_oklab,var(--brand-ink)_55%,var(--accent-2))] bg-clip-text text-transparent">
                  Keep going.
                </span>
              </>
            ) : (
              <>
                {name ? `${name}, know exactly what to learn` : "Know exactly what to learn"}{" "}
                <span className="bg-linear-to-r from-brand-ink to-[color-mix(in_oklab,var(--brand-ink)_55%,var(--accent-2))] bg-clip-text text-transparent">
                  next.
                </span>
              </>
            )}
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-ink-muted sm:text-[17px] sm:leading-8">
            Turn your resume into a skill profile, see how it covers a real job description, and follow a week-by-week
            plan with projects worth building.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            {ready ? (
              <>
                <ButtonLink href={next.href} size="lg" icon={<ArrowRight aria-hidden />}>
                  {next.label}
                </ButtonLink>
                <span className="text-sm text-ink-faint">{next.hint}</span>
              </>
            ) : (
              <Skeleton className="h-12 w-60" />
            )}
          </div>
        </div>

        <div className="relative">
          {!ready ? (
            <Skeleton className="h-[300px]" />
          ) : roadmap ? (
            <FocusCard roadmap={roadmap} />
          ) : started ? (
            <NextStepCard profile={profile} match={match} running={running} />
          ) : (
            <HeroPreview />
          )}
        </div>
      </section>

      <section aria-labelledby="journey-heading">
        <div className="mb-5">
          <SectionLabel>Your journey</SectionLabel>
          <h2 id="journey-heading" className="mt-1 font-display text-2xl font-medium text-ink">
            Three steps to a plan
          </h2>
        </div>
        <ol className="stagger grid gap-4 md:grid-cols-3">
          <JourneyCard
            index={1}
            icon={FileText}
            title="Resume profile"
            copy="Upload a PDF to detect your skills, or type them in."
            ready={ready}
            state={skillCount ? "done" : "todo"}
            detail={skillCount ? `${skillCount} skills${profile?.filename ? ` · ${profile.filename}` : ""}` : "Not started"}
            href="/resume-analyzer"
            cta={skillCount ? "Review" : "Start"}
          />
          <JourneyCard
            index={2}
            icon={BriefcaseBusiness}
            title="Job match"
            copy="See how your skills cover a job description."
            ready={ready}
            state={match ? "done" : "todo"}
            detail={match ? verdictForMatch(match.result).short : "Not started"}
            href="/job-matcher"
            cta={match ? "View" : "Start"}
          />
          <JourneyCard
            index={3}
            icon={Route}
            title="Learning roadmap"
            copy="A prioritized weekly plan, optionally explained by AI."
            ready={ready}
            state={running ? "running" : roadmap ? "done" : "todo"}
            detail={
              running
                ? job.mode === "ai"
                  ? "AI analysis in progress"
                  : "Building…"
                : roadmap
                  ? `${roadmap.result.target_weeks}-week ${roadmap.mode === "ai" ? "AI-enhanced" : "quick"} plan`
                  : "Not started"
            }
            href="/skill-gap-analysis"
            cta={roadmap ? "Open" : "Start"}
          />
        </ol>
      </section>

      {ready && match && (
        <section aria-labelledby="snapshot-heading" className="space-y-5">
          <div>
            <SectionLabel>Snapshot</SectionLabel>
            <h2 id="snapshot-heading" className="mt-1 font-display text-2xl font-medium text-ink">
              Where you stand
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <CoverageCard match={match} />
            <Card
              title="Your skills"
              description="Shared across every analysis. Edit them on any page."
              actions={
                <NavLink href="/resume-analyzer" className="text-xs font-semibold text-brand-ink hover:underline">
                  Edit
                </NavLink>
              }
            >
              <ChipList items={(profile?.skills ?? []).slice(0, 18)} tone="brand" size="sm" />
              {(profile?.skills.length ?? 0) > 18 && (
                <p className="mt-3 text-xs text-ink-faint">+{(profile?.skills.length ?? 0) - 18} more</p>
              )}
            </Card>
          </div>
        </section>
      )}

      <section className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-sm text-ink-faint">
        <p>
          {system.backend === "online"
            ? system.ai?.available
              ? `Backend online · AI ready with ${system.ai.model}`
              : "Backend online · AI-enhanced roadmaps need Ollama"
            : system.backend === "offline"
              ? "Backend offline"
              : "Connecting to backend…"}
          <span className="hidden sm:inline"> · Your data stays in this browser.</span>
        </p>
        {ready && started && (
          <Button variant="ghost" size="sm" onClick={resetAll} icon={<Trash2 aria-hidden />}>
            Clear saved data
          </Button>
        )}
      </section>
    </div>
  );
}

function FocusCard({ roadmap }: { roadmap: SavedRoadmap }) {
  const done = useRoadmapProgress(roadmap.generatedAt);
  const weeks = roadmap.result.weekly_roadmap;
  const total = countTopics(weeks);
  const completed = countDone(weeks, done);
  const allDone = total > 0 && completed === total;
  const current = weeks.find((week) => !weekProgress(week, done).complete) ?? weeks[weeks.length - 1];
  const progress = current ? weekProgress(current, done) : null;
  const upcoming = current
    ? current.activities
        .flatMap((activity) => activity.topics.map((topic) => ({ skill: activity.skill, topic })))
        .filter(({ skill, topic }) => !done[topicKey(current.week, skill, topic)])
        .slice(0, 3)
    : [];

  return (
    <Card glow padding="lg" className="animate-rise shadow-pop [animation-delay:120ms]">
      <div className="flex items-center justify-between">
        <SectionLabel>{allDone ? "Plan complete" : `Up next · Week ${current?.week ?? 1}`}</SectionLabel>
        <span className="text-xs text-ink-faint">
          {roadmap.result.target_weeks}-week {roadmap.mode === "ai" ? "AI" : "quick"} plan
        </span>
      </div>
      <h2 className="mt-2 text-balance font-display text-2xl font-medium leading-tight text-ink">
        {allDone ? "Every topic is done. Time to build." : (current?.title.replace(/^Week \d+:\s*/, "") ?? "Your plan")}
      </h2>

      {progress && progress.total > 0 && !allDone && (
        <div className="mt-5">
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-ink-muted">This week</span>
            <span className="text-ink-faint">
              {progress.completed} of {progress.total} topics
            </span>
          </div>
          <ProgressBar className="mt-2" value={progress.completed} max={progress.total} label="This week's progress" />
        </div>
      )}

      {upcoming.length > 0 && (
        <ul className="mt-5 space-y-2.5">
          {upcoming.map(({ skill, topic }) => (
            <li key={`${skill}-${topic}`} className="flex items-start gap-2.5 text-sm">
              <CircleDashed className="mt-0.5 size-4 shrink-0 text-brand-ink" aria-hidden />
              <span className="min-w-0">
                <span className="text-ink">{topic}</span>
                <span className="block text-xs text-ink-faint">{skill}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-5">
        <span className="text-xs text-ink-faint">
          {completed} of {total} topics overall
        </span>
        <ButtonLink href="/skill-gap-analysis" size="sm" icon={<ArrowRight aria-hidden />}>
          {allDone ? "Review plan" : `Continue week ${current?.week ?? 1}`}
        </ButtonLink>
      </div>
    </Card>
  );
}

function NextStepCard({
  profile,
  match,
  running,
}: {
  profile: ResumeProfile | null;
  match: SavedMatch | null;
  running: boolean;
}) {
  const skills = profile?.skills ?? [];
  const step = match
    ? {
        label: "Next step · Roadmap",
        title: running ? "Your roadmap is being generated" : `Turn ${match.result.missing_count} gaps into a weekly plan`,
        copy: "Pick quick or AI-enhanced, then follow the plan week by week.",
        href: "/skill-gap-analysis",
        cta: running ? "View progress" : "Build roadmap",
      }
    : {
        label: "Next step · Job match",
        title: "See how your skills cover a real job",
        copy: "Paste a job description, or use the sample to try it out.",
        href: "/job-matcher",
        cta: "Match a job",
      };

  return (
    <Card glow padding="lg" className="animate-rise shadow-pop [animation-delay:120ms]">
      <SectionLabel>{step.label}</SectionLabel>
      <h2 className="mt-2 text-balance font-display text-2xl font-medium leading-tight text-ink">{step.title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink-muted">{step.copy}</p>
      {skills.length > 0 && (
        <div className="mt-5">
          <ChipList items={skills.slice(0, 8)} tone="brand" size="sm" />
        </div>
      )}
      <div className="mt-6 border-t border-line pt-5">
        <ButtonLink href={step.href} size="sm" icon={<ArrowRight aria-hidden />}>
          {step.cta}
        </ButtonLink>
      </div>
    </Card>
  );
}

function CoverageCard({ match }: { match: SavedMatch }) {
  return (
    <Card
      title="Job match"
      description="Your last comparison"
      actions={
        <NavLink href="/job-matcher" className="text-xs font-semibold text-brand-ink hover:underline">
          Details
        </NavLink>
      }
    >
      <MatchVerdictBlock verdict={verdictForMatch(match.result)} size="sm" />
      {match.result.missing_skills.length > 0 && (
        <div className="mt-5">
          <SectionLabel className="mb-2">Potential gaps</SectionLabel>
          <ChipList items={match.result.missing_skills.slice(0, 8)} tone="warning" size="sm" />
        </div>
      )}
    </Card>
  );
}

function JourneyCard({
  index,
  icon: Icon,
  title,
  copy,
  ready,
  state,
  detail,
  href,
  cta,
}: {
  index: number;
  icon: LucideIcon;
  title: string;
  copy: string;
  ready: boolean;
  state: "todo" | "done" | "running";
  detail: string;
  href: string;
  cta: string;
}) {
  return (
    <li>
      <NavLink
        href={href}
        onPointerMove={trackSpotlight}
        className="spotlight group flex h-full flex-col rounded-2xl bg-surface p-5 shadow-card transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-raised"
      >
        <div className="flex items-center justify-between">
          <span className="flex size-10 items-center justify-center rounded-xl bg-brand-tint text-brand-ink transition-transform duration-300 group-hover:scale-105">
            <Icon className="size-5" aria-hidden />
          </span>
          <span
            className={cn(
              "flex size-7 items-center justify-center rounded-full text-xs font-semibold",
              state === "done" && "bg-good text-white shadow-[0_0_0_4px_var(--good-tint)]",
              state === "running" && "bg-brand-tint text-brand-ink",
              state === "todo" && "bg-surface-2 text-ink-muted",
            )}
            aria-hidden
          >
            {state === "done" ? (
              <Check className="size-4" strokeWidth={3} />
            ) : state === "running" ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              index
            )}
          </span>
        </div>
        <h3 className="mt-5 text-base font-semibold text-ink">{title}</h3>
        <p className="mt-1 flex-1 text-sm leading-6 text-ink-muted">{copy}</p>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4 text-sm">
          {ready ? (
            <span className={cn("truncate", state === "todo" ? "text-ink-faint" : "text-ink")}>{detail}</span>
          ) : (
            <Skeleton className="h-4 w-28" />
          )}
          <span className="inline-flex shrink-0 items-center gap-1 font-medium text-brand-ink">
            {cta}
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
          </span>
        </div>
      </NavLink>
    </li>
  );
}
