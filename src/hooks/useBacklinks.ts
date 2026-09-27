"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchJson, noteKeys } from "@/lib/api-client";
import type { NoteSummary } from "@/lib/note-types";
import { useCurrentUserId } from "@/components/app/query-provider";

export function useBacklinks(noteId: string): NoteSummary[] | undefined {
  const userId = useCurrentUserId();
  return useQuery({
    queryKey: noteKeys.backlinks(userId, noteId),
    queryFn: async () =>
      (await fetchJson<NoteSummary[]>(`/api/notes/${encodeURIComponent(noteId)}/backlinks`)) ?? [],
  }).data;
}
