"use client";

import { ClipboardPaste, Eraser } from "lucide-react";
import { useId } from "react";

import { TextButton } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/stat";
import { jobDescriptionStore, useJobDescription } from "@/lib/app-state";
import { LIMITS } from "@/lib/config";
import { SAMPLE_JOB_DESCRIPTION } from "@/lib/sample-job";

/** Job description input shared by Job Match and Roadmap pages. */
export function JobDescriptionField({ rows = 10 }: { rows?: number }) {
  const id = useId();
  const { value, ready } = useJobDescription();
  const text = value ?? "";
  const length = text.trim().length;
  const tooShort = length > 0 && length < LIMITS.minJobDescription;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          Target job description
        </label>
        {ready && (
          <TextButton onClick={() => jobDescriptionStore.set(text ? null : SAMPLE_JOB_DESCRIPTION)}>
            {text ? (
              <>
                <Eraser aria-hidden /> Clear
              </>
            ) : (
              <>
                <ClipboardPaste aria-hidden /> Try a sample job
              </>
            )}
          </TextButton>
        )}
      </div>

      {ready ? (
        <textarea
          id={id}
          value={text}
          onChange={(event) => jobDescriptionStore.set(event.target.value || null)}
          placeholder="Paste the full job description, including responsibilities and requirements…"
          rows={rows}
          maxLength={LIMITS.maxJobDescription}
          aria-describedby={`${id}-hint`}
          aria-invalid={tooShort || undefined}
          className="w-full resize-y rounded-xl bg-surface-2/70 p-3.5 text-sm leading-6 text-ink outline-none transition-shadow placeholder:text-ink-faint focus:shadow-[0_0_0_2px_var(--brand)]"
        />
      ) : (
        <Skeleton className="h-56" />
      )}

      <div id={`${id}-hint`} className="mt-2 flex justify-between gap-3 text-xs leading-5 text-ink-faint">
        <span className={tooShort ? "text-ink" : undefined}>
          {tooShort
            ? `Add at least ${LIMITS.minJobDescription - length} more characters.`
            : "Saved in this browser and shared across pages."}
        </span>
        <span className="tabular-nums">
          {text.length.toLocaleString()} / {LIMITS.maxJobDescription.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
