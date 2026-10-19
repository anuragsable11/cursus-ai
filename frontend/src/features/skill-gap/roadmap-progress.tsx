"use client";

import { LoaderCircle, Square } from "lucide-react";
import { useLayoutEffect, useRef } from "react";

import { LiveElapsed } from "@/components/live-elapsed";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AI_EXPECTED_SECONDS } from "@/lib/config";
import { cancelRoadmap } from "@/lib/roadmap-job";
import type { RoadmapMode } from "@/lib/types";

const AI_STAGES: { from: number; label: string }[] = [
  { from: 0, label: "Reading the job description" },
  { from: 15, label: "Comparing it with your skills" },
  { from: 35, label: "Explaining your most important gaps" },
  { from: 80, label: "Suggesting projects and interview topics" },
  { from: AI_EXPECTED_SECONDS + 20, label: "Finishing up. Slower computers can take a little longer" },
];

function stageFor(elapsed: number) {
  return [...AI_STAGES].reverse().find((item) => elapsed >= item.from) ?? AI_STAGES[0];
}

// Ease toward 95% so the bar never claims to be finished early.
function estimatedProgress(elapsed: number) {
  return Math.min(95, (1 - Math.exp(-elapsed / (AI_EXPECTED_SECONDS * 0.6))) * 100);
}

export function RoadmapProgress({ mode, startedAt }: { mode: RoadmapMode; startedAt: number }) {
  const barRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLParagraphElement>(null);

  // Live values are written straight to the DOM once a second. Re-rendering
  // through React on every tick stalls route transitions on busy machines.
  useLayoutEffect(() => {
    if (mode !== "ai") return;
    const update = () => {
      const elapsed = Math.max(0, (Date.now() - startedAt) / 1000);
      const progress = estimatedProgress(elapsed);
      if (barRef.current) barRef.current.style.width = `${progress}%`;
      if (trackRef.current) trackRef.current.setAttribute("aria-valuenow", String(Math.round(progress)));
      const label = `${stageFor(elapsed).label}…`;
      if (stageRef.current && stageRef.current.textContent !== label) stageRef.current.textContent = label;
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [mode, startedAt]);

  if (mode === "quick") {
    return (
      <Card tone="flat">
        <div className="flex items-center gap-3 text-sm text-ink-muted">
          <LoaderCircle className="size-4 animate-spin" aria-hidden />
          Building your roadmap…
        </div>
      </Card>
    );
  }

  return (
    <Card
      className="print-hidden animate-rise"
      footer={
        <>
          <span className="text-[13px]">
            Elapsed <LiveElapsed startedAt={startedAt} className="font-mono text-[13px] tabular-nums text-ink" /> ·
            usually about {Math.round(AI_EXPECTED_SECONDS / 60)} minutes
          </span>
          <span className="text-[13px]">Browse other pages meanwhile. We&apos;ll let you know when it&apos;s ready.</span>
        </>
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[13px] text-ink-muted">
            <span className="relative flex size-2" aria-hidden>
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-warning opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-warning" />
            </span>
            Generating
          </p>
          <h2 className="mt-1 text-base font-semibold tracking-[-0.01em] text-ink">Your AI-enhanced roadmap</h2>
          <p ref={stageRef} className="mt-0.5 text-sm text-ink-muted" aria-live="polite">
            {AI_STAGES[0].label}…
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={cancelRoadmap} icon={<Square aria-hidden />}>
          Cancel
        </Button>
      </div>

      <div
        ref={trackRef}
        className="mt-5 h-1.5 overflow-hidden rounded-full bg-surface-3"
        role="progressbar"
        aria-label="Estimated progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
      >
        <div
          ref={barRef}
          className="h-full rounded-full bg-brand transition-[width] duration-1000 ease-linear"
          style={{ width: "0%" }}
        />
      </div>
    </Card>
  );
}
