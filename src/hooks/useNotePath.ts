"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db, type Note } from "@/lib/db";

export function useNotePath(note: Note | undefined) {
  return useLiveQuery(async () => {
    if (!note) return [];
    const ancestors: Note[] = [];
    let parentId = note.parentId;
    while (parentId) {
      const parent = await db.notes.get(parentId);
      if (!parent) break;
      ancestors.unshift(parent);
      parentId = parent.parentId;
    }
    return ancestors;
  }, [note?.id, note?.parentId]);
}
