import { useSyncExternalStore } from "react";

import { api, errorMessage, isAbort } from "./api";
import { roadmapStore } from "./app-state";
import { pushToast } from "./toasts";
import type { RoadmapMode } from "./types";

const ROADMAP_PATH = "/skill-gap-analysis";

function onRoadmapPage() {
  return typeof window !== "undefined" && window.location.pathname.startsWith(ROADMAP_PATH);
}

export type RoadmapRequest = {
  skills: string[];
  jobDescription: string;
  targetWeeks: number;
};

export type RoadmapJobState =
  | { status: "idle" }
  | { status: "running"; mode: RoadmapMode; startedAt: number }
  | { status: "error"; mode: RoadmapMode; message: string };

// The job lives outside React so a multi-minute AI request keeps running
// while the user visits other pages, and its result is saved either way.
const IDLE: RoadmapJobState = { status: "idle" };
let state: RoadmapJobState = IDLE;
let controller: AbortController | null = null;
const listeners = new Set<() => void>();

function setState(next: RoadmapJobState) {
  state = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useRoadmapJob(): RoadmapJobState {
  return useSyncExternalStore(subscribe, () => state, () => IDLE);
}

export async function startRoadmap(mode: RoadmapMode, request: RoadmapRequest) {
  if (state.status === "running") return;

  const ownController = new AbortController();
  controller = ownController;
  setState({ status: "running", mode, startedAt: Date.now() });

  const body = {
    resume_skills: request.skills,
    job_description: request.jobDescription,
    target_weeks: request.targetWeeks,
  };

  try {
    const result =
      mode === "ai"
        ? await api.aiGapAnalysis(body, ownController.signal)
        : await api.gapAnalysis(body, ownController.signal);

    roadmapStore.set({
      mode,
      request,
      result,
      generatedAt: new Date().toISOString(),
    });
    setState(IDLE);
    if (mode === "ai" && !onRoadmapPage()) {
      pushToast({
        tone: "success",
        title: "Your AI roadmap is ready",
        description: `${result.target_weeks}-week plan with ${result.prioritized_gaps.length} prioritized skills.`,
        href: ROADMAP_PATH,
        actionLabel: "Open roadmap",
      });
    }
  } catch (error) {
    if (isAbort(error)) {
      setState(IDLE);
    } else {
      const message = errorMessage(error);
      setState({ status: "error", mode, message });
      if (mode === "ai" && !onRoadmapPage()) {
        pushToast({
          tone: "error",
          title: "The AI roadmap could not be generated",
          description: message,
          href: ROADMAP_PATH,
          actionLabel: "View details",
        }, 15000);
      }
    }
  } finally {
    if (controller === ownController) controller = null;
  }
}

export function cancelRoadmap() {
  controller?.abort();
}

export function dismissRoadmapError() {
  if (state.status === "error") setState(IDLE);
}
