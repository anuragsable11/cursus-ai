"use client";

import { useId } from "react";

import { cn } from "@/lib/cn";

/** Cursus mark: a path that curves back on itself and ends at a milestone. */
export function BrandMark({ className }: { className?: string }) {
  const id = useId();
  const fill = `${id}-fill`;
  const shine = `${id}-shine`;

  return (
    <svg viewBox="0 0 32 32" className={cn("size-8 shrink-0", className)} aria-hidden>
      <defs>
        <linearGradient id={fill} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--brand)" />
          <stop offset="1" stopColor="color-mix(in oklab, var(--brand) 55%, var(--accent-2))" />
        </linearGradient>
        <linearGradient id={shine} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${fill})`} />
      <rect width="32" height="32" rx="9" fill={`url(#${shine})`} />
      <path
        d="M21.6 10.4a7.8 7.8 0 1 0 0 11.2"
        fill="none"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="21.6" cy="21.6" r="2.6" fill="#fff" />
      <circle cx="21.6" cy="10.4" r="1.3" fill="#fff" opacity="0.7" />
    </svg>
  );
}
