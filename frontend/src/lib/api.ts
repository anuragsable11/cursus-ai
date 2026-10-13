import { API_URL } from "./config";
import type {
  AiStatus,
  MatchResult,
  ResumeAnalysisResponse,
  RoadmapResult,
} from "./types";

export type ApiErrorKind = "network" | "timeout" | "aborted" | "http";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(message: string, kind: ApiErrorKind, status?: number) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

type RequestOptions = {
  json?: unknown;
  form?: FormData;
  timeoutMs?: number;
  signal?: AbortSignal;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { json, form, timeoutMs = 30_000, signal } = options;
  const controller = new AbortController();
  let timedOut = false;

  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const forwardAbort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener("abort", forwardAbort, { once: true });

  try {
    let response: Response;
    try {
      response = await fetch(`${API_URL}${path}`, {
        method: json !== undefined || form ? "POST" : "GET",
        headers: json !== undefined ? { "Content-Type": "application/json" } : undefined,
        body: json !== undefined ? JSON.stringify(json) : form,
        signal: controller.signal,
      });
    } catch {
      if (timedOut) {
        throw new ApiError(
          `The request took longer than ${Math.round(timeoutMs / 1000)} seconds and was stopped.`,
          "timeout",
        );
      }
      if (signal?.aborted) {
        throw new ApiError("Request cancelled.", "aborted");
      }
      throw new ApiError(
        `Can't reach the CURSUS AI backend at ${API_URL}. Make sure the FastAPI server is running.`,
        "network",
      );
    }

    const data: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      throw new ApiError(describeError(data, response.status), "http", response.status);
    }

    return data as T;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", forwardAbort);
  }
}

type ValidationIssue = { loc?: unknown[]; msg?: string };

function describeError(data: unknown, status: number): string {
  const detail = (data as { detail?: unknown } | null)?.detail;

  if (typeof detail === "string" && detail.trim()) return detail;

  if (Array.isArray(detail) && detail.length > 0) {
    return (detail as ValidationIssue[])
      .map((issue) => {
        const field = issue.loc?.filter((part) => typeof part === "string").at(-1);
        const label = typeof field === "string" ? field.replaceAll("_", " ") : "";
        return label && label !== "body" ? `${capitalize(label)}: ${issue.msg}` : issue.msg;
      })
      .filter(Boolean)
      .join(" ");
  }

  if (status === 404) {
    return "This feature isn't available on the running backend. Restart it to load the latest version.";
  }
  if (status >= 500) {
    return `The backend ran into an error (HTTP ${status}). Check the server logs and try again.`;
  }
  return `The request failed (HTTP ${status}).`;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}

export function isAbort(error: unknown): boolean {
  return error instanceof ApiError && error.kind === "aborted";
}

// Endpoints

export type AnalysisRequest = {
  resume_skills: string[];
  job_description: string;
  target_weeks?: number;
};

export const api = {
  health: () => request<{ status: string }>("/health", { timeoutMs: 4_000 }),

  aiStatus: () => request<AiStatus>("/api/v1/ai/status", { timeoutMs: 6_000 }),

  analyzeResume: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return request<ResumeAnalysisResponse>("/api/v1/resumes/analyze", {
      form,
      timeoutMs: 60_000,
    });
  },

  matchJob: (body: AnalysisRequest) =>
    request<MatchResult>("/api/v1/jobs/match", { json: body }),

  gapAnalysis: (body: AnalysisRequest, signal?: AbortSignal) =>
    request<RoadmapResult>("/api/v1/skills/gap-analysis", { json: body, signal }),

  // The backend allows the model 240 seconds; leave headroom for the
  // prompt and the response.
  aiGapAnalysis: (body: AnalysisRequest, signal?: AbortSignal) =>
    request<RoadmapResult>("/api/v1/skills/ai-gap-analysis", {
      json: body,
      signal,
      timeoutMs: 300_000,
    }),
};
