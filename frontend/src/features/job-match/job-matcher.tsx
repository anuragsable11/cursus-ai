"use client";

import { ArrowRight, BriefcaseBusiness, CircleCheck, Pencil, SearchCheck, TriangleAlert } from "lucide-react";
import { useState } from "react";

import { InputsSummary } from "@/components/inputs-summary";
import { MatchVerdictBlock } from "@/components/match-verdict";
import { JobDescriptionField } from "@/components/job-description-field";
import { SkillsPanel } from "@/components/skills-panel";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, SectionLabel } from "@/components/ui/card";
import { ChipList } from "@/components/ui/chip";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, Skeleton } from "@/components/ui/stat";
import { api, errorMessage } from "@/lib/api";
import { inputsChanged, matchStore, useJobDescription, useProfile, useSavedMatch } from "@/lib/app-state";
import { LIMITS } from "@/lib/config";
import { verdictForMatch } from "@/lib/match-verdict";
import type { SavedMatch } from "@/lib/types";
import { formatDateTime } from "@/lib/use-now";

export function JobMatcher() {
  const { value: profile, ready } = useProfile();
  const { value: jobDescription } = useJobDescription();
  const { value: saved } = useSavedMatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  const skills = profile?.skills ?? [];
  const jobText = jobDescription ?? "";
  const stale = saved ? inputsChanged(saved.request, skills, jobText) : false;
  const showForm = !saved || editing;

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
      matchStore.set({ request: { skills, jobDescription: jobText }, result, generatedAt: new Date().toISOString() });
      setEditing(false);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Step 2 of 3"
        step={2}
        title="Job Matcher"
        description="See how your skills cover what a job description asks for, and which skills are worth closing the gap on."
      />

      {!ready ? (
        <Skeleton className="h-80" />
      ) : showForm ? (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <Card title="Compare" description="Your skills against a job description." icon={<SearchCheck aria-hidden />}>
            <div className="space-y-6">
              <SkillsPanel />
              <JobDescriptionField />

              {error && (
                <Alert tone="error" onDismiss={() => setError("")}>
                  {error}
                </Alert>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={analyze} disabled={problem !== null} loading={loading} size="lg" icon={<SearchCheck aria-hidden />}>
                  {loading ? "Comparing…" : saved ? "Compare again" : "Compare skills"}
                </Button>
                {saved && (
                  <Button variant="ghost" size="lg" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                )}
                {problem && <span className="text-xs text-ink-faint">{problem}</span>}
              </div>
            </div>
          </Card>

          <aside className="space-y-4 lg:sticky lg:top-10">
            {saved ? (
              <Card tone="flat" title="Last comparison" description={formatDateTime(saved.generatedAt)}>
                <MiniResult saved={saved} />
              </Card>
            ) : (
              <Card tone="flat">
                <EmptyState
                  icon={<BriefcaseBusiness aria-hidden />}
                  title="How coverage works"
                  description="We look for a fixed vocabulary of technical skills in both your list and the job description. Coverage is the share of the job's skills you already have."
                />
              </Card>
            )}
          </aside>
        </div>
      ) : (
        <div className="space-y-5">
          <InputsSummary skills={skills} jobDescription={jobText} stale={stale} onEdit={() => setEditing(true)} />
          <MatchResults saved={saved} stale={stale} onEdit={() => setEditing(true)} />
        </div>
      )}
    </>
  );
}

function MiniResult({ saved }: { saved: SavedMatch }) {
  return (
    <div>
      <MatchVerdictBlock verdict={verdictForMatch(saved.result)} size="sm" />
      <p className="mt-3 text-xs text-ink-faint">
        Compare again after editing to refresh this result.
      </p>
    </div>
  );
}

function MatchResults({ saved, stale, onEdit }: { saved: SavedMatch; stale: boolean; onEdit: () => void }) {
  const { result } = saved;
  const verdict = verdictForMatch(result);
  const nothingToCompare = verdict.level === "unknown";

  return (
    <div className="space-y-5 animate-rise">
      {stale && (
        <Alert tone="warning">
          Your skills or the job description changed since this comparison. Edit inputs and compare again to refresh it.
        </Alert>
      )}

      <Card padding="lg" glow={verdict.showScore}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            <MatchVerdictBlock verdict={verdict} />
            <p className="mt-4 text-xs leading-5 text-ink-faint">Compared {formatDateTime(saved.generatedAt)}</p>
          </div>

          {nothingToCompare ? (
            <div className="rounded-xl bg-surface-2/70 p-5">
              <SectionLabel>What we look for</SectionLabel>
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                The match is based on technical skills named in the job description, such as Python, SQL, Docker,
                PyTorch, LLM, RAG, LangChain or AWS. Paste the full posting, including its requirements, to get a
                real comparison.
              </p>
              <Button variant="secondary" size="sm" className="mt-4" onClick={onEdit} icon={<Pencil aria-hidden />}>
                Edit job description
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="mb-2.5 flex items-center gap-2 text-sm font-medium text-ink">
                  <CircleCheck className="size-4 text-good" aria-hidden />
                  Skills you have
                  <span className="text-ink-faint">· {result.matched_skills.length}</span>
                </h3>
                <ChipList items={result.matched_skills} tone="good" empty="None of the job's skills are in your list yet." />
              </div>
              <div>
                <h3 className="mb-2.5 flex items-center gap-2 text-sm font-medium text-ink">
                  <TriangleAlert className="size-4 text-warning" aria-hidden />
                  Potential gaps
                  <span className="text-ink-faint">· {result.missing_skills.length}</span>
                </h3>
                <ChipList items={result.missing_skills} tone="warning" empty="No gaps. You cover every skill this job mentions." />
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
          <p className="max-w-xl text-xs leading-5 text-ink-faint">
            The verdict counts skills from a fixed vocabulary found in both inputs. It isn&apos;t a hiring probability,
            and a missing skill only means it isn&apos;t in your list.
          </p>
          {nothingToCompare ? (
            <Button variant="secondary" onClick={onEdit} icon={<Pencil aria-hidden />}>
              Try another job description
            </Button>
          ) : (
            <ButtonLink href="/skill-gap-analysis" icon={<ArrowRight aria-hidden />}>
              {verdict.level === "none"
                ? `Build a roadmap for these ${result.missing_skills.length} skills`
                : result.missing_skills.length > 0
                  ? "Turn gaps into a roadmap"
                  : "Build a roadmap"}
            </ButtonLink>
          )}
        </div>
      </Card>
    </div>
  );
}
