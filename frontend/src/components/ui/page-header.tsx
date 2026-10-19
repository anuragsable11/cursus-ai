import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  /** Position in the three-step journey, shown as a small segmented indicator. */
  step?: 1 | 2 | 3;
  title: string;
  description: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, step, title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 sm:mb-10">
      <div className="max-w-2xl">
        <div className="mb-3 flex items-center gap-3">
          {step && (
            <span className="flex gap-1" aria-hidden>
              {[1, 2, 3].map((index) => (
                <span
                  key={index}
                  className={`h-1 w-5 rounded-full ${index <= step ? "bg-brand" : "bg-line-strong"}`}
                />
              ))}
            </span>
          )}
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">{eyebrow}</p>
        </div>
        <h1 className="text-balance font-display text-[2rem] font-medium leading-[1.08] tracking-[-0.015em] text-ink sm:text-[2.75rem]">
          {title}
        </h1>
        <p className="mt-3 max-w-xl text-pretty text-[15px] leading-7 text-ink-muted">{description}</p>
      </div>
      {actions && <div className="print-hidden flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
