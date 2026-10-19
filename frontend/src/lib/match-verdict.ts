import type { MatchResult, RoadmapResult } from "./types";

export type MatchLevel = "full" | "strong" | "partial" | "weak" | "none" | "unknown";
export type VerdictTone = "good" | "warning" | "serious" | "critical" | "neutral";

export type MatchVerdict = {
  level: MatchLevel;
  /** Headline, e.g. "Not a match" or "Partial match". */
  title: string;
  /** One-line label for tight spaces, e.g. "Partial match · 52%". */
  short: string;
  description: string;
  tone: VerdictTone;
  /** False when a percentage would be meaningless (nothing matched or nothing to compare). */
  showScore: boolean;
  score: number;
};

type Context = "match" | "roadmap";

const skills = (count: number) => (count === 1 ? "skill" : "skills");

/** Turns raw coverage numbers into a plain-language verdict. */
export function matchVerdict(matched: number, total: number, score: number, context: Context = "match"): MatchVerdict {
  const base = { score: Math.round(score) };

  if (total === 0) {
    return {
      ...base,
      level: "unknown",
      title: "Not a match",
      short: "Not a match",
      tone: "neutral",
      showScore: false,
      description:
        context === "roadmap"
          ? "This job description doesn't mention any of the technical skills we track, so it doesn't line up with your profile. The plan below follows the core AI Engineer path instead."
          : "This job description doesn't mention any of the technical skills we track, so it doesn't line up with your profile. It may be a non-technical role, or the requirements may be missing from the text.",
    };
  }

  if (matched === 0) {
    return {
      ...base,
      level: "none",
      title: "Not a match",
      short: "Not a match",
      tone: "critical",
      showScore: false,
      description:
        context === "roadmap"
          ? `None of the ${total} ${skills(total)} this job asks for are in your profile yet. The plan below starts from the foundations.`
          : `None of the ${total} ${skills(total)} this job asks for are in your profile yet.`,
    };
  }

  if (matched >= total) {
    return {
      ...base,
      level: "full",
      title: "Full match",
      short: `Full match · ${base.score}%`,
      tone: "good",
      showScore: true,
      description: `You have all ${total} ${skills(total)} this job asks for.`,
    };
  }

  if (score >= 70) {
    return {
      ...base,
      level: "strong",
      title: "Strong match",
      short: `Strong match · ${base.score}%`,
      tone: "good",
      showScore: true,
      description: `You have ${matched} of the ${total} ${skills(total)} this job asks for.`,
    };
  }

  if (score >= 40) {
    return {
      ...base,
      level: "partial",
      title: "Partial match",
      short: `Partial match · ${base.score}%`,
      tone: "warning",
      showScore: true,
      description: `You have ${matched} of the ${total} ${skills(total)} this job asks for, with a few gaps to close.`,
    };
  }

  return {
    ...base,
    level: "weak",
    title: "Weak match",
    short: `Weak match · ${base.score}%`,
    tone: "serious",
    showScore: true,
    description: `You have only ${matched} of the ${total} ${skills(total)} this job asks for. Most of them are gaps for now.`,
  };
}

export function verdictForMatch(result: MatchResult): MatchVerdict {
  return matchVerdict(result.matched_count, result.total_required, result.match_score);
}

export function verdictForRoadmap(result: RoadmapResult): MatchVerdict {
  const matched = result.matched_job_skills.length;
  return matchVerdict(matched, matched + result.job_specific_gaps.length, result.match_score, "roadmap");
}
