"use client";

import { useLayoutEffect, useRef } from "react";

import { formatDuration } from "@/lib/use-now";

/**
 * Elapsed time since `startedAt`, updated by writing to the DOM once a second.
 * It never re-renders through React, so a ticking clock can't interrupt
 * route transitions while a long AI run is in progress.
 */
export function LiveElapsed({ startedAt, className }: { startedAt: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const update = () => {
      if (ref.current) ref.current.textContent = formatDuration((Date.now() - startedAt) / 1000);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [startedAt]);

  return (
    <span ref={ref} className={className ?? "tabular-nums"}>
      0:00
    </span>
  );
}
