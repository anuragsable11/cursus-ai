"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Flag,
  Hammer,
  Lightbulb,
  MessagesSquare,
  Sparkles,
  TriangleAlert,
  Zap,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, SectionLabel } from "@/components/ui/card";
import { Chip, ChipList, type ChipTone } from "@/components/ui/chip";
import { coverageBand, Meter, ProgressBar } from "@/components/ui/meter";
import { HeroFigure, Stat } from "@/components/ui/stat";
import { cn } from "@/lib/cn";
import {
  countDone,
  countTopics,
  setTopicDone,
  setWeekDone,
  topicKey,
  useRoadmapProgress,
  weekProgress,
} from "@/lib/progress";
import type { GapExplanation, GapPriority, RoadmapWeek, SavedRoadmap } from "@/lib/types";
import { formatDateTime } from "@/lib/use-now";

const PRIORITY_TONE: Record<GapPriority, ChipTone> = {
  High: "serious",
  Medium: "warning",
  Low: "neutral",
};

type Props = { saved: SavedRoadmap; stale: boolean; onEdit: () => void };

export function RoadmapResults({ saved, stale }: Props) {
  const { result, mode } = saved;
  const isAi = mode === "ai";
  const weeks = result.weekly_roadmap;
  const done = useRoadmapProgress(saved.generatedAt);
  const totalTopics = countTopics(weeks);
  const doneTopics = countDone(weeks, done);
  const band = coverageBand(result.match_score);

  const explanations = result.gap_explanations ?? [];
  const explained = new Set(explanations.map((item) => item.skill.toLowerCase()));
  const otherGaps = result.prioritized_gaps.filter((skill) => !explained.has(skill.toLowerCase()));
  const projects = result.project_recommendations ?? [];
  const interview = result.interview_focus ?? [];

  return (
    <div className="space-y-8 animate-rise">
      {stale && (
        <Alert>
          Your inputs changed since this roadmap was generated. Edit inputs and generate again to refresh it.
        </Alert>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">
            {isAi ? <Sparkles className="size-3.5" aria-hidden /> : <Zap className="size-3.5" aria-hidden />}
            {isAi ? "AI-enhanced roadmap" : "Quick roadmap"}
          </p>
          <h2 className="mt-2 font-display text-[1.75rem] font-medium leading-tight text-ink sm:text-[2rem]">
            Your {result.target_weeks}-week learning plan
          </h2>
          <p className="mt-1 text-sm text-ink-muted">Generated {formatDateTime(saved.generatedAt)}</p>
        </div>
        {totalTopics > 0 && (
          <div className="w-full sm:w-64">
            <div className="flex items-baseline justify-between text-sm">
              <span className="text-ink">
                {doneTopics} of {totalTopics} topics done
              </span>
              <span className="text-ink-faint">{Math.round((doneTopics / totalTopics) * 100)}%</span>
            </div>
            <ProgressBar className="mt-2" value={doneTopics} max={totalTopics} label="Roadmap progress" />
          </div>
        )}
      </div>

      <Card padding="lg">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            <SectionLabel>Job skill coverage</SectionLabel>
            <HeroFigure
              className="mt-3"
              value={`${result.match_score}%`}
              label={`${result.matched_job_skills.length} of ${
                result.matched_job_skills.length + result.job_specific_gaps.length
              } skills this job mentions`}
            />
            <Meter className="mt-5" value={result.match_score} label="Job skill coverage" band={band} />
            <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-ink">
              {band.icon}
              {band.label}
            </p>
          </div>

          <div>
            {result.summary ? (
              <blockquote className="font-display text-[1.15rem] leading-8 text-ink [font-variation-settings:'SOFT'_50]">
                <span className="text-brand-ink">“</span>
                {result.summary}
                <span className="text-brand-ink">”</span>
              </blockquote>
            ) : (
              <p className="text-[15px] leading-7 text-ink">
                This plan combines the skills the job description mentions with the core AI Engineer path, ordered
                from foundations to deployment so each week builds on the last.
              </p>
            )}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <Stat label="Skills to build" value={result.prioritized_gaps.length} />
              <Stat label="Already have" value={result.matched_job_skills.length} />
              <Stat label="Weeks" value={result.target_weeks} />
            </div>
          </div>
        </div>
      </Card>

      <section aria-labelledby="gaps-heading">
        <div className="mb-4 flex items-center gap-2">
          <Flag className="size-4 text-brand-ink" aria-hidden />
          <h3 id="gaps-heading" className="font-semibold text-ink">
            Prioritized skill gaps
          </h3>
          <span className="text-sm text-ink-faint">· ordered so earlier skills unlock later ones</span>
        </div>
        {result.prioritized_gaps.length === 0 ? (
          <Card tone="flat">
            <p className="flex items-center gap-2 text-sm text-ink">
              <CircleCheck className="size-4 text-good" aria-hidden />
              No gaps detected. Your skills cover this job and the core path.
            </p>
          </Card>
        ) : (
          <>
            {explanations.length > 0 && (
              <ol className="grid gap-3 md:grid-cols-2">
                {explanations.map((item, index) => (
                  <GapCard key={item.skill} item={item} index={index} />
                ))}
              </ol>
            )}
            {otherGaps.length > 0 && (
              <div className={cn(explanations.length > 0 && "mt-4")}>
                {explanations.length > 0 && <SectionLabel className="mb-2">Also on your list</SectionLabel>}
                <ChipList items={otherGaps} tone="warning" numbered={explanations.length === 0} />
              </div>
            )}
          </>
        )}
      </section>

      <WeeklyPlan key={saved.generatedAt} weeks={weeks} roadmapId={saved.generatedAt} done={done} />

      {(projects.length > 0 || interview.length > 0) && (
        <div className="grid gap-5 lg:grid-cols-2">
          {projects.length > 0 && (
            <Card title="Portfolio projects" description="Build these to prove the skills." icon={<Hammer aria-hidden />}>
              <ul className="space-y-3">
                {projects.map((project) => (
                  <li key={project.title} className="rounded-xl bg-surface-2/70 p-4">
                    <p className="font-medium text-ink">{project.title}</p>
                    {project.description && <p className="mt-1 text-sm leading-6 text-ink-muted">{project.description}</p>}
                    {project.skills_practiced.length > 0 && (
                      <div className="mt-3">
                        <ChipList items={project.skills_practiced} tone="brand" size="sm" />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {interview.length > 0 && (
            <Card title="Interview preparation" description="Practice answering these out loud." icon={<MessagesSquare aria-hidden />}>
              <ol className="space-y-3">
                {interview.map((topic, index) => (
                  <li key={topic} className="flex gap-3 text-sm leading-6 text-ink">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-tint text-xs font-semibold text-brand-ink">
                      {index + 1}
                    </span>
                    {topic}
                  </li>
                ))}
              </ol>
            </Card>
          )}
        </div>
      )}

      <p className="text-xs leading-5 text-ink-faint">{result.disclaimer}</p>
    </div>
  );
}

function Alert({ children }: { children: ReactNode }) {
  return (
    <div role="status" className="print-hidden flex gap-3 rounded-xl bg-warning-tint p-3.5 text-sm leading-6 text-ink">
      <TriangleAlert className="mt-1 size-4 shrink-0 text-warning" aria-hidden />
      <p>{children}</p>
    </div>
  );
}

function GapCard({ item, index }: { item: GapExplanation; index: number }) {
  return (
    <li className="rounded-2xl bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-medium text-ink">
          <span className="text-xs tabular-nums text-ink-faint">{index + 1}</span>
          {item.skill}
        </p>
        <Chip tone={PRIORITY_TONE[item.priority] ?? "neutral"} size="sm">
          {item.priority} priority
        </Chip>
      </div>
      <p className="mt-2 text-sm leading-6 text-ink-muted">{item.reason}</p>
      <p className="mt-3 flex gap-2 rounded-lg bg-surface-2/70 p-2.5 text-sm leading-6 text-ink">
        <Lightbulb className="mt-1 size-4 shrink-0 text-warning" aria-hidden />
        {item.recommended_action}
      </p>
    </li>
  );
}

function WeeklyPlan({ weeks, roadmapId, done }: { weeks: RoadmapWeek[]; roadmapId: string; done: Record<string, true> }) {
  const firstOpen = weeks.findIndex((week) => !weekProgress(week, done).complete);
  const [selected, setSelected] = useState(firstOpen === -1 ? 0 : firstOpen);
  const index = Math.min(selected, weeks.length - 1);
  const week = weeks[index];
  if (!week) return null;

  return (
    <section aria-labelledby="weeks-heading">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 id="weeks-heading" className="font-semibold text-ink">
          Week by week
        </h3>
        <div className="print-hidden flex items-center gap-1">
          <Button variant="ghost" size="sm" disabled={index === 0} onClick={() => setSelected(index - 1)} icon={<ChevronLeft aria-hidden />}>
            Previous
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={index === weeks.length - 1}
            onClick={() => setSelected(index + 1)}
          >
            Next
            <ChevronRight aria-hidden />
          </Button>
        </div>
      </div>

      <div role="tablist" aria-label="Weeks" className="print-hidden -mx-1 flex gap-1 overflow-x-auto px-1 pb-2">
        {weeks.map((item, tabIndex) => {
          const progress = weekProgress(item, done);
          const active = tabIndex === index;
          return (
            <button
              key={item.week}
              role="tab"
              type="button"
              id={`week-tab-${item.week}`}
              aria-selected={active}
              aria-controls={`week-panel-${item.week}`}
              onClick={() => setSelected(tabIndex)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm transition-colors",
                active ? "bg-surface font-medium text-ink shadow-card" : "text-ink-muted hover:bg-surface-2 hover:text-ink",
              )}
            >
              {progress.complete ? (
                <span className="flex size-4 items-center justify-center rounded-full bg-good text-white" aria-hidden>
                  <Check className="size-3" strokeWidth={3} />
                </span>
              ) : (
                <span
                  className={cn("size-2 rounded-full", progress.completed > 0 ? "bg-brand" : "bg-line-strong")}
                  aria-hidden
                />
              )}
              Week {item.week}
              <span className="sr-only">
                , {progress.completed} of {progress.total} topics done
              </span>
            </button>
          );
        })}
      </div>

      {weeks.map((item, panelIndex) => (
        <WeekPanel
          key={item.week}
          week={item}
          roadmapId={roadmapId}
          done={done}
          hidden={panelIndex !== index}
        />
      ))}
    </section>
  );
}

function WeekPanel({
  week,
  roadmapId,
  done,
  hidden,
}: {
  week: RoadmapWeek;
  roadmapId: string;
  done: Record<string, true>;
  hidden: boolean;
}) {
  const progress = weekProgress(week, done);
  const title = week.title.replace(/^Week \d+:\s*/, "");

  return (
    <div
      role="tabpanel"
      id={`week-panel-${week.week}`}
      aria-labelledby={`week-tab-${week.week}`}
      className={cn(
        "mt-3 rounded-2xl bg-surface p-5 shadow-card sm:p-6",
        // A class, not the hidden attribute: Tailwind's base [hidden] rule
        // is !important and would beat the print override.
        hidden && "hidden print:mt-6 print:block",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <SectionLabel>Week {week.week}</SectionLabel>
          <h4 className="mt-1 font-display text-xl font-medium text-ink">{title || "Review and practice"}</h4>
          {progress.total > 0 && (
            <p className="mt-1 text-xs text-ink-faint">
              {progress.completed} of {progress.total} topics done
            </p>
          )}
        </div>
        {progress.total > 0 && (
          <Button
            variant={progress.complete ? "ghost" : "secondary"}
            size="sm"
            className="print-hidden"
            onClick={() => setWeekDone(roadmapId, week, !progress.complete)}
            icon={progress.complete ? undefined : <Check aria-hidden />}
          >
            {progress.complete ? "Mark week incomplete" : "Mark week complete"}
          </Button>
        )}
      </div>

      {week.activities.length > 0 ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {week.activities.map((activity) => (
            <div key={activity.skill} className="rounded-xl bg-surface-2/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink">{activity.skill}</p>
                {activity.level && <span className="text-xs text-ink-faint">{activity.level}</span>}
              </div>
              <ul className="mt-3 space-y-1">
                {activity.topics.map((topic) => {
                  const key = topicKey(week.week, activity.skill, topic);
                  const checked = Boolean(done[key]);
                  return (
                    <li key={topic}>
                      <label className="flex cursor-pointer items-start gap-2.5 rounded-lg px-1.5 py-1.5 text-sm leading-5 transition-colors hover:bg-surface">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) => setTopicDone(roadmapId, key, event.target.checked)}
                          className="mt-0.5 size-4 shrink-0 cursor-pointer rounded accent-brand"
                        />
                        <span className={cn(checked ? "text-ink-faint line-through decoration-ink-faint/60" : "text-ink")}>
                          {topic}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              {activity.project && (
                <p className="mt-3 flex gap-2 rounded-lg bg-surface p-2.5 text-xs leading-5 text-ink-muted shadow-card">
                  <Hammer className="mt-0.5 size-3.5 shrink-0 text-brand-ink" aria-hidden />
                  <span>
                    <span className="font-medium text-ink">Project · </span>
                    {activity.project}
                  </span>
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-ink-muted">Consolidate earlier weeks and polish your projects.</p>
      )}

      {week.deliverable && (
        <p className="mt-5 flex gap-2 border-t border-line pt-4 text-sm leading-6 text-ink-muted">
          <Flag className="mt-1 size-4 shrink-0 text-good" aria-hidden />
          <span>
            <span className="font-medium text-ink">Deliverable · </span>
            {week.deliverable}
          </span>
        </p>
      )}
    </div>
  );
}
