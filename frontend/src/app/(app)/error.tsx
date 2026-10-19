"use client";

import { TriangleAlert } from "lucide-react";
import { useEffect } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { PageBody } from "@/components/ui/page-header";
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
    <PageBody>
      <EmptyState
        icon={<TriangleAlert aria-hidden />}
        title="Something went wrong"
        description="This page hit an unexpected error. Your saved data is safe in this browser."
        action={
          <div className="flex gap-3">
            <Button onClick={() => retry()}>Try again</Button>
            <ButtonLink href="/" variant="secondary">
              Overview
            </ButtonLink>
          </div>
        }
      />
    </PageBody>
  );
}
