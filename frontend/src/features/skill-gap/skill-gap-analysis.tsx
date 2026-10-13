"use client";

import { Route, Sparkles, Wand2, Zap, type LucideIcon } from "lucide-react";
import { useId, useState } from "react";

import { JobDescriptionField } from "@/components/job-description-field";
import { SkillsPanel } from "@/components/skills-panel";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, Skeleton } from "@/components/ui/stat";
import {
  inputsChanged,
  targetWeeksStore,
  useJobDescription,
  useProfile,
  useSavedRoadmap,
  useTargetWeeks,
} from "@/lib/app-state";
import { cn } from "@/lib/cn";
import { AI_EXPECTED_SECONDS, LIMITS, ROADMAP_WEEK_OPTIONS } from "@/lib/config";
import { dismissRoadmapError, startRoadmap, useRoadmapJob } from "@/lib/roadmap-job";
import { refreshSystemStatus, useSystemStatus } from "@/lib/system-status";
import type { RoadmapMode } from "@/lib/types";

import { RoadmapProgress } from "./roadmap-progress";
import { RoadmapResults } from "./roadmap-results";

export function SkillGapAnalysis() {
  const { value: profile, ready } = useProfile();
  const { value: jobDescription } = useJobDescription();
  const { value: storedWeeks } = useTargetWeeks();
  const { value: saved } = useSavedRoadmap();
  const job = useRoadmapJob();
  const system = useSystemStatus();
  const [chosenMode, setChosenMode] = useState<RoadmapMode | null>(null);
  const modeGroup = useId();

  const skills = profile?.skills ?? [];
  const jobText = jobDescription ?? "";
  const weeks = storedWeeks ?? 4;
  const running = job.status === "running";

  // AI is selectable unless we know it can't work. An older backend
  // without the status endpoint reports ai = null; let the user try.
  const aiBlockedReason =
    system.backend === "offline"
      ? "The backend is offline."
      : system.ai && !system.ai.available
        ? system.ai.message
        : null;
  const aiReady = system.backend === "online" && system.ai?.available === true;
  const mode: RoadmapMode =
    chosenMode === "ai" && aiBlockedReason
      ? "quick"
      : chosenMode ?? (aiReady ? "ai" : "quick");

  const problem =
    jobText.trim().length < LIMITS.minJobDescription
      ? `Add a job description of at least ${LIMITS.minJobDescription} characters.`
      : null;

  function generate() {
    if (problem || running) return;
    void startRoadmap(mode, { skills, jobDescription: jobText, targetWeeks: weeks });
  }

  return (
    <>
      <PageHeader
        eyebrow="Step 3 · Roadmap"
        icon={<Route className="size-3.5" aria-hidden />}
        title="Skill Gap Roadmap"
        description="Prioritize the skills to strengthen for your target job and get a week-by-week plan with practical projects."
      />

      <Card className="print:hidden">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
          <div className="space-y-6">
            <SkillsPanel />
            <JobDescriptionField rows={8} />
          </div>

          <div className="space-y-6 lg:border-l lg:border-line lg:pl-8">
            <WeeksPicker value={weeks} disabled={running} />

            <fieldset disabled={running}>
              <legend className="mb-2 text-sm font-medium text-ink">Analysis type</legend>
              <div className="space-y-2">
                <ModeOption
                  value="quick"
                  name={modeGroup}
                  current={mode}
                  onSelect={setChosenMode}
                  icon={Zap}
                  title="Quick plan"
                  meta="Instant"
                  description="Rule-based priorities and a weekly plan from a curated curriculum."
                />
                <ModeOption
                  value="ai"
                  name={modeGroup}
                  current={mode}
                  onSelect={setChosenMode}
                  icon={Sparkles}
                  title="AI-enhanced"
                  meta={`About ${Math.round(AI_EXPECTED_SECONDS / 60)} min`}
                  description="Adds a personal summary, gap explanations, project ideas and interview topics from your local AI model."
                  disabledReason={aiBlockedReason}
                />
              </div>
              {aiBlockedReason && (
                <button
                  type="button"
                  onClick={() => void refreshSystemStatus()}
                  className="mt-2 text-xs text-brand-soft hover:underline"
                >
                  Check AI availability again
                </button>
              )}
            </fieldset>

            <div>
              <Button
                onClick={generate}
                disabled={!ready || problem !== null || running}
                size="lg"
                className="w-full"
                icon={<Wand2 className="size-4" aria-hidden />}
              >
                {running ? "Generating…" : saved ? "Generate a new roadmap" : "Generate my roadmap"}
              </Button>
              <p className="mt-2 text-center text-xs leading-5 text-ink-faint">
                {ready && problem
                  ? problem
                  : ready && skills.length === 0
                    ? "No skills listed. The plan will start from the fundamentals."
                    : mode === "ai"
                      ? "Runs on your computer. You can visit other pages while it works."
                      : "Uses your skills, the job description and the AI Engineer path."}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-8 space-y-6">
        {job.status === "running" && <RoadmapProgress mode={job.mode} startedAt={job.startedAt} />}

        {job.status === "error" && (
          <Alert
            tone="error"
            title={job.mode === "ai" ? "The AI roadmap could not be generated" : "The roadmap could not be generated"}
            onDismiss={dismissRoadmapError}
            actions={
              <>
                <Button size="sm" onClick={generate} disabled={problem !== null}>
                  Try again
                </Button>
                {job.mode === "ai" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={problem !== null}
                    onClick={() => {
                      setChosenMode("quick");
                      void startRoadmap("quick", { skills, jobDescription: jobText, targetWeeks: weeks });
                    }}
                  >
                    Use a quick plan instead
                  </Button>
                )}
              </>
            }
          >
            {job.message}
          </Alert>
        )}

        {!ready ? (
          <Skeleton className="h-72" />
        ) : saved ? (
          <RoadmapResults
            saved={saved}
            stale={
              inputsChanged(saved.request, skills, jobText) || saved.request.targetWeeks !== weeks
            }
          />
        ) : (
          job.status !== "running" && (
            <Card>
              <EmptyState
                icon={<Route className="size-6" aria-hidden />}
                title="Your roadmap will appear here"
                description="Choose a duration and analysis type, then generate. Each week comes with topics, a project milestone and a deliverable."
              />
            </Card>
          )
        )}
      </div>
    </>
  );
}

