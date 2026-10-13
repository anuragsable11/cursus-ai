"use client";

import { TriangleAlert } from "lucide-react";
import { useEffect } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/stat";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <EmptyState
      icon={<TriangleAlert className="size-6" aria-hidden />}
      title="Something went wrong"
      description="This page hit an unexpected error. Your saved data is safe in this browser."
      action={
        <div className="flex gap-3">
          <Button onClick={() => retry()}>Try again</Button>
          <ButtonLink href="/" variant="secondary">
            Dashboard
          </ButtonLink>
        </div>
      }
    />
  );
}
