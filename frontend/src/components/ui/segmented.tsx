"use client";

import { useId, type ReactNode } from "react";

import { cn } from "@/lib/cn";

export type SegmentedOption<T extends string | number> = {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  /** When set, only the icon is shown and this text is read by screen readers. */
  srLabel?: string;
};

type SegmentedProps<T extends string | number> = {
  label: string;
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
};

/** A radio group styled as a pill switch. */
export function Segmented<T extends string | number>({
  label,
  options,
  value,
  onChange,
  size = "md",
  disabled = false,
  className,
}: SegmentedProps<T>) {
  const name = useId();

  return (
    <fieldset
      disabled={disabled}
      aria-label={label}
      className={cn(
        "inline-grid w-full rounded-xl bg-surface-2 p-1 disabled:opacity-60",
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <label
            key={String(option.value)}
            className={cn(
              "flex cursor-pointer items-center justify-center gap-1.5 rounded-lg font-medium transition-colors",
              "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand",
              size === "md" ? "h-9 px-3 text-sm" : "h-7 px-2 text-xs",
              selected ? "bg-surface text-ink shadow-card" : "text-ink-muted hover:text-ink",
              "[&_svg]:size-4",
            )}
          >
            <input
              type="radio"
              name={name}
              value={String(option.value)}
              checked={selected}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.icon}
            {option.srLabel ? <span className="sr-only">{option.srLabel}</span> : <span>{option.label}</span>}
          </label>
        );
      })}
    </fieldset>
  );
}
