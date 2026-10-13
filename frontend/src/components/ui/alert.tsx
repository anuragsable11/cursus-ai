import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type Tone = "error" | "success" | "info" | "warning";

const tones: Record<Tone, { box: string; icon: ReactNode }> = {
  error: {
    box: "border-danger/25 bg-danger/[0.08] text-red-200",
    icon: <CircleAlert className="size-5 text-danger" aria-hidden />,
  },
  success: {
    box: "border-success/25 bg-success/[0.08] text-emerald-100",
    icon: <CircleCheck className="size-5 text-success" aria-hidden />,
  },
  info: {
    box: "border-brand/25 bg-brand/[0.07] text-violet-100",
    icon: <Info className="size-5 text-brand-soft" aria-hidden />,
  },
  warning: {
    box: "border-warning/25 bg-warning/[0.08] text-amber-100",
    icon: <TriangleAlert className="size-5 text-warning" aria-hidden />,
  },
};

type AlertProps = {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  onDismiss?: () => void;
  className?: string;
};

export function Alert({ tone = "info", title, children, actions, onDismiss, className }: AlertProps) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-xl border p-4 text-sm leading-6", tones[tone].box, className)}
    >
      <span className="mt-0.5 shrink-0">{tones[tone].icon}</span>
      <div className="min-w-0 flex-1">
        {title && <p className="font-medium text-ink">{title}</p>}
        {children && <div className={cn(Boolean(title) && "mt-1", "text-ink-muted")}>{children}</div>}
        {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="-m-1 h-fit rounded-md p-1 text-ink-faint hover:bg-white/10 hover:text-ink"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}
