"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { describeDatabaseError, formatErrorDetails } from "@/lib/db-errors";
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
      <details className="w-full max-w-md rounded-md border text-left text-sm">
        <summary className="cursor-pointer rounded-md px-3 py-2 text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Detalhes técnicos
        </summary>
        <pre className="max-h-60 overflow-auto border-t bg-muted/50 px-3 py-2 font-mono text-xs whitespace-pre-wrap break-words select-all">
          {formatErrorDetails(error)}
        </pre>
      </details>
      <div className="flex flex-wrap justify-center gap-2">
        {onRetry && <Button onClick={onRetry}>Tentar novamente</Button>}
        <Button asChild variant="outline">
          <Link href="/">Ir para o início</Link>
        </Button>
      </div>
    </div>
  );
}
