import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type Tone = "error" | "success" | "info" | "warning";

const tones: Record<Tone, { box: string; icon: ReactNode }> = {
  error: {
    box: "border-critical/30 bg-critical-tint",
    icon: <CircleAlert className="size-4 text-critical" aria-hidden />,
  },
  success: {
    box: "border-good/30 bg-good-tint",
    icon: <CircleCheck className="size-4 text-good" aria-hidden />,
  },
  info: {
    box: "border-accent/30 bg-accent-tint",
    icon: <Info className="size-4 text-accent" aria-hidden />,
  },
  warning: {
    box: "border-warning/40 bg-warning-tint",
    icon: <TriangleAlert className="size-4 text-warning" aria-hidden />,
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
      className={cn("flex gap-3 rounded-lg border px-4 py-3 text-sm leading-6 text-ink", tones[tone].box, className)}
    >
      <span className="mt-1 shrink-0">{tones[tone].icon}</span>
      <div className="min-w-0 flex-1">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className={cn(Boolean(title) && "mt-0.5", "text-ink-muted")}>{children}</div>}
        {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="-m-1 h-fit rounded-md p-1 text-ink-faint transition-colors hover:bg-ink/5 hover:text-ink"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}
