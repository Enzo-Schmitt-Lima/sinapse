"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

export function useNotes() {
  return useLiveQuery(() => db.notes.orderBy("updatedAt").reverse().toArray(), []);
}
