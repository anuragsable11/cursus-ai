import type { Metadata } from "next";

import { Dashboard } from "@/features/dashboard/dashboard";

export const metadata: Metadata = {
  title: { absolute: "Cursus AI · Career intelligence" },
};

export default function HomePage() {
  return <Dashboard />;
}
