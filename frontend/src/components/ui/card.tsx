import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type CardProps = {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** A muted band along the bottom edge, for a note and the card's main action. */
  footer?: ReactNode;
  /** "raised" is the default white card, "flat" is an outline on the canvas. */
  tone?: "raised" | "flat";
  padding?: "md" | "lg" | "none";
  className?: string;
  children?: ReactNode;
};

const tones = {
  raised: "bg-surface shadow-card",
  flat: "bg-transparent",
};

const paddings = { md: "p-5 sm:p-6", lg: "p-6 sm:p-8", none: "" };

export function Card({
  title,
  description,
  actions,
  footer,
  tone = "raised",
  padding = "md",
  className,
  children,
}: CardProps) {
  const hasHeader = title || description || actions;

  return (
    <section className={cn("overflow-hidden rounded-xl border border-line", tones[tone], className)}>
      <div className={paddings[padding]}>
        {hasHeader && (
          <div
            className={cn(
              "flex items-start justify-between gap-4",
              // Unpadded cards hold edge-to-edge content (lists, tables), so the header pads itself.
              padding === "none" ? "px-5 py-4 sm:px-6" : Boolean(children) && "mb-5",
            )}
          >
            <div className="min-w-0">
              {title && <h2 className="text-base font-semibold tracking-[-0.01em] text-ink">{title}</h2>}
              {description && <p className="mt-1 text-sm leading-6 text-ink-muted">{description}</p>}
            </div>
            {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
          </div>
        )}
        {children}
      </div>
      {footer && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-canvas px-5 py-3 text-sm text-ink-muted sm:px-6">
          {footer}
        </div>
      )}
    </section>
  );
}

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-[13px] font-medium text-ink-muted", className)}>{children}</p>;
}
