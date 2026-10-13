"use client";

import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  FileText,
  LoaderCircle,
  Route,
  Sparkles,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import { Button, ButtonLink } from "@/components/ui/button";
import { Card, SectionLabel } from "@/components/ui/card";
import { ChipList } from "@/components/ui/chip";
import { coverageBand, Meter, ProgressBar } from "@/components/ui/meter";
import { Skeleton } from "@/components/ui/stat";
import { clearAllData, useProfile, useSavedMatch, useSavedRoadmap } from "@/lib/app-state";
import { cn } from "@/lib/cn";
import { countDone, countTopics, useRoadmapProgress, weekProgress } from "@/lib/progress";
import { useRoadmapJob } from "@/lib/roadmap-job";
import { useSystemStatus } from "@/lib/system-status";
import type { SavedRoadmap } from "@/lib/types";

export function Dashboard() {
  const { value: profile, ready } = useProfile();
  const { value: match } = useSavedMatch();
  const { value: roadmap } = useSavedRoadmap();
  const job = useRoadmapJob();
  const system = useSystemStatus();

  const skillCount = profile?.skills.length ?? 0;
  const running = job.status === "running";
  const started = skillCount > 0 || match || roadmap;

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
    <div className="space-y-12">
      <section className="relative">
        <div className="pointer-events-none absolute -inset-x-8 -top-10 h-64 [background:var(--glow)]" aria-hidden />
        <div className="relative max-w-2xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-tint px-3 py-1 text-xs font-medium text-brand-ink">
            <Sparkles className="size-3.5" aria-hidden />
            Career intelligence for aspiring AI Engineers
          </p>
          <h1 className="font-display text-[2.6rem] font-medium leading-[1.05] tracking-[-0.015em] text-ink sm:text-[3.4rem]">
            {started ? (
              <>
                Welcome back. <span className="text-brand-ink">Keep going.</span>
              </>
            ) : (
              <>
                Know exactly what to learn <span className="text-brand-ink">next.</span>
              </>
            )}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-ink-muted sm:text-[17px]">
            Turn your resume into a skill profile, see how it covers a real job description, and follow a
            week-by-week plan with projects worth building.
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
      </section>

      <section aria-labelledby="journey-heading">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <SectionLabel>Your journey</SectionLabel>
            <h2 id="journey-heading" className="mt-1 font-display text-2xl font-medium text-ink">
              Three steps to a plan
            </h2>
          </div>
        </div>
        <ol className="grid gap-4 md:grid-cols-3">
          <JourneyCard
            index={1}
            icon={FileText}
            title="Resume profile"
            copy="Upload a PDF to detect your skills, or type them in."
            ready={ready}
            state={skillCount ? "done" : "todo"}
            detail={
              skillCount
                ? `${skillCount} skills${profile?.filename ? ` · ${profile.filename}` : ""}`
                : "Not started"
            }
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
            detail={match ? `${match.result.match_score}% coverage · ${match.result.missing_count} gaps` : "Not started"}
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

      {ready && started && (
        <section aria-labelledby="snapshot-heading" className="space-y-5">
          <div>
            <SectionLabel>Snapshot</SectionLabel>
            <h2 id="snapshot-heading" className="mt-1 font-display text-2xl font-medium text-ink">
              Where you stand
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {match ? (
              <Card
                title="Job coverage"
                description={`${match.result.matched_count} of ${match.result.total_required} skills the job mentions`}
                actions={
                  <Link href="/job-matcher" className="text-xs font-semibold text-brand-ink hover:underline">
                    Details
                  </Link>
                }
              >
                <div className="flex items-end gap-4">
                  <p className="font-sans text-5xl font-semibold leading-none tracking-[-0.03em] text-ink">
                    {match.result.match_score}%
                  </p>
                  <p className="mb-1 flex items-center gap-1.5 text-sm text-ink-muted">
                    {coverageBand(match.result.match_score).icon}
                    {coverageBand(match.result.match_score).label}
                  </p>
                </div>
                <Meter
                  className="mt-4"
                  value={match.result.match_score}
                  label="Job skill coverage"
                  band={coverageBand(match.result.match_score)}
                />
                {match.result.missing_skills.length > 0 && (
                  <div className="mt-5">
                    <SectionLabel className="mb-2">Potential gaps</SectionLabel>
                    <ChipList items={match.result.missing_skills.slice(0, 8)} tone="warning" size="sm" />
                  </div>
                )}
              </Card>
            ) : (
              <Card
                title="Your skills"
                description="Shared across every analysis. Edit them on any page."
                actions={
                  <Link href="/job-matcher" className="text-xs font-semibold text-brand-ink hover:underline">
                    Match a job
                  </Link>
                }
              >
                <ChipList items={(profile?.skills ?? []).slice(0, 16)} tone="brand" size="sm" />
              </Card>
            )}

            {roadmap ? <RoadmapSnapshot roadmap={roadmap} /> : <ProfileCard skills={profile?.skills ?? []} />}
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

function ProfileCard({ skills }: { skills: string[] }) {
  if (skills.length === 0) return null;
  return (
    <Card
      title="Your skills"
      description="Shared across every analysis. Edit them on any page."
      actions={
        <Link href="/resume-analyzer" className="text-xs font-semibold text-brand-ink hover:underline">
          Edit
        </Link>
      }
    >
      <ChipList items={skills.slice(0, 16)} tone="brand" size="sm" />
    </Card>
  );
}

function RoadmapSnapshot({ roadmap }: { roadmap: SavedRoadmap }) {
  const done = useRoadmapProgress(roadmap.generatedAt);
  const weeks = roadmap.result.weekly_roadmap;
  const total = countTopics(weeks);
  const completed = countDone(weeks, done);
  const current = weeks.find((week) => !weekProgress(week, done).complete) ?? weeks[weeks.length - 1];
  const currentProgress = current ? weekProgress(current, done) : null;

  return (
    <Card
      title="Your roadmap"
      description={`${roadmap.result.target_weeks}-week ${roadmap.mode === "ai" ? "AI-enhanced" : "quick"} plan`}
      actions={
        <Link href="/skill-gap-analysis" className="text-xs font-semibold text-brand-ink hover:underline">
          Open
        </Link>
      }
    >
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-ink">
          {completed} of {total} topics done
        </span>
        <span className="text-ink-faint">{total > 0 ? Math.round((completed / total) * 100) : 0}%</span>
      </div>
      <ProgressBar className="mt-2" value={completed} max={total} label="Roadmap progress" />

      {current && (
        <div className="mt-5 rounded-xl bg-surface-2/70 p-4">
          <SectionLabel>{currentProgress?.complete ? "All weeks complete" : "Up next"}</SectionLabel>
          <p className="mt-1 font-medium text-ink">
            Week {current.week}: {current.title.replace(/^Week \d+:\s*/, "")}
          </p>
          {currentProgress && currentProgress.total > 0 && (
            <p className="mt-1 text-xs text-ink-faint">
              {currentProgress.completed} of {currentProgress.total} topics done this week
            </p>
          )}
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
      <Link
        href={href}
        className="group flex h-full flex-col rounded-2xl bg-surface p-5 shadow-card transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-pop"
      >
        <div className="flex items-center justify-between">
          <span className="flex size-10 items-center justify-center rounded-xl bg-brand-tint text-brand-ink">
            <Icon className="size-5" aria-hidden />
          </span>
          <span
            className={cn(
              "flex size-7 items-center justify-center rounded-full text-xs font-semibold",
              state === "done" && "bg-good text-white",
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
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </div>
      </Link>
    </li>
  );
}
