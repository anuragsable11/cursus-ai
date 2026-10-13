// Base URL of the FastAPI backend. Override with NEXT_PUBLIC_API_URL in
// frontend/.env.local; the value is inlined at build time.
export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

export const LIMITS = {
  maxSkills: 100,
  maxSkillLength: 60,
  minJobDescription: 30,
  maxJobDescription: 20000,
  maxResumeBytes: 5 * 1024 * 1024,
} as const;

export const ROADMAP_WEEK_OPTIONS = [2, 4, 6, 8, 12] as const;

// The local model answers in roughly two minutes on CPU-only hardware.
export const AI_EXPECTED_SECONDS = 120;
