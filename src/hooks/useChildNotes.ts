"use client";

import type { NoteSummary } from "@/lib/note-types";
import { selectChildren, useNotes } from "./useNotes";

export function useChildNotes(parentId: string | null): NoteSummary[] | undefined {
  const notes = useNotes();
  return notes ? selectChildren(notes, parentId) : undefined;
}
