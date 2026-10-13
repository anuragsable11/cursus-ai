"use client";

import { RefreshCw, ServerOff } from "lucide-react";
import { useState } from "react";

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
    <div className="border-b border-danger/20 bg-danger/[0.06] print:hidden">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-sm sm:px-6">
        <ServerOff className="size-4 shrink-0 text-danger" aria-hidden />
        <p className="min-w-0 flex-1 text-red-100">
          Can&apos;t reach the backend at <span className="font-mono text-xs">{API_URL}</span>. Start it
          from the <span className="font-mono text-xs">backend</span> folder with{" "}
          <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-xs">uvicorn main:app --reload</code>
        </p>
        <button
          type="button"
          onClick={retry}
          disabled={checking}
          className="inline-flex items-center gap-1.5 rounded-lg border border-danger/30 px-3 py-1.5 text-xs font-medium text-red-100 hover:bg-danger/10 disabled:opacity-60"
        >
          <RefreshCw className={checking ? "size-3.5 animate-spin" : "size-3.5"} aria-hidden />
          Retry
        </button>
      </div>
    </div>
  );
}
