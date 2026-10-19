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
    <span className={cn("relative flex size-[18px] shrink-0", className)}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={cn(
          "peer size-full cursor-pointer appearance-none rounded-[6px] border border-line-strong bg-surface",
          "transition-[background-color,border-color,transform] duration-200 active:scale-90",
          "checked:border-brand checked:bg-brand",
        )}
      />
      <svg
        viewBox="0 0 16 16"
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 m-auto size-3 text-on-brand",
          "[stroke-dasharray:14] [stroke-dashoffset:14] transition-[stroke-dashoffset] duration-300 ease-out",
          "peer-checked:[stroke-dashoffset:0]",
        )}
      >
        <path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
