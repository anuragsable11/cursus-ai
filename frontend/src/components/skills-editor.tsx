"use client";

import { Plus } from "lucide-react";
import { useState, type ClipboardEvent, type KeyboardEvent } from "react";

import { Chip } from "@/components/ui/chip";
import { fieldClasses } from "@/components/ui/field";
import { cn } from "@/lib/cn";
import { LIMITS } from "@/lib/config";
import { normalizeSkills, parseSkillInput } from "@/lib/skills";

type SkillsEditorProps = {
  id: string;
  skills: string[];
  onChange: (skills: string[]) => void;
  describedBy?: string;
};

/** Editable list of skill chips. Enter, comma or paste adds skills. */
export function SkillsEditor({ id, skills, onChange, describedBy }: SkillsEditorProps) {
  const [draft, setDraft] = useState("");
  const full = skills.length >= LIMITS.maxSkills;

  function add(text: string) {
    const added = parseSkillInput(text);
    if (added.length > 0) onChange(normalizeSkills([...skills, ...added]));
    setDraft("");
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      add(draft);
    } else if (event.key === "Backspace" && draft === "" && skills.length > 0) {
      onChange(skills.slice(0, -1));
    }
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text");
    if (/[,;\n]/.test(pasted)) {
      event.preventDefault();
      add(draft + pasted);
    }
  }

  return (
    <div className={cn(fieldClasses, "p-1")}>
      {skills.length > 0 && (
        <ul className="flex flex-wrap gap-1.5 p-1" aria-label="Your skills">
          {skills.map((skill) => (
            <li key={skill} className="max-w-full">
              <Chip
                tone="brand"
                onRemove={() => onChange(skills.filter((item) => item !== skill))}
                removeLabel={`Remove ${skill}`}
              >
                {skill}
              </Chip>
            </li>
          ))}
        </ul>
      )}
      <div className="flex items-center gap-2">
        <input
          id={id}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onBlur={() => draft.trim() && add(draft)}
          disabled={full}
          maxLength={LIMITS.maxSkillLength * 4}
          placeholder={
            full
              ? "Skill limit reached"
              : skills.length > 0
                ? "Add another skill…"
                : "Type a skill and press Enter, e.g. Python, SQL, Docker"
          }
          aria-describedby={describedBy}
          className="h-8 min-w-0 flex-1 bg-transparent px-2 text-sm text-ink outline-none placeholder:text-ink-faint focus-visible:outline-none"
        />
        {draft.trim() && (
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => add(draft)}
            className="mr-0.5 inline-flex h-7 items-center gap-1 rounded-md bg-surface-2 px-2.5 text-xs font-medium text-ink transition-colors hover:bg-surface-3"
          >
            <Plus className="size-3.5" aria-hidden />
            Add
          </button>
        )}
      </div>
    </div>
  );
}
