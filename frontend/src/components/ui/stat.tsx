import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type StatProps = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  className?: string;
};

/** A stat tile. The value uses proportional figures on purpose. */
export function Stat({ label, value, hint, icon, className }: StatProps) {
  return (
    <div className={cn("rounded-xl bg-surface-2/70 p-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-ink-muted">{label}</p>
        {icon && <span className="text-ink-faint [&_svg]:size-4">{icon}</span>}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}

/** The one number a view leads with. Sans-serif, large, proportional figures. */
export function HeroFigure({ value, label, className }: { value: ReactNode; label: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="font-sans text-[3.25rem] font-semibold leading-none tracking-[-0.03em] text-ink sm:text-[3.75rem]">
        {value}
      </p>
      <p className="mt-2 text-sm text-ink-muted">{label}</p>
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
      <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-tint text-brand-ink [&_svg]:size-5">
        {icon}
      </span>
      <h3 className="mt-5 font-display text-xl font-medium text-ink">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-ink-muted">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-surface-3", className)} aria-hidden />;
}
