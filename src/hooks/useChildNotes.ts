"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

export function useChildNotes(parentId: string | null) {
  return useLiveQuery(async () => {
    const notes = await (parentId === null
      ? db.notes.filter((note) => note.parentId === null).toArray()
      : db.notes.where("parentId").equals(parentId).toArray());
    return notes.sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
  }, [parentId]);
}
