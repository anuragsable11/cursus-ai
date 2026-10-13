import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  icon: ReactNode;
  title: string;
  description: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, icon, title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-soft">
          {icon}
          {eyebrow}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-ink-muted sm:text-base sm:leading-7">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap gap-2 print:hidden">{actions}</div>}
    </header>
  );
}
