"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Flag,
  Hammer,
  Lightbulb,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState, type ChangeEvent } from "react";

import { MatchVerdictBlock } from "@/components/match-verdict";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, SectionLabel } from "@/components/ui/card";
import { CheckboxBox } from "@/components/ui/checkbox";
import { Chip, ChipList, type ChipTone } from "@/components/ui/chip";
import { CountUp } from "@/components/ui/count-up";
import { ProgressBar } from "@/components/ui/meter";
import { Stat, StatGroup } from "@/components/ui/stat";
import { cn } from "@/lib/cn";
import { verdictForRoadmap } from "@/lib/match-verdict";
import { celebrate, centerOf } from "@/lib/motion";
import {
  countDone,
  countTopics,
  setTopicDone,
  setWeekDone,
  topicKey,
  useRoadmapProgress,
  weekProgress,
} from "@/lib/progress";
import { pushToast } from "@/lib/toasts";
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
  const verdict = verdictForRoadmap(result);

  const explanations = result.gap_explanations ?? [];
  const explained = new Set(explanations.map((item) => item.skill.toLowerCase()));
  const otherGaps = result.prioritized_gaps.filter((skill) => !explained.has(skill.toLowerCase()));
  const projects = result.project_recommendations ?? [];
  const interview = result.interview_focus ?? [];

  return (
    <div className="space-y-10 animate-rise">
      {stale && (
        <Alert tone="warning" className="print-hidden">
          Your inputs changed since this roadmap was generated. Edit inputs and generate again to refresh it.
        </Alert>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-[13px] text-ink-muted">
            {isAi ? <Sparkles className="size-3.5" aria-hidden /> : <Zap className="size-3.5" aria-hidden />}
            {isAi ? "AI-enhanced roadmap" : "Quick roadmap"}
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-ink">
            Your {result.target_weeks}-week learning plan
          </h2>
          <p className="mt-1 text-sm text-ink-muted">Generated {formatDateTime(saved.generatedAt)}</p>
        </div>
        {totalTopics > 0 && (
          <div className="w-full sm:w-64">
            <div className="flex items-baseline justify-between text-[13px]">
              <span className="text-ink">
                {doneTopics} of {totalTopics} topics done
              </span>
              <span className="font-mono text-xs tabular-nums text-ink-faint">
                {Math.round((doneTopics / totalTopics) * 100)}%
              </span>
            </div>
            <ProgressBar className="mt-2" value={doneTopics} max={totalTopics} label="Roadmap progress" />
          </div>
        )}
      </div>

      <Card padding="lg">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10">
          <MatchVerdictBlock verdict={verdict} label="Match with this job" />

          <div className="lg:border-l lg:border-line lg:pl-10">
            {result.summary ? (
              <blockquote className="border-l-2 border-line-strong pl-4 text-[15px] leading-7 text-ink">
                {result.summary}
              </blockquote>
            ) : (
              <p className="text-[15px] leading-7 text-ink">
                This plan combines the skills the job description mentions with the core AI Engineer path, ordered
                from foundations to deployment so each week builds on the last.
              </p>
            )}
            <StatGroup className="mt-6">
              <Stat label="Skills to build" value={<CountUp value={result.prioritized_gaps.length} />} />
              <Stat label="Already have" value={<CountUp value={result.matched_job_skills.length} />} />
              <Stat label="Weeks" value={<CountUp value={result.target_weeks} />} />
            </StatGroup>
          </div>
        </div>
      </Card>

      <section aria-labelledby="gaps-heading">
        <div className="mb-4">
          <h3 id="gaps-heading" className="text-base font-semibold tracking-[-0.01em] text-ink">
            Prioritized skill gaps
          </h3>
          <p className="mt-0.5 text-sm text-ink-muted">Ordered so earlier skills unlock later ones.</p>
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
              <ol className="grid gap-4 md:grid-cols-2">
                {explanations.map((item, index) => (
                  <GapCard key={item.skill} item={item} index={index} />
                ))}
              </ol>
            )}
            {otherGaps.length > 0 && (
              <div className={cn(explanations.length > 0 && "mt-5")}>
                {explanations.length > 0 && <SectionLabel className="mb-2">Also on your list</SectionLabel>}
                <ChipList items={otherGaps} tone="warning" numbered={explanations.length === 0} />
              </div>
            )}
          </>
        )}
      </section>

      <WeeklyPlan
        key={saved.generatedAt}
        weeks={weeks}
        roadmapId={saved.generatedAt}
        done={done}
        planDone={doneTopics}
        planTotal={totalTopics}
      />

      {(projects.length > 0 || interview.length > 0) && (
        <div className="grid items-start gap-6 lg:grid-cols-2">
          {projects.length > 0 && (
            <Card title="Portfolio projects" description="Build these to prove the skills.">
              <ul className="space-y-3">
                {projects.map((project) => (
                  <li key={project.title} className="rounded-lg border border-line p-4">
                    <p className="flex items-center gap-2 text-sm font-medium text-ink">
                      <Hammer className="size-3.5 shrink-0 text-ink-faint" aria-hidden />
                      {project.title}
                    </p>
                    {project.description && <p className="mt-1.5 text-sm leading-6 text-ink-muted">{project.description}</p>}
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
            <Card title="Interview preparation" description="Practice answering these out loud.">
              <ol className="divide-y divide-line">
                {interview.map((topic, index) => (
                  <li key={topic} className="flex gap-3 py-2.5 text-sm leading-6 text-ink first:pt-0 last:pb-0">
                    <span className="w-5 shrink-0 pt-px font-mono text-xs leading-6 tabular-nums text-ink-faint">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {topic}
                  </li>
                ))}
              </ol>
            </Card>
          )}
        </div>
      )}

      <p className="text-[13px] leading-5 text-ink-faint">{result.disclaimer}</p>
    </div>
  );
}

function GapCard({ item, index }: { item: GapExplanation; index: number }) {
  return (
    <li className="flex flex-col rounded-xl border border-line bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <p className="flex items-baseline gap-2.5 font-medium text-ink">
          <span className="font-mono text-xs tabular-nums text-ink-faint">{String(index + 1).padStart(2, "0")}</span>
          {item.skill}
        </p>
        <Chip tone={PRIORITY_TONE[item.priority] ?? "neutral"} size="sm" className="shrink-0">
          {item.priority} priority
        </Chip>
      </div>
      <p className="mt-2 flex-1 text-sm leading-6 text-ink-muted">{item.reason}</p>
      <p className="mt-4 flex gap-2 border-t border-line pt-3 text-sm leading-6 text-ink">
        <Lightbulb className="mt-1 size-4 shrink-0 text-warning" aria-hidden />
        {item.recommended_action}
      </p>
    </li>
  );
}

type PlanTotals = { planDone: number; planTotal: number };

function WeeklyPlan({
  weeks,
  roadmapId,
  done,
  planDone,
  planTotal,
}: { weeks: RoadmapWeek[]; roadmapId: string; done: Record<string, true> } & PlanTotals) {
  const firstOpen = weeks.findIndex((week) => !weekProgress(week, done).complete);
  const [selected, setSelected] = useState(firstOpen === -1 ? 0 : firstOpen);
  const index = Math.min(selected, weeks.length - 1);
  const week = weeks[index];
  if (!week) return null;

  return (
    <section aria-labelledby="weeks-heading">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h3 id="weeks-heading" className="text-base font-semibold tracking-[-0.01em] text-ink">
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

      <div role="tablist" aria-label="Weeks" className="print-hidden flex gap-1 overflow-x-auto border-b border-line [scrollbar-width:none]">
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
                "relative flex h-10 shrink-0 items-center gap-2 px-3 text-sm transition-colors focus-visible:outline-offset-[-2px]",
                active ? "text-ink" : "text-ink-muted hover:text-ink",
              )}
            >
              {progress.complete ? (
                <Check className="size-3.5 text-good" strokeWidth={3} aria-hidden />
              ) : (
                <span
                  className={cn("size-1.5 rounded-full", progress.completed > 0 ? "bg-ink" : "bg-line-hover")}
                  aria-hidden
                />
              )}
              Week {item.week}
              <span className="sr-only">
                , {progress.completed} of {progress.total} topics done
              </span>
              {active && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-ink" aria-hidden />}
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
          planDone={planDone}
          planTotal={planTotal}
        />
      ))}
    </section>
  );
}

