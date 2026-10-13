// Response shapes returned by the FastAPI backend.

export type ResumeAnalysisResponse = {
  filename: string;
  pages: number;
  characters_extracted: number;
  profile: {
    skills: string[];
    experience_text: string;
    education_text: string;
    projects_text: string;
    characters_analyzed: number;
    analysis_method: string;
  };
  status: string;
};

export type MatchResult = {
  match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  required_skills: string[];
  matched_count: number;
  missing_count: number;
  total_required: number;
  scoring_method: string;
  message: string;
};

export type RoadmapActivity = {
  skill: string;
  priority?: number;
  level: string;
  topics: string[];
  project: string;
};

export type RoadmapWeek = {
  week: number;
  title: string;
  skills: string[];
  activities: RoadmapActivity[];
  deliverable: string;
};

export type GapPriority = "High" | "Medium" | "Low";

export type GapExplanation = {
  skill: string;
  reason: string;
  priority: GapPriority;
  recommended_action: string;
};

export type ProjectRecommendation = {
  title: string;
  description: string;
  skills_practiced: string[];
};

export type RoadmapResult = {
  career_path: string;
  match_score: number;
  matched_job_skills: string[];
  job_specific_gaps: string[];
  career_path_gaps?: string[];
  prioritized_gaps: string[];
  target_weeks: number;
  weekly_roadmap: RoadmapWeek[];
  analysis_method: string;
  disclaimer: string;
  // Present only on AI-enhanced results.
  summary?: string;
  gap_explanations?: GapExplanation[];
  project_recommendations?: ProjectRecommendation[];
  interview_focus?: string[];
};

export type AiStatus = {
  available: boolean;
  model: string;
  model_installed: boolean;
  message: string;
};

// State the frontend keeps in the browser.

export type RoadmapMode = "quick" | "ai";

export type ResumeProfile = {
  source: "resume" | "manual";
  filename: string | null;
  pages: number | null;
  characters_analyzed: number | null;
  experience_text: string;
  education_text: string;
  projects_text: string;
  // Skills detected in the resume, kept so edits can be reset.
  detected_skills: string[];
  // The skill list used everywhere; the user can edit it.
  skills: string[];
  updated_at: string;
};

export type SavedMatch = {
  request: { skills: string[]; jobDescription: string };
  result: MatchResult;
  generatedAt: string;
};

export type SavedRoadmap = {
  mode: RoadmapMode;
  request: { skills: string[]; jobDescription: string; targetWeeks: number };
  result: RoadmapResult;
  generatedAt: string;
};
