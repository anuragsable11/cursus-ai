import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type StatProps = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  className?: string;
};

/** One figure in a StatGroup. The value uses proportional figures on purpose. */
export function Stat({ label, value, hint, className }: StatProps) {
  return (
    <div className={cn("min-w-0 px-4 py-3", className)}>
      <p className="truncate text-[13px] text-ink-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-ink">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}

/** A row of stats in one outlined strip, divided by hairlines. */
export function StatGroup({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("grid auto-cols-fr grid-flow-col divide-x divide-line rounded-lg border border-line", className)}>
      {children}
    </div>
  );
}

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-4 py-14 text-center", className)}>
      <span
        className="flex size-10 items-center justify-center rounded-lg border border-line bg-surface text-ink-muted shadow-card [&_svg]:size-5"
        aria-hidden
      >
        {icon}
      </span>
      <h3 className="mt-4 text-base font-semibold tracking-[-0.01em] text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-6 text-ink-muted">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-lg", className)} aria-hidden />;
}
