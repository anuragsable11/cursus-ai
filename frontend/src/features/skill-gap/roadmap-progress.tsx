"use client";

import { LoaderCircle, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AI_EXPECTED_SECONDS } from "@/lib/config";
import { cancelRoadmap } from "@/lib/roadmap-job";
import type { RoadmapMode } from "@/lib/types";
import { formatDuration, useNow } from "@/lib/use-now";

const AI_STAGES: { from: number; label: string }[] = [
  { from: 0, label: "Reading the job description" },
  { from: 15, label: "Comparing it with your skills" },
  { from: 35, label: "Explaining your most important gaps" },
  { from: 80, label: "Suggesting projects and interview topics" },
  { from: AI_EXPECTED_SECONDS + 20, label: "Finishing up. Slower computers can take a little longer" },
];

export function RoadmapProgress({ mode, startedAt }: { mode: RoadmapMode; startedAt: number }) {
  const now = useNow();
  const elapsed = now ? Math.max(0, (now - startedAt) / 1000) : 0;

  if (mode === "quick") {
    return (
      <Card>
        <div className="flex items-center gap-3 text-sm text-ink-muted">
          <LoaderCircle className="size-5 animate-spin text-brand-soft" aria-hidden />
          Building your roadmap…
        </div>
      </Card>
    );
  }

  // Ease toward 95% so the bar never claims to be finished early.
  const progress = Math.min(95, (1 - Math.exp(-elapsed / (AI_EXPECTED_SECONDS * 0.6))) * 100);
  const stage = [...AI_STAGES].reverse().find((item) => elapsed >= item.from) ?? AI_STAGES[0];

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10">
            <LoaderCircle className="size-5 animate-spin text-brand-soft" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="font-semibold text-ink">Generating your AI-enhanced roadmap</h2>
            <p className="mt-1 text-sm text-ink-muted" aria-live="polite">
              {stage.label}…
            </p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={cancelRoadmap} icon={<Square className="size-3" aria-hidden />}>
          Cancel
        </Button>
      </div>

      <div
        className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.06]"
        role="progressbar"
        aria-label="Estimated progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <div
          className="h-full rounded-full bg-linear-to-r from-violet-500 to-indigo-400 transition-[width] duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-ink-faint">
        <span>
          Elapsed <span className="tabular-nums text-ink-muted">{formatDuration(elapsed)}</span> · usually about{" "}
          {Math.round(AI_EXPECTED_SECONDS / 60)} minutes
        </span>
        <span>You can use other pages meanwhile. The result is saved automatically.</span>
      </div>
    </Card>
  );
}
