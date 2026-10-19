"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { BrandLockup } from "@/components/brand-mark";
import { ThemeCycleButton } from "@/components/theme-toggle";
import { postAuthDestination, useAuth } from "@/lib/auth";

/** A single centered column for sign in and sign up. Signed-in visitors are sent on. */
export function AuthLayout({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.status === "authenticated") router.replace(postAuthDestination(window.location.search));
  }, [auth.status, router]);

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="flex h-16 items-center justify-between px-4 sm:px-6">
        <BrandLockup />
        <ThemeCycleButton />
      </header>

      <main className="flex flex-1 justify-center px-4 pt-[10vh] pb-16 sm:px-6">
        <div className="w-full max-w-[360px]">{children}</div>
      </main>

      <footer className="px-4 pb-6 text-center text-[13px] text-ink-faint">
        Runs on your machine. Your resume never leaves your local backend.
      </footer>
    </div>
  );
}
