import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type CardProps = {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
  children?: ReactNode;
};

export function Card({ title, description, icon, actions, className, children }: CardProps) {
  const hasHeader = title || description || actions;

  return (
    <section className={cn("rounded-2xl border border-line bg-surface p-5 sm:p-6", className)}>
      {hasHeader && (
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            {icon && (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand-soft">
                {icon}
              </span>
            )}
            <div className="min-w-0">
              {title && <h2 className="text-base font-semibold text-ink">{title}</h2>}
              {description && (
                <p className="mt-1 text-sm leading-6 text-ink-muted">{description}</p>
              )}
            </div>
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
