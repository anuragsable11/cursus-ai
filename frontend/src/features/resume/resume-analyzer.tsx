"use client";

import {
  ArrowRight,
  FileText,
  FileUp,
  ScanText,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { useId, useState, type DragEvent } from "react";

import { SkillsPanel } from "@/components/skills-panel";
import { Alert } from "@/components/ui/alert";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState, Skeleton, Stat } from "@/components/ui/stat";
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
        eyebrow="Step 1 · Resume"
        icon={<FileText className="size-3.5" aria-hidden />}
        title="Resume Analyzer"
        description="Upload your resume to detect skills, experience, education and projects. The skill list is shared with Job Match and Roadmap, and you can edit it at any time."
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Card
          title={hasResume ? "Replace your resume" : "Upload your resume"}
          description="PDF with selectable text · up to 5 MB"
          icon={<FileUp className="size-4" aria-hidden />}
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
              "flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center transition-colors",
              "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand",
              dragging
                ? "border-brand bg-brand/10"
                : "border-line-strong bg-canvas/50 hover:border-brand/50 hover:bg-brand/[0.04]",
            )}
          >
            <span className="flex size-12 items-center justify-center rounded-full border border-line bg-white/[0.04]">
              <FileUp className="size-5 text-brand-soft" aria-hidden />
            </span>
            <span className="mt-4 text-sm font-medium text-ink">
              {dragging ? "Drop your PDF here" : "Drag a PDF here, or click to browse"}
            </span>
            <span className="mt-1.5 text-xs text-ink-faint">Scanned images without text are not supported</span>
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
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-line bg-white/[0.03] p-3">
              <FileText className="size-5 shrink-0 text-brand-soft" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">{file.name}</p>
                <p className="text-xs text-ink-faint">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                disabled={loading}
                aria-label="Remove selected file"
                className="rounded-lg p-2 text-ink-faint hover:bg-white/10 hover:text-ink disabled:opacity-50"
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
            <p className="mt-4 text-xs leading-5 text-ink-faint">
              Analyzing replaces your current list of {profile?.skills.length} skills.
            </p>
          )}

          <Button
            onClick={analyze}
            disabled={!file}
            loading={loading}
            size="lg"
            className="mt-4 w-full"
            icon={<ScanText className="size-4" aria-hidden />}
          >
            {loading ? "Reading your resume…" : "Analyze resume"}
          </Button>

          <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-ink-faint">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            The PDF is sent only to your local backend. Only the extracted profile is kept, in this browser.
          </p>
        </Card>

        <div className="space-y-6">
          {!ready ? (
            <Skeleton className="h-96" />
          ) : profile ? (
            <>
              {analyzed && (
                <Alert
                  tone="success"
                  title="Resume analyzed"
                  onDismiss={() => setAnalyzed(false)}
                >
                  We detected {profile.detected_skills.length} skills. Review them below, then match a job.
                </Alert>
              )}

              <Card
                title={hasResume ? profile.filename ?? "Your resume" : "Your skill profile"}
                description={
                  hasResume
                    ? "Detected with rule-based parsing. Check the list and add anything that was missed."
                    : "Entered manually. Upload a resume to also detect experience, education and projects."
                }
                icon={<FileText className="size-4" aria-hidden />}
                actions={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeProfile}
                    icon={<Trash2 className="size-3.5" aria-hidden />}
                  >
                    Remove
                  </Button>
                }
              >
                {hasResume && (
                  <div className="mb-6 grid grid-cols-3 gap-3">
                    <Stat label="Pages" value={profile.pages ?? "–"} />
                    <Stat label="Skills detected" value={profile.detected_skills.length} />
                    <Stat label="Characters" value={(profile.characters_analyzed ?? 0).toLocaleString()} />
                  </div>
                )}
                <SkillsPanel />
              </Card>

              {hasResume && (
                <Card title="Resume sections" description="Text found under common section headings.">
                  <div className="divide-y divide-line">
                    {(
                      [
                        ["Experience", profile.experience_text],
                        ["Education", profile.education_text],
                        ["Projects", profile.projects_text],
                      ] as const
                    ).map(([heading, content]) => (
                      <details key={heading} className="group py-3 first:pt-0 last:pb-0">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-ink">
                          {heading}
                          <span className="text-xs font-normal text-ink-faint group-open:hidden">
                            {content ? "Show" : "Not detected"}
                          </span>
                          <span className="hidden text-xs font-normal text-ink-faint group-open:inline">Hide</span>
                        </summary>
                        <p className="mt-3 max-h-72 overflow-y-auto whitespace-pre-wrap rounded-lg bg-canvas/60 p-3 text-sm leading-6 text-ink-muted">
                          {content || `No "${heading}" heading was found in this resume.`}
                        </p>
                      </details>
                    ))}
                  </div>
                </Card>
              )}

              <div className="flex flex-wrap gap-3">
                <ButtonLink href="/job-matcher" icon={<ArrowRight className="size-4" aria-hidden />}>
                  Match a job
                </ButtonLink>
                <ButtonLink href="/skill-gap-analysis" variant="secondary">
                  Build a roadmap
                </ButtonLink>
              </div>
            </>
          ) : (
            <Card>
              <EmptyState
                icon={<ScanText className="size-6" aria-hidden />}
                title="No resume analyzed yet"
                description="Upload a PDF to build your skill profile. Prefer to type your skills? You can enter them on the Job Match page."
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
    </>
  );
}
