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
          <LoaderCircle className="size-5 animate-spin text-brand-ink" aria-hidden />
          Building your roadmap…
        </div>
      </Card>
    );
  }

  return (
    <Card glow className="print-hidden animate-rise shadow-raised">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-tint">
            <LoaderCircle className="size-5 animate-spin text-brand-ink" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="font-semibold text-ink">Generating your AI-enhanced roadmap</h2>
            <p ref={stageRef} className="mt-0.5 text-sm text-ink-muted" aria-live="polite">
              {AI_STAGES[0].label}…
            </p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={cancelRoadmap} icon={<Square aria-hidden />}>
          Cancel
        </Button>
      </div>

      <div
        ref={trackRef}
        className="mt-5 h-2 overflow-hidden rounded-full bg-brand-tint"
        role="progressbar"
        aria-label="Estimated progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
      >
        <div
          ref={barRef}
          className="relative h-full overflow-hidden rounded-full bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--accent-2))] transition-[width] duration-1000 ease-linear"
          style={{ width: "0%" }}
        >
          <span className="absolute inset-0 bg-[linear-gradient(100deg,transparent_30%,rgb(255_255_255/0.35)_50%,transparent_70%)] bg-[length:200%_100%] [animation:shimmer_1.4s_linear_infinite]" />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-ink-muted">
        <span>
          Elapsed <LiveElapsed startedAt={startedAt} className="tabular-nums text-ink" /> · usually about{" "}
          {Math.round(AI_EXPECTED_SECONDS / 60)} minutes
        </span>
        <span>Browse other pages meanwhile. We&apos;ll let you know when it&apos;s ready.</span>
      </div>
    </Card>
  );
}
