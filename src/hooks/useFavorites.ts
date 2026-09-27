"use client";

import type { NoteSummary } from "@/lib/note-types";
import { selectFavorites, useNotes } from "./useNotes";

export function useFavorites(): NoteSummary[] | undefined {
  const notes = useNotes();
  return notes ? selectFavorites(notes) : undefined;
}
