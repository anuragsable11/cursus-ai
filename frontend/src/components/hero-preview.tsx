import { Check, FileText, Route } from "lucide-react";

/**
 * A decorative collage of the three steps, shown to first-time visitors.
 * Values are illustrative, so the whole thing is hidden from assistive tech.
 */
export function HeroPreview() {
  return (
    <div className="relative mx-auto h-[340px] w-full max-w-[420px] select-none" aria-hidden>
      <svg className="absolute inset-0 size-full" viewBox="0 0 420 340" fill="none" preserveAspectRatio="none">
        <path
          d="M110 96 C 190 96, 210 70, 300 92 S 330 200, 250 222 S 120 236, 130 280"
          stroke="var(--brand)"
          strokeOpacity="0.45"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="flow-dash"
        />
      </svg>

      <div className="absolute top-8 left-0 w-[210px] -rotate-[4deg] rounded-2xl bg-surface p-4 shadow-raised animate-rise">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand-tint text-brand-ink">
            <FileText className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-ink">resume.pdf</p>
            <p className="text-[11px] text-ink-faint">12 skills found</p>
          </div>
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="h-1.5 w-full rounded-full bg-surface-3" />
          <div className="h-1.5 w-4/5 rounded-full bg-surface-3" />
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {["Python", "SQL", "Docker"].map((skill) => (
            <span key={skill} className="rounded-md bg-brand-tint px-1.5 py-0.5 text-[10px] font-medium text-brand-ink">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="absolute top-0 right-0 w-[200px] rotate-[3deg] rounded-2xl bg-surface p-4 shadow-raised animate-rise [animation-delay:120ms]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">Skill coverage</p>
        <p className="mt-1.5 text-[2rem] font-semibold leading-none tracking-[-0.03em] text-ink">68%</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-good-tint">
          <div className="meter-fill h-full w-[68%] rounded-full bg-good" />
        </div>
        <p className="mt-2 text-[11px] text-ink-faint">15 of 22 job skills</p>
      </div>

      <div className="edge-glow absolute bottom-0 left-10 w-[250px] -rotate-[1deg] rounded-2xl bg-surface p-4 shadow-pop animate-rise [animation-delay:240ms]">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-ink">
            <Route className="size-3" />
            Week 2
          </p>
          <span className="text-[10px] text-ink-faint">2 of 3</span>
        </div>
        <p className="mt-1 font-display text-[15px] font-medium text-ink">Embeddings & RAG</p>
        <ul className="mt-2.5 space-y-1.5">
          {[
            ["Chunking and embeddings", true],
            ["Vector search basics", true],
            ["Grounded generation", false],
          ].map(([label, done]) => (
            <li key={label as string} className="flex items-center gap-2 text-[11px]">
              <span
                className={`flex size-3.5 items-center justify-center rounded-[4px] ${
                  done ? "bg-brand text-on-brand" : "border border-line-strong"
                }`}
              >
                {done && <Check className="size-2.5" strokeWidth={3.5} />}
              </span>
              <span className={done ? "text-ink-faint line-through" : "text-ink"}>{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
