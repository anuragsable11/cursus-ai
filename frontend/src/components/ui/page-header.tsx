import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 sm:mb-10">
      <div className="max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-ink">{eyebrow}</p>
        <h1 className="font-display text-[2rem] font-medium leading-[1.1] tracking-[-0.01em] text-ink sm:text-[2.5rem]">
          {title}
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-7 text-ink-muted">{description}</p>
      </div>
      {actions && <div className="print-hidden flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}
