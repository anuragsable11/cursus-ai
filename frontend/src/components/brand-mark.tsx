import { cn } from "@/lib/cn";

/** Cursus mark: a path that curves back on itself and ends at a milestone. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7 shrink-0", className)} aria-hidden>
      <circle cx="16" cy="16" r="16" fill="var(--ink)" />
      <path
        d="M21.6 10.4a7.8 7.8 0 1 0 0 11.2"
        fill="none"
        stroke="var(--surface)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <circle cx="21.6" cy="21.6" r="2.6" fill="var(--surface)" />
      <circle cx="21.6" cy="10.4" r="1.3" fill="var(--surface)" opacity="0.6" />
    </svg>
  );
}

/** Mark plus wordmark, as shown in headers. */
export function BrandLockup({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <BrandMark />
      <span className="text-[15px] font-semibold tracking-[-0.02em] text-ink">Cursus AI</span>
    </span>
  );
}
