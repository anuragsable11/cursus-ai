import { Check, FileText } from "lucide-react";

import { cn } from "@/lib/cn";

/**
 * An example of the three steps, shown to first-time visitors.
 * Values are illustrative, so the whole thing is hidden from assistive tech.
 */
export function HeroPreview() {
  return (
    <div className="select-none overflow-hidden rounded-xl border border-line bg-surface shadow-card" aria-hidden>
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <p className="text-sm font-medium text-ink">What you&apos;ll get</p>
        <p className="font-mono text-[11px] text-ink-faint">example</p>
      </div>

      <div className="divide-y divide-line">
        <div className="px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-sm font-medium text-ink">
              <FileText className="size-4 text-ink-muted" />
              resume.pdf
            </p>
            <p className="flex items-center gap-1.5 text-xs text-ink-muted">
              <span className="size-1.5 rounded-full bg-good" />
              12 skills found
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {["Python", "SQL", "Docker", "FastAPI"].map((skill) => (
              <span key={skill} className="flex h-6 items-center rounded-full px-2 text-xs font-medium text-ink shadow-field">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[13px] text-ink-muted">Skill coverage</p>
            <p className="text-xs text-ink-faint">15 of 22 job skills</p>
          </div>
          <p className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-ink">68%</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-good-tint">
            <div className="meter-fill h-full w-[68%] rounded-full bg-good" />
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-ink">Week 2 · Embeddings &amp; RAG</p>
            <span className="text-xs text-ink-faint">2 of 3</span>
          </div>
          <ul className="mt-3 space-y-2">
            {(
              [
                ["Chunking and embeddings", true],
                ["Vector search basics", true],
                ["Grounded generation", false],
              ] as const
            ).map(([label, done]) => (
              <li key={label} className="flex items-center gap-2.5 text-[13px]">
                <span
                  className={cn(
                    "flex size-4 items-center justify-center rounded-[4px]",
                    done ? "bg-brand text-on-brand" : "shadow-[0_0_0_1px_var(--line-hover)]",
                  )}
                >
                  {done && <Check className="size-3" strokeWidth={3} />}
                </span>
                <span className={done ? "text-ink-faint line-through" : "text-ink"}>{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
