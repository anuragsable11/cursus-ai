import type { Metadata } from "next";

import { SkillGapAnalysis } from "@/features/skill-gap/skill-gap-analysis";

export const metadata: Metadata = {
  title: "Skill Gap Roadmap",
};

export default function SkillGapAnalysisPage() {
  return <SkillGapAnalysis />;
}
