"use client";

import Link from "next/link";
import { FileText, RotateCcw } from "lucide-react";
import { useId } from "react";

import { SkillsEditor } from "@/components/skills-editor";
import { Skeleton } from "@/components/ui/stat";
import { setProfileSkills, useProfile } from "@/lib/app-state";
import { LIMITS } from "@/lib/config";
import { sameSkillSet } from "@/lib/skills";

/** The shared, editable skill list used by every analysis. */
export function SkillsPanel() {
  const id = useId();
  const { value: profile, ready } = useProfile();
  const skills = profile?.skills ?? [];
  const canReset =
    profile?.source === "resume" &&
    profile.detected_skills.length > 0 &&
    !sameSkillSet(profile.detected_skills, skills);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={`${id}-input`} className="text-sm font-medium text-ink">
          Your skills
        </label>
        <span className="text-xs tabular-nums text-ink-faint">
          {skills.length} / {LIMITS.maxSkills}
        </span>
      </div>

      <p id={`${id}-hint`} className="mb-2.5 text-xs leading-5 text-ink-muted">
        {!ready ? (
          "Loading your profile…"
        ) : profile?.source === "resume" && profile.filename ? (
          <>
            <FileText className="mr-1 inline size-3.5 align-[-2px]" aria-hidden />
            Detected from <span className="text-ink">{profile.filename}</span>. Add anything the
            resume missed.
          </>
        ) : (
          <>
            Enter your skills, or{" "}
            <Link href="/resume-analyzer" className="font-medium text-brand-soft hover:underline">
              analyze your resume
            </Link>{" "}
            to fill them in automatically.
          </>
        )}
      </p>

      {ready ? (
        <SkillsEditor
          id={`${id}-input`}
          skills={skills}
          onChange={setProfileSkills}
          describedBy={`${id}-hint`}
        />
      ) : (
        <Skeleton className="h-24" />
      )}

      {canReset && (
        <button
          type="button"
          onClick={() => setProfileSkills(profile.detected_skills)}
          className="mt-2 inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink"
        >
          <RotateCcw className="size-3.5" aria-hidden />
          Reset to the {profile.detected_skills.length} skills detected in your resume
        </button>
      )}
    </div>
  );
}
