import { BadgeCheck, CircleCheck, CircleDashed, CircleHelp, CircleX, TriangleAlert } from "lucide-react";

import { SectionLabel } from "@/components/ui/card";
import { CountUp } from "@/components/ui/count-up";
import { Meter } from "@/components/ui/meter";
import { cn } from "@/lib/cn";
import type { MatchLevel, MatchVerdict, VerdictTone } from "@/lib/match-verdict";

const ICONS: Record<MatchLevel, typeof CircleCheck> = {
  full: BadgeCheck,
  strong: CircleCheck,
  partial: CircleDashed,
  weak: TriangleAlert,
  none: CircleX,
  unknown: CircleHelp,
};

const TONES: Record<VerdictTone, { bubble: string; fill: string; track: string }> = {
  good: { bubble: "bg-good-tint text-good", fill: "bg-good", track: "bg-good-tint" },
  warning: { bubble: "bg-warning-tint text-warning", fill: "bg-warning", track: "bg-warning-tint" },
  serious: { bubble: "bg-serious-tint text-serious", fill: "bg-serious", track: "bg-serious-tint" },
  critical: { bubble: "bg-critical-tint text-critical", fill: "bg-critical", track: "bg-critical-tint" },
  neutral: { bubble: "bg-surface-2 text-ink-muted", fill: "bg-ink-faint", track: "bg-surface-2" },
};

/**
 * The verdict leads; the percentage only appears when it means something.
 * Color always sits next to an icon and a written label.
 */
export function MatchVerdictBlock({
  verdict,
  size = "lg",
  label = "Match verdict",
}: {
  verdict: MatchVerdict;
  size?: "lg" | "sm";
  label?: string;
}) {
  const Icon = ICONS[verdict.level];
  const tone = TONES[verdict.tone];
  const large = size === "lg";

  return (
    <div>
      {large && <SectionLabel className="mb-3">{label}</SectionLabel>}
      <div className="flex items-center gap-3">
        <span className={cn("flex shrink-0 items-center justify-center rounded-xl", tone.bubble, large ? "size-11" : "size-9")}>
          <Icon className={large ? "size-5" : "size-4"} aria-hidden />
        </span>
        <h3
          className={cn(
            "font-display font-medium leading-tight tracking-[-0.01em] text-ink",
            large ? "text-[1.9rem]" : "text-xl",
          )}
        >
          {verdict.title}
        </h3>
      </div>
      <p className={cn("text-pretty text-ink-muted", large ? "mt-3 text-sm leading-6" : "mt-2 text-sm leading-6")}>
        {verdict.description}
      </p>

      {verdict.showScore && (
        <div className={large ? "mt-6" : "mt-4"}>
          <div className="flex items-baseline gap-2">
            <span className={cn("font-sans font-semibold tracking-[-0.03em] text-ink", large ? "text-4xl" : "text-2xl")}>
              <CountUp value={verdict.score} suffix="%" />
            </span>
            <span className="text-sm text-ink-muted">skill coverage</span>
          </div>
          <Meter
            className="mt-3"
            value={verdict.score}
            label="Job skill coverage"
            band={{ fill: tone.fill, track: tone.track }}
            size={large ? "md" : "sm"}
          />
        </div>
      )}
    </div>
  );
}
