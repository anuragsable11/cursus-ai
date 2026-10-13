import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type StatProps = {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export function Stat({ label, value, icon, className }: StatProps) {
  return (
    <div className={cn("rounded-xl border border-line bg-white/[0.02] p-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-ink-muted">{label}</p>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-ink">{value}</p>
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
    <div className={cn("flex flex-col items-center justify-center px-4 py-12 text-center", className)}>
      <span className="flex size-14 items-center justify-center rounded-2xl border border-brand/20 bg-brand/[0.08] text-brand-soft">
        {icon}
      </span>
      <h3 className="mt-5 text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-ink-muted">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-white/[0.05]", className)} aria-hidden />;
}
