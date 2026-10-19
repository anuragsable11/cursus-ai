"use client";

import { ArrowRight, ChevronDown, FileText, FileUp, ScanText, ShieldCheck, Trash2, X } from "lucide-react";
import { useId, useState, type DragEvent } from "react";

import { SkillsPanel } from "@/components/skills-panel";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageBody, PageHeader } from "@/components/ui/page-header";
import { EmptyState, Skeleton, Stat, StatGroup } from "@/components/ui/stat";
import { api, errorMessage } from "@/lib/api";
import { profileStore, useProfile } from "@/lib/app-state";
import { cn } from "@/lib/cn";
import { LIMITS } from "@/lib/config";
import { normalizeSkills } from "@/lib/skills";

function validatePdf(file: File): string | null {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return "Please choose a PDF file.";
  if (file.size > LIMITS.maxResumeBytes) return "The PDF must be 5 MB or smaller.";
  if (file.size === 0) return "This file is empty.";
  return null;
}

export function ResumeAnalyzer() {
  const inputId = useId();
  const { value: profile, ready } = useProfile();
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analyzed, setAnalyzed] = useState(false);

  const hasResume = profile?.source === "resume";

  function choose(selected: File | null | undefined) {
    setError("");
    setAnalyzed(false);
    if (!selected) return;
    const problem = validatePdf(selected);
    if (problem) {
      setFile(null);
      setError(problem);
      return;
    }
    setFile(selected);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    choose(event.dataTransfer.files?.[0]);
  }

  async function analyze() {
    if (!file || loading) return;
    setLoading(true);
    setError("");

    try {
      const data = await api.analyzeResume(file);
      const detected = normalizeSkills(data.profile?.skills ?? []);

      profileStore.set({
        source: "resume",
        filename: data.filename,
        pages: data.pages,
        characters_analyzed: data.profile.characters_analyzed,
        experience_text: data.profile.experience_text ?? "",
        education_text: data.profile.education_text ?? "",
        projects_text: data.profile.projects_text ?? "",
        detected_skills: detected,
        skills: detected,
        updated_at: new Date().toISOString(),
      });
      setFile(null);
      setAnalyzed(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function removeProfile() {
    if (window.confirm("Remove your resume profile and skills from this browser?")) {
      profileStore.set(null);
      setAnalyzed(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Step 1 of 3"
        title="Resume Analyzer"
        description="Upload your resume to detect skills, experience, education and projects. The skill list is shared with every other step and stays editable."
      />

      <PageBody>
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <Card
            title={hasResume ? "Replace your resume" : "Upload your resume"}
            description="PDF with selectable text, up to 5 MB"
            footer={
              <p className="flex items-start gap-2 text-[13px] leading-5">
                <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                The PDF goes only to your local backend. Only the extracted profile is kept, in this browser.
              </p>
            }
          >
            <label
              htmlFor={inputId}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={cn(
                "flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center transition-colors",
                "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent",
                dragging
                  ? "border-ink bg-surface-2"
                  : "border-line-hover bg-canvas hover:border-ink-faint hover:bg-surface-2/60",
              )}
            >
              <span className="flex size-10 items-center justify-center rounded-lg border border-line bg-surface shadow-card">
                <FileUp className="size-5 text-ink-muted" aria-hidden />
              </span>
              <span className="mt-4 text-sm font-medium text-ink">
                {dragging ? "Drop your PDF here" : "Drag a PDF here, or click to browse"}
              </span>
              <span className="mt-1 text-[13px] text-ink-faint">Scanned images without text aren&apos;t supported</span>
              <input
                id={inputId}
                type="file"
                accept=".pdf,application/pdf"
                className="sr-only"
                onChange={(event) => {
                  choose(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </label>

            {file && (
              <div className="mt-4 flex items-center gap-3 rounded-lg border border-line p-3">
                <FileText className="size-4 shrink-0 text-ink-muted" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{file.name}</p>
                  <p className="font-mono text-xs text-ink-faint">{(file.size / 1024).toFixed(0)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  disabled={loading}
                  aria-label="Remove selected file"
                  className="rounded-md p-1.5 text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-50"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
            )}

            {error && (
              <Alert tone="error" className="mt-4">
                {error}
              </Alert>
            )}

            {file && (profile?.skills.length ?? 0) > 0 && (
              <p className="mt-4 text-[13px] leading-5 text-ink-faint">
                Analyzing replaces your current list of {profile?.skills.length} skills.
              </p>
            )}

            <Button
              onClick={analyze}
              disabled={!file}
              loading={loading}
              size="lg"
              className="mt-4 w-full"
              icon={<ScanText aria-hidden />}
            >
              {loading ? "Reading your resume…" : "Analyze resume"}
            </Button>
          </Card>

          <div className="space-y-6">
            {!ready ? (
              <Skeleton className="h-96 rounded-xl" />
            ) : profile ? (
              <>
                {analyzed && (
                  <Alert tone="success" title="Resume analyzed" onDismiss={() => setAnalyzed(false)} className="animate-rise">
                    We found {profile.detected_skills.length} skills. Check the list, then match a job.
                  </Alert>
                )}

                <Card
                  title={hasResume ? (profile.filename ?? "Your resume") : "Your skill profile"}
                  description={
                    hasResume
                      ? "Detected by rule-based parsing. Add anything that was missed."
                      : "Entered manually. Upload a resume to also capture experience, education and projects."
                  }
                  actions={
                    <Button variant="ghost" size="sm" onClick={removeProfile} icon={<Trash2 aria-hidden />}>
                      Remove
                    </Button>
                  }
                >
                  {hasResume && (
                    <StatGroup className="mb-6">
                      <Stat label="Pages" value={profile.pages ?? "–"} />
                      <Stat label="Skills found" value={profile.detected_skills.length} />
                      <Stat label="Characters" value={(profile.characters_analyzed ?? 0).toLocaleString()} />
                    </StatGroup>
                  )}
                  <SkillsPanel />
                </Card>

                {hasResume && (
                  <Card title="Resume sections" description="Text found under common headings." padding="none">
                    <div className="divide-y divide-line border-t border-line">
                      {(
                        [
                          ["Experience", profile.experience_text],
                          ["Education", profile.education_text],
                          ["Projects", profile.projects_text],
                        ] as const
                      ).map(([heading, content]) => (
                        <details key={heading} className="group">
                          <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-3.5 text-sm font-medium text-ink transition-colors hover:bg-canvas focus-visible:outline-offset-[-2px] sm:px-6">
                            {heading}
                            <span className="flex items-center gap-2 text-[13px] font-normal text-ink-faint">
                              {content ? "" : "Not detected"}
                              <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
                            </span>
                          </summary>
                          <p className="mx-5 mb-4 max-h-72 overflow-y-auto whitespace-pre-wrap rounded-lg border border-line bg-canvas p-3 text-sm leading-6 text-ink-muted sm:mx-6">
                            {content || `No "${heading}" heading was found in this resume.`}
                          </p>
                        </details>
                      ))}
                    </div>
                  </Card>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <ButtonLink href="/job-matcher" icon={<ArrowRight aria-hidden />} className="flex-row-reverse">
                    Next: match a job
                  </ButtonLink>
                  <ButtonLink href="/skill-gap-analysis" variant="ghost">
                    Skip to roadmap
                  </ButtonLink>
                </div>
              </>
            ) : (
              <Card tone="flat">
                <EmptyState
                  icon={<ScanText aria-hidden />}
                  title="No resume yet"
                  description="Upload a PDF to build your skill profile. Prefer typing? Enter your skills on the Job Match page."
                  action={
                    <ButtonLink href="/job-matcher" variant="secondary">
                      Enter skills manually
                    </ButtonLink>
                  }
                />
              </Card>
            )}
          </div>
        </div>
      </PageBody>
    </>
  );
}
