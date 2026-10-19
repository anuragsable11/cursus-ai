"use client";

import { Printer, Route, Sparkles, WandSparkles, Zap, type LucideIcon } from "lucide-react";
import { useId, useState } from "react";

import { InputsSummary, SummaryItem } from "@/components/inputs-summary";
import { JobDescriptionField } from "@/components/job-description-field";
import { SkillsPanel } from "@/components/skills-panel";
import { Alert } from "@/components/ui/alert";
import { Button, TextButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageBody, PageHeader } from "@/components/ui/page-header";
import { Segmented } from "@/components/ui/segmented";
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
  const [editing, setEditing] = useState(false);
  const modeGroup = useId();

  const skills = profile?.skills ?? [];
  const jobText = jobDescription ?? "";
  const weeks = storedWeeks ?? 4;
  const running = job.status === "running";
  const stale = saved ? inputsChanged(saved.request, skills, jobText) || saved.request.targetWeeks !== weeks : false;
  const showForm = !saved || editing;

  const aiBlockedReason =
    system.backend === "offline"
      ? "The backend is offline."
      : system.ai && !system.ai.available
        ? system.ai.message
        : null;
  const aiReady = system.backend === "online" && system.ai?.available === true;
  const mode: RoadmapMode =
    chosenMode === "ai" && aiBlockedReason ? "quick" : (chosenMode ?? (aiReady ? "ai" : "quick"));

  const problem =
    jobText.trim().length < LIMITS.minJobDescription
      ? `Add a job description of at least ${LIMITS.minJobDescription} characters.`
      : null;

  function generate(useMode: RoadmapMode = mode) {
    if (problem || running) return;
    setEditing(false);
    void startRoadmap(useMode, { skills, jobDescription: jobText, targetWeeks: weeks });
  }

  return (
    <>
      <PageHeader
        eyebrow="Step 3 of 3"
        title="Skill Gap Roadmap"
        description="Prioritize the skills to strengthen for your target job, then follow a week-by-week plan with projects and check off what you learn."
        actions={
          saved && !showForm ? (
            <Button variant="secondary" onClick={() => window.print()} icon={<Printer aria-hidden />}>
              Print or save PDF
            </Button>
          ) : undefined
        }
      />

      <PageBody>
        {!ready ? (
          <Skeleton className="h-96 rounded-xl" />
        ) : showForm ? (
          <Card className="print-hidden" padding="none">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
              <div className="space-y-6 p-5 sm:p-6">
                <SkillsPanel />
                <JobDescriptionField rows={8} />
              </div>

              <div className="space-y-6 border-t border-line bg-canvas p-5 sm:p-6 lg:border-t-0 lg:border-l">
                <div>
                  <p className="mb-2 text-sm font-medium text-ink">Duration</p>
                  <Segmented
                    label="Roadmap duration in weeks"
                    value={weeks}
                    disabled={running}
                    onChange={(value) => targetWeeksStore.set(value)}
                    options={ROADMAP_WEEK_OPTIONS.map((option) => ({ value: option as number, label: `${option}w` }))}
                  />
                </div>

                <fieldset disabled={running}>
                  <legend className="mb-2 text-sm font-medium text-ink">Analysis</legend>
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
                      meta={`~${Math.round(AI_EXPECTED_SECONDS / 60)} min`}
                      description="Adds a personal summary, gap explanations, project ideas and interview topics from your local model."
                      disabledReason={aiBlockedReason}
                    />
                  </div>
                  {aiBlockedReason && (
                    <TextButton className="mt-2" onClick={() => void refreshSystemStatus()}>
                      Check AI availability again
                    </TextButton>
                  )}
                </fieldset>

                <div>
                  <Button
                    onClick={() => generate()}
                    disabled={problem !== null || running}
                    size="lg"
                    className="w-full"
                    icon={<WandSparkles aria-hidden />}
                  >
                    {running ? "Generating…" : saved ? "Generate new roadmap" : "Generate my roadmap"}
                  </Button>
                  {saved && !running && (
                    <Button variant="ghost" className="mt-2 w-full" onClick={() => setEditing(false)}>
                      Keep current roadmap
                    </Button>
                  )}
                  <p className="mt-3 text-center text-[13px] leading-5 text-ink-faint">
                    {problem
                      ? problem
                      : skills.length === 0
                        ? "No skills listed, so the plan starts from the fundamentals."
                        : mode === "ai"
                          ? "Runs on your computer. You can browse other pages while it works."
                          : "Based on your skills, the job description and the AI Engineer path."}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <InputsSummary
            skills={skills}
            jobDescription={jobText}
            stale={stale}
            onEdit={() => setEditing(true)}
            extra={
              <>
                <SummaryItem label="Duration" value={`${saved.request.targetWeeks} weeks`} />
                <SummaryItem label="Type" value={saved.mode === "ai" ? "AI-enhanced" : "Quick plan"} />
              </>
            }
          />
        )}

        <div className="mt-6 space-y-6">
          {job.status === "running" && <RoadmapProgress mode={job.mode} startedAt={job.startedAt} />}

          {job.status === "error" && (
            <Alert
              tone="error"
              title={job.mode === "ai" ? "The AI roadmap couldn't be generated" : "The roadmap couldn't be generated"}
              onDismiss={dismissRoadmapError}
              actions={
                <>
                  <Button size="sm" onClick={() => generate(job.mode)} disabled={problem !== null}>
                    Try again
                  </Button>
                  {job.mode === "ai" && (
                    <Button size="sm" variant="secondary" disabled={problem !== null} onClick={() => generate("quick")}>
                      Use a quick plan instead
                    </Button>
                  )}
                </>
              }
            >
              {job.message}
            </Alert>
          )}

          {ready && saved ? (
            <RoadmapResults saved={saved} stale={stale} onEdit={() => setEditing(true)} />
          ) : (
            ready &&
            job.status !== "running" && (
              <Card tone="flat">
                <EmptyState
                  icon={<Route aria-hidden />}
                  title="Your roadmap will appear here"
                  description="Pick a duration and analysis type, then generate. Each week comes with topics to tick off, a project milestone and a deliverable."
                />
              </Card>
            )
          )}
        </div>
      </PageBody>
    </>
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
        "flex gap-3 rounded-lg bg-surface p-3.5 transition-shadow",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
        disabled
          ? "cursor-not-allowed opacity-60 shadow-field"
          : selected
            ? "cursor-pointer shadow-[0_0_0_1.5px_var(--ink)]"
            : "cursor-pointer shadow-field hover:shadow-field-hover",
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
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full transition-shadow",
          selected ? "shadow-[0_0_0_1.5px_var(--ink)]" : "shadow-[0_0_0_1px_var(--line-hover)]",
        )}
        aria-hidden
      >
        {selected && <span className="size-2 rounded-full bg-ink" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-sm font-medium text-ink">
            <Icon className="size-3.5 text-ink-muted" aria-hidden />
            {title}
          </span>
          <span className="font-mono text-[11px] text-ink-faint">{meta}</span>
        </span>
        <span className="mt-1 block text-[13px] leading-5 text-ink-muted">{disabledReason ?? description}</span>
      </span>
    </label>
  );
}
