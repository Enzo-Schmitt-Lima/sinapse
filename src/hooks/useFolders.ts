"use client";

import { selectFolders, useNotes } from "./useNotes";

export function useFolders(): string[] | undefined {
  const notes = useNotes();
  return notes ? selectFolders(notes) : undefined;
}
