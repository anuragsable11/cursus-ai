import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

/** Width and gutters shared by the title band and the page body. */
export const containerClasses = "mx-auto w-full max-w-[1200px] px-4 sm:px-6";

type PageHeaderProps = {
  /** Small context line above the title, e.g. "Step 1 of 3". */
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
};

/** A full-width white band with the page title, above the gray page body. */
export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="border-b border-line bg-surface">
      <div
        className={cn(
          containerClasses,
          "flex flex-wrap items-end justify-between gap-x-8 gap-y-5 py-8 sm:py-10",
        )}
      >
        <div className="max-w-2xl">
          {eyebrow && <p className="mb-2 text-sm text-ink-muted">{eyebrow}</p>}
          <h1 className="text-balance text-[1.75rem] font-semibold leading-tight tracking-[-0.04em] text-ink sm:text-[2rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-xl text-pretty text-[15px] leading-6 text-ink-muted">{description}</p>
          )}
        </div>
        {actions && <div className="print-hidden flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

/** The page body under the title band. */
export function PageBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(containerClasses, "py-8 sm:py-10", className)}>{children}</div>;
}
