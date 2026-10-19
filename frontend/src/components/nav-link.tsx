"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

import { navDirection } from "@/lib/journey-nav";

/** A Link that tags navigation with its direction through the journey. */
export function NavLink({ href, transitionTypes, ...props }: ComponentProps<typeof Link>) {
  const pathname = usePathname();
  const target = typeof href === "string" ? href.split(/[?#]/)[0] : (href.pathname ?? "");
  return <Link href={href} transitionTypes={transitionTypes ?? navDirection(pathname, target)} {...props} />;
}
