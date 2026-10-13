import { CircleCheck, CircleDashed, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type CoverageBand = {
  key: "good" | "warning" | "serious";
  label: string;
  fill: string;
  track: string;
  icon: ReactNode;
};

/** Severity band for a 0-100 skill coverage score. */
export function coverageBand(score: number): CoverageBand {
  if (score >= 70) {
    return {
      key: "good",
      label: "Strong coverage",
      fill: "bg-good",
      track: "bg-good-tint",
      icon: <CircleCheck className="size-4 text-good" aria-hidden />,
    };
  }
  if (score >= 40) {
    return {
      key: "warning",
      label: "Partial coverage",
      fill: "bg-warning",
      track: "bg-warning-tint",
      icon: <CircleDashed className="size-4 text-warning" aria-hidden />,
    };
  }
  return {
    key: "serious",
    label: "Low coverage",
    fill: "bg-serious",
    track: "bg-serious-tint",
    icon: <TriangleAlert className="size-4 text-serious" aria-hidden />,
  };
}

type MeterProps = {
  value: number;
  max?: number;
  label: string;
  band?: CoverageBand;
  size?: "sm" | "md";
  className?: string;
};

/**
 * A linear meter: the fill carries severity and the track is a lighter
 * step of the same hue, so the state reads across the whole bar.
 */
export function Meter({ value, max = 100, label, band, size = "md", className }: MeterProps) {
  const clamped = Math.max(0, Math.min(max, value));
  const percent = max > 0 ? (clamped / max) * 100 : 0;
  const tone = band ?? { fill: "bg-brand", track: "bg-brand-tint" };

  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(clamped)}
      className={cn("w-full overflow-hidden rounded-full", size === "md" ? "h-2.5" : "h-1.5", tone.track, className)}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-700 ease-out", tone.fill)}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

/** A plain progress bar for completion, in the brand hue. */
export function ProgressBar({ value, max, label, className }: { value: number; max: number; label: string; className?: string }) {
  const percent = max > 0 ? (value / max) * 100 : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-brand-tint", className)}
    >
      <div className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out" style={{ width: `${percent}%` }} />
    </div>
  );
}
