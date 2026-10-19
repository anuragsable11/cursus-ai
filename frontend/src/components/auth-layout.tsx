"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { BrandMark } from "@/components/brand-mark";
import { HeroPreview } from "@/components/hero-preview";
import { ThemeCycleButton } from "@/components/theme-toggle";
import { postAuthDestination, useAuth } from "@/lib/auth";

/** Two-panel layout for sign in and sign up. Signed-in visitors are sent on. */
export function AuthLayout({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.status === "authenticated") router.replace(postAuthDestination(window.location.search));
  }, [auth.status, router]);

  return (
    <div className="relative flex min-h-screen">
      <div className="aurora pointer-events-none fixed inset-0 -z-10" aria-hidden />

      <aside className="relative hidden w-[46%] flex-col justify-between overflow-hidden border-r border-line bg-surface/40 p-10 backdrop-blur-sm lg:flex">
        <div className="flex items-center gap-2.5">
          <BrandMark />
          <span className="font-display text-[18px] font-medium tracking-tight text-ink">
            Cursus <span className="text-brand-ink">AI</span>
          </span>
        </div>

        <div className="my-10">
          <h2 className="max-w-md text-balance font-display text-[2.4rem] font-medium leading-[1.05] tracking-[-0.02em] text-ink">
            Know exactly what to learn{" "}
            <span className="bg-linear-to-r from-brand-ink to-[color-mix(in_oklab,var(--brand-ink)_55%,var(--accent-2))] bg-clip-text text-transparent">
              next.
            </span>
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-7 text-ink-muted">
            Turn your resume into a skill profile, measure it against real job descriptions, and follow a
            week-by-week plan with projects worth building.
          </p>
          <div className="mt-10 scale-95 origin-left">
            <HeroPreview />
          </div>
        </div>

        <p className="text-xs text-ink-faint">Runs on your machine. Your resume never leaves your local backend.</p>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-2.5 lg:invisible">
            <BrandMark />
            <span className="font-display text-[18px] font-medium tracking-tight text-ink">
              Cursus <span className="text-brand-ink">AI</span>
            </span>
          </div>
          <ThemeCycleButton />
        </div>
        <div className="flex flex-1 items-center justify-center px-5 pb-12 sm:px-8">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
      </main>
    </div>
  );
}
