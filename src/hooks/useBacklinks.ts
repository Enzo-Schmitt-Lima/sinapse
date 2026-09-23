"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

export function useBacklinks(noteId: string) {
  return useLiveQuery(() => db.notes.where("links").equals(noteId).toArray(), [noteId]);
}
