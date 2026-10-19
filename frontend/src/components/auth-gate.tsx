"use client";

import { usePathname, useRouter } from "next/navigation";
import { RefreshCw, ServerOff } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { refreshSession, useAuth } from "@/lib/auth";
import { API_URL } from "@/lib/config";

/** Renders the signed-in app, or sends the visitor to sign in. */
export function AuthGate({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (auth.status !== "unauthenticated") return;
    const next = pathname && pathname !== "/" ? `?next=${encodeURIComponent(pathname)}` : "";
    router.replace(`/login${next}`);
  }, [auth.status, pathname, router]);

  if (auth.status === "authenticated") return <>{children}</>;
  if (auth.status === "offline") return <OfflineScreen message={auth.message} />;
  return <Splash />;
}

function Splash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas" aria-busy="true" aria-live="polite">
      <div className="flex flex-col items-center gap-4 animate-fade">
        <BrandMark className="size-10 drop-shadow-[0_8px_18px_color-mix(in_oklab,var(--brand)_45%,transparent)]" />
        <p className="text-sm text-ink-faint">Checking your session…</p>
      </div>
    </div>
  );
}

function OfflineScreen({ message }: { message: string }) {
  const [retrying, setRetrying] = useState(false);

  async function retry() {
    setRetrying(true);
    await refreshSession();
    setRetrying(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-md rounded-2xl bg-surface p-8 text-center shadow-raised animate-rise">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-critical-tint text-critical">
          <ServerOff className="size-5" aria-hidden />
        </span>
        <h1 className="mt-5 font-display text-2xl font-medium text-ink">Can&apos;t reach the backend</h1>
        <p className="mt-2 text-sm leading-6 text-ink-muted">{message}</p>
        <p className="mt-4 rounded-xl bg-surface-2 p-3 text-left text-xs leading-6 text-ink-muted">
          Expected at <span className="font-mono">{API_URL}</span>. In the{" "}
          <span className="font-mono">backend</span> folder run{" "}
          <code className="rounded-md bg-surface px-1.5 py-0.5 font-mono shadow-card">uvicorn main:app --reload</code>
        </p>
        <Button className="mt-6" onClick={retry} loading={retrying} icon={<RefreshCw aria-hidden />}>
          Try again
        </Button>
      </div>
    </div>
  );
}
