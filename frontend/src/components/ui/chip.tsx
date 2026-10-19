import { X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type ChipTone = "neutral" | "brand" | "good" | "warning" | "serious" | "critical";

// Status tones carry a colored dot; the text itself stays in ink so the
// meaning never relies on color alone.
const tones: Record<ChipTone, { box: string; dot?: string }> = {
  neutral: { box: "bg-surface-2 text-ink-muted" },
  brand: { box: "bg-surface text-ink shadow-field" },
  good: { box: "bg-surface text-ink shadow-field", dot: "bg-good" },
  warning: { box: "bg-surface text-ink shadow-field", dot: "bg-warning" },
  serious: { box: "bg-surface text-ink shadow-field", dot: "bg-serious" },
  critical: { box: "bg-surface text-ink shadow-field", dot: "bg-critical" },
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
        "inline-flex max-w-full items-center gap-1.5 rounded-full font-medium",
        size === "md" ? "h-7 px-2.5 text-[13px]" : "h-6 px-2 text-xs",
        onRemove && "pr-1",
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
          className="flex size-5 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink"
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
            leading={numbered ? <span className="font-mono text-[11px] tabular-nums text-ink-faint">{index + 1}</span> : undefined}
          >
            {item}
          </Chip>
        </li>
      ))}
    </ul>
  );
}
