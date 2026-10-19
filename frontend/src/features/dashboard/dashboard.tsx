"use client";

import {
  ArrowRight,
  BriefcaseBusiness,
  ChevronRight,
  CircleDashed,
  FileText,
  Route,
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
import { PageBody, PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/stat";
import { clearAllData, useProfile, useSavedMatch, useSavedRoadmap } from "@/lib/app-state";
import { firstName, useCurrentUser } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { verdictForMatch } from "@/lib/match-verdict";
import { countDone, countTopics, topicKey, useRoadmapProgress, weekProgress } from "@/lib/progress";
import { useRoadmapJob } from "@/lib/roadmap-job";
import type { ResumeProfile, SavedMatch, SavedRoadmap } from "@/lib/types";

type StepState = "todo" | "done" | "running";

const quietLinkClasses = "text-[13px] font-medium text-ink-muted transition-colors hover:text-ink";

export function Dashboard() {
  const { value: profile, ready } = useProfile();
  const { value: match } = useSavedMatch();
  const { value: roadmap } = useSavedRoadmap();
  const job = useRoadmapJob();
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

  const steps: JourneyStep[] = [
    {
      icon: FileText,
      title: "Resume profile",
      copy: "Upload a PDF to detect your skills, or type them in.",
      state: skillCount ? "done" : "todo",
      detail: skillCount ? `${skillCount} skills${profile?.filename ? ` · ${profile.filename}` : ""}` : "",
      href: "/resume-analyzer",
      cta: skillCount ? "Review" : "Start",
    },
    {
      icon: BriefcaseBusiness,
      title: "Job match",
      copy: "See how your skills cover a job description.",
      state: match ? "done" : "todo",
      detail: match ? verdictForMatch(match.result).short : "",
      href: "/job-matcher",
      cta: match ? "View" : "Start",
    },
    {
      icon: Route,
      title: "Learning roadmap",
      copy: "A prioritized weekly plan, optionally explained by AI.",
      state: running ? "running" : roadmap ? "done" : "todo",
      detail: running
        ? job.mode === "ai"
          ? "AI analysis in progress"
          : "Building…"
        : roadmap
          ? `${roadmap.result.target_weeks}-week ${roadmap.mode === "ai" ? "AI-enhanced" : "quick"} plan`
          : "",
      href: "/skill-gap-analysis",
      cta: roadmap ? "Open" : "Start",
    },
  ];

  function resetAll() {
    if (window.confirm("Clear your saved skills, job description, results and progress from this browser?")) {
      clearAllData();
    }
  }

  return (
    <>
      <PageHeader
        title={
          started
            ? name
              ? `Welcome back, ${name}`
              : "Welcome back"
            : name
              ? `${name}, know exactly what to learn next`
              : "Know exactly what to learn next"
        }
        description="Turn your resume into a skill profile, see how it covers a real job description, and follow a week-by-week plan with projects worth building."
        actions={
          ready ? (
            <>
              <span className="hidden text-[13px] text-ink-faint sm:inline">{next.hint}</span>
              <ButtonLink href={next.href} icon={<ArrowRight aria-hidden />} className="flex-row-reverse">
                {next.label}
              </ButtonLink>
            </>
          ) : (
            <Skeleton className="h-10 w-52" />
          )
        }
      />

      <PageBody>
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22.5rem)]">
          <div className="space-y-6">
            <JourneyList steps={steps} ready={ready} />
            {ready && profile && skillCount > 0 && <SkillsCard profile={profile} />}
          </div>

          <aside className="space-y-6">
            {!ready ? (
              <Skeleton className="h-72 rounded-xl" />
            ) : (
              <>
                {roadmap ? (
                  <FocusCard roadmap={roadmap} />
                ) : started ? (
                  <NextStepCard profile={profile} match={match} running={running} />
                ) : (
                  <HeroPreview />
                )}
                {match && <CoverageCard match={match} />}
              </>
            )}
          </aside>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-[13px] text-ink-faint">
          <p>Your skills, results and progress are saved in this browser, per account.</p>
          {ready && started && (
            <Button variant="ghost" size="sm" onClick={resetAll} icon={<Trash2 aria-hidden />}>
              Clear saved data
            </Button>
          )}
        </div>
      </PageBody>
    </>
  );
}

type JourneyStep = {
  icon: LucideIcon;
  title: string;
  copy: string;
  state: StepState;
  detail: string;
  href: string;
  cta: string;
};

const STATUS: Record<StepState, { dot: string; label: string }> = {
  done: { dot: "bg-good", label: "Completed" },
  running: { dot: "bg-warning animate-pulse", label: "In progress" },
  todo: { dot: "bg-line-hover", label: "Not started" },
};

