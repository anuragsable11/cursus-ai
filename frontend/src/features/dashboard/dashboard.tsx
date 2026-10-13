"use client";

import {
  ArrowRight,
  BriefcaseBusiness,
  CircleCheck,
  Cpu,
  FileText,
  LoaderCircle,
  Route,
  Server,
  Sparkles,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip, ChipList } from "@/components/ui/chip";
import { Skeleton } from "@/components/ui/stat";
import {
  clearAllData,
  useProfile,
  useSavedMatch,
  useSavedRoadmap,
} from "@/lib/app-state";
import { cn } from "@/lib/cn";
import { API_URL } from "@/lib/config";
import { useRoadmapJob } from "@/lib/roadmap-job";
import { useSystemStatus } from "@/lib/system-status";

type StepStatus = "done" | "running" | "todo";

export function Dashboard() {
  const { value: profile, ready } = useProfile();
  const { value: match } = useSavedMatch();
  const { value: roadmap } = useSavedRoadmap();
  const job = useRoadmapJob();

  const skillCount = profile?.skills.length ?? 0;
  const roadmapRunning = job.status === "running";

  const next = !skillCount
    ? { href: "/resume-analyzer", label: "Analyze your resume" }
    : !match
      ? { href: "/job-matcher", label: "Match a job description" }
      : !roadmap
        ? { href: "/skill-gap-analysis", label: "Build your learning roadmap" }
        : { href: "/skill-gap-analysis", label: "Open your roadmap" };

  function resetAll() {
    if (window.confirm("Clear your saved skills, job description and results from this browser?")) {
      clearAllData();
    }
  }

  return (
    <div className="space-y-10">
      <section className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="pt-2">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/10 px-3 py-1 text-xs font-medium text-violet-200">
            <Sparkles className="size-3.5" aria-hidden />
            Career intelligence for AI Engineers
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Plan your path to an <span className="text-brand-soft">AI Engineer</span> role
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-ink-muted">
            Turn your resume into a skill profile, see how it covers a real job description, and get a
            week-by-week learning plan with projects to build.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            {ready ? (
              <ButtonLink href={next.href} size="lg" icon={<ArrowRight className="size-4" aria-hidden />}>
                {next.label}
              </ButtonLink>
            ) : (
              <Skeleton className="h-12 w-56" />
            )}
          </div>
        </div>

        <SystemCard />
      </section>

      <section aria-labelledby="progress-heading">
        <h2 id="progress-heading" className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-ink-faint">
          Your progress
        </h2>
        <ol className="grid gap-4 md:grid-cols-3">
          <StepCard
            step={1}
            icon={FileText}
            title="Resume profile"
            description="Upload a PDF resume to detect your skills, experience and projects."
            ready={ready}
            status={skillCount ? "done" : "todo"}
            statusText={
              skillCount
                ? `${skillCount} skills${profile?.filename ? ` from ${profile.filename}` : " entered manually"}`
                : "Not started"
            }
            href="/resume-analyzer"
            cta={skillCount ? "Review profile" : "Upload resume"}
          />
          <StepCard
            step={2}
            icon={BriefcaseBusiness}
            title="Job match"
            description="Compare your skills with a job description to see coverage and gaps."
            ready={ready}
            status={match ? "done" : "todo"}
            statusText={
              match
                ? `${match.result.match_score}% coverage · ${match.result.missing_skills.length} potential gaps`
                : "Not started"
            }
            href="/job-matcher"
            cta={match ? "View match" : "Match a job"}
          />
          <StepCard
            step={3}
            icon={Route}
            title="Learning roadmap"
            description="Get a prioritized weekly plan, with optional AI explanations and interview prep."
            ready={ready}
            status={roadmapRunning ? "running" : roadmap ? "done" : "todo"}
            statusText={
              roadmapRunning
                ? job.mode === "ai"
                  ? "AI analysis in progress…"
                  : "Building…"
                : roadmap
                  ? `${roadmap.result.target_weeks}-week ${roadmap.mode === "ai" ? "AI-enhanced" : "quick"} plan`
                  : "Not started"
            }
            href="/skill-gap-analysis"
            cta={roadmap ? "Open roadmap" : "Build roadmap"}
          />
        </ol>
      </section>

      {ready && (skillCount > 0 || roadmap) && (
        <section className="grid gap-6 lg:grid-cols-2">
          {skillCount > 0 && profile && (
            <Card
              title="Your skills"
              description="Used by every analysis. Edit them from any page."
              icon={<CircleCheck className="size-4" aria-hidden />}
            >
              <ul className="flex flex-wrap gap-2">
                {profile.skills.slice(0, 18).map((skill) => (
                  <li key={skill}>
                    <Chip tone="brand">{skill}</Chip>
                  </li>
                ))}
                {profile.skills.length > 18 && (
                  <li>
                    <Chip>+{profile.skills.length - 18} more</Chip>
                  </li>
                )}
              </ul>
            </Card>
          )}

          {roadmap ? (
            <Card
              title="Up next in your roadmap"
              description={roadmap.result.weekly_roadmap[0]?.title ?? "Week 1"}
              icon={<Route className="size-4" aria-hidden />}
              actions={
                <ButtonLink href="/skill-gap-analysis" variant="secondary" size="sm">
                  Full plan
                </ButtonLink>
              }
            >
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-ink-faint">Top priorities</p>
              <ChipList
                items={roadmap.result.prioritized_gaps.slice(0, 6)}
                tone="warning"
                numbered
                empty="No gaps detected for this job."
              />
              {roadmap.result.weekly_roadmap[0]?.deliverable && (
                <p className="mt-4 text-sm leading-6 text-ink-muted">
                  <span className="text-ink">Week 1 deliverable:</span>{" "}
                  {roadmap.result.weekly_roadmap[0].deliverable}
                </p>
              )}
            </Card>
          ) : match ? (
            <Card
              title="Gaps from your last job match"
              description={`${match.result.match_score}% of the detected job skills are covered.`}
              icon={<BriefcaseBusiness className="size-4" aria-hidden />}
              actions={
                <ButtonLink href="/skill-gap-analysis" size="sm">
                  Build roadmap
                </ButtonLink>
              }
            >
              <ChipList items={match.result.missing_skills} tone="warning" empty="No gaps detected." />
            </Card>
          ) : null}
        </section>
      )}

      {ready && (profile || match || roadmap) && (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line px-5 py-4">
          <p className="text-sm text-ink-muted">
            Your data stays in this browser. Nothing is uploaded except to your local backend.
          </p>
          <Button variant="ghost" size="sm" onClick={resetAll} icon={<Trash2 className="size-3.5" aria-hidden />}>
            Clear saved data
          </Button>
        </section>
      )}
    </div>
  );
}

