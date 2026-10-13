"use client";

import {
  ArrowRight,
  BriefcaseBusiness,
  CircleCheck,
  SearchCheck,
  TriangleAlert,
} from "lucide-react";
import { useState } from "react";

import { JobDescriptionField } from "@/components/job-description-field";
import { SkillsPanel } from "@/components/skills-panel";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChipList } from "@/components/ui/chip";
import { PageHeader } from "@/components/ui/page-header";
import { ScoreRing, scoreTone } from "@/components/ui/score-ring";
import { EmptyState, Skeleton, Stat } from "@/components/ui/stat";
import { api, errorMessage } from "@/lib/api";
import {
  inputsChanged,
  matchStore,
  useJobDescription,
  useProfile,
  useSavedMatch,
} from "@/lib/app-state";
import { LIMITS } from "@/lib/config";
import type { SavedMatch } from "@/lib/types";
import { formatDateTime } from "@/lib/use-now";

export function JobMatcher() {
  const { value: profile, ready } = useProfile();
  const { value: jobDescription } = useJobDescription();
  const { value: saved } = useSavedMatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const skills = profile?.skills ?? [];
  const jobText = jobDescription ?? "";

  const problem =
    skills.length === 0
      ? "Add at least one skill to compare."
      : jobText.trim().length < LIMITS.minJobDescription
        ? `Add a job description of at least ${LIMITS.minJobDescription} characters.`
        : null;

  async function analyze() {
    if (problem || loading) return;
    setLoading(true);
    setError("");
    try {
      const result = await api.matchJob({ resume_skills: skills, job_description: jobText });
      matchStore.set({
        request: { skills, jobDescription: jobText },
        result,
        generatedAt: new Date().toISOString(),
      });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Step 2 · Job match"
        icon={<BriefcaseBusiness className="size-3.5" aria-hidden />}
        title="Job Matcher"
        description="See how your skills cover the skills a job description asks for, and which ones are potential gaps worth closing."
      />

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card title="Compare" icon={<SearchCheck className="size-4" aria-hidden />}>
          <div className="space-y-6">
            <SkillsPanel />
            <JobDescriptionField />

            {error && (
              <Alert tone="error" onDismiss={() => setError("")}>
                {error}
              </Alert>
            )}

            <div>
              <Button
                onClick={analyze}
                disabled={!ready || problem !== null}
                loading={loading}
                size="lg"
                className="w-full"
                icon={<SearchCheck className="size-4" aria-hidden />}
              >
                {loading ? "Comparing…" : saved ? "Compare again" : "Compare skills"}
              </Button>
              {ready && problem && <p className="mt-2 text-center text-xs text-ink-faint">{problem}</p>}
            </div>
          </div>
        </Card>

        <div className="lg:sticky lg:top-24">
          {!ready ? (
            <Skeleton className="h-96" />
          ) : saved ? (
            <MatchResults
              saved={saved}
              stale={inputsChanged(saved.request, skills, jobText)}
            />
          ) : (
            <Card>
              <EmptyState
                icon={<BriefcaseBusiness className="size-6" aria-hidden />}
                title="Your match will appear here"
                description="Add your skills and paste a job description. No job in mind? Use the sample job to try it out."
              />
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function MatchResults({ saved, stale }: { saved: SavedMatch; stale: boolean }) {
  const { result } = saved;
  const tone = scoreTone(result.match_score);
  const noSkillsFound = result.total_required === 0;

  return (
    <Card
      title="Match results"
      description={`Compared ${formatDateTime(saved.generatedAt)}`}
      icon={<CircleCheck className="size-4" aria-hidden />}
    >
      {stale && (
        <Alert tone="warning" className="mb-5">
          Your skills or the job description changed since this comparison. Compare again to update it.
        </Alert>
      )}

      {noSkillsFound ? (
        <Alert tone="info" title="No recognized skills in this job description">
          The detector looks for common technical skills such as Python, SQL, Docker, PyTorch, LLM and RAG. Try a
          more detailed job description that lists the required tools and technologies.
        </Alert>
      ) : (
        <>
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
            <ScoreRing score={result.match_score} />
            <div className="text-center sm:text-left">
              <p className={`text-lg font-semibold ${tone.text}`}>{tone.label}</p>
              <p className="mt-1 text-sm leading-6 text-ink-muted">
                You have {result.matched_count} of the {result.total_required} skills this job mentions.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <Stat label="Job skills" value={result.total_required} />
            <Stat label="You have" value={result.matched_count} />
            <Stat label="Potential gaps" value={result.missing_count} />
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <h3 className="mb-2.5 flex items-center gap-2 text-sm font-medium text-ink">
                <CircleCheck className="size-4 text-success" aria-hidden />
                Skills you have
              </h3>
              <ChipList items={result.matched_skills} tone="success" empty="None of the job's skills are in your list yet." />
            </div>
            <div>
              <h3 className="mb-2.5 flex items-center gap-2 text-sm font-medium text-ink">
                <TriangleAlert className="size-4 text-warning" aria-hidden />
                Potential gaps
              </h3>
              <ChipList items={result.missing_skills} tone="warning" empty="No gaps. You cover every skill this job mentions." />
            </div>
          </div>

          {result.missing_skills.length > 0 && (
            <div className="mt-6 rounded-xl border border-brand/20 bg-brand/[0.06] p-4">
              <p className="text-sm font-medium text-ink">Turn these gaps into a plan</p>
              <p className="mt-1 text-sm leading-6 text-ink-muted">
                Build a week-by-week roadmap for this job description.
              </p>
              <ButtonLink
                href="/skill-gap-analysis"
                size="sm"
                className="mt-3"
                icon={<ArrowRight className="size-3.5" aria-hidden />}
              >
                Build my roadmap
              </ButtonLink>
            </div>
          )}
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-ink-faint">
        Coverage counts skills from a fixed vocabulary that appear in both inputs. It is not a hiring probability, and
        a missing skill only means it is not in your list.
      </p>
    </Card>
  );
}
