"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { useId } from "react";

import { SkillsEditor } from "@/components/skills-editor";
import { TextButton, textLinkClasses } from "@/components/ui/button";
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
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={`${id}-input`} className="text-sm font-medium text-ink">
          Your skills
        </label>
        <span className="font-mono text-xs tabular-nums text-ink-faint">
          {skills.length} / {LIMITS.maxSkills}
        </span>
      </div>

      {ready ? (
        <SkillsEditor id={`${id}-input`} skills={skills} onChange={setProfileSkills} describedBy={`${id}-hint`} />
      ) : (
        <Skeleton className="h-24" />
      )}

      <div id={`${id}-hint`} className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[13px] leading-5 text-ink-faint">
        <span>
          {!ready ? (
            "Loading your profile…"
          ) : profile?.source === "resume" && profile.filename ? (
            <>
              Detected from <span className="text-ink-muted">{profile.filename}</span>. Add anything it missed.
            </>
          ) : (
            <>
              Press Enter after each skill, or{" "}
              <Link href="/resume-analyzer" className={textLinkClasses}>
                analyze your resume
              </Link>{" "}
              to fill them in.
            </>
          )}
        </span>
        {canReset && (
          <TextButton onClick={() => setProfileSkills(profile.detected_skills)}>
            <RotateCcw aria-hidden />
            Reset to detected skills
          </TextButton>
        )}
      </div>
    </div>
  );
}