function JourneyList({ steps, ready }: { steps: JourneyStep[]; ready: boolean }) {
  const completed = steps.filter((step) => step.state === "done").length;

  return (
    <section
      aria-labelledby="journey-heading"
      className="overflow-hidden rounded-xl border border-line bg-surface shadow-card"
    >
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
        <div>
          <h2 id="journey-heading" className="text-base font-semibold tracking-[-0.01em] text-ink">
            Your journey
          </h2>
          <p className="mt-0.5 text-sm text-ink-muted">Three steps to a plan</p>
        </div>
        {ready && (
          <span className="font-mono text-xs tabular-nums text-ink-faint">
            {completed}/{steps.length} complete
          </span>
        )}
      </div>
      <ol className="divide-y divide-line">
        {steps.map((step) => (
          <JourneyRow key={step.href} step={step} ready={ready} />
        ))}
      </ol>
    </section>
  );
}

function JourneyRow({ step, ready }: { step: JourneyStep; ready: boolean }) {
  const { icon: Icon, state } = step;
  const status = STATUS[state];

  return (
    <li>
      <NavLink
        href={step.href}
        className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-canvas focus-visible:outline-offset-[-2px]"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-ink-muted">
          <Icon className="size-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-ink">{step.title}</span>
          {ready ? (
            <span className="mt-0.5 block truncate text-[13px] text-ink-muted">{step.detail || step.copy}</span>
          ) : (
            <Skeleton className="mt-1.5 h-3.5 w-40" />
          )}
        </span>
        {ready && (
          <span className="flex shrink-0 items-center gap-2 text-[13px] text-ink-muted">
            <span className={cn("size-2 rounded-full", status.dot)} aria-hidden />
            <span className="hidden sm:inline">{status.label}</span>
            <span className="sr-only sm:hidden">{status.label}</span>
          </span>
        )}
        <span className="hidden shrink-0 items-center gap-0.5 text-[13px] font-medium text-ink-muted transition-colors group-hover:text-ink sm:flex">
          {step.cta}
          <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
        <ChevronRight className="size-4 shrink-0 text-ink-faint sm:hidden" aria-hidden />
      </NavLink>
    </li>
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
    <Card
      footer={
        <>
          <span className="text-[13px] tabular-nums">
            {completed} of {total} topics overall
          </span>
          <ButtonLink href="/skill-gap-analysis" size="sm">
            {allDone ? "Review plan" : `Continue week ${current?.week ?? 1}`}
          </ButtonLink>
        </>
      }
    >
      <div className="flex items-center justify-between gap-3">
        <SectionLabel>{allDone ? "Plan complete" : `Up next · Week ${current?.week ?? 1}`}</SectionLabel>
        <span className="text-xs text-ink-faint">
          {roadmap.result.target_weeks}-week {roadmap.mode === "ai" ? "AI" : "quick"} plan
        </span>
      </div>
      <h2 className="mt-1.5 text-balance text-lg font-semibold leading-snug tracking-[-0.02em] text-ink">
        {allDone ? "Every topic is done. Time to build." : (current?.title.replace(/^Week \d+:\s*/, "") ?? "Your plan")}
      </h2>

      {progress && progress.total > 0 && !allDone && (
        <div className="mt-5">
          <div className="flex items-baseline justify-between text-[13px]">
            <span className="text-ink-muted">This week</span>
            <span className="tabular-nums text-ink-faint">
              {progress.completed} of {progress.total} topics
            </span>
          </div>
          <ProgressBar className="mt-2" value={progress.completed} max={progress.total} label="This week's progress" />
        </div>
      )}

      {upcoming.length > 0 && (
        <ul className="mt-5 space-y-3">
          {upcoming.map(({ skill, topic }) => (
            <li key={`${skill}-${topic}`} className="flex items-start gap-2.5 text-sm">
              <CircleDashed className="mt-0.5 size-4 shrink-0 text-ink-faint" aria-hidden />
              <span className="min-w-0">
                <span className="text-ink">{topic}</span>
                <span className="block text-xs text-ink-faint">{skill}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
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
    <Card
      footer={
        <>
          <span className="text-[13px]">{step.label}</span>
          <ButtonLink href={step.href} size="sm">
            {step.cta}
          </ButtonLink>
        </>
      }
    >
      <h2 className="text-balance text-lg font-semibold leading-snug tracking-[-0.02em] text-ink">{step.title}</h2>
      <p className="mt-1.5 text-sm leading-6 text-ink-muted">{step.copy}</p>
      {skills.length > 0 && (
        <div className="mt-5">
          <ChipList items={skills.slice(0, 8)} tone="brand" size="sm" />
        </div>
      )}
    </Card>
  );
}

function CoverageCard({ match }: { match: SavedMatch }) {
  return (
    <Card
      title="Job match"
      description="Your last comparison"
      actions={
        <NavLink href="/job-matcher" className={quietLinkClasses}>
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

function SkillsCard({ profile }: { profile: ResumeProfile }) {
  const extra = profile.skills.length - 18;
  return (
    <Card
      title="Your skills"
      description="Shared across every analysis. Edit them on any page."
      actions={
        <NavLink href="/resume-analyzer" className={quietLinkClasses}>
          Edit
        </NavLink>
      }
    >
      <ChipList items={profile.skills.slice(0, 18)} tone="brand" size="sm" />
      {extra > 0 && <p className="mt-3 text-[13px] text-ink-faint">+{extra} more</p>}
    </Card>
  );
}
