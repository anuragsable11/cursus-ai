"use client";

import { Pencil, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

type InputsSummaryProps = {
  skills: string[];
  jobDescription: string;
  extra?: ReactNode;
  stale: boolean;
  onEdit: () => void;
};

function jobTitle(text: string): string {
  const firstLine = text.split("\n").map((line) => line.trim()).find(Boolean) ?? "";
  return firstLine.length > 70 ? `${firstLine.slice(0, 70)}…` : firstLine || "Job description";
}

/** Collapsed view of the inputs behind a result, with a way back to edit them. */
export function InputsSummary({ skills, jobDescription, extra, stale, onEdit }: InputsSummaryProps) {
  return (
    <div className="print-hidden flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl bg-surface-2/60 px-4 py-3 sm:px-5">
      <dl className="flex min-w-0 flex-1 flex-wrap gap-x-6 gap-y-2 text-sm">
        <div className="min-w-0">
          <dt className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">Skills</dt>
          <dd className="truncate text-ink">
            {skills.length === 0
              ? "None listed"
              : `${skills.slice(0, 4).join(", ")}${skills.length > 4 ? ` +${skills.length - 4} more` : ""}`}
          </dd>
        </div>
        <div className="min-w-0 max-w-full">
          <dt className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">Job</dt>
          <dd className="truncate text-ink">{jobTitle(jobDescription)}</dd>
        </div>
        {extra}
      </dl>
      <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
        {stale && (
          <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
            <TriangleAlert className="size-3.5 text-warning" aria-hidden />
            Inputs changed
          </span>
        )}
        <Button variant="secondary" size="sm" onClick={onEdit} icon={<Pencil aria-hidden />} className="ml-auto">
          Edit inputs
        </Button>
      </div>
    </div>
  );
}

export function SummaryItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">{label}</dt>
      <dd className="truncate text-ink">{value}</dd>
    </div>
  );
}
