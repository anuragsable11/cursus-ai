import type { ChangeEvent } from "react";

import { cn } from "@/lib/cn";

type CheckboxBoxProps = {
  checked: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
};

/** A native checkbox with a drawn tick. Wrap it in a <label> with the text. */
export function CheckboxBox({ checked, onChange, className }: CheckboxBoxProps) {
  return (
    <span className={cn("relative flex size-4 shrink-0", className)}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={cn(
          "peer size-full cursor-pointer appearance-none rounded-[4px] bg-surface shadow-[0_0_0_1px_var(--line-hover)]",
          "transition-[background-color,box-shadow] duration-150 hover:shadow-[0_0_0_1px_var(--ink-faint)]",
          "checked:bg-brand checked:shadow-[0_0_0_1px_var(--brand)]",
        )}
      />
      <svg
        viewBox="0 0 16 16"
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 m-auto size-3 text-on-brand",
          "[stroke-dasharray:14] [stroke-dashoffset:14] transition-[stroke-dashoffset] duration-200 ease-out",
          "peer-checked:[stroke-dashoffset:0]",
        )}
      >
        <path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
