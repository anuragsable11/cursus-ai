import { createPersistedStore, useStore } from "./store";
import type { RoadmapWeek } from "./types";

// Which roadmap topics the user has ticked off, keyed by the roadmap's
// generation timestamp so a new roadmap starts fresh.
type ProgressMap = Record<string, Record<string, true>>;

function parse(value: unknown): ProgressMap | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const result: ProgressMap = {};
  for (const [roadmapId, topics] of Object.entries(value as Record<string, unknown>)) {
    if (typeof topics !== "object" || topics === null) continue;
    const done: Record<string, true> = {};
    for (const [key, flag] of Object.entries(topics as Record<string, unknown>)) {
      if (flag === true) done[key] = true;
    }
    result[roadmapId] = done;
  }
  return result;
}

export const progressStore = createPersistedStore("cursus.progress.v1", parse);

export const topicKey = (week: number, skill: string, topic: string) =>
  `${week}|${skill}|${topic}`;

export function useRoadmapProgress(roadmapId: string): Record<string, true> {
  const { value } = useStore(progressStore);
  return value?.[roadmapId] ?? EMPTY;
}

const EMPTY: Record<string, true> = {};

export function setTopicDone(roadmapId: string, key: string, done: boolean) {
  const all = progressStore.get() ?? {};
  const current = { ...(all[roadmapId] ?? {}) };
  if (done) current[key] = true;
  else delete current[key];
  // Keep only the newest few roadmaps so storage doesn't grow forever.
  const next: ProgressMap = { ...all, [roadmapId]: current };
  const ids = Object.keys(next).sort().slice(-5);
  progressStore.set(Object.fromEntries(ids.map((id) => [id, next[id]])));
}

export function setWeekDone(roadmapId: string, week: RoadmapWeek, done: boolean) {
  const all = progressStore.get() ?? {};
  const current = { ...(all[roadmapId] ?? {}) };
  for (const activity of week.activities) {
    for (const topic of activity.topics) {
      const key = topicKey(week.week, activity.skill, topic);
      if (done) current[key] = true;
      else delete current[key];
    }
  }
  progressStore.set({ ...all, [roadmapId]: current });
}

export function countTopics(weeks: RoadmapWeek[]): number {
  return weeks.reduce(
    (sum, week) => sum + week.activities.reduce((inner, activity) => inner + activity.topics.length, 0),
    0,
  );
}

export function countDone(weeks: RoadmapWeek[], done: Record<string, true>): number {
  let count = 0;
  for (const week of weeks) {
    for (const activity of week.activities) {
      for (const topic of activity.topics) {
        if (done[topicKey(week.week, activity.skill, topic)]) count++;
      }
    }
  }
  return count;
}

export function weekProgress(week: RoadmapWeek, done: Record<string, true>) {
  const total = countTopics([week]);
  const completed = countDone([week], done);
  return { total, completed, complete: total > 0 && completed === total };
}
