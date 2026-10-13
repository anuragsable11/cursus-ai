import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type CardProps = {
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  /** Visual weight: "raised" is the default white card, "flat" sits on the canvas. */
  tone?: "raised" | "flat" | "tint";
  padding?: "md" | "lg" | "none";
  className?: string;
  children?: ReactNode;
};

const tones = {
  raised: "bg-surface shadow-card",
  flat: "bg-surface-2/60",
  tint: "bg-brand-tint",
};

const paddings = { md: "p-5 sm:p-6", lg: "p-6 sm:p-8", none: "" };

export function Card({
  title,
  description,
  icon,
  actions,
  tone = "raised",
  padding = "md",
  className,
  children,
}: CardProps) {
  const hasHeader = title || description || actions;

  return (
    <section className={cn("rounded-2xl", tones[tone], paddings[padding], className)}>
      {hasHeader && (
        <div className={cn("flex items-start justify-between gap-4", Boolean(children) && "mb-5")}>
          <div className="flex min-w-0 flex-1 items-start gap-3">
            {icon && (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-tint text-brand-ink [&_svg]:size-4">
                {icon}
              </span>
            )}
            <div className="min-w-0">
              {title && <h2 className="text-[15px] font-semibold leading-6 text-ink">{title}</h2>}
              {description && <p className="mt-0.5 text-sm leading-6 text-ink-muted">{description}</p>}
            </div>
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint", className)}>
      {children}
    </p>
  );
}
