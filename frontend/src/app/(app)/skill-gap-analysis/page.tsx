import type { Metadata } from "next";

import { PageTransition } from "@/components/page-transition";
import { SkillGapAnalysis } from "@/features/skill-gap/skill-gap-analysis";

export const metadata: Metadata = {
  title: "Skill Gap Roadmap",
};

export default function SkillGapAnalysisPage() {
  return (
    <PageTransition>
      <SkillGapAnalysis />
    </PageTransition>
  );
}
