"use client";

import {
  CalendarDays,
  CircleCheck,
  Flag,
  Hammer,
  Lightbulb,
  MessagesSquare,
  Printer,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip, ChipList, type ChipTone } from "@/components/ui/chip";
import { ScoreRing } from "@/components/ui/score-ring";
import { Stat } from "@/components/ui/stat";
import type { GapExplanation, GapPriority, RoadmapWeek, SavedRoadmap } from "@/lib/types";
import { formatDateTime } from "@/lib/use-now";

const PRIORITY_TONE: Record<GapPriority, ChipTone> = {
  High: "danger",
  Medium: "warning",
  Low: "neutral",
};

export function RoadmapResults({ saved, stale }: { saved: SavedRoadmap; stale: boolean }) {
  const { result, mode } = saved;
  const isAi = mode === "ai";
  const explanations = result.gap_explanations ?? [];
  const explained = new Set(explanations.map((item) => item.skill.toLowerCase()));
  const otherGaps = result.prioritized_gaps.filter((skill) => !explained.has(skill.toLowerCase()));
  const projects = result.project_recommendations ?? [];
  const interview = result.interview_focus ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-brand-soft">
            {isAi ? <Sparkles className="size-3.5" aria-hidden /> : <Zap className="size-3.5" aria-hidden />}
            {isAi ? "AI-enhanced roadmap" : "Quick roadmap"}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            Your {result.target_weeks}-week learning plan
          </h2>
          <p className="mt-1 text-sm text-ink-muted">Generated {formatDateTime(saved.generatedAt)}</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => window.print()}
          icon={<Printer className="size-3.5" aria-hidden />}
          className="print:hidden"
        >
          Print or save as PDF
        </Button>
      </div>

      {stale && (
        <Alert tone="warning" className="print:hidden">
          Your skills, job description or duration changed since this roadmap was generated. Generate a new one to
          update it.
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Card className="flex flex-col items-center justify-center text-center">
          <ScoreRing score={result.match_score} label="Job skill coverage" />
          <div className="mt-6 grid w-full grid-cols-2 gap-3">
            <Stat label="Skills to build" value={result.prioritized_gaps.length} icon={<TrendingUp className="size-4 text-warning" aria-hidden />} />
            <Stat label="Already have" value={result.matched_job_skills.length} icon={<CircleCheck className="size-4 text-success" aria-hidden />} />
          </div>
        </Card>

        <Card
          title={isAi ? "Summary" : "Where you stand"}
          icon={isAi ? <Sparkles className="size-4" aria-hidden /> : <Target className="size-4" aria-hidden />}
        >
          {result.summary ? (
            <p className="text-sm leading-7 text-ink">{result.summary}</p>
          ) : (
            <p className="text-sm leading-7 text-ink-muted">
              This plan combines skills the job description mentions with the core AI Engineer path, ordered from
              foundations to deployment.
            </p>
          )}
          <div className="mt-5 space-y-4">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-faint">Matched job skills</p>
              <ChipList items={result.matched_job_skills} tone="success" empty="None detected yet." />
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-ink-faint">Gaps named in the job</p>
              <ChipList items={result.job_specific_gaps} tone="warning" empty="None. Remaining gaps come from the AI Engineer path." />
            </div>
          </div>
        </Card>
      </div>

      <Card
        title="Prioritized skill gaps"
        description="Ordered by learning dependency, so earlier skills unlock later ones."
        icon={<Flag className="size-4" aria-hidden />}
      >
        {explanations.length > 0 && (
          <ul className="mb-5 grid gap-3 md:grid-cols-2">
            {explanations.map((item) => (
              <GapCard key={item.skill} item={item} />
            ))}
          </ul>
        )}
        {otherGaps.length > 0 && (
          <>
            {explanations.length > 0 && (
              <p className="mb-2.5 text-xs font-medium uppercase tracking-wider text-ink-faint">Also on your list</p>
            )}
            <ChipList items={otherGaps} tone="warning" numbered={explanations.length === 0} />
          </>
        )}
        {result.prioritized_gaps.length === 0 && (
          <p className="text-sm text-success">No gaps detected. Your skills cover this job and the core path.</p>
        )}
      </Card>

      <section aria-labelledby="weekly-heading">
        <h3 id="weekly-heading" className="mb-4 flex items-center gap-2 text-lg font-semibold text-ink">
          <CalendarDays className="size-5 text-brand-soft" aria-hidden />
          Week by week
        </h3>
        <ol className="relative space-y-4 border-l border-line pl-6 sm:pl-8">
          {result.weekly_roadmap.map((week) => (
            <WeekCard key={week.week} week={week} />
          ))}
        </ol>
      </section>

      {(projects.length > 0 || interview.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {projects.length > 0 && (
            <Card title="Portfolio projects" icon={<Hammer className="size-4" aria-hidden />}>
              <ul className="space-y-4">
                {projects.map((project) => (
                  <li key={project.title} className="rounded-xl border border-line bg-white/[0.02] p-4">
                    <p className="font-medium text-ink">{project.title}</p>
                    {project.description && (
                      <p className="mt-1 text-sm leading-6 text-ink-muted">{project.description}</p>
                    )}
                    {project.skills_practiced.length > 0 && (
                      <div className="mt-3">
                        <ChipList items={project.skills_practiced} tone="brand" />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {interview.length > 0 && (
            <Card title="Interview preparation" icon={<MessagesSquare className="size-4" aria-hidden />}>
              <ol className="space-y-3">
                {interview.map((topic, index) => (
                  <li key={topic} className="flex gap-3 text-sm leading-6 text-ink-muted">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs font-medium tabular-nums text-brand-soft">
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

function GapCard({ item }: { item: GapExplanation }) {
  return (
    <li className="rounded-xl border border-line bg-white/[0.02] p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-ink">{item.skill}</p>
        <Chip tone={PRIORITY_TONE[item.priority] ?? "neutral"}>{item.priority} priority</Chip>
      </div>
      <p className="mt-2 text-sm leading-6 text-ink-muted">{item.reason}</p>
      <p className="mt-3 flex gap-2 text-sm leading-6 text-ink">
        <Lightbulb className="mt-1 size-4 shrink-0 text-warning" aria-hidden />
        {item.recommended_action}
      </p>
    </li>
  );
}

function WeekCard({ week }: { week: RoadmapWeek }) {
  const title = week.title.replace(/^Week \d+:\s*/, "");

  return (
    <li className="relative break-inside-avoid">
      <span className="absolute top-5 -left-[31px] flex size-3.5 items-center justify-center rounded-full border-2 border-brand bg-canvas sm:-left-[39px]" aria-hidden />
      <article className="rounded-2xl border border-line bg-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-soft">Week {week.week}</p>
        <h4 className="mt-1 text-base font-semibold text-ink">{title || "Review and practice"}</h4>

        {week.activities.length > 0 ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {week.activities.map((activity) => (
              <div key={activity.skill} className="rounded-xl border border-line bg-white/[0.02] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-ink">{activity.skill}</p>
                  {activity.level && <span className="text-xs text-ink-faint">{activity.level}</span>}
                </div>
                <ul className="mt-3 space-y-1.5">
                  {activity.topics.map((topic) => (
                    <li key={topic} className="flex gap-2 text-sm leading-5 text-ink-muted">
                      <CircleCheck className="mt-0.5 size-3.5 shrink-0 text-brand-soft" aria-hidden />
                      {topic}
                    </li>
                  ))}
                </ul>
                {activity.project && (
                  <p className="mt-3 rounded-lg bg-canvas/60 p-2.5 text-xs leading-5 text-ink-muted">
                    <span className="font-medium text-ink">Project: </span>
                    {activity.project}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-ink-muted">Consolidate earlier weeks and polish your projects.</p>
        )}

        {week.deliverable && (
          <p className="mt-4 border-t border-line pt-3 text-sm leading-6 text-ink-muted">
            <span className="font-medium text-success">Deliverable: </span>
            {week.deliverable}
          </p>
        )}
      </article>
    </li>
  );
}
