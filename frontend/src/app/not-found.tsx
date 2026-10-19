import { Compass } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/stat";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <EmptyState
        icon={<Compass aria-hidden />}
        title="Page not found"
        description="This page doesn't exist. Head back to the overview to continue your plan."
        action={<ButtonLink href="/">Go to overview</ButtonLink>}
      />
    </main>
  );
}
