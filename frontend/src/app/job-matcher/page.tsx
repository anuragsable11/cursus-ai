import type { Metadata } from "next";

import { JobMatcher } from "@/features/job-match/job-matcher";

export const metadata: Metadata = {
  title: "Job Matcher",
};

export default function JobMatcherPage() {
  return <JobMatcher />;
}
