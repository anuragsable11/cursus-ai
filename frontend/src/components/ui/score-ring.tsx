import { cn } from "@/lib/cn";

type ScoreRingProps = {
  score: number;
  label?: string;
  size?: "md" | "lg";
};

export function scoreTone(score: number) {
  if (score >= 70) return { stroke: "stroke-success", text: "text-success", label: "Strong coverage" };
  if (score >= 40) return { stroke: "stroke-warning", text: "text-warning", label: "Partial coverage" };
  return { stroke: "stroke-danger", text: "text-danger", label: "Low coverage" };
}

export function ScoreRing({ score, label = "Skill coverage", size = "lg" }: ScoreRingProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const tone = scoreTone(clamped);

  return (
    <div
      className={cn("relative shrink-0", size === "lg" ? "size-36" : "size-24")}
      role="img"
      aria-label={`${label}: ${clamped}%`}
    >
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r={radius} className="fill-none stroke-white/[0.08]" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          className={cn("fill-none transition-[stroke-dashoffset] duration-700", tone.stroke)}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-semibold tabular-nums text-ink", size === "lg" ? "text-3xl" : "text-xl")}>
          {clamped}%
        </span>
        {size === "lg" && <span className="mt-0.5 text-[11px] text-ink-muted">{label}</span>}
      </div>
    </div>
  );
}
