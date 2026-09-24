"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { describeDatabaseError } from "@/lib/db-errors";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ErrorScreenProps {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}

export function ErrorScreen({ error, onRetry, className }: ErrorScreenProps) {
  const { title, description } = describeDatabaseError(error);

  return (
    <div
      role="alert"
      className={cn("flex h-full flex-col items-center justify-center gap-4 p-6 text-center", className)}
    >
      <span className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlert className="size-5" aria-hidden="true" />
      </span>
      <div className="max-w-md space-y-2">
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {onRetry && <Button onClick={onRetry}>Tentar novamente</Button>}
        <Button asChild variant="outline">
          <Link href="/">Ir para o início</Link>
        </Button>
      </div>
    </div>
  );
}
