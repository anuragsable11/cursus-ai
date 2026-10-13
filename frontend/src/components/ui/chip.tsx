import { X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type ChipTone = "neutral" | "brand" | "good" | "warning" | "serious" | "critical";

// Status tones carry a colored dot; the text itself stays in ink so the
// meaning never relies on color alone.
const tones: Record<ChipTone, { box: string; dot?: string }> = {
  neutral: { box: "bg-surface-2 text-ink-muted" },
  brand: { box: "bg-brand-tint text-brand-ink" },
  good: { box: "bg-good-tint text-ink", dot: "bg-good" },
  warning: { box: "bg-warning-tint text-ink", dot: "bg-warning" },
  serious: { box: "bg-serious-tint text-ink", dot: "bg-serious" },
  critical: { box: "bg-critical-tint text-ink", dot: "bg-critical" },
};

type ChipProps = {
  tone?: ChipTone;
  children: ReactNode;
  leading?: ReactNode;
  onRemove?: () => void;
  removeLabel?: string;
  size?: "sm" | "md";
  className?: string;
};

export function Chip({ tone = "neutral", children, leading, onRemove, removeLabel, size = "md", className }: ChipProps) {
  const style = tones[tone];
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-lg font-medium",
        size === "md" ? "h-7 px-2.5 text-xs" : "h-6 px-2 text-[11px]",
        style.box,
        className,
      )}
    >
      {style.dot && <span className={cn("size-1.5 shrink-0 rounded-full", style.dot)} aria-hidden />}
      {leading}
      <span className="truncate">{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel ?? "Remove"}
          className="-mr-1 rounded p-0.5 opacity-60 transition-opacity hover:bg-ink/10 hover:opacity-100"
        >
          <X className="size-3" aria-hidden />
        </button>
      )}
    </span>
  );
}

export function ChipList({
  items,
  tone,
  empty,
  numbered = false,
  size,
}: {
  items: string[];
  tone?: ChipTone;
  empty?: ReactNode;
  numbered?: boolean;
  size?: "sm" | "md";
}) {
  if (items.length === 0) {
    return empty ? <p className="text-sm text-ink-muted">{empty}</p> : null;
  }

  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item, index) => (
        <li key={item} className="max-w-full">
          <Chip
            tone={tone}
            size={size}
            leading={numbered ? <span className="tabular-nums opacity-60">{index + 1}</span> : undefined}
          >
            {item}
          </Chip>
        </li>
      ))}
    </ul>
  );
}