function celebratePlan() {
  celebrate(undefined, 220);
  pushToast({
    tone: "success",
    title: "Roadmap complete",
    description: "Every topic is ticked off. Time to ship those projects.",
  });
}

function WeekPanel({
  week,
  roadmapId,
  done,
  hidden,
  planDone,
  planTotal,
}: {
  week: RoadmapWeek;
  roadmapId: string;
  done: Record<string, true>;
  hidden: boolean;
} & PlanTotals) {
  const progress = weekProgress(week, done);

  function toggleTopic(key: string, event: ChangeEvent<HTMLInputElement>) {
    const checked = event.target.checked;
    setTopicDone(roadmapId, key, checked);
    if (!checked) return;
    if (planDone + 1 === planTotal) celebratePlan();
    else if (progress.completed + 1 === progress.total) celebrate(centerOf(event.target));
  }

  function toggleWeek(element: HTMLElement) {
    const completing = !progress.complete;
    setWeekDone(roadmapId, week, completing);
    if (!completing) return;
    if (planDone - progress.completed + progress.total === planTotal) celebratePlan();
    else celebrate(centerOf(element));
  }
  const title = week.title.replace(/^Week \d+:\s*/, "");

  return (
    <div
      role="tabpanel"
      id={`week-panel-${week.week}`}
      aria-labelledby={`week-tab-${week.week}`}
      className={cn(
        "mt-4 rounded-xl border border-line bg-surface p-5 shadow-card sm:p-6",
        // A class, not the hidden attribute: Tailwind's base [hidden] rule
        // is !important and would beat the print override.
        hidden && "hidden print:mt-6 print:block",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <SectionLabel>Week {week.week}</SectionLabel>
          <h4 className="mt-1 text-lg font-semibold tracking-[-0.02em] text-ink">{title || "Review and practice"}</h4>
          {progress.total > 0 && (
            <p className="mt-0.5 text-[13px] tabular-nums text-ink-faint">
              {progress.completed} of {progress.total} topics done
            </p>
          )}
        </div>
        {progress.total > 0 && (
          <Button
            variant={progress.complete ? "ghost" : "secondary"}
            size="sm"
            className="print-hidden"
            onClick={(event) => toggleWeek(event.currentTarget)}
            icon={progress.complete ? undefined : <Check aria-hidden />}
          >
            {progress.complete ? "Mark week incomplete" : "Mark week complete"}
          </Button>
        )}
      </div>

      {week.activities.length > 0 ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {week.activities.map((activity) => (
            <div key={activity.skill} className="flex flex-col rounded-lg border border-line p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink">{activity.skill}</p>
                {activity.level && <span className="text-xs text-ink-faint">{activity.level}</span>}
              </div>
              <ul className="mt-2 flex-1 space-y-0.5">
                {activity.topics.map((topic) => {
                  const key = topicKey(week.week, activity.skill, topic);
                  const checked = Boolean(done[key]);
                  return (
                    <li key={topic}>
                      <label className="-mx-1.5 flex cursor-pointer items-start gap-2.5 rounded-md px-1.5 py-1.5 text-sm leading-5 transition-colors hover:bg-surface-2">
                        <CheckboxBox className="mt-0.5" checked={checked} onChange={(event) => toggleTopic(key, event)} />
                        <span
                          className={cn(
                            "transition-colors duration-200",
                            checked ? "text-ink-faint line-through decoration-ink-faint/60" : "text-ink",
                          )}
                        >
                          {topic}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              {activity.project && (
                <p className="mt-3 flex gap-2 border-t border-line pt-3 text-[13px] leading-5 text-ink-muted">
                  <Hammer className="mt-0.5 size-3.5 shrink-0 text-ink-faint" aria-hidden />
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
