"use client";

import { ErrorScreen } from "@/components/app/error-screen";

export default function RootError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorScreen error={error} onRetry={retry} className="min-h-dvh" />;
}
