import { LIMITS, ROADMAP_WEEK_OPTIONS } from "./config";
import { normalizeSkills, sameSkillSet } from "./skills";
import { createPersistedStore, useStore } from "./store";
import type {
  ResumeProfile,
  RoadmapResult,
  SavedMatch,
  SavedRoadmap,
} from "./types";

// Validation helpers for data read back from localStorage.

type Json = Record<string, unknown>;

const isObject = (value: unknown): value is Json =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const text = (value: unknown) => (typeof value === "string" ? value : "");
const numberOrNull = (value: unknown) => (typeof value === "number" ? value : null);

function parseProfile(value: unknown): ResumeProfile | null {
  if (!isObject(value) || !isStringArray(value.skills)) return null;
  return {
    source: value.source === "resume" ? "resume" : "manual",
    filename: typeof value.filename === "string" ? value.filename : null,
    pages: numberOrNull(value.pages),
    characters_analyzed: numberOrNull(value.characters_analyzed),
    experience_text: text(value.experience_text),
    education_text: text(value.education_text),
    projects_text: text(value.projects_text),
    detected_skills: isStringArray(value.detected_skills) ? value.detected_skills : [],
    skills: value.skills,
    updated_at: text(value.updated_at),
  };
}

function isRoadmapResult(value: unknown): value is RoadmapResult {
  return (
    isObject(value) &&
    typeof value.match_score === "number" &&
    isStringArray(value.prioritized_gaps) &&
    isStringArray(value.matched_job_skills) &&
    Array.isArray(value.weekly_roadmap)
  );
}

function parseMatch(value: unknown): SavedMatch | null {
  if (!isObject(value) || !isObject(value.request) || !isObject(value.result)) return null;
  const { request, result } = value;
  if (
    !isStringArray(request.skills) ||
    typeof request.jobDescription !== "string" ||
    typeof result.match_score !== "number" ||
    !isStringArray(result.matched_skills) ||
    !isStringArray(result.missing_skills)
  ) {
    return null;
  }
  return value as SavedMatch;
}

function parseRoadmap(value: unknown): SavedRoadmap | null {
  if (!isObject(value) || !isObject(value.request) || !isRoadmapResult(value.result)) {
    return null;
  }
  if (value.mode !== "quick" && value.mode !== "ai") return null;
  if (!isStringArray(value.request.skills)) return null;
  return value as SavedRoadmap;
}

// Stores

export const profileStore = createPersistedStore("cursus.profile.v1", parseProfile);

export const jobDescriptionStore = createPersistedStore("cursus.job-description.v1", (value) =>
  typeof value === "string" ? value.slice(0, LIMITS.maxJobDescription) : null,
);

export const targetWeeksStore = createPersistedStore("cursus.target-weeks.v1", (value) =>
  typeof value === "number" && (ROADMAP_WEEK_OPTIONS as readonly number[]).includes(value)
    ? value
    : null,
);

export const matchStore = createPersistedStore("cursus.match.v1", parseMatch);

export const roadmapStore = createPersistedStore("cursus.roadmap.v1", parseRoadmap);

// Hooks

export const useProfile = () => useStore(profileStore);
export const useJobDescription = () => useStore(jobDescriptionStore);
export const useTargetWeeks = () => useStore(targetWeeksStore);
export const useSavedMatch = () => useStore(matchStore);
export const useSavedRoadmap = () => useStore(roadmapStore);

// Mutations

export function setProfileSkills(skills: string[]) {
  const cleaned = normalizeSkills(skills);
  const current = profileStore.get();
  const updated_at = new Date().toISOString();

  if (current) {
    profileStore.set({ ...current, skills: cleaned, updated_at });
    return;
  }

  profileStore.set({
    source: "manual",
    filename: null,
    pages: null,
    characters_analyzed: null,
    experience_text: "",
    education_text: "",
    projects_text: "",
    detected_skills: [],
    skills: cleaned,
    updated_at,
  });
}

export function clearAllData() {
  profileStore.set(null);
  jobDescriptionStore.set(null);
  targetWeeksStore.set(null);
  matchStore.set(null);
  roadmapStore.set(null);
}

/** True when a saved result was produced from different inputs. */
export function inputsChanged(
  saved: { skills: string[]; jobDescription: string },
  skills: string[],
  jobDescription: string,
): boolean {
  return (
    !sameSkillSet(saved.skills, skills) ||
    saved.jobDescription.trim() !== jobDescription.trim()
  );
}
