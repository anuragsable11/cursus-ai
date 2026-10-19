"use client";

import { RefreshCw, ServerOff } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { containerClasses } from "@/components/ui/page-header";
import { cn } from "@/lib/cn";
import { API_URL } from "@/lib/config";
import { refreshSystemStatus, useSystemStatus } from "@/lib/system-status";

/** A full-width strip under the tabs that explains how to start the backend. */
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
    <div className="print-hidden border-b border-critical/25 bg-critical-tint">
      <div className={cn(containerClasses, "flex flex-wrap items-center gap-x-4 gap-y-2 py-2.5 text-sm")}>
        <ServerOff className="size-4 shrink-0 text-critical" aria-hidden />
        <p className="min-w-0 flex-1 leading-6 text-ink">
          The backend at <span className="font-mono text-[13px]">{API_URL}</span> isn&apos;t reachable. In the{" "}
          <span className="font-mono text-[13px]">backend</span> folder run{" "}
          <code className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[13px]">
            uvicorn main:app --reload
          </code>
        </p>
        <Button variant="secondary" size="sm" onClick={retry} loading={checking} icon={<RefreshCw aria-hidden />}>
          Retry
        </Button>
      </div>
    </div>
  );
}
