"use client";

import { useCountUp } from "@/lib/motion";

/** A number that counts up on first view. Screen readers get the final value. */
export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const shown = useCountUp(value);
  return (
    <>
      <span className="sr-only">
        {value}
        {suffix}
      </span>
      <span aria-hidden>
        {shown}
        {suffix}
      </span>
    </>
  );
}