function StepCard({
  step,
  icon: Icon,
  title,
  description,
  ready,
  status,
  statusText,
  href,
  cta,
}: {
  step: number;
  icon: LucideIcon;
  title: string;
  description: string;
  ready: boolean;
  status: StepStatus;
  statusText: string;
  href: string;
  cta: string;
}) {
  return (
    <li className="flex flex-col rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between">
        <span className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand-soft">
          <Icon className="size-5" aria-hidden />
        </span>
        <span className="text-xs font-medium tabular-nums text-ink-faint">Step {step}</span>
      </div>
      <h3 className="mt-4 font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-6 text-ink-muted">{description}</p>

      <div className="mt-4 flex items-center gap-2 text-xs">
        {!ready ? (
          <Skeleton className="h-4 w-40" />
        ) : (
          <>
            {status === "done" && <CircleCheck className="size-4 shrink-0 text-success" aria-hidden />}
            {status === "running" && <LoaderCircle className="size-4 shrink-0 animate-spin text-brand-soft" aria-hidden />}
            {status === "todo" && <span className="size-2 shrink-0 rounded-full bg-ink-faint" aria-hidden />}
            <span className={cn("truncate", status === "todo" ? "text-ink-faint" : "text-ink")}>{statusText}</span>
          </>
        )}
      </div>

      <ButtonLink href={href} variant="secondary" className="mt-4 w-full">
        {cta}
      </ButtonLink>
    </li>
  );
}

function SystemCard() {
  const status = useSystemStatus();

  const backend =
    status.backend === "checking"
      ? { tone: "bg-ink-faint", text: "Checking…" }
      : status.backend === "online"
        ? { tone: "bg-success", text: "Online" }
        : { tone: "bg-danger", text: "Offline" };

  const ai =
    status.backend !== "online"
      ? { tone: "bg-ink-faint", text: status.backend === "checking" ? "Checking…" : "Unavailable", detail: "Needs the backend." }
      : status.ai === null
        ? { tone: "bg-ink-faint", text: "Unknown", detail: "Restart the backend to enable status checks." }
        : status.ai.available
          ? { tone: "bg-success", text: "Ready", detail: `${status.ai.model} running locally with Ollama.` }
          : { tone: "bg-warning", text: "Not ready", detail: status.ai.message };

  return (
    <Card title="System status" icon={<Cpu className="size-4" aria-hidden />}>
      <div className="space-y-4 text-sm">
        <div className="flex items-start gap-3">
          <Server className="mt-0.5 size-4 shrink-0 text-ink-faint" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-ink">Backend API</p>
            <p className="truncate font-mono text-xs text-ink-faint">{API_URL}</p>
          </div>
          <StatusBadge tone={backend.tone} text={backend.text} />
        </div>
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-ink-faint" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-ink">AI engine</p>
            <p className="text-xs leading-5 text-ink-faint">{ai.detail}</p>
          </div>
          <StatusBadge tone={ai.tone} text={ai.text} />
        </div>
      </div>
      <p className="mt-5 border-t border-line pt-4 text-xs leading-5 text-ink-faint">
        Resume parsing, job matching and quick roadmaps work without AI. AI-enhanced roadmaps need Ollama.
      </p>
    </Card>
  );
}

function StatusBadge({ tone, text }: { tone: string; text: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs text-ink-muted">
      <span className={cn("size-1.5 rounded-full", tone)} aria-hidden />
      {text}
    </span>
  );
}
