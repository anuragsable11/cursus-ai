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
      <Card tone="flat">
        <div className="flex items-center gap-3 text-sm text-ink-muted">
          <LoaderCircle className="size-5 animate-spin text-brand-ink" aria-hidden />
          Building your roadmap…
        </div>
      </Card>
    );
  }

  // Ease toward 95% so the bar never claims to be finished early.
  const progress = Math.min(95, (1 - Math.exp(-elapsed / (AI_EXPECTED_SECONDS * 0.6))) * 100);
  const stage = [...AI_STAGES].reverse().find((item) => elapsed >= item.from) ?? AI_STAGES[0];

  return (
    <Card tone="tint" className="print-hidden animate-rise">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface shadow-card">
            <LoaderCircle className="size-5 animate-spin text-brand-ink" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="font-semibold text-ink">Generating your AI-enhanced roadmap</h2>
            <p className="mt-0.5 text-sm text-ink-muted" aria-live="polite">
              {stage.label}…
            </p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={cancelRoadmap} icon={<Square aria-hidden />}>
          Cancel
        </Button>
      </div>

      <div
        className="mt-5 h-2 overflow-hidden rounded-full bg-surface"
        role="progressbar"
        aria-label="Estimated progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <div className="h-full rounded-full bg-brand transition-[width] duration-1000 ease-linear" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-ink-muted">
        <span>
          Elapsed <span className="tabular-nums text-ink">{formatDuration(elapsed)}</span> · usually about{" "}
          {Math.round(AI_EXPECTED_SECONDS / 60)} minutes
        </span>
        <span>Browse other pages meanwhile. We&apos;ll let you know when it&apos;s ready.</span>
      </div>
    </Card>
  );
}
