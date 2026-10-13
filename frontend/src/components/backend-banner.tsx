"use client";

import { RefreshCw, ServerOff } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/config";
import { refreshSystemStatus, useSystemStatus } from "@/lib/system-status";

/** Explains how to start the backend when it can't be reached. */
export function BackendBanner() {
  const { backend } = useSystemStatus();
  const [checking, setChecking] = useState(false);

  if (backend !== "offline") return null;

  async function retry() {
    setChecking(true);
    await refreshSystemStatus();
    setChecking(false);
  }

  return (
    <div className="print-hidden mx-auto w-full max-w-[1120px] px-4 pt-4 sm:px-8 lg:px-12">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-critical-tint px-4 py-3 text-sm">
        <ServerOff className="size-4 shrink-0 text-critical" aria-hidden />
        <p className="min-w-0 flex-1 leading-6 text-ink">
          The backend at <span className="font-mono text-xs">{API_URL}</span> isn&apos;t reachable. In the{" "}
          <span className="font-mono text-xs">backend</span> folder run{" "}
          <code className="rounded-md bg-surface px-1.5 py-0.5 font-mono text-xs shadow-card">uvicorn main:app --reload</code>
        </p>
        <Button variant="secondary" size="sm" onClick={retry} loading={checking} icon={<RefreshCw aria-hidden />}>
          Retry
        </Button>
      </div>
    </div>
  );
}