function WeeksPicker({ value, disabled }: { value: number; disabled: boolean }) {
  const name = useId();
  return (
    <fieldset disabled={disabled}>
      <legend className="mb-2 text-sm font-medium text-ink">Roadmap duration</legend>
      <div className="grid grid-cols-5 gap-1 rounded-xl border border-line-strong bg-canvas/60 p-1">
        {ROADMAP_WEEK_OPTIONS.map((option) => (
          <label
            key={option}
            className={cn(
              "flex cursor-pointer items-center justify-center rounded-lg py-2 text-sm transition-colors",
              "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand",
              option === value ? "bg-brand text-white" : "text-ink-muted hover:bg-white/[0.05] hover:text-ink",
            )}
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={option === value}
              onChange={() => targetWeeksStore.set(option)}
              className="sr-only"
            />
            {option}
            <span className="sr-only"> weeks</span>
          </label>
        ))}
      </div>
      <p className="mt-1.5 text-xs text-ink-faint">Weeks</p>
    </fieldset>
  );
}

function ModeOption({
  value,
  name,
  current,
  onSelect,
  icon: Icon,
  title,
  meta,
  description,
  disabledReason,
}: {
  value: RoadmapMode;
  name: string;
  current: RoadmapMode;
  onSelect: (mode: RoadmapMode) => void;
  icon: LucideIcon;
  title: string;
  meta: string;
  description: string;
  disabledReason?: string | null;
}) {
  const selected = value === current;
  const disabled = Boolean(disabledReason);

  return (
    <label
      className={cn(
        "flex gap-3 rounded-xl border p-3.5 transition-colors",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand",
        disabled
          ? "cursor-not-allowed border-line opacity-60"
          : selected
            ? "cursor-pointer border-brand/60 bg-brand/[0.08]"
            : "cursor-pointer border-line hover:border-line-strong hover:bg-white/[0.02]",
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={selected}
        disabled={disabled}
        onChange={() => onSelect(value)}
        className="sr-only"
      />
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          selected ? "bg-brand text-white" : "bg-white/[0.05] text-ink-muted",
        )}
      >
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <span className="text-sm font-medium text-ink">{title}</span>
          <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-muted">
            {meta}
          </span>
        </span>
        <span className="mt-1 block text-xs leading-5 text-ink-muted">{disabledReason ?? description}</span>
      </span>
    </label>
  );
}
