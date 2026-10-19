import type { Metadata } from "next";

import { PageTransition } from "@/components/page-transition";
import { ResumeAnalyzer } from "@/features/resume/resume-analyzer";

export const metadata: Metadata = {
  title: "Resume Analyzer",
};

export default function ResumeAnalyzerPage() {
  return (
    <PageTransition>
      <ResumeAnalyzer />
    </PageTransition>
  );
}
