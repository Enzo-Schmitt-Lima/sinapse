"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

export function useNote(id: string | undefined) {
  return useLiveQuery(() => (id ? db.notes.get(id) : undefined), [id]);
}
