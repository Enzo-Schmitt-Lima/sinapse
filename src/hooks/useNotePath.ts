"use client";

import type { NoteSummary } from "@/lib/note-types";
import { useNotes } from "./useNotes";

/** Ancestrais da nota (do mais alto ao pai direto), a partir da lista leve. */
export function useNotePath(note: Pick<NoteSummary, "id" | "parentId"> | null | undefined): NoteSummary[] | undefined {
  const notes = useNotes();
  if (!notes || !note) return notes ? [] : undefined;

  const byId = new Map(notes.map((item) => [item.id, item]));
  const ancestors: NoteSummary[] = [];
  const visited = new Set<string>([note.id]);
  let parentId = note.parentId;
  while (parentId && !visited.has(parentId)) {
    const parent = byId.get(parentId);
    if (!parent) break;
    ancestors.unshift(parent);
    visited.add(parentId);
    parentId = parent.parentId;
  }
  return ancestors;
}
