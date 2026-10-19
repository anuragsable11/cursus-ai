"use client";

import { ArrowRight, CircleCheck, Pencil, SearchCheck, TriangleAlert } from "lucide-react";
import { useState } from "react";

import { InputsSummary } from "@/components/inputs-summary";
import { MatchVerdictBlock } from "@/components/match-verdict";
import { JobDescriptionField } from "@/components/job-description-field";
import { SkillsPanel } from "@/components/skills-panel";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, SectionLabel } from "@/components/ui/card";
import { ChipList } from "@/components/ui/chip";
import { PageBody, PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/stat";
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
        title="Job Matcher"
        description="See how your skills cover what a job description asks for, and which skills are worth closing the gap on."
      />

      <PageBody>
        {!ready ? (
          <Skeleton className="h-80 rounded-xl" />
        ) : showForm ? (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <Card
              title="Compare"
              description="Your skills against a job description."
              footer={
                <>
                  <span className="text-[13px] text-ink-faint">{problem}</span>
                  <div className="ml-auto flex items-center gap-2">
                    {saved && (
                      <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                        Cancel
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={analyze}
                      disabled={problem !== null}
                      loading={loading}
                      icon={<SearchCheck aria-hidden />}
                    >
                      {loading ? "Comparing…" : saved ? "Compare again" : "Compare skills"}
                    </Button>
                  </div>
                </>
              }
            >
              <div className="space-y-6">
                <SkillsPanel />
                <JobDescriptionField />

                {error && (
                  <Alert tone="error" onDismiss={() => setError("")}>
                    {error}
                  </Alert>
                )}
              </div>
            </Card>

            <aside className="lg:sticky lg:top-16">
              {saved ? (
                <Card tone="flat" title="Last comparison" description={formatDateTime(saved.generatedAt)}>
                  <MatchVerdictBlock verdict={verdictForMatch(saved.result)} size="sm" />
                  <p className="mt-4 text-[13px] text-ink-faint">Compare again after editing to refresh this result.</p>
                </Card>
              ) : (
                <Card
                  tone="flat"
                  title="How coverage works"
                  description="We look for a fixed vocabulary of technical skills in both your list and the job description. Coverage is the share of the job's skills you already have."
                />
              )}
            </aside>
          </div>
        ) : (
          <div className="space-y-6">
            <InputsSummary skills={skills} jobDescription={jobText} stale={stale} onEdit={() => setEditing(true)} />
            <MatchResults saved={saved} stale={stale} onEdit={() => setEditing(true)} />
          </div>
        )}
      </PageBody>
    </>
  );
}

function MatchResults({ saved, stale, onEdit }: { saved: SavedMatch; stale: boolean; onEdit: () => void }) {
  const { result } = saved;
  const verdict = verdictForMatch(result);
  const nothingToCompare = verdict.level === "unknown";

  return (
    <div className="space-y-6 animate-rise">
      {stale && (
        <Alert tone="warning">
          Your skills or the job description changed since this comparison. Edit inputs and compare again to refresh it.
        </Alert>
      )}

      <Card
        padding="lg"
        footer={
          <>
            <p className="max-w-xl text-[13px] leading-5">
              The verdict counts skills from a fixed vocabulary found in both inputs. It isn&apos;t a hiring
              probability, and a missing skill only means it isn&apos;t in your list.
            </p>
            {nothingToCompare ? (
              <Button variant="secondary" size="sm" onClick={onEdit} icon={<Pencil aria-hidden />}>
                Try another job description
              </Button>
            ) : (
              <ButtonLink href="/skill-gap-analysis" size="sm" icon={<ArrowRight aria-hidden />} className="flex-row-reverse">
                {verdict.level === "none"
                  ? `Build a roadmap for these ${result.missing_skills.length} skills`
                  : result.missing_skills.length > 0
                    ? "Turn gaps into a roadmap"
                    : "Build a roadmap"}
              </ButtonLink>
            )}
          </>
        }
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10">
          <div>
            <MatchVerdictBlock verdict={verdict} />
            <p className="mt-4 text-[13px] leading-5 text-ink-faint">Compared {formatDateTime(saved.generatedAt)}</p>
          </div>

          {nothingToCompare ? (
            <div className="rounded-lg border border-line bg-canvas p-5">
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
            <div className="space-y-6 lg:border-l lg:border-line lg:pl-10">
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
                  <CircleCheck className="size-4 text-good" aria-hidden />
                  Skills you have
                  <span className="font-mono text-xs tabular-nums text-ink-faint">{result.matched_skills.length}</span>
                </h3>
                <ChipList items={result.matched_skills} tone="good" empty="None of the job's skills are in your list yet." />
              </div>
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
                  <TriangleAlert className="size-4 text-warning" aria-hidden />
                  Potential gaps
                  <span className="font-mono text-xs tabular-nums text-ink-faint">{result.missing_skills.length}</span>
                </h3>
                <ChipList items={result.missing_skills} tone="warning" empty="No gaps. You cover every skill this job mentions." />
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
