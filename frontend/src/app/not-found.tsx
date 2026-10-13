import { Compass } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/stat";

export default function NotFound() {
  return (
    <EmptyState
      icon={<Compass className="size-6" aria-hidden />}
      title="Page not found"
      description="This page doesn't exist. Head back to the dashboard to continue your plan."
      action={<ButtonLink href="/">Go to dashboard</ButtonLink>}
    />
  );
}
