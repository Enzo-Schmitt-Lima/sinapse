"use client";

import { ErrorScreen } from "@/components/app/error-screen";

export default function AppError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <ErrorScreen error={error} onRetry={retry} />;
}
