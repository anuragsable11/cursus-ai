import type Link from "next/link";
import { LoaderCircle } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { NavLink } from "@/components/nav-link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap " +
  "transition-[background-color,color,box-shadow] duration-150 " +
  "disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-on-brand hover:bg-brand-hover",
  secondary: "bg-surface text-ink shadow-field hover:bg-surface-2",
  ghost: "text-ink-muted hover:bg-surface-2 hover:text-ink",
  danger: "bg-critical text-white hover:bg-critical/90",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] [&_svg]:size-3.5",
  md: "h-10 px-4 text-sm [&_svg]:size-4",
  lg: "h-12 px-5 text-[15px] [&_svg]:size-4",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <LoaderCircle className="animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
};

export function ButtonLink({ variant = "primary", size = "md", icon, className, children, ...props }: ButtonLinkProps) {
  return (
    <NavLink className={buttonClasses(variant, size, className)} {...props}>
      {icon}
      {children}
    </NavLink>
  );
}

/** A quiet inline action, for secondary controls next to labels. */
export function TextButton({ className, children, type = "button", ...props }: ComponentProps<"button">) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm text-[13px] font-medium text-ink-muted transition-colors hover:text-ink disabled:opacity-50 [&_svg]:size-3.5",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/** Inline link styling for links inside running text. */
export const textLinkClasses = "font-medium text-accent-ink hover:underline underline-offset-4";
