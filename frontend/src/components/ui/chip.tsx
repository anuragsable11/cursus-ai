import { X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type ChipTone = "neutral" | "brand" | "success" | "warning" | "danger";

const tones: Record<ChipTone, string> = {
  neutral: "border-line-strong bg-white/[0.04] text-ink-muted",
  brand: "border-brand/25 bg-brand/10 text-violet-200",
  success: "border-success/25 bg-success/10 text-emerald-200",
  warning: "border-warning/25 bg-warning/10 text-amber-200",
  danger: "border-danger/25 bg-danger/10 text-red-200",
};

type ChipProps = {
  tone?: ChipTone;
  children: ReactNode;
  leading?: ReactNode;
  onRemove?: () => void;
  removeLabel?: string;
  className?: string;
};

export function Chip({ tone = "neutral", children, leading, onRemove, removeLabel, className }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {leading}
      <span className="truncate">{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel ?? "Remove"}
          className="-mr-1 rounded p-0.5 opacity-70 hover:bg-white/10 hover:opacity-100"
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
}: {
  items: string[];
  tone?: ChipTone;
  empty?: ReactNode;
  numbered?: boolean;
}) {
  if (items.length === 0) {
    return empty ? <p className="text-sm text-ink-muted">{empty}</p> : null;
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <li key={item} className="max-w-full">
          <Chip
            tone={tone}
            leading={numbered ? <span className="tabular-nums opacity-60">{index + 1}</span> : undefined}
          >
            {item}
          </Chip>
        </li>
      ))}
    </ul>
  );
}
